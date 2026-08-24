/** OpenRouter + Nemotron config. Key goes in `.env` as EXPO_PUBLIC_OPENROUTER_API_KEY. */
export const AI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
  model: process.env.EXPO_PUBLIC_AI_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
  baseUrl: process.env.EXPO_PUBLIC_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  appTitle: 'Healthline Nutrition',
  appReferer: 'https://healthline.local',
};

export function hasAiKey() {
  return Boolean(AI_CONFIG.apiKey && AI_CONFIG.apiKey.trim().length > 8);
}
