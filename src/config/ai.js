/** OpenRouter + Nemotron config. Key goes in `.env` as EXPO_PUBLIC_OPENROUTER_API_KEY. */
export const AI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
  /** Text / voice logging */
  model: process.env.EXPO_PUBLIC_AI_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
  /**
   * Vision (meal photo). Must support image input.
   * Default: Nemotron Nano VL. Override with EXPO_PUBLIC_AI_VISION_MODEL.
   */
  visionModel:
    process.env.EXPO_PUBLIC_AI_VISION_MODEL || 'nvidia/nemotron-nano-12b-v2-vl:free',
  /** Extra vision fallback if primary is rate-limited / unavailable */
  visionFallbacks: ['openrouter/free'],
  baseUrl: process.env.EXPO_PUBLIC_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  appTitle: 'Healthline Nutrition',
  appReferer: 'https://healthline.local',
};

export function hasAiKey() {
  return Boolean(AI_CONFIG.apiKey && AI_CONFIG.apiKey.trim().length > 8);
}
