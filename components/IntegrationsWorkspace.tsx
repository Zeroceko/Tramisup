"use client";

import { useDeferredValue, useMemo, useState } from "react";
import IntegrationCard, {
  type ExistingIntegration,
  type IntegrationDef,
} from "@/components/IntegrationCard";
import { BrandLogo } from "@/components/BrandLogo";

type IntegrationsWorkspaceProps = {
  productName: string;
  integrations: ExistingIntegration[];
  availableIntegrations: IntegrationDef[];
  productId: string;
  success?: string;
  error?: string;
};

const feedbackCopy: Record<string, { tone: "success" | "error"; title: string; body: string }> = {
  ga4_connected: {
    tone: "success",
    title: "Google Analytics baglandi",
    body: "Bir adim daha kaldi: senkronizasyonun dogru property uzerinden akmasi icin GA4 mulkunu sec.",
  },
  stripe_connected: {
    tone: "success",
    title: "Stripe baglandi",
    body: "Gelir ve churn verileri artik sync akisina hazir.",
  },
  stripe_denied: {
    tone: "error",
    title: "Stripe izni tamamlanmadi",
    body: "Baglanti ekrani yarida kaldi. Istersen tekrar deneyebiliriz.",
  },
  missing_params_or_denied: {
    tone: "error",
    title: "Google baglantisi tamamlanmadi",
    body: "Google izin akisi eksik ya da yarida kaldi. Tekrar deneyince akisi kaldigi yerden netlestirebiliriz.",
  },
  unauthorized_product: {
    tone: "error",
    title: "Baglanti hedefi dogrulanamadi",
    body: "Secili urunle OAuth state eslesmedi. Sayfayi yenileyip tekrar dene.",
  },
  missing_env_secrets: {
    tone: "error",
    title: "Google OAuth ayari eksik",
    body: "Sunucu tarafinda gerekli gizli anahtarlar eksik gorunuyor.",
  },
  exchange_failed: {
    tone: "error",
    title: "Token degisimi basarisiz oldu",
    body: "Google izin verdi ama token alma asamasi tamamlanmadi. Log tarafini tekrar kontrol etmemiz gerekebilir.",
  },
  oauth_crash: {
    tone: "error",
    title: "OAuth callback beklenmedik sekilde durdu",
    body: "Akis callback asamasinda patladi. Log bize kalan ipucunu verecek.",
  },
};

export default function IntegrationsWorkspace({
  productName,
  integrations,
  availableIntegrations,
  productId,
  success,
  error,
}: IntegrationsWorkspaceProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const integrationMap = useMemo(
    () => new Map(integrations.map((integration) => [integration.provider, integration])),
    [integrations],
  );

  const connectedCount = integrations.filter((integration) => integration.status === "CONNECTED").length;
  const setupCount = integrations.filter(
    (integration) =>
      integration.status === "CONNECTED" &&
      integration.provider === "GA4" &&
      !integration.selectedPropertyId,
  ).length;

  const syncReadyCount = integrations.filter((integration) => {
    if (integration.status !== "CONNECTED") {
      return false;
    }

    if (integration.provider === "GA4") {
      return Boolean(integration.selectedPropertyId);
    }

    return true;
  }).length;

  const filteredIntegrations = availableIntegrations.filter((integration) => {
    if (!deferredSearch) {
      return true;
    }

    const haystack = `${integration.name} ${integration.description} ${integration.provider}`.toLowerCase();
    return haystack.includes(deferredSearch);
  });

  const liveIntegrations = filteredIntegrations.filter((integration) => !integration.comingSoon);
  const roadmapIntegrations = filteredIntegrations.filter((integration) => integration.comingSoon);
  const feedback = success ? feedbackCopy[success] : error ? feedbackCopy[error] : null;

  return (
    <div className="min-h-screen -m-4 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,166,196,0.42),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(187,219,255,0.28),_transparent_30%),linear-gradient(180deg,_#fff9fc_0%,_#fff7f9_42%,_#f8f6f3_100%)] p-4 sm:-m-6 sm:p-6 md:-m-8 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[34px] border border-[#efdde6] bg-white/88 p-6 shadow-[0_30px_100px_rgba(216,153,181,0.18)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,_rgba(255,205,226,0.45),_rgba(255,255,255,0))]" />

          <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d3e1] bg-[#fff7fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b85e88]">
                Workspace Connectors
              </div>
              <div className="space-y-3">
                <p className="text-[15px] text-[#6d6571]">Where does your product stand right now?</p>
                <div className="flex flex-wrap items-end gap-3">
                  <h1 className="font-outfit text-[38px] leading-none tracking-[-0.04em] text-[#111014] sm:text-[48px]">
                    Integrations Board
                  </h1>
                  <div className="rounded-full border border-[#eee2e8] bg-white px-3 py-1 text-[12px] font-medium text-[#6d6571]">
                    {productName}
                  </div>
                </div>
                <p className="max-w-2xl text-[15px] leading-7 text-[#5f5963]">
                  Tiramisup&apos;in Founder Coach katmani burada bagladigin veri kaynaklariyla karar veriyor.
                  Once dogru connector&apos;u bagla, sonra dogru mulku sec, en son sync ile gercek metriyi iceri al.
                </p>
              </div>

              {feedback ? (
                <div
                  className={`rounded-[24px] border px-4 py-4 ${
                    feedback.tone === "success"
                      ? "border-[#dcefd8] bg-[#f6fff3]"
                      : "border-[#f4d7da] bg-[#fff6f7]"
                  }`}
                >
                  <p className="text-[13px] font-semibold text-[#111014]">{feedback.title}</p>
                  <p className="mt-1 text-[13px] leading-6 text-[#625d67]">{feedback.body}</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[28px] border border-[#eee5ea] bg-white p-5 shadow-[0_12px_40px_rgba(17,16,20,0.04)]">
                <p className="text-[13px] text-[#78717c]">Connected</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="font-outfit text-[40px] leading-none tracking-[-0.05em] text-[#111014]">
                    {connectedCount}
                  </span>
                  <span className="rounded-full bg-[#fff0f7] px-3 py-1 text-[12px] font-medium text-[#b85e88]">
                    Live sources
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eee5ea] bg-white p-5 shadow-[0_12px_40px_rgba(17,16,20,0.04)]">
                <p className="text-[13px] text-[#78717c]">Needs setup</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="font-outfit text-[40px] leading-none tracking-[-0.05em] text-[#111014]">
                    {setupCount}
                  </span>
                  <span className="rounded-full bg-[#fff7df] px-3 py-1 text-[12px] font-medium text-[#a27a00]">
                    Pick property
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eee5ea] bg-[#111014] p-5 text-white shadow-[0_18px_54px_rgba(17,16,20,0.18)]">
                <p className="text-[13px] text-white/66">Sync-ready</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="font-outfit text-[40px] leading-none tracking-[-0.05em]">
                    {syncReadyCount}
                  </span>
                  <span className="rounded-full bg-white/12 px-3 py-1 text-[12px] font-medium text-[#ffd8ea]">
                    Coach-ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.88fr]">
          <section className="space-y-6">
            <div className="rounded-[30px] border border-[#eee2e8] bg-white/92 p-5 shadow-[0_16px_48px_rgba(17,16,20,0.05)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-[#111014]">Growth Stack Connectors</p>
                  <p className="mt-1 text-[13px] leading-6 text-[#6b6570]">
                    Once secili urunun veri akisini sakin bir sirayla kur. GA4 icin property secimi, Stripe icin revenue sync burada netlesiyor.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-full border border-[#ecdfe7] bg-[#fff8fb] px-3 py-2 text-[12px] font-medium text-[#7a6d76]">
                    Live: {liveIntegrations.length} connector
                  </div>
                  <label className="relative block min-w-[240px]">
                    <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9b93a0]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Connector ara..."
                      className="h-11 w-full rounded-full border border-[#ece1e7] bg-white pl-11 pr-4 text-[14px] text-[#111014] outline-none transition focus:border-[#f3b7d1] focus:ring-4 focus:ring-[#ffd9ea]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {liveIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.provider}
                  integration={integration}
                  existingIntegration={integrationMap.get(integration.provider)}
                  productId={productId}
                  autoOpenPropertySelector={success === "ga4_connected" && integration.provider === "GA4"}
                />
              ))}
            </div>

            <div className="rounded-[30px] border border-[#eee2e8] bg-white/92 p-6 shadow-[0_16px_48px_rgba(17,16,20,0.05)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#b85e88]">Roadmap</p>
                  <h2 className="mt-2 font-outfit text-[28px] tracking-[-0.03em] text-[#111014]">Next connectors</h2>
                </div>
                <p className="max-w-xl text-[13px] leading-6 text-[#6b6570]">
                  Bu grup bugun acik degil. Ama gorecegin her kart, gelecekte coach katmanina hangi sinyali ekleyecegimizi gosteriyor.
                </p>
              </div>

              <div className="mt-5 divide-y divide-[#f0e8ed]">
                {roadmapIntegrations.map((integration) => (
                  <div key={integration.provider} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f8f2f6] overflow-hidden">
                      <BrandLogo provider={integration.provider} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#111014]">{integration.name}</p>
                      <p className="truncate text-[12px] text-[#8b8390]">{integration.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#ece5e9] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#8b8390]">
                      Yakında
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[30px] border border-[#eee2e8] bg-white/92 p-6 shadow-[0_16px_48px_rgba(17,16,20,0.05)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#b85e88]">How it works</p>
              <div className="mt-4 space-y-4">
                {[
                  "Google veya Stripe bagla.",
                  "Google icin dogru GA4 mulkunu sec.",
                  "Sync ile metrikleri veritabanina yaz.",
                  "Founder Coach artik gercek veriyle yorum yapsin.",
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-[22px] bg-[#fff8fb] p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffd8ea] text-[13px] font-semibold text-[#111014]">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-[13px] leading-6 text-[#5f5963]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] bg-[#111014] p-6 text-white shadow-[0_22px_60px_rgba(17,16,20,0.24)]">
              <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffd8ea]">
                Founder Coach
              </div>
              <h3 className="mt-5 font-outfit text-[30px] leading-[1.05] tracking-[-0.04em]">
                Real metrics in. Sharper advice out.
              </h3>
              <p className="mt-4 text-[14px] leading-7 text-white/74">
                GA4 baglantisinda property secimi net degilse koçluk da bulanık kalir. Bu yuzden baglandi rozetinden sonra
                bir de veri kaynagini sabitliyoruz.
              </p>
              <div className="mt-6 rounded-[24px] bg-white/8 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/58">Current rule</p>
                <p className="mt-2 text-[14px] leading-6 text-white/78">
                  GA4 kartinda property secili olmadan sync butonu artik veri cekmeye calismayacak. Once dogru mulk, sonra sync.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
