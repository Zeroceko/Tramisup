import { createOpenAI } from '@ai-sdk/openai';

const apiKey = process.env.QWEN_API_KEY;

if (!apiKey) {
  console.warn("WARNING: QWEN_API_KEY is not set in the environment variables.");
}

// Create a configured instance of the OpenAI compatible provider for Qwen
export const openai = createOpenAI({
  apiKey,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// Automatically use qwen-plus
export const defaultModel = openai('qwen-plus');
