import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const qwenApiKey = process.env.QWEN_API_KEY;
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testQwenRaw() {
  console.log("\n🤖 Testing Qwen Raw (OpenAI SDK)...");
  if (!qwenApiKey) return;
  
  const openai = new OpenAI({
    apiKey: qwenApiKey,
    baseURL: 'https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1',
  });

  try {
    const response = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [{ role: "user", content: "Say 'Hello' as JSON: { 'test': 'Hello' }" }],
    });
    console.log("✅ Qwen RAW SUCCESS:", response.choices[0].message.content);
  } catch (err: any) {
    console.error("❌ Qwen RAW FAILED:", err.message);
  }
}

async function testGeminiRaw() {
  console.log("\n🤖 Testing Gemini Raw (Google SDK)...");
  if (!googleApiKey) return;

  const genAI = new GoogleGenerativeAI(googleApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Say 'Hello'");
    const response = await result.response;
    console.log("✅ Gemini RAW SUCCESS text:", response.text());
  } catch (err: any) {
    console.error("❌ Gemini RAW FAILED:", err.message);
  }
}

async function start() {
  await testQwenRaw();
  await testGeminiRaw();
}

start();
