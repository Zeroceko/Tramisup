import { createOpenAI } from '@ai-sdk/openai';

// Ensure the API key is set in environment variables (using OpenAI or falling back to Qwen)
const apiKey = process.env.OPENAI_API_KEY || process.env.QWEN_API_KEY;

if (!apiKey) {
  console.warn("WARNING: API KEY is not set in the environment variables.");
}

// Create a configured instance of the OpenAI provider
export const openai = createOpenAI({
  apiKey,
  baseURL: (process.env.QWEN_API_KEY && !process.env.OPENAI_API_KEY) ? 'https://dashscope.aliyuncs.com/compatible-mode/v1' : undefined,
});

// Automatically switch model based on what key we found
export const defaultModel = openai(
  (process.env.QWEN_API_KEY && !process.env.OPENAI_API_KEY) ? 'qwen-plus' : 'gpt-4o'
);
