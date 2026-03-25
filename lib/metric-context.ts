import { prisma } from "@/lib/prisma";

// ── Types ──────────────────────────────────────────────────────────────────────

export type MetricSnapshot = {
  latestMrr: number | null;
  latestDau: number | null;
  latestMau: number | null;
  latestNewSignups: number | null;
  latestChurnedUsers: number | null;
  latestActiveSubscriptions: number | null;
  latestActivationRate: number | null;
  mrrTrend: "up" | "down" | "stable" | null;
  dauTrend: "up" | "down" | "stable" | null;
  daysCovered: number;
};

export type MetricContext = {
  snapshot: MetricSnapshot | null;
  integrations: string[];
  contextString: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function trend(
  current: number | null | undefined,
  previous: number | null | undefined
): "up" | "down" | "stable" | null {
  if (current == null || previous == null) return null;
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

function fmt(value: number | null | undefined, suffix = ""): string {
  if (value == null) return "veri yok";
  return `${value.toLocaleString("tr-TR")}${suffix}`;
}

function trendIcon(t: "up" | "down" | "stable" | null): string {
  if (t === "up") return "📈";
  if (t === "down") return "📉";
  if (t === "stable") return "➡️";
  return "";
}

// ── Core Function ──────────────────────────────────────────────────────────────

/**
 * Fetches the last 7 days of Metric records and connected integrations for a
 * product, then builds a structured snapshot and a ready-to-inject Turkish
 * context string for AI prompts.
 */
export async function getMetricContext(productId: string): Promise<MetricContext> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [metrics, integrations] = await Promise.all([
    prisma.metric.findMany({
      where: { productId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "desc" },
      take: 14, // get enough rows to compute trends
    }),
    prisma.integration.findMany({
      where: { productId, status: "CONNECTED" },
      select: { provider: true, lastSyncAt: true },
    }),
  ]);

  const connectedProviders = integrations.map((i) => i.provider);

  if (metrics.length === 0) {
    const noDataLines = [
      "📊 GERÇEK METRİK VERİSİ: Henüz metrik kaydı yok.",
      connectedProviders.length > 0
        ? `Bağlı entegrasyonlar: ${connectedProviders.join(", ")}. İlk sync bekleniyor.`
        : "Bağlı entegrasyon yok. Kurucuya Stripe veya GA4 bağlamasını öner.",
    ];

    return {
      snapshot: null,
      integrations: connectedProviders,
      contextString: noDataLines.join("\n"),
    };
  }

  // Latest = most recent row; previous = second most recent (for trend)
  const latest = metrics[0];
  const previous = metrics.length > 1 ? metrics[1] : null;

  const snapshot: MetricSnapshot = {
    latestMrr: latest.mrr,
    latestDau: latest.dau,
    latestMau: latest.mau,
    latestNewSignups: latest.newSignups,
    latestChurnedUsers: latest.churnedUsers,
    latestActiveSubscriptions: latest.activeSubscriptions,
    latestActivationRate: latest.activationRate,
    mrrTrend: trend(latest.mrr, previous?.mrr),
    dauTrend: trend(latest.dau, previous?.dau),
    daysCovered: metrics.length,
  };

  // ── Build a human-readable Turkish context string ───────────────────────────
  const lines: string[] = [
    "📊 GERÇEK METRİK VERİSİ (Son kayıtlar):",
  ];

  if (snapshot.latestMrr != null) {
    lines.push(
      `  • MRR (Aylık Tekrarlayan Gelir): ${fmt(snapshot.latestMrr, "$")} ${trendIcon(snapshot.mrrTrend)}`
    );
  }
  if (snapshot.latestDau != null) {
    lines.push(
      `  • DAU (Günlük Aktif Kullanıcı): ${fmt(snapshot.latestDau)} ${trendIcon(snapshot.dauTrend)}`
    );
  }
  if (snapshot.latestMau != null) {
    lines.push(`  • MAU (Aylık Aktif Kullanıcı): ${fmt(snapshot.latestMau)}`);
  }
  if (snapshot.latestNewSignups != null) {
    lines.push(`  • Yeni Kayıt: ${fmt(snapshot.latestNewSignups)}`);
  }
  if (snapshot.latestActiveSubscriptions != null) {
    lines.push(`  • Aktif Abonelik: ${fmt(snapshot.latestActiveSubscriptions)}`);
  }
  if (snapshot.latestChurnedUsers != null && snapshot.latestChurnedUsers > 0) {
    lines.push(`  • Son 30 Gün İptal: ${fmt(snapshot.latestChurnedUsers)} ⚠️`);
  }
  if (snapshot.latestActivationRate != null) {
    lines.push(`  • Aktivasyon Oranı: %${(snapshot.latestActivationRate * 100).toFixed(1)}`);
  }

  lines.push(`  • Kapsanan gün sayısı: ${snapshot.daysCovered}`);
  lines.push(`  • Veri kaynağı: ${latest.source === "INTEGRATION" ? "Otomatik entegrasyon" : "Manuel giriş"}`);

  if (connectedProviders.length > 0) {
    lines.push(`  • Bağlı entegrasyonlar: ${connectedProviders.join(", ")}`);
  } else {
    lines.push("  • Bağlı entegrasyon yok — kurucuya Stripe/GA4 bağlamasını öner.");
  }

  // Add trend analysis cue for the AI
  if (snapshot.mrrTrend === "down") {
    lines.push("\n⚠️ DİKKAT: MRR düşüş trendinde. Churn analizi öncelikli.");
  }
  if (snapshot.dauTrend === "down") {
    lines.push("\n⚠️ DİKKAT: DAU düşüyor. Retention veya activation problemine bak.");
  }

  return {
    snapshot,
    integrations: connectedProviders,
    contextString: lines.join("\n"),
  };
}
