import { AI_CONFIG, hasAiKey } from '../config/ai';

const SYSTEM_PROMPT = `You are a nutrition assistant for the Healthline food diary app.
Analyze the meal (photo and/or text) and return ONLY valid JSON — no markdown fences, no commentary.

Schema:
{
  "items": [
    {
      "name": "specific food name",
      "serving": "amount e.g. 1 cup / 100g / 1 medium",
      "calories": number,
      "carbs": number,
      "protein": number,
      "fat": number
    }
  ],
  "summary": "short friendly title for the whole meal"
}

Rules:
- NEVER return a single vague item like "Mixed meal", "Food", or "Plate". Name real foods you see or that were described (e.g. tomato, banana, broccoli, grapes).
- Split the plate into 2–6 separate food items whenever possible.
- Estimate macros in grams as numbers (not strings). Calories must be realistic for each item.
- Prefer common grocery/produce names that users recognize.
- summary should describe the plate, e.g. "Fresh fruit & veg plate".`;


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

function normalizeItems(raw) {
  const list = Array.isArray(raw?.items) ? raw.items : [];
  return list
    .map((item, i) => ({
      id: `ai-${Date.now()}-${i}`,
      name: String(item.name || 'Food').trim(),
      serving: String(item.serving || '1 serving').trim(),
      calories: Math.max(0, Math.round(Number(item.calories) || 0)),
      carbs: Math.max(0, Math.round(Number(item.carbs) || 0)),
      protein: Math.max(0, Math.round(Number(item.protein) || 0)),
      fat: Math.max(0, Math.round(Number(item.fat) || 0)),
    }))
    .filter((item) => item.name && item.calories > 0);
}

export async function chatCompletion(messages, { temperature = 0.2, maxTokens = 800 } = {}) {
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
      model: AI_CONFIG.model,
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

/** Parse a meal description / voice transcript into diary food items. */
export async function parseFoodFromText(userText) {
  const content = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Meal description:\n${String(userText || '').trim()}\n\nReturn JSON only.`,
    },
  ]);
  const parsed = extractJson(content);
  const items = normalizeItems(parsed);
  if (!items.length) {
    throw new Error('AI returned no usable food items');
  }
  return {
    items,
    summary: parsed.summary || items.map((i) => i.name).join(', '),
  };
}

/**
 * Diagnose food from a meal photo (base64).
 * Tries vision first; if the model rejects images, falls back to text note.
 */
export async function parseFoodFromImage({ base64, mimeType = 'image/jpeg', note = '' }) {
  if (!base64) {
    throw new Error('No image data');
  }

  const hint = String(note || '').trim();
  const textPart = [
    'Look at this meal photo carefully.',
    'List each visible food separately (fruits, vegetables, proteins, sides).',
    'Do not use vague labels like Mixed meal or Plate.',
    hint ? `User note: ${hint}` : '',
    'Return JSON only matching the schema.',
  ]
    .filter(Boolean)
    .join('\n');

  const dataUrl = `data:${mimeType};base64,${base64}`;

  try {
    const content = await chatCompletion([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: textPart },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ], { maxTokens: 1000 });

    const parsed = extractJson(content);
    const items = normalizeItems(parsed);
    if (!items.length) throw new Error('AI returned no usable food items');
    return {
      items,
      summary: parsed.summary || items.map((i) => i.name).join(', '),
      mode: 'vision',
    };
  } catch (visionErr) {
    // Free Nemotron may be text-only — fall back to description.
    if (!hint) {
      const err = new Error(
        `${visionErr.message || 'Image AI failed'}. Add a short description and try again.`,
      );
      err.code = 'VISION_FALLBACK';
      throw err;
    }
    const fallback = await parseFoodFromText(
      `Meal photo uploaded. User description: ${hint}`,
    );
    return { ...fallback, mode: 'text-fallback' };
  }
}

export { hasAiKey };
