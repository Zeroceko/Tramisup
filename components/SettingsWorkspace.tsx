"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";
import AISettingsPanel from "@/components/AISettingsPanel";
import IntegrationsWorkspace from "@/components/IntegrationsWorkspace";
import MetricSetupSelector from "@/components/MetricSetupSelector";
import BillingUsage from "@/components/BillingUsage";
import type { GrowthMetricPlan } from "@/lib/growth-metric-recommendations";
import type { SavedMetricSetup } from "@/lib/metric-setup";
import type { ExistingIntegration, IntegrationDef } from "@/components/IntegrationCard";
import type { PlanTier, LimitKey } from "@/lib/plan-limits";
import type { BillingInterval, SubStatus } from "@prisma/client";

type IntegrationItem = ExistingIntegration;

type UserShape = {
  id: string;
  name: string | null;
  email: string;
  preferredLocale?: string | null;
  product: {
    id: string;
    name: string;
    launchDate: Date | null;
    status: string;
  } | null;
} | null;

type CopyShape = {
  sourcesLabel: string;
  sourcesTitle: string;
  sourcesWithCountLabel: string;
  sourcesEmpty: string;
  lastSync: string;
  connected: string;
  error: string;
  disconnected: string;
  manageSources: string;
  connectSource: string;
  growthLabel: string;
  growthTitle: string;
  growthDesc: string;
  growthCta: string;
  navProduct: string;
  navAI: string;
  navSources: string;
  navTracking: string;
  navBilling: string;
};

type BillingData = {
  plan: PlanTier;
  interval: BillingInterval;
  status: SubStatus;
  currentPeriodEnd: Date | null;
  usage: Array<{ key: LimitKey; label: string; used: number; limit: number }>;
};

type WorkspaceSectionKey = "product" | "ai" | "sources" | "tracking" | "billing";

export default function SettingsWorkspace({
  locale,
  user,
  activeProduct,
  integrations,
  connectedCount,
  copy,
  isEn,
  metricPlan,
  savedMetricSetup,
  connectedProviders,
  availableIntegrations,
  sourceIntegrations,
  manualEntryCount,
  aiConnections,
  productAISettings,
  aiSuccess,
  aiError,
  sourceSuccess,
  sourceError,
  initialSection,
  billingData,
}: {
  locale: string;
  user: UserShape;
  activeProduct: { id: string; name: string; status: string } | null | undefined;
  integrations: IntegrationItem[];
  connectedCount: number;
  copy: CopyShape;
  isEn: boolean;
  metricPlan: GrowthMetricPlan | null;
  savedMetricSetup: SavedMetricSetup | null;
  connectedProviders: string[];
  availableIntegrations: IntegrationDef[];
  sourceIntegrations: ExistingIntegration[];
  manualEntryCount: number;
  aiConnections: Array<{
    id: string;
    provider: "GOOGLE_AI" | "OPENAI" | "ANTHROPIC";
    authType: string;
    status: string;
    label: string | null;
    remoteAccountEmail: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  productAISettings: {
    mode: "PLATFORM_DEFAULT" | "CONNECTED_MODEL";
    selectedConnectionId: string | null;
  } | null;
  aiSuccess?: string;
  aiError?: string;
  sourceSuccess?: string;
  sourceError?: string;
  initialSection?: WorkspaceSectionKey;
  billingData?: BillingData;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSection = (() => {
    const section = searchParams.get("section");
    if (section === "ai" || section === "sources" || section === "tracking" || section === "billing" || section === "product") {
      return section;
    }
    return initialSection ?? "product";
  })() as WorkspaceSectionKey;

  const navItems = useMemo(
    () =>
      [
        { key: "product", label: copy.navProduct },
        { key: "ai", label: copy.navAI },
        { key: "sources", label: copy.navSources },
        { key: "tracking", label: copy.navTracking },
        { key: "billing", label: copy.navBilling },
      ] satisfies Array<{ key: WorkspaceSectionKey; label: string }>,
    [copy]
  );

  if (!pathname?.includes("/settings")) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white">
      <div className="border-b border-[#f1f1f1] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.set("section", item.key);
                  router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
                }}
                className={`inline-flex h-11 items-center rounded-full px-5 text-[14px] font-medium transition ${
                  active
                    ? "bg-[#ffd7ef] text-[#0d0d12]"
                    : "bg-[#f7f7fa] text-[#666d80] hover:bg-[#f0f1f6] hover:text-[#0d0d12]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {activeSection === "product" ? (
          <SettingsForm
            user={user}
            locale={locale}
            activeSection={activeSection}
          />
        ) : null}

        {activeSection === "ai" ? (
          <AISettingsPanel
            locale={locale}
            activeProductId={activeProduct?.id ?? null}
            activeProductName={activeProduct?.name ?? null}
            connections={aiConnections}
            settings={productAISettings}
            success={aiSuccess}
            error={aiError}
          />
        ) : null}

        {activeSection === "sources" && activeProduct ? (
          <IntegrationsWorkspace
            locale={locale}
            embedded
            productName={activeProduct.name}
            integrations={sourceIntegrations}
            availableIntegrations={availableIntegrations}
            productId={activeProduct.id}
            manualEntryCount={manualEntryCount}
            success={sourceSuccess}
            error={sourceError}
          />
        ) : null}

        {activeSection === "tracking" && activeProduct && metricPlan ? (
          <MetricSetupSelector
            productId={activeProduct.id}
            plan={metricPlan}
            initialSetup={savedMetricSetup}
            locale={locale}
            connectedProviders={connectedProviders}
          />
        ) : null}

        {activeSection === "tracking" && (!activeProduct || !metricPlan) ? (
          <div className="rounded-[20px] border border-dashed border-[#e8e8e8] bg-[#fafafa] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
              {copy.navTracking}
            </p>
            <p className="mt-2 text-[16px] font-semibold text-[#0d0d12]">
              {isEn ? "Tracking setup is not ready yet" : "Takip kurulumu henüz hazır değil"}
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[#666d80]">
              {activeProduct
                ? isEn
                  ? "This product does not have a metric plan to edit yet. Complete onboarding or reopen growth setup once the tracking model exists."
                  : "Bu ürün için henüz düzenlenebilir bir metrik planı yok. Tracking modeli oluştuktan sonra onboarding'i tamamla veya growth setup'ı yeniden aç."
                : isEn
                  ? "Select an active product first to configure tracking metrics."
                  : "Takip metriklerini kurmak için önce aktif bir ürün seç."}
            </p>
          </div>
        ) : null}

        {activeSection === "billing" && billingData ? (
          <BillingUsage
            plan={billingData.plan}
            interval={billingData.interval}
            status={billingData.status}
            currentPeriodEnd={billingData.currentPeriodEnd}
            usage={billingData.usage}
            locale={locale}
          />
        ) : null}
      </div>
    </section>
  );
}
