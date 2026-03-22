import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, description, category, targetAudience, businessModel } =
      await req.json();

    if (!name || !description) {
      return NextResponse.json({}, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY not set — skipping AI suggestions");
      return NextResponse.json({});
    }

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Based on this product, recommend the best success metric and growth channels.

Product: "${name}"
Description: "${description}"
Category: ${category || "SaaS"}
Target audience: ${targetAudience || "unknown"}
Business model: ${businessModel || "unknown"}

Return ONLY a JSON object. Values MUST exactly match the options.

{
  "successMetric": one of: "Kullanıcı sayısı" | "MRR" | "Activation rate" | "Retention rate" | "NPS" | "Churn rate",
  "growthChannels": array of 2-3 from: ["Organic/SEO", "Paid ads", "Content marketing", "Social media", "Product Hunt", "Referral/Word of mouth", "Partnerships", "Cold outreach"]
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const suggestions = JSON.parse(text);

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("AI wizard suggest error:", err);
    return NextResponse.json({});
  }
}
