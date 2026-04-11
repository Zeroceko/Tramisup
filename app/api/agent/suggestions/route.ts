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
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        category: true,
        businessModel: true,
        targetAudience: true,
        launchGoals: true,
      },
    });
    if (!product) {
      return NextResponse.json({ suggestions: [] });
    }

    // Parse goalKey from launchGoals JSON string: { goalKey, growthGoal }
    let goalKey: string | null = null;
    if (product.launchGoals) {
      try {
        const lg = JSON.parse(product.launchGoals as string);
        goalKey = typeof lg?.goalKey === "string" ? lg.goalKey : null;
      } catch { /* ignore */ }
    }

    const ctx = await buildAgentContext(agentType, productId, locale);
    const data = JSON.parse(ctx.contextSummary);
    const stage = product.status; // PRE_LAUNCH | LAUNCHED | GROWING
    const productName = product.name;

    // Product attributes for context-driven card generation
    const bm = (product.businessModel ?? "").toLowerCase();
    const cat = (product.category ?? "").toLowerCase();
    const desc = (product.description ?? "").toLowerCase();

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
              ? `${tasks.high_priority_open} high-priority task(s) still open — close the top one`
              : `${tasks.high_priority_open} yüksek öncelikli görev hâlâ açık — en kritik olanı kapat`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Close the top high-priority task for ${productName}`
                : `${productName} için en kritik yüksek öncelikli görevi kapat`,
              priority: "HIGH",
            },
          });
        }
      } else {
        // LAUNCHED or GROWING — product-specific cards

        // Carry forward task-state cards if slots remain
        if (tasks.in_progress > 0 && suggestions.length < 3) {
          suggestions.push({
            label: isEn
              ? `${tasks.in_progress} task(s) in progress — find and remove what's blocking them`
              : `${tasks.in_progress} görev devam ediyor — sıkıştıran şeyi bul ve kaldır`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Remove the blocker on in-progress tasks for ${productName}`
                : `${productName}'deki devam eden görevlerin önündeki engeli kaldır`,
              priority: "MEDIUM",
            },
          });
        }
        if (tasks.done === 0 && tasks.total > 0 && suggestions.length < 3) {
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

        // Card 1 — businessModel-specific metric suggestion
        if (suggestions.length < 3) {
          let metricCard: Suggestion;
          if (bm.includes("subscription") || bm.includes("abonelik")) {
            metricCard = {
              label: isEn
                ? `Set up MRR and churn tracking — the core metrics for ${productName}`
                : `${productName} için MRR ve churn takibini kur — subscription'ın temel metrikleri`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Set up MRR and churn rate tracking for ${productName}`
                  : `${productName} için MRR ve churn rate takibini kur`,
                priority: "HIGH",
              },
            };
          } else if (bm.includes("marketplace") || bm.includes("komisyon")) {
            metricCard = {
              label: isEn
                ? `Set up GMV and conversion rate tracking for ${productName}`
                : `${productName} için GMV ve dönüşüm oranı takibini kur`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Set up GMV and conversion tracking for ${productName}`
                  : `${productName} için GMV ve dönüşüm takibini kur`,
                priority: "HIGH",
              },
            };
          } else if (bm.includes("freemium")) {
            metricCard = {
              label: isEn
                ? `Track free-to-paid conversion — the metric that defines ${productName}'s growth`
                : `${productName} için ücretsiz→ücretli dönüşümü takip et`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Set up free-to-paid conversion tracking for ${productName}`
                  : `${productName} için ücretsiz→ücretli dönüşüm takibini kur`,
                priority: "HIGH",
              },
            };
          } else if (cat.includes("mobile") || desc.includes("ios") || desc.includes("android")) {
            metricCard = {
              label: isEn
                ? `Set up DAU and Day-7 retention — the two metrics that define mobile health`
                : `DAU ve 7. gün retention'ı kur — mobil sağlığı tanımlayan iki metrik`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Set up DAU and Day-7 retention tracking for ${productName}`
                  : `${productName} için DAU ve 7. gün retention takibini kur`,
                priority: "HIGH",
              },
            };
          } else {
            metricCard = {
              label: isEn
                ? `${productName} has no baseline data yet — set up your first metrics`
                : `${productName} için henüz baz veri yok — ilk metrikleri kur`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Set up AARRR metrics for ${productName}`
                  : `${productName} için AARRR metriklerini kur`,
                priority: "HIGH",
              },
            };
          }
          suggestions.push(metricCard);
        }

        // Card 2 — goalKey-specific action task
        if (suggestions.length < 3) {
          let goalCard: Suggestion;
          if (goalKey === "build_growth_rhythm") {
            goalCard = {
              label: isEn
                ? `Map current acquisition sources — understand where users are coming from`
                : `Mevcut edinim kaynaklarını haritala — kullanıcıların nereden geldiğini netleştir`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Map current acquisition sources for ${productName}`
                  : `${productName} için mevcut edinim kaynaklarını haritala`,
                priority: "HIGH",
              },
            };
          } else if (goalKey === "get_first_users") {
            goalCard = {
              label: isEn
                ? `List the first 10 target users and define how to reach each one`
                : `İlk 10 hedef kullanıcıyı listele ve her birine nasıl ulaşacağını tanımla`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Identify and reach first 10 target users for ${productName}`
                  : `${productName} için ilk 10 hedef kullanıcıyı belirle ve ulaş`,
                priority: "HIGH",
              },
            };
          } else if (goalKey === "get_first_revenue") {
            goalCard = {
              label: isEn
                ? `Identify the single most likely first paying customer — and make contact`
                : `İlk ödeme yapacak en muhtemel müşteriyi belirle ve iletişime geç`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Identify and contact the first paying customer prospect for ${productName}`
                  : `${productName} için ilk ödeme yapacak müşteri adayını belirle ve iletişime geç`,
                priority: "HIGH",
              },
            };
          } else if (goalKey === "validate_product") {
            goalCard = {
              label: isEn
                ? `Write down the key unvalidated assumption about ${productName} — then test it`
                : `${productName} hakkındaki temel doğrulanmamış varsayımı yaz — sonra test et`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Validate the key unproven assumption about ${productName}`
                  : `${productName} hakkındaki temel doğrulanmamış varsayımı test et`,
                priority: "HIGH",
              },
            };
          } else {
            goalCard = {
              label: isEn
                ? `Name the single biggest growth blocker for ${productName} — and remove it`
                : `${productName}'in büyümesini engelleyen tek şeyi tanımla ve kaldır`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Remove the biggest growth blocker for ${productName}`
                  : `${productName} için en büyük growth engelini kaldır`,
                priority: "HIGH",
              },
            };
          }
          suggestions.push(goalCard);
        }

        // Card 3 — integration or manual baseline
        if (suggestions.length < 3) {
          const setup = data.metric_setup ?? {};
          const integrations = data.connected_integrations ?? [];
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
          } else {
            suggestions.push({
              label: isEn
                ? `Enter your first metric baseline — even rough numbers help`
                : `İlk metrik baz çizgisini gir — kaba sayılar bile işe yarar`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Enter first metric baseline for ${productName}`
                  : `${productName} için ilk metrik baz çizgisini gir`,
                priority: "MEDIUM",
              },
            });
          }
        }
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
      for (const [c, info] of Object.entries(categories) as [string, { total: number; completed: number }][]) {
        const rate = info.total > 0 ? (info.completed / info.total) * 100 : 100;
        if (rate < weakestRate) {
          weakestRate = rate;
          weakestCat = c;
        }
      }
      if (weakestCat && weakestRate < 100) {
        suggestions.push({
          label: isEn
            ? `${weakestCat} is the weakest area (${Math.round(weakestRate)}%) — advance the next item`
            : `${weakestCat} en zayıf alan (%${Math.round(weakestRate)}) — sıradaki maddeyi ilerlet`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Advance ${weakestCat} launch items for ${productName} (currently at ${Math.round(weakestRate)}%)`
              : `${productName} için ${weakestCat} launch maddelerini ilerlet (şu an %${Math.round(weakestRate)})`,
            priority: "MEDIUM",
          },
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
        // Card 1 — businessModel-specific metric setup suggestion
        let setupCard: Suggestion;
        if (bm.includes("subscription") || bm.includes("abonelik")) {
          setupCard = {
            label: isEn
              ? `Set up MRR and churn tracking — the core metrics for ${productName}`
              : `${productName} için MRR ve churn takibini kur — subscription'ın temel metrikleri`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Set up MRR and churn rate tracking for ${productName}`
                : `${productName} için MRR ve churn rate takibini kur`,
              priority: "HIGH",
            },
          };
        } else if (bm.includes("marketplace") || bm.includes("komisyon")) {
          setupCard = {
            label: isEn
              ? `Set up GMV and conversion rate tracking for ${productName}`
              : `${productName} için GMV ve dönüşüm oranı takibini kur`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Set up GMV and conversion tracking for ${productName}`
                : `${productName} için GMV ve dönüşüm takibini kur`,
              priority: "HIGH",
            },
          };
        } else if (bm.includes("freemium")) {
          setupCard = {
            label: isEn
              ? `Track free-to-paid conversion — the metric that defines ${productName}'s growth`
              : `${productName} için ücretsiz→ücretli dönüşümü takip et`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Set up free-to-paid conversion tracking for ${productName}`
                : `${productName} için ücretsiz→ücretli dönüşüm takibini kur`,
              priority: "HIGH",
            },
          };
        } else if (cat.includes("mobile") || desc.includes("ios") || desc.includes("android")) {
          setupCard = {
            label: isEn
              ? `Set up DAU and Day-7 retention — the two metrics that define mobile health`
              : `DAU ve 7. gün retention'ı kur — mobil sağlığı tanımlayan iki metrik`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Set up DAU and Day-7 retention tracking for ${productName}`
                : `${productName} için DAU ve 7. gün retention takibini kur`,
              priority: "HIGH",
            },
          };
        } else {
          setupCard = {
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
          };
        }
        suggestions.push(setupCard);

        // Card 2 — goalKey-specific action task
        if (goalKey === "build_growth_rhythm") {
          suggestions.push({
            label: isEn
              ? `Map current acquisition sources — understand where users are coming from`
              : `Mevcut edinim kaynaklarını haritala — kullanıcıların nereden geldiğini netleştir`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Map current acquisition sources for ${productName}`
                : `${productName} için mevcut edinim kaynaklarını haritala`,
              priority: "HIGH",
            },
          });
        } else if (goalKey === "get_first_users") {
          suggestions.push({
            label: isEn
              ? `List the first 10 target users and define how to reach each one`
              : `İlk 10 hedef kullanıcıyı listele ve her birine nasıl ulaşacağını tanımla`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Identify and reach first 10 target users for ${productName}`
                : `${productName} için ilk 10 hedef kullanıcıyı belirle ve ulaş`,
              priority: "HIGH",
            },
          });
        } else if (goalKey === "get_first_revenue") {
          suggestions.push({
            label: isEn
              ? `Identify the single most likely first paying customer — and make contact`
              : `İlk ödeme yapacak en muhtemel müşteriyi belirle ve iletişime geç`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Identify and contact the first paying customer prospect for ${productName}`
                : `${productName} için ilk ödeme yapacak müşteri adayını belirle ve iletişime geç`,
              priority: "HIGH",
            },
          });
        } else {
          suggestions.push({
            label: isEn
              ? `Name the single biggest growth blocker for ${productName} — and remove it`
              : `${productName}'in büyümesini engelleyen tek şeyi tanımla ve kaldır`,
            intent: "create_task",
            payload: {
              title: isEn
                ? `Remove the biggest growth blocker for ${productName}`
                : `${productName} için en büyük growth engelini kaldır`,
              priority: "HIGH",
            },
          });
        }

        // Card 3 — baseline entry prompt
        suggestions.push({
          label: isEn
            ? `Enter your first metric baseline — even rough numbers help`
            : `İlk metrik baz çizgisini gir — kaba sayılar bile işe yarar`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Enter first metric baseline for ${productName}`
              : `${productName} için ilk metrik baz çizgisini gir`,
            priority: "MEDIUM",
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
                ? `${key} dropped from ${trend.prev} to ${trend.latest} — find and fix the cause`
                : `${key} ${trend.prev}'den ${trend.latest}'e düştü — nedenini bul ve gider`,
              intent: "create_task",
              payload: {
                title: isEn
                  ? `Investigate why ${key} dropped from ${trend.prev} to ${trend.latest} for ${productName}`
                  : `${productName}'de ${key} neden ${trend.prev}'den ${trend.latest}'e düştü — araştır ve çöz`,
                priority: "HIGH",
              },
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
            ? `Identify the weakest AARRR stage for ${productName} and focus on it this week`
            : `${productName} için en zayıf AARRR aşamasını belirle ve bu hafta ona odaklan`,
          intent: "create_task",
          payload: {
            title: isEn
              ? `Identify and address the weakest AARRR stage for ${productName}`
              : `${productName} için en zayıf AARRR aşamasını belirle ve harekete geç`,
            priority: "MEDIUM",
          },
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
