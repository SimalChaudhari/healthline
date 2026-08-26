import { AI_CONFIG, hasAiKey } from '../config/ai';
import {
  SYSTEM_PROMPT,
  buildTextUserPrompt,
  buildVisionUserPrompt,
  buildVisionFallbackText,
} from '../config/aiPrompts';
import { stripDataUrlPrefix } from '../utils/prepareMealImage';

const VAGUE_NAMES = /^(mixed\s*meal|food|plate|dish|meal|item|unknown|assorted|various|other)$/i;

function extractJson(text) {
  if (!text) throw new Error('Empty AI response');
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Could not parse AI JSON');
  }
}

/** Soft-correct macros so calories ≈ 4c+4p+9f when wildly off. */
function reconcileMacros({ calories, carbs, protein, fat }) {
  const fromMacros = carbs * 4 + protein * 4 + fat * 9;
  if (fromMacros <= 0) return { calories, carbs, protein, fat };
  const ratio = calories / fromMacros;
  if (calories > 0 && (ratio < 0.8 || ratio > 1.2)) {
    const scale = Math.sqrt(Math.min(Math.max(ratio, 0.5), 2));
    return {
      calories,
      carbs: Math.max(0, Math.round(carbs * scale)),
      protein: Math.max(0, Math.round(protein * scale)),
      fat: Math.max(0, Math.round(fat * scale)),
    };
  }
  return { calories, carbs, protein, fat };
}

function normalizeItems(raw) {
  const list = Array.isArray(raw?.items) ? raw.items : [];
  return list
    .map((item, i) => {
      const name = String(item.name || '').trim();
      let calories = Math.max(0, Math.round(Number(item.calories) || 0));
      let carbs = Math.max(0, Math.round(Number(item.carbs) || 0));
      let protein = Math.max(0, Math.round(Number(item.protein) || 0));
      let fat = Math.max(0, Math.round(Number(item.fat) || 0));
      ({ calories, carbs, protein, fat } = reconcileMacros({ calories, carbs, protein, fat }));

      const confidence = Math.min(1, Math.max(0, Number(item.confidence) || 0.7));

      return {
        id: `ai-${Date.now()}-${i}`,
        name,
        serving: String(item.serving || '1 serving').trim(),
        calories,
        carbs,
        protein,
        fat,
        confidence,
      };
    })
    .filter(
      (item) =>
        item.name &&
        !VAGUE_NAMES.test(item.name) &&
        item.calories > 0 &&
        item.calories < 5000,
    );
}

export async function chatCompletion(
  messages,
  { temperature = 0.15, maxTokens = 1000, model = AI_CONFIG.model } = {},
) {
  if (!hasAiKey()) {
    const err = new Error('Missing OpenRouter API key. Add EXPO_PUBLIC_OPENROUTER_API_KEY in .env');
    err.code = 'NO_KEY';
    throw err;
  }

  const res = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey.trim()}`,
      'HTTP-Referer': AI_CONFIG.appReferer,
      'X-Title': AI_CONFIG.appTitle,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `AI request failed (${res.status})`;
    const err = new Error(msg);
    err.code = 'API_ERROR';
    err.status = res.status;
    throw err;
  }

  return data?.choices?.[0]?.message?.content || '';
}

function finalizeResult(parsed) {
  const items = normalizeItems(parsed);
  if (!items.length) {
    throw new Error('AI returned no usable food items');
  }
  return {
    items,
    summary: String(parsed.summary || items.map((i) => i.name).join(', ')).trim(),
  };
}

/** Parse a meal description / voice transcript into diary food items. */
export async function parseFoodFromText(userText) {
  const content = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildTextUserPrompt(userText) },
  ]);
  return finalizeResult(extractJson(content));
}

function visionModelChain() {
  const primary = AI_CONFIG.visionModel;
  const extras = Array.isArray(AI_CONFIG.visionFallbacks) ? AI_CONFIG.visionFallbacks : [];
  return [...new Set([primary, ...extras].filter(Boolean))];
}

async function runVisionOnce({ dataUrl, hint, model }) {
  const content = await chatCompletion(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: buildVisionUserPrompt(hint) },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    { maxTokens: 1200, model },
  );
  return finalizeResult(extractJson(content));
}

/**
 * Diagnose food from a meal photo (base64).
 * Uses a vision-capable model; falls back across models, then text note.
 */
export async function parseFoodFromImage({ base64, mimeType = 'image/jpeg', note = '' }) {
  const clean = stripDataUrlPrefix(base64);
  if (!clean) {
    throw new Error('No image data');
  }

  const hint = String(note || '').trim();
  const mime = mimeType || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${clean}`;
  const models = visionModelChain();

  let lastErr = null;
  for (const model of models) {
    try {
      const parsed = await runVisionOnce({ dataUrl, hint, model });
      return { ...parsed, mode: 'vision', model };
    } catch (err) {
      lastErr = err;
      continue;
    }
  }

  if (hint) {
    try {
      const fallback = await parseFoodFromText(buildVisionFallbackText(hint));
      return { ...fallback, mode: 'text-fallback' };
    } catch (textErr) {
      lastErr = textErr;
    }
  }

  const detail = lastErr?.message || 'Image AI failed';
  const tip = hint ? '' : ' Add a short food description and tap Diagnose again.';
  const err = new Error(`${detail}.${tip}`);
  err.code = 'VISION_FAILED';
  throw err;
}

export { hasAiKey };
