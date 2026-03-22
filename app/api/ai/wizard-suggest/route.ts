import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, description, category, targetAudience, launchStatus, website } =
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

    const prompt = `You are an expert startup advisor. Analyze this product and recommend the best metrics and growth strategy options.

Product: "${name}"
Description: "${description}"
Category: ${category || "SaaS"}
Target audience: ${targetAudience || "unknown"}
Launch status: ${launchStatus || "unknown"}
${website ? `Website: ${website}` : ""}

Return ONLY a valid JSON object. Every value MUST be exactly as written in the option lists below.

{
  "successMetric": one of: "Kullanıcı sayısı" | "MRR" | "Activation rate" | "Retention rate" | "NPS" | "Churn rate",
  "trackingMetrics": array of 2-4 items from: ["DAU/MAU", "MRR/ARR", "Churn", "Activation", "Retention", "Conversion rate", "ARPU"],
  "growthChannels": array of 2-3 items from: ["Organic/SEO", "Paid ads", "Content marketing", "Social media", "Product Hunt", "Referral/Word of mouth", "Partnerships", "Cold outreach"],
  "pricingStrategy": one of: "Free → Paid upsell" | "Free trial → Subscription" | "Direkt paid" | "Contact sales" | "Henüz karar vermedim",
  "wantedIntegrations": array of 1-3 items from: ["Stripe", "GA4", "Mixpanel", "Segment", "Amplitude", "PostHog"]
}

Respond with ONLY the JSON object. No markdown fences, no explanations.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if model adds them
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const suggestions = JSON.parse(cleaned);

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("AI wizard suggest error:", err);
    return NextResponse.json({});
  }
}
