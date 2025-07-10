// 🤖 AI Generation settings
export const GENERATION_CONFIG = {
  AI_MODEL: "deepseek-ai/DeepSeek-V3",
  TEMPERATURE: 0.9,
  TOP_P: 0.95,
  MAX_DESCRIPTION_WORDS: 25,
  CREATIVE_SEED_RANGE: 10000,
  REALISTIC_RARITIES: ['commun', 'peu commun', 'rare']
} as const