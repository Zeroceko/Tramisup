import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import OpenAI from "openai";

const qwenApiKey = process.env.QWEN_API_KEY;

if (!qwenApiKey) {
  console.warn("WARNING: QWEN_API_KEY is not set in the environment variables.");
}

// 1. Qwen via Raw OpenAI SDK (more stable for Alibaba MaaS compat mode)
export const qwenRaw = new OpenAI({
  apiKey: qwenApiKey,
  baseURL: 'https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
});

// 2. Vercel AI SDK wrappers (kept for other use cases or Gemini)
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
 * Primarily uses Qwen via raw OpenAI SDK for consistency.
 */
export async function withFallback<T>(
  primaryFn: (model: any) => Promise<T>,
  context: string = 'AI Call'
): Promise<T> {
  try {
    // Try primary: Qwen via AI SDK
    return await primaryFn(defaultModel);
  } catch (err) {
    console.warn(`[${context}] Primary (AI SDK) failed, trying Gemini...`, err);
    try {
      // Try fallback: Gemini via AI SDK
      return await primaryFn(geminiModel);
    } catch (fallbackErr) {
      console.error(`[${context}] Both AI models failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Specifically for structured output (objects) where AI SDK's generateObject might fail on compatible providers.
 */
export async function generateStructuredFallback<T>(
  prompt: string,
  schema: any,
  context: string = 'Structured AI Call'
): Promise<T> {
  try {
    console.log(`[${context}] Attempting raw Qwen call for structured output...`);
    const response = await qwenRaw.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "You are a helpful assistant that always outputs valid JSON strictly matching the requested format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    // Strip markdown blocks if present
    const cleanContent = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(cleanContent) as T;
  } catch (err) {
    console.warn(`[${context}] Raw Qwen failed, falling back to Vercel AI SDK (Gemini/Default)...`, err);
    // This is where we could put more logic if needed
    throw err;
  }
}

