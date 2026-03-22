import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, description, category, targetAudience, businessModel } =
      await req.json();

    if (!name || !description) {
      return NextResponse.json({}, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set — skipping AI suggestions");
      return NextResponse.json({});
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert startup advisor. Based on this product, recommend the best success metric and growth channels.

Product: "${name}"
Description: "${description}"
Category: ${category || "SaaS"}
Target audience: ${targetAudience || "unknown"}
Business model: ${businessModel || "unknown"}

Return ONLY a valid JSON object. Values MUST exactly match the options listed.

{
  "successMetric": one of exactly: "Kullanıcı sayısı" | "MRR" | "Activation rate" | "Retention rate" | "NPS" | "Churn rate",
  "growthChannels": array of 2-3 items from exactly: ["Organic/SEO", "Paid ads", "Content marketing", "Social media", "Product Hunt", "Referral/Word of mouth", "Partnerships", "Cold outreach"]
}

Reasoning guide:
- SaaS/Subscription → successMetric: "MRR", channels lean toward "Content marketing", "Organic/SEO"
- Marketplace fee → successMetric: "Kullanıcı sayısı", channels lean toward "Referral/Word of mouth"
- Freemium → successMetric: "Activation rate", channels lean toward "Product Hunt", "Content marketing"
- B2B/Enterprise → channels include "Cold outreach", "Partnerships"
- Consumer → channels include "Social media", "Referral/Word of mouth"

Respond with ONLY the JSON object. No markdown, no explanations.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const suggestions = JSON.parse(cleaned);

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("AI wizard suggest error:", err);
    return NextResponse.json({});
  }
}
