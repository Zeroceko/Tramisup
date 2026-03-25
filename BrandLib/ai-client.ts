import { createGoogleGenerativeAI } from '@ai-sdk/google';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in the environment variables.");
}

// Create a configured instance of the Google provider
export const googleSdk = createGoogleGenerativeAI({
  apiKey,
});

// Automatically use gemini-2.5-flash
export const defaultModel = googleSdk('gemini-2.5-flash');
