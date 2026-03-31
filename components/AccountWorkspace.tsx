"use client";

import { useMemo, useState } from "react";
import SettingsForm from "@/components/SettingsForm";

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
    description?: string | null;
    category?: string | null;
    targetAudience?: string | null;
    businessModel?: string | null;
    website?: string | null;
    launchStatus?: string | null;
    launchGoals?: string | null;
  } | null;
} | null;

export default function AccountWorkspace({
  user,
  locale,
}: {
  user: UserShape;
  locale: string;
}) {
  const isEn = locale === "en";
  const [activeSection, setActiveSection] = useState<"profile" | "security">("profile");

  const navItems = useMemo(
    () =>
      [
        { key: "profile", label: isEn ? "Profile" : "Profil" },
        { key: "security", label: isEn ? "Security" : "Güvenlik" },
      ] satisfies Array<{ key: "profile" | "security"; label: string }>,
    [isEn]
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
        <SettingsForm user={user} locale={locale} activeSection={activeSection} />
      </div>
    </section>
  );
}
