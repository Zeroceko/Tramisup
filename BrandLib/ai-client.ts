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
  // 1. Try Gemini
  try {
    console.log(`[${context}] Trying Gemini...`);
    return await primaryFn(defaultModel);
  } catch (err) {
    console.warn(`[${context}] Gemini failed, trying Qwen (AI SDK)...`, err);
    
    // 2. Try Qwen via AI SDK
    try {
      return await primaryFn(qwenModel);
    } catch (qwenErr) {
      console.warn(`[${context}] Qwen (AI SDK) failed, trying Raw Qwen fallback...`, qwenErr);
      
      // 3. Final raw fallback for TEXT generation (if T is handleable as string)
      // This is mainly for orchestrator/agents that use generateText
      try {
        // We can't easily turn primaryFn into a raw call if it's bound to AI SDK models,
        // so we only do this if we can detect it's a simple text request or through specific logic.
        // For now, let's just throw so the caller handles it, OR implement a raw text generator.
        throw qwenErr; 
      } catch (finalErr) {
        console.error(`[${context}] ALL models failed:`, finalErr);
        throw finalErr;
      }
    }
  }
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
    
    // 2. Try Raw Qwen
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

