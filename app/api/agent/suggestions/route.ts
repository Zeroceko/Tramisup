import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAgentContext, type AgentType } from "@/lib/agent-context";

const VALID_AGENT_TYPES: AgentType[] = ["overview", "launch", "growth"];

/**
 * GET /api/agent/suggestions?agentType=overview&productId=xxx&locale=en
 *
 * Returns context-driven initial suggestion cards for the agent panel.
 * No AI call — pure deterministic logic based on product state.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const agentType = url.searchParams.get("agentType") as AgentType;
    const productId = url.searchParams.get("productId") ?? "";
    const locale = url.searchParams.get("locale") === "tr" ? "tr" : "en";
    const isEn = locale === "en";

    if (!VALID_AGENT_TYPES.includes(agentType)) {
      return NextResponse.json({ error: "Invalid agentType" }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true, name: true, status: true, description: true },
    });
    if (!product) {
      return NextResponse.json({ suggestions: [] });
    }

    const ctx = await buildAgentContext(agentType, productId, locale);
    const data = JSON.parse(ctx.contextSummary);
    const stage = product.status; // PRE_LAUNCH | LAUNCHED | GROWING
    const productName = product.name;

    type Suggestion = {
      label: string;
      intent: "create_task" | "ask";
      payload?: { title: string; description?: string; priority: string };
    };

    const suggestions: Suggestion[] = [];

    if (agentType === "overview") {
      const tasks = data.tasks ?? {};
      const checklist = data.launch_checklist ?? {};

      if (stage === "PRE_LAUNCH") {
        if (checklist.high_blockers_remaining > 0) {
          suggestions.push({
            label: isEn
              ? `${productName} has ${checklist.high_blockers_remaining} critical blocker(s) — close the top one`
              : `${productName}'in ${checklist.high_blockers_remaining} kritik blocker'ı var — en önemlisini kapat`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Close the top critical launch blocker for ${productName}`
                : `${productName} için en kritik launch blocker'ını kapat`,
              priority: "HIGH",
            },
          });
        }
        if (checklist.completion_rate < 50) {
          suggestions.push({
            label: isEn
              ? `Launch readiness is at ${checklist.completion_rate}% — pick the next easiest win`
              : `Launch hazırlığı %${checklist.completion_rate} — sonraki en kolay kazanımı seç`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Complete the next launch checklist item for ${productName}`
                : `${productName} için sıradaki launch maddesini tamamla`,
              priority: "MEDIUM",
            },
          });
        }
        if (tasks.high_priority_open > 0) {
          suggestions.push({
            label: isEn
              ? `${tasks.high_priority_open} high-priority task(s) open — review and act`
              : `${tasks.high_priority_open} yüksek öncelikli görev açık — incele ve harekete geç`,
            intent: "ask",
          });
        }
      } else {
        // LAUNCHED or GROWING
        if (tasks.in_progress > 0) {
          suggestions.push({
            label: isEn
              ? `${tasks.in_progress} task(s) in progress — what's blocking them?`
              : `${tasks.in_progress} görev devam ediyor — sıkıştıran ne?`,
            intent: "ask",
          });
        }
        if (tasks.done === 0 && tasks.total > 0) {
          suggestions.push({
            label: isEn
              ? `No task completed yet — pick the smallest one and finish it today`
              : `Henüz tamamlanan görev yok — en küçüğünü seç, bugün bitir`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Complete the first task for ${productName}`
                : `${productName} için ilk görevi tamamla`,
              priority: "MEDIUM",
            },
          });
        }
        suggestions.push({
          label: isEn
            ? `What is the single most impactful thing ${productName} should do this week?`
            : `${productName} bu hafta yapabileceği en etkili tek şey ne?`,
          intent: "ask",
        });
      }
    } else if (agentType === "launch") {
      const categories = data.categories ?? {};
      const blockers = data.high_priority_blockers ?? [];
      const completion = data.overall_completion_rate ?? 0;

      if (blockers.length > 0) {
        suggestions.push({
          label: isEn
            ? `Critical: "${blockers[0]}" — create a task to close it`
            : `Kritik: "${blockers[0]}" — kapatmak için görev oluştur`,
          intent: "create_task",
          payload: {
            title: blockers[0],
            priority: "HIGH",
          },
        });
      }

      // Find the category with lowest completion
      let weakestCat = "";
      let weakestRate = 100;
      for (const [cat, info] of Object.entries(categories) as [string, { total: number; completed: number }][]) {
        const rate = info.total > 0 ? (info.completed / info.total) * 100 : 100;
        if (rate < weakestRate) {
          weakestRate = rate;
          weakestCat = cat;
        }
      }
      if (weakestCat && weakestRate < 100) {
        suggestions.push({
          label: isEn
            ? `${weakestCat} is the weakest area (${Math.round(weakestRate)}%) — what needs to happen?`
            : `${weakestCat} en zayıf alan (%${Math.round(weakestRate)}) — ne yapılmalı?`,
          intent: "ask",
        });
      }

      if (completion > 0 && completion < 80) {
        suggestions.push({
          label: isEn
            ? `Overall launch readiness: ${completion}% — focus on medium-priority items next`
            : `Genel launch hazırlığı: %${completion} — orta öncelikli maddelere odaklan`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Review and advance medium-priority launch items`
              : `Orta öncelikli launch maddelerini ilerlet`,
            priority: "MEDIUM",
          },
        });
      }
    } else if (agentType === "growth") {
      const setup = data.metric_setup ?? {};
      const trends = data.recent_metric_trends ?? {};
      const entries = data.data_entries_last_14_days ?? 0;
      const integrations = data.connected_integrations ?? [];

      if (!setup.has_setup) {
        suggestions.push({
          label: isEn
            ? `${productName} has no metric setup yet — define what to track first`
            : `${productName}'in henüz metrik kurulumu yok — önce neyi takip edeceğini belirle`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Set up AARRR metrics for ${productName}`
              : `${productName} için AARRR metriklerini kur`,
            priority: "HIGH",
          },
        });
      } else if (entries === 0) {
        suggestions.push({
          label: isEn
            ? `Metrics selected but no data yet — enter the first baseline today`
            : `Metrikler seçili ama veri yok — bugün ilk baz çizgisini gir`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Enter the first metric baseline for ${productName}`
              : `${productName} için ilk metrik baz çizgisini gir`,
            priority: "HIGH",
          },
        });
      } else {
        // Find declining trends
        for (const [key, trend] of Object.entries(trends) as [string, { latest: number; prev: number | null }][]) {
          if (trend.prev !== null && trend.latest < trend.prev) {
            suggestions.push({
              label: isEn
                ? `${key} dropped from ${trend.prev} to ${trend.latest} — investigate why`
                : `${key} ${trend.prev}'den ${trend.latest}'e düştü — nedenini araştır`,
              intent: "ask",
            });
            break; // only surface the first declining metric
          }
        }
      }

      if (integrations.length === 0 && setup.has_setup) {
        suggestions.push({
          label: isEn
            ? `No data source connected — automate with GA4 or Stripe`
            : `Bağlı kaynak yok — GA4 veya Stripe ile otomatikleştir`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Connect a data source for ${productName}`
              : `${productName} için veri kaynağı bağla`,
            priority: "MEDIUM",
          },
        });
      }

      if (entries >= 5) {
        suggestions.push({
          label: isEn
            ? `What is the weakest AARRR stage for ${productName} right now?`
            : `${productName} için şu an en zayıf AARRR aşaması hangisi?`,
          intent: "ask",
        });
      }
    }

    // Ensure at least 1, max 3
    return NextResponse.json({
      suggestions: suggestions.slice(0, 3),
    });
  } catch (error) {
    console.error("[agent/suggestions] Error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
