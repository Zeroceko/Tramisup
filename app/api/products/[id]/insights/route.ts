import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeUrl } from "@/lib/url-scraper";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const INSIGHTS_PROMPT = (productName: string, website: string, content: string) =>
  `Sen bir startup büyüme danışmanısın. "${productName}" ürününün web sitesini analiz ediyorsun.

URL: ${website}

SİTE İÇERİĞİ:
${content}

Görevin: Bu siteyi/ürünü inceleyerek ne eksik olduğunu söyle. Gerçekçi, spesifik ve aksiyonable ol.

Şu alanlarda eksiklikleri değerlendir:
- Messaging ve değer önerisi netliği
- Sosyal kanıt (testimonial, kullanıcı sayısı, logolar)
- CTA (call-to-action) netliği
- Pricing şeffaflığı
- Onboarding akışı
- SEO temelleri
- Mobile uyumluluk sinyalleri
- Trust faktörleri (about, iletişim, legal)

SADECE JSON döndür:

{
  "insights": [
    {
      "area": "alan adı (kısa)",
      "issue": "ne eksik veya yanlış (1 cümle, Türkçe)",
      "fix": "nasıl düzeltilir (1-2 cümle, spesifik)"
    }
  ]
}

Kurallar:
- 5-8 insight döndür
- Gerçekten bu siteye özel ol, generic tavsiye verme
- Her insight aksiyonable olsun
- Türkçe yaz
- Her koşulda en az 5 insight döndür. Eğer site içeriği yetersizse, genel startup website en iyi pratiklerine göre eksik olabilecekleri listele. Asla boş array döndürme.`;

type Insight = {
  area: string;
  issue: string;
  fix: string;
};

function extractInsights(parsed: unknown): Insight[] {
  if (!parsed || typeof parsed !== "object") return [];
  const obj = parsed as Record<string, unknown>;
  // Try common keys
  for (const key of ["insights", "analysis", "items", "results", "eksikler"]) {
    if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 0) {
      return obj[key] as Insight[];
    }
  }
  // If the object itself has area/issue/fix — it's a single item
  if (obj.area && obj.issue) return [obj as unknown as Insight];
  return [];
}

const QWEN_BASE_URL = "https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1";

async function generateInsights(productName: string, website: string, content: string): Promise<Insight[]> {
  const prompt = INSIGHTS_PROMPT(productName, website, content);

  if (process.env.QWEN_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.QWEN_API_KEY, baseURL: QWEN_BASE_URL });
      const res = await client.chat.completions.create({
        model: "qwen-plus",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });
      const text = res.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(text);
      const insights = extractInsights(parsed);
      if (insights.length > 0) { console.log("[insights] Generated via Qwen"); return insights; }
    } catch (err) {
      console.warn("[insights] Qwen failed:", (err as Error).message);
    }
  }

  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
      });
      const res = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });
      const text = res.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(text);
      const insights = extractInsights(parsed);
      if (insights.length > 0) { console.log("[insights] Generated via DeepSeek"); return insights; }
      console.warn("[insights] DeepSeek returned 0 insights, keys:", Object.keys(parsed));
    } catch (err) {
      console.warn("[insights] DeepSeek failed:", (err as Error).message);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      console.log("[insights] Gemini raw:", text.slice(0, 200));
      const parsed = JSON.parse(text);
      return extractInsights(parsed);
    } catch (err) {
      console.warn("[insights] Gemini failed:", (err as Error).message);
    }
  }

  return [];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, name: true, website: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!product.website) {
      return NextResponse.json({ insights: [] });
    }

    const content = await scrapeUrl(product.website);
    if (!content) {
      return NextResponse.json({ insights: [], error: "Site içeriği alınamadı" });
    }

    const insights = await generateInsights(product.name, product.website, content);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
