"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";
import { BrandLogo } from "@/components/BrandLogo";

type IntegrationItem = {
  provider: string;
  status: string;
  lastSyncAt: Date | string | null;
};

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
  navSources: string;
  navTracking: string;
};

type WorkspaceSectionKey = "product" | "sources" | "tracking";

export default function SettingsWorkspace({
  locale,
  user,
  activeProduct,
  integrations,
  connectedCount,
  copy,
  isEn,
}: {
  locale: string;
  user: UserShape;
  activeProduct: { id: string; name: string; status: string } | null | undefined;
  integrations: IntegrationItem[];
  connectedCount: number;
  copy: CopyShape;
  isEn: boolean;
}) {
  const [activeSection, setActiveSection] = useState<WorkspaceSectionKey>("product");
  const sourcesSummary =
    connectedCount > 0
      ? `${connectedCount} ${copy.sourcesWithCountLabel}`
      : copy.sourcesEmpty;

  const navItems = useMemo(
    () =>
      [
        { key: "product", label: copy.navProduct },
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

        {activeSection === "sources" && activeProduct ? (
          <section className="rounded-[20px] border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                  {copy.sourcesLabel}
                </p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                  {copy.sourcesTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
                  {sourcesSummary}
                </p>
              </div>
              {connectedCount > 0 && (
                <span className="mt-1 flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-[#f0fffe] px-3 text-[13px] font-bold text-[#0d9488]">
                  {connectedCount}
                </span>
              )}
            </div>

            {integrations.length > 0 && (
              <div className="mt-4 space-y-2">
                {integrations.map((integration) => {
                  const isConnected = integration.status === "CONNECTED";
                  const lastSync = integration.lastSyncAt
                    ? new Intl.DateTimeFormat(isEn ? "en-US" : "tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(integration.lastSyncAt))
                    : null;

                  return (
                    <div
                      key={integration.provider}
                      className="flex items-center justify-between gap-3 rounded-[14px] bg-[#fafafa] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#ececec] bg-white">
                          <BrandLogo provider={integration.provider} className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#0d0d12]">
                            {integration.provider}
                          </p>
                          {lastSync && (
                            <p className="text-[11px] text-[#8b93a6]">
                              {copy.lastSync}: {lastSync}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isConnected
                            ? "bg-[#f0fffe] text-[#0d9488]"
                            : integration.status === "ERROR"
                              ? "bg-[#fee2e2] text-[#ef4444]"
                              : "bg-[#f5f5f5] text-[#8b93a6]"
                        }`}
                      >
                        {isConnected
                          ? copy.connected
                          : integration.status === "ERROR"
                            ? copy.error
                            : copy.disconnected}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href={`/${locale}/integrations`}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#111014] px-5 text-[13px] font-semibold text-white transition hover:bg-[#28232a]"
            >
              {connectedCount > 0 ? copy.manageSources : copy.connectSource}
            </Link>
          </section>
        ) : null}

        {activeSection === "tracking" && activeProduct ? (
          <section className="rounded-[20px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff7fa_100%)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
              {copy.growthLabel}
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              {copy.growthTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
              {copy.growthDesc}
            </p>
            <Link
              href={`/${locale}/metrics#tracking-metrics`}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#111014] px-5 text-[13px] font-semibold text-white transition hover:bg-[#28232a]"
            >
              {copy.growthCta}
            </Link>
          </section>
        ) : null}
      </div>
    </section>
  );
}
