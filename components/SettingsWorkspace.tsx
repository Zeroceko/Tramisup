"use client";

import { useMemo, useState } from "react";
import SettingsForm from "@/components/SettingsForm";
import AISettingsPanel from "@/components/AISettingsPanel";
import IntegrationsWorkspace from "@/components/IntegrationsWorkspace";
import MetricSetupSelector from "@/components/MetricSetupSelector";
import type { GrowthMetricPlan } from "@/lib/growth-metric-recommendations";
import type { SavedMetricSetup } from "@/lib/metric-setup";
import type { ExistingIntegration, IntegrationDef } from "@/components/IntegrationCard";

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
};

type WorkspaceSectionKey = "product" | "ai" | "sources" | "tracking";

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
}) {
  const [activeSection, setActiveSection] = useState<WorkspaceSectionKey>(initialSection ?? "product");

  const navItems = useMemo(
    () =>
      [
        { key: "product", label: copy.navProduct },
        { key: "ai", label: copy.navAI },
        { key: "sources", label: copy.navSources },
        { key: "tracking", label: copy.navTracking },
      ] satisfies Array<{ key: WorkspaceSectionKey; label: string }>,
    [copy]
  );

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
                onClick={() => setActiveSection(item.key)}
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
      </div>
    </section>
  );
}
