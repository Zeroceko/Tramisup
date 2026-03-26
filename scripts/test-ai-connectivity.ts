import { generateObject } from "ai";
import { z } from "zod";
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const qwenApiKey = process.env.QWEN_API_KEY;
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const qwenSdk = createOpenAI({
  apiKey: qwenApiKey,
  baseURL: 'https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
});

// Retry with Pro
const qwenModel = qwenSdk('qwen-plus');
const geminiModel = google('gemini-1.5-pro');

const Schema = z.object({
  test: z.string(),
});

async function testModel(name: string, model: any) {
  console.log(`\n🤖 Testing ${name}...`);
  try {
    const { object } = await generateObject({
      model,
      schema: Schema,
      prompt: "Say 'Hello Tiramisu' in a JSON object with key 'test'",
    });
    console.log(`✅ ${name} SUCCESS:`, object);
  } catch (err: any) {
    console.error(`❌ ${name} FAILED:`, err.message);
  }
}

async function start() {
  console.log("Starting AI Key Connectivity Test...");
  console.log("QWEN_API_KEY present:", !!qwenApiKey);
  console.log("GOOGLE_GENERATIVE_AI_API_KEY present:", !!googleApiKey);

  if (qwenApiKey) await testModel("Qwen-Plus", qwenModel);
  if (googleApiKey) await testModel("Gemini-1.5-Flash", geminiModel);
}

start();
