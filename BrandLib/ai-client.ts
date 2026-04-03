import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import OpenAI from "openai";

const qwenApiKey = process.env.QWEN_API_KEY;
const geminiApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? null;

if (!qwenApiKey) {
  console.warn("WARNING: QWEN_API_KEY is not set in the environment variables.");
}

// 1. Qwen via Raw OpenAI SDK (more stable for Alibaba MaaS compat mode)
export const qwenRaw = qwenApiKey
  ? new OpenAI({
      apiKey: qwenApiKey,
      baseURL: 'https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
    })
  : null;

// 2. Vercel AI SDK wrappers (kept for other use cases or Gemini)
export const qwenSdk = qwenApiKey
  ? createOpenAI({
      apiKey: qwenApiKey,
      baseURL: 'https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
    })
  : null;

// Primary model: Gemini 1.5 Flash
export const defaultModel = geminiApiKey ? google('gemini-1.5-flash') : null;

// Backup model: qwen-plus via AI SDK wrapper
export const qwenModel = qwenSdk ? qwenSdk('qwen-plus') : null;

/**
 * Execute an AI function with fallback logic.
 * Primarily uses Qwen via raw OpenAI SDK for consistency.
 */
export async function withFallback<T>(
  primaryFn: (model: any) => Promise<T>,
  context: string = 'AI Call'
): Promise<T> {
  // 1. Try Gemini
  if (defaultModel) {
    try {
      console.log(`[${context}] Trying Gemini...`);
      return await primaryFn(defaultModel);
    } catch (err) {
      console.warn(`[${context}] Gemini failed, trying Qwen (AI SDK)...`, err);
    }
  }

  if (qwenModel) {
    try {
      return await primaryFn(qwenModel);
    } catch (qwenErr) {
      console.warn(`[${context}] Qwen (AI SDK) failed, trying Raw Qwen fallback...`, qwenErr);

      try {
        throw qwenErr;
      } catch (finalErr) {
        console.error(`[${context}] ALL models failed:`, finalErr);
        throw finalErr;
      }
    }
  }

  throw new Error(`[${context}] No AI provider is configured.`);
}

/**
 * Robust text generation that tries Gemini then Raw Qwen.
 */
export async function generateTextFallback(
  systemPrompt: string,
  userPrompt: string,
  context: string = 'Text AI Call'
): Promise<string> {
  // 1. Try Gemini
  if (defaultModel) {
    try {
      const { generateText } = await import("ai");
      const result = await generateText({
        model: defaultModel,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.text;
    } catch (err) {
      console.warn(`[${context}] Gemini text failed, trying Raw Qwen...`, err);
    }
  }

  if (qwenRaw) {
    try {
      const response = await qwenRaw.chat.completions.create({
        model: "qwen-plus",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      });
      return response.choices[0].message.content || "";
    } catch (fallbackErr) {
      console.error(`[${context}] Both text AI paths failed:`, fallbackErr);
      throw fallbackErr;
    }
  }

  throw new Error(`[${context}] No AI provider is configured.`);
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
  if (defaultModel) {
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
    }
  }

  if (qwenRaw) {
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

  throw new Error(`[${context}] No AI provider is configured.`);
}
