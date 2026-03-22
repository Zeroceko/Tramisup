import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LaunchCategory, GrowthCategory, Priority, TaskStatus } from "@prisma/client";

export type AiLaunchItem = {
  category: LaunchCategory;
  title: string;
  description?: string;
  priority: Priority;
  order: number;
};

export type AiGrowthItem = {
  category: GrowthCategory;
  title: string;
  description?: string;
  order: number;
};

export type AiTask = {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
};

export type AiPlan = {
  launchChecklist: AiLaunchItem[];
  growthChecklist: AiGrowthItem[];
  tasks: AiTask[];
};

export type WizardInput = {
  name: string;
  description: string;
  category?: string;
  targetAudience?: string;
  launchStatus?: string;
  businessModel?: string;
  pricingStrategy?: string;
  launchGoals?: string[];
  growthChannels?: string[];
  successMetric?: string;
  trackingMetrics?: string[];
  teamSize?: string;
  userRole?: string;
  website?: string;
  launchDate?: string;
  firstTask?: string;
};

export async function generateAiPlan(input: WizardInput): Promise<AiPlan | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[ai-plan] GEMINI_API_KEY not set — skipping AI plan");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const goalsText = input.launchGoals?.length
      ? input.launchGoals.join(", ")
      : "not specified";
    const channelsText = input.growthChannels?.length
      ? input.growthChannels.join(", ")
      : "not specified";

    const prompt = `You are an expert startup advisor creating a personalized action plan.

PRODUCT DETAILS:
- Name: ${input.name}
- Description: ${input.description}
- Category: ${input.category || "SaaS"}
- Target audience: ${input.targetAudience || "unknown"}
- Launch status: ${input.launchStatus || "unknown"}
- Business model: ${input.businessModel || "unknown"}
- Pricing strategy: ${input.pricingStrategy || "unknown"}
- Launch goals: ${goalsText}
- Growth channels: ${channelsText}
- Success metric: ${input.successMetric || "unknown"}
- Team size: ${input.teamSize || "unknown"}
- User role: ${input.userRole || "unknown"}
${input.website ? `- Website: ${input.website}` : ""}
${input.launchDate ? `- Target launch date: ${input.launchDate}` : ""}

Create a highly personalized action plan SPECIFIC to this product. Do NOT give generic startup advice.
Reference the actual product, its audience, and business model in the titles.
Write everything in TURKISH.

Return ONLY a valid JSON object with this exact structure:

{
  "launchChecklist": [
    {
      "category": "PRODUCT" | "MARKETING" | "LEGAL" | "TECH",
      "title": "specific actionable task title (max 60 chars)",
      "description": "1-2 sentence explanation why this matters for this product",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "order": 1
    }
  ],
  "growthChecklist": [
    {
      "category": "ACQUISITION" | "ACTIVATION" | "RETENTION" | "REVENUE",
      "title": "specific actionable task title (max 60 chars)",
      "description": "1-2 sentence explanation",
      "order": 1
    }
  ],
  "tasks": [
    {
      "title": "specific first-week task (max 60 chars)",
      "description": "what exactly to do",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "status": "TODO" | "IN_PROGRESS"
    }
  ]
}

Rules:
- launchChecklist: 10-14 items, ordered within each category, cover PRODUCT/MARKETING/LEGAL/TECH proportionally
- growthChecklist: 8-12 items, cover all four categories: ACQUISITION, ACTIVATION, RETENTION, REVENUE
- tasks: 4-6 immediate tasks for THIS week
${input.firstTask ? `- Include this user-specified first task in tasks: "${input.firstTask}"` : ""}
- Every item must be SPECIFIC to this product, not generic
- Respond with ONLY the JSON object, no markdown, no explanations`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const plan: AiPlan = JSON.parse(cleaned);

    // Validate structure
    if (!plan.launchChecklist || !plan.growthChecklist || !plan.tasks) {
      throw new Error("Invalid AI plan structure");
    }

    return plan;
  } catch (err) {
    console.error("[ai-plan] Generation failed:", err);
    return null;
  }
}
