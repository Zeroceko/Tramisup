import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

const qwenApiKey = process.env.QWEN_API_KEY;

if (!qwenApiKey) {
  console.warn("WARNING: QWEN_API_KEY is not set in the environment variables.");
}

// Qwen via Alibaba Cloud MaaS
export const qwenSdk = createOpenAI({
  apiKey: qwenApiKey,
  baseURL: 'https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
});

// Primary model: qwen-plus
export const defaultModel = qwenSdk('qwen-plus');

// Backup model: Gemini 1.5 Flash (standard GOOGLE_GENERATIVE_AI_API_KEY from .env)
export const geminiModel = google('gemini-1.5-flash');

/**
 * Execute an AI function with fallback logic.
 * If the primary call fails, it retries once with the backup model.
 */
export async function withFallback<T>(
  primaryFn: (model: any) => Promise<T>,
  context: string = 'AI Call'
): Promise<T> {
  try {
    return await primaryFn(defaultModel);
  } catch (err) {
    console.warn(`[${context}] Primary model failed, falling back to Gemini:`, err);
    try {
      return await primaryFn(geminiModel);
    } catch (fallbackErr) {
      console.error(`[${context}] Fallback model also failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

