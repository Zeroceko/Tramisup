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

// Primary model: Gemini 1.5 Flash
export const defaultModel = google('gemini-1.5-flash');

// Backup model: qwen-plus via AI SDK wrapper
export const qwenModel = qwenSdk('qwen-plus');

/**
 * Execute an AI function with fallback logic.
 * Primarily uses Qwen via raw OpenAI SDK for consistency.
 */
export async function withFallback<T>(
  primaryFn: (model: any) => Promise<T>,
  context: string = 'AI Call'
): Promise<T> {
  try {
    // Try primary: Gemini via AI SDK
    return await primaryFn(defaultModel);
  } catch (err) {
    console.warn(`[${context}] Primary (Gemini) failed, trying Qwen...`, err);
    try {
      // Try fallback: Qwen via AI SDK
      return await primaryFn(qwenModel);
    } catch (fallbackErr) {
      console.error(`[${context}] Both AI models failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Specifically for structured output (objects) where AI SDK's generateObject might fail on compatible providers.
 * Now prioritized for Gemini (#1) with Raw Qwen fallback (#2).
 */
export async function generateStructuredFallback<T>(
  prompt: string,
  schema: any,
  context: string = 'Structured AI Call'
): Promise<T> {
  // 1. Try Primary (Gemini via AI SDK)
  try {
    const { generateObject } = await import("ai");
    const { object } = await generateObject({
      model: defaultModel,
      schema: schema,
      prompt: prompt,
      temperature: 0.7,
    });
    return object as T;
  } catch (err) {
    console.warn(`[${context}] Gemini structured call failed, trying Raw Qwen...`, err);
    
    // 2. Try Fallback (Raw Qwen - very stable for JSON)
    try {
      const response = await qwenRaw.chat.completions.create({
        model: "qwen-plus",
        messages: [
          { role: "system", content: "You are a helpful assistant that always outputs valid JSON strictly matching the requested format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content || "{}";
      const cleanContent = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      return JSON.parse(cleanContent) as T;
    } catch (fallbackErr) {
      console.error(`[${context}] Both structured AI paths failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

