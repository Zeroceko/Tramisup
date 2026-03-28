"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GrowthMetricPlan, FunnelSection, FunnelMetricRecommendation } from "@/lib/growth-metric-recommendations";
import type { SavedMetricSetup } from "@/lib/metric-setup";
import { getStageAutomationGuides } from "@/lib/integration-recommendations";

// --- Types ---

type Selected = Record<string, string>;

// --- Summary panel ---

function SummaryPanel({
  plan,
  selected,
}: {
  plan: GrowthMetricPlan;
  selected: Selected;
}) {
  const selectedCount = plan.sections.filter((s) => !!selected[s.stage]).length;
  const total = plan.sections.length;
  const allDone = selectedCount === total;

  // Detect vanity selections
  const vanitySelections = plan.sections.flatMap((section) => {
    const key = selected[section.stage];
    if (!key) return [];
    const metric = section.metrics.find((m) => m.key === key);
    return metric?.vanityWarning ? [{ stage: section.stage, warning: metric.vanityWarning }] : [];
  });

  // Build what the dashboard will show
  const dashboardItems = plan.sections.map((section) => {
    const key = selected[section.stage];
    const metric = section.metrics.find((m) => m.key === key);
    return { stage: section.stage, metric: metric ?? null };
  });

  return (
    <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
        Ölçüm sistemi
      </p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold tracking-[-0.02em] text-[#0d0d12]">
          {selectedCount}
        </span>
        <span className="text-[14px] text-[#666d80]">/ {total} aşama</span>
      </div>

      {/* Funnel coverage dots */}
      <div className="mt-3 flex gap-1">
        {plan.sections.map((section) => (
          <div
            key={section.stage}
            title={section.stage}
            className={`h-2 flex-1 rounded-full transition-colors ${
              selected[section.stage] ? "bg-[#95dbda]" : "bg-[#e8e8e8]"
            }`}
          />
        ))}
      </div>

      {/* Selected metrics list */}
      <div className="mt-4 space-y-2">
        {dashboardItems.map(({ stage, metric }) => (
          <div key={stage} className="flex items-start gap-2">
            <span
              className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                metric ? "bg-[#95dbda]" : "bg-[#e8e8e8]"
              }`}
            />
            <div className="min-w-0">
              <p className="text-[11px] text-[#8a8fa0]">{stage}</p>
              {metric ? (
                <p className="text-[12px] font-semibold leading-4 text-[#0d0d12]">
                  {metric.name}
                </p>
              ) : (
                <p className="text-[12px] text-[#c0c0c0]">Seçilmedi</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vanity warnings */}
      {vanitySelections.length > 0 && (
        <div className="mt-4 rounded-[12px] border border-orange-100 bg-[#fff7ed] p-3">
          <p className="text-[11px] font-semibold text-[#c2410c]">
            {vanitySelections.length === 1 ? "1 düşük güven metriği" : `${vanitySelections.length} düşük güven metriği`}
          </p>
          {vanitySelections.map(({ stage, warning }) => (
            <p key={stage} className="mt-1 text-[11px] leading-4 text-[#c2410c]">
              <span className="font-semibold">{stage}:</span> {warning}
            </p>
          ))}
        </div>
      )}

      {/* Coach explanation */}
      {allDone && vanitySelections.length === 0 && (
        <div className="mt-4 rounded-[12px] bg-[#f0fafa] p-3">
          <p className="text-[12px] font-semibold text-[#0d0d12]">Koç ne yapacak?</p>
          <p className="mt-1 text-[11px] leading-4 text-[#666d80]">
            Bu {total} metrik her gün güncellendikçe koç trendi okuyacak, zayıf halkayı tespit edecek ve ne yapman gerektiğini söyleyecek.
          </p>
        </div>
      )}

      {!allDone && (
        <p className="mt-4 text-[11px] leading-4 text-[#8a8fa0]">
          {total - selectedCount} aşama daha seçilince dashboard ve koç bu metrikleri kullanmaya başlar.
        </p>
      )}
    </div>
  );
}

// --- Metric card ---

function MetricCard({
  metric,
  isSelected,
  isDisabled = false,
  sourceLabel,
  onSelect,
}: {
  metric: FunnelMetricRecommendation;
  isSelected: boolean;
  isDisabled?: boolean;
  sourceLabel?: string | null;
  onSelect: () => void;
}) {
  const [showAvoid, setShowAvoid] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      className={`w-full rounded-[14px] border p-4 text-left transition ${
        isSelected
          ? "border-[#95dbda] bg-[#f0fafa]"
          : isDisabled
          ? "border-[#ececec] bg-[#f7f7f7] opacity-55"
          : "border-[#e8e8e8] bg-[#fafafa] hover:border-[#cce8e8]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {metric.recommended && (
            <span className="rounded-full bg-[#ffd7ef] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0d0d12]">
              Önerilen
            </span>
          )}
          {sourceLabel && (
            <span className="rounded-full bg-[#eaf7f6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1c6b69]">
              {sourceLabel}
            </span>
          )}
        </div>
        {/* Radio circle */}
        <span
          className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
            isSelected ? "border-[#95dbda] bg-[#95dbda]" : "border-[#cfcfcf]"
          }`}
        >
          {isSelected && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path
                d="M1 3L3 5L7 1"
                stroke="#0d0d12"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>

      {/* Name */}
      <p className={`mt-2 text-[13px] font-semibold leading-snug ${isSelected ? "text-[#0d0d12]" : "text-[#0d0d12]"}`}>
        {metric.name}
      </p>

      {/* Description */}
      <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{metric.description}</p>

      {/* When to use */}
      <p className="mt-2 text-[11px] leading-4 text-[#8a8fa0]">
        <span className="font-semibold">Ne zaman: </span>
        {metric.whenToUse}
      </p>

      {/* When to avoid (toggle) */}
      {metric.whenToAvoid && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowAvoid((v) => !v); }}
          className="mt-1.5 text-[11px] text-[#94a3b8] underline-offset-2 hover:underline"
        >
          {showAvoid ? "Gizle" : "Ne zaman seçme?"}
        </button>
      )}
      {showAvoid && metric.whenToAvoid && (
        <p className="mt-1 text-[11px] leading-4 text-[#8a8fa0]">
          <span className="font-semibold">Kaçın: </span>
          {metric.whenToAvoid}
        </p>
      )}

      {/* Vanity warning — only shown when selected */}
      {isSelected && metric.vanityWarning && (
        <div className="mt-3 rounded-[10px] border border-orange-100 bg-[#fff7ed] p-2.5">
          <p className="text-[11px] leading-4 text-[#c2410c]">
            ⚠ {metric.vanityWarning}
          </p>
        </div>
      )}

      {isDisabled && (
        <p className="mt-3 text-[11px] leading-4 text-[#8a8fa0]">
          Bu secenek bagli kaynaklarla otomatik dolmaz.
        </p>
      )}
    </button>
  );
}

// --- Stage section ---

function StageSection({
  section,
  selectedKey,
  automation,
  onSelect,
  stageIndex,
}: {
  section: FunnelSection;
  selectedKey: string | undefined;
  automation: {
    supportedMetricKeys: string[];
    connectedProviders: string[];
  };
  onSelect: (key: string) => void;
  stageIndex: number;
}) {
  const isDone = !!selectedKey;
  const hasAutomation = automation.supportedMetricKeys.length > 0;
  const providerLabel = automation.connectedProviders.join(" + ");

  return (
    <div className={`rounded-[16px] border p-5 ${isDone ? "border-[#d1f0ef]" : "border-[#e8e8e8]"}`}>
      {/* Stage header */}
      <div className="mb-4 flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            isDone
              ? "bg-[#95dbda] text-[#0d0d12]"
              : "border border-[#e8e8e8] bg-white text-[#8a8fa0]"
          }`}
        >
          {isDone ? (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            stageIndex + 1
          )}
        </span>
        <div>
          <p className="text-[15px] font-semibold text-[#0d0d12]">{section.stage}</p>
          <p className="mt-0.5 text-[12px] leading-4 text-[#666d80]">{section.guidingQuestion}</p>
        </div>
      </div>

      <div className={`mb-4 rounded-[12px] px-4 py-3 ${hasAutomation ? "bg-[#f0fafa]" : "bg-[#fafafa]"}`}>
        <p className="text-[12px] font-semibold text-[#0d0d12]">
          {hasAutomation
            ? `${providerLabel} bu asamayi otomatik besliyor`
            : "Bu asama manuel secim istiyor"}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
          {hasAutomation
            ? "Bu kaynaklardan gercekten akitabildigimiz metrikleri one cikardik. Diger secenekler bu baglanti ile otomatik dolmaz."
            : "Bu asama icin bagli kaynaklardan dogrudan veri gelmiyor. Buraya manuel girecegin bir metrik sec."}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {section.metrics.map((metric) => {
          const isSupported = automation.supportedMetricKeys.includes(metric.key);
          const shouldDisable = hasAutomation && !isSupported;
          return (
          <MetricCard
            key={metric.key}
            metric={metric}
            isSelected={selectedKey === metric.key}
            isDisabled={shouldDisable}
            sourceLabel={isSupported ? providerLabel : null}
            onSelect={() => onSelect(metric.key)}
          />
          );
        })}
      </div>
    </div>
  );
}

// --- Main component ---

export default function MetricSetupSelector({
  productId,
  plan,
  initialSetup,
  locale,
  connectedProviders,
}: {
  productId: string;
  plan: GrowthMetricPlan;
  initialSetup: SavedMetricSetup | null;
  locale: string;
  connectedProviders: string[];
}) {
  const router = useRouter();

  const automationGuides = useMemo(
    () => getStageAutomationGuides({ plan, connectedProviders }),
    [plan, connectedProviders],
  );
  const automationMap = useMemo(
    () => new Map(automationGuides.map((guide) => [guide.stage, guide])),
    [automationGuides],
  );

  const initialMap = useMemo<Selected>(() => {
    const map: Selected = {};
    const hasSavedSelections = (initialSetup?.selections?.length ?? 0) > 0;
    if (hasSavedSelections) {
      for (const s of initialSetup?.selections ?? []) {
        if (s.selectedMetricKeys[0]) map[s.stage] = s.selectedMetricKeys[0];
      }
      return map;
    }

    for (const guide of automationGuides) {
      if (guide.preferredMetricKey) {
        map[guide.stage] = guide.preferredMetricKey;
      }
    }
    return map;
  }, [automationGuides, initialSetup]);

  const [selected, setSelected] = useState<Selected>(initialMap);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!initialSetup?.selections?.length);

  const completedStages = plan.sections.filter((s) => !!selected[s.stage]).length;
  const allReady = completedStages === plan.sections.length;
  const hasConnectedSources = connectedProviders.length > 0;
  const automatedStages = automationGuides.filter((guide) => guide.supportedMetricKeys.length > 0);
  const manualStages = automationGuides.filter((guide) => guide.supportedMetricKeys.length === 0);
  const mismatchedStages = automationGuides.filter((guide) => {
    const current = selected[guide.stage];
    return current && guide.supportedMetricKeys.length > 0 && !guide.supportedMetricKeys.includes(current);
  });

  function selectMetric(stage: string, key: string) {
    setError(null);
    setSelected((prev) => ({ ...prev, [stage]: key }));
  }

  async function saveSetup() {
    if (!allReady) {
      setError("Devam etmeden önce her aşama için bir metrik seç.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const setup: SavedMetricSetup = {
        version: 2,
        selections: plan.sections.map((s) => ({
          stage: s.stage,
          selectedMetricKeys: selected[s.stage] ? [selected[s.stage]] : [],
        })),
        entries: initialSetup?.entries ?? [],
      };
      const res = await fetch(`/api/products/${productId}/metric-setup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup }),
      });
      if (!res.ok) throw new Error("save failed");
      setEditing(false);
      router.push(`/${locale}/metrics`);
      router.refresh();
    } catch {
      setError("Metrik tercihleri kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  // --- Summary view (not editing) ---
  if (!editing && initialSetup?.selections?.length) {
    const summary = plan.sections.map((s) => {
      const key = selected[s.stage];
      const metric = s.metrics.find((m) => m.key === key);
      return { stage: s.stage, metric };
    });

    return (
      <section id="tracking-metrics" className="rounded-[16px] border border-[#e8e8e8] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
              Seçilen ölçüm sistemi
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
              {plan.sections.length} aşama tanımlı
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#666d80]">
              Günlük veri girişi ve trend takibi için Metrics ekranını kullan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 inline-flex h-9 items-center justify-center rounded-full border border-[#e8e8e8] px-4 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6]"
          >
            Metrikleri değiştir
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summary.map(({ stage, metric }) => (
            <div key={stage} className="rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8fa0]">
                {stage}
              </p>
              {metric ? (
                <>
                  <p className="mt-1 text-[14px] font-semibold text-[#0d0d12]">{metric.name}</p>
                  {metric.vanityWarning && (
                    <p className="mt-1.5 text-[11px] leading-4 text-[#f97316]">
                      ⚠ Düşük güven metriği
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-[13px] text-[#8a8fa0]">Seçilmedi</p>
              )}
            </div>
          ))}
        </div>

        {mismatchedStages.length > 0 && (
          <div className="mt-5 rounded-[14px] border border-[#fed7aa] bg-[#fff7ed] p-4">
            <p className="text-[12px] font-semibold text-[#c2410c]">
              Bagli kaynaklarla uyumlu olmayan secimler var
            </p>
            <p className="mt-1 text-[12px] leading-5 text-[#c2410c]/80">
              {mismatchedStages.map((item) => item.stage).join(", ")} asamalarinda secili metrikler otomatik dolmayacak.
              Metrikleri gozden gecirirsen bagli kaynaklardan akan verilerle daha temiz bir setup kurabiliriz.
            </p>
          </div>
        )}
      </section>
    );
  }

  // --- Edit view ---
  return (
    <section id="tracking-metrics">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
          Growth = neyi takip edeceğiz?
        </p>
        <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
          Her aşama için tek bir ana sinyal seç
        </h2>
        <p className="mt-1.5 text-[13px] leading-5 text-[#666d80]">
          Amacımız optimizasyon değil, netlik. Her aşama için <strong>bir</strong> metrik seç — kaydedince Metrics ekranında günlük veri girmeye geçiyoruz.
        </p>
      </div>

      {hasConnectedSources && (automatedStages.length > 0 || manualStages.length > 0) && (
        <div className="mb-5 rounded-[16px] border border-[#e8e8e8] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
            Kaynak uyumu
          </p>
          <p className="mt-1 text-[14px] leading-6 text-[#0d0d12]">
            Bagli kaynaklardan gercekten akitabildigimiz asamalari otomatik oneriyoruz. Eksik kalan asamalar icin manuel takip edecegin metriği sen sececeksin.
          </p>
          {automatedStages.length > 0 && (
            <p className="mt-3 text-[12px] leading-5 text-[#666d80]">
              Otomatik dolacak asamalar: {automatedStages.map((guide) => guide.stage).join(", ")}
            </p>
          )}
          {manualStages.length > 0 && (
            <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
              Manuel secim gereken asamalar: {manualStages.map((guide) => guide.stage).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        {/* Stage sections */}
        <div className="space-y-3">
          {plan.sections.map((section, i) => (
            <StageSection
              key={section.stage}
              section={section}
              selectedKey={selected[section.stage]}
              automation={{
                supportedMetricKeys: automationMap.get(section.stage)?.supportedMetricKeys ?? [],
                connectedProviders: automationMap.get(section.stage)?.connectedProviders ?? [],
              }}
              onSelect={(key) => selectMetric(section.stage, key)}
              stageIndex={i}
            />
          ))}
        </div>

        {/* Summary panel (sticky on desktop) */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <SummaryPanel plan={plan} selected={selected} />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 mt-5 rounded-[16px] border border-[#e8e8e8] bg-white/96 p-4 shadow-[0_8px_24px_rgba(13,13,18,0.08)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#0d0d12]">
              {completedStages} / {plan.sections.length} aşama seçildi
            </p>
            {!allReady && (
              <p className="mt-0.5 text-[12px] text-[#666d80]">
                Kalan {plan.sections.filter((s) => !selected[s.stage]).map((s) => s.stage).join(", ")} aşamaları için seçim yap.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {initialSetup?.selections?.length ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:opacity-50"
              >
                Vazgeç
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void saveSetup()}
              disabled={saving || !allReady}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Kaydet ve metrik girişine geç"}
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-[12px] text-[#b42318]">{error}</p>}
      </div>
    </section>
  );
}
