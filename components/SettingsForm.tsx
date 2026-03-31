"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import PasswordChecklist from "@/components/ui/PasswordChecklist";
import { isStrongPassword } from "@/lib/password-rules";

interface User {
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
}

const inputCls =
  "w-full rounded-[12px] border border-[#e8e8e8] px-4 py-3 text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none transition focus:border-[#95dbda]";
const labelCls = "mb-1.5 block text-[12px] font-semibold text-[#0d0d12]";
const cardCls = "rounded-[20px] border border-[#e8e8e8] bg-white p-5 sm:p-6";

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 border-b border-[#f1f1f1] pb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
        {title}
      </h3>
      <p className="mt-1 text-[13px] leading-6 text-[#666d80]">{description}</p>
    </div>
  );
}

export type SettingsSectionKey = "profile" | "product" | "security";

export default function SettingsForm({
  user,
  locale,
  activeSection = "profile",
}: {
  user: User | null;
  locale: string;
  activeSection?: SettingsSectionKey;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const isEn = locale === "en";

  const setLocaleCookie = (newLocale: string) => {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${maxAge}`;
  };

  const copy = isEn
    ? {
        errorGeneric: "Something went wrong.",
        success: "Settings updated.",
        personalTitle: "Personal",
        personalDesc: "Update the account details tied to your login and locale preference.",
        name: "Full name",
        email: "Email",
        language: "Language",
        projectTitle: "Project",
        projectDesc: "Update the active product's onboarding context, links, and launch stage from one place.",
        projectName: "Project name",
        description: "Product description",
        website: "Primary website",
        category: "Category",
        audience: "Target audience",
        businessModel: "Business model",
        launchStage: "Launch / growth stage",
        topPriority: "Current top priority",
        contextLinks: "Links and docs",
        contextLinksHint: "One link per line. Add docs, demos, landing pages, or source material that helps Tiramisup understand the product.",
        launchDate: "Launch date",
        optional: "(optional)",
        status: "Status",
        securityTitle: "Security",
        securityDescription: "Update your account password.",
        saveHint: "These changes update your account and active product settings.",
        currentPassword: "Current password",
        newPassword: "New password",
        confirmNewPassword: "Confirm new password",
        currentPasswordPlaceholder: "Your current password",
        newPasswordPlaceholder: "Min. 8 characters",
        confirmNewPasswordPlaceholder: "Repeat new password",
        passwordSave: "Update password",
        passwordSaving: "Updating…",
        passwordSuccess: "Password updated.",
        passwordChecklist: {
          title: "Password requirements",
          minLength: "At least 8 characters",
          number: "At least 1 number",
          special: "At least 1 special character",
        },
        passwordErrors: {
          currentRequired: "Enter your current password.",
          rules: "Your password must be at least 8 characters and include a number and a special character.",
          mismatch: "New passwords don't match.",
        },
        statusOptions: {
          PRE_LAUNCH: "Pre-Launch",
          LAUNCHED: "Launched",
          GROWING: "Growing",
        },
        save: "Save changes",
        saving: "Saving…",
        launchStatusOptions: {
          IDEA: "Idea stage",
          BUILDING: "Building",
          TESTING: "I have test users",
          PREPARING: "Preparing for launch",
          LIVE: "Live",
          GROWING: "Growing",
        },
      }
    : {
        errorGeneric: "Bir hata oluştu.",
        success: "Ayarlar güncellendi.",
        personalTitle: "Kişisel Bilgiler",
        personalDesc: "Giriş yaptığın hesap bilgilerini ve tercih edilen dili burada güncelleyebilirsin.",
        name: "Ad Soyad",
        email: "E-posta",
        language: "Dil",
        projectTitle: "Proje Bilgileri",
        projectDesc: "Aktif ürünün onboarding bağlamını, bağlantılarını ve launch aşamasını buradan güncelle.",
        projectName: "Proje Adı",
        description: "Ürün açıklaması",
        website: "Ana website",
        category: "Kategori",
        audience: "Hedef kitle",
        businessModel: "İş modeli",
        launchStage: "Launch / growth aşaması",
        topPriority: "Şu anki ana öncelik",
        contextLinks: "Bağlantılar ve dokümanlar",
        contextLinksHint: "Her satıra bir link yaz. Ürünü anlamaya yardımcı olacak doc, demo, landing veya kaynak ekleyebilirsin.",
        launchDate: "Launch Tarihi",
        optional: "(opsiyonel)",
        status: "Durum",
        securityTitle: "Güvenlik",
        securityDescription: "Hesap şifreni güncelle.",
        saveHint: "Bu değişiklikler hesabını ve aktif ürün ayarlarını günceller.",
        currentPassword: "Mevcut şifre",
        newPassword: "Yeni şifre",
        confirmNewPassword: "Yeni şifreyi doğrula",
        currentPasswordPlaceholder: "Mevcut şifren",
        newPasswordPlaceholder: "En az 8 karakter",
        confirmNewPasswordPlaceholder: "Yeni şifreyi tekrar gir",
        passwordSave: "Şifreyi güncelle",
        passwordSaving: "Güncelleniyor…",
        passwordSuccess: "Şifre güncellendi.",
        passwordChecklist: {
          title: "Şifre gereksinimleri",
          minLength: "En az 8 karakter",
          number: "En az 1 sayı",
          special: "En az 1 özel karakter",
        },
        passwordErrors: {
          currentRequired: "Mevcut şifreni gir.",
          rules: "Şifren en az 8 karakter olmalı; en az 1 sayı ve 1 özel karakter içermeli.",
          mismatch: "Yeni şifreler eşleşmiyor.",
        },
        statusOptions: {
          PRE_LAUNCH: "Launch hazırlığında",
          LAUNCHED: "Yayında",
          GROWING: "Büyüme aşamasında",
        },
        save: "Değişiklikleri Kaydet",
        saving: "Kaydediliyor…",
        launchStatusOptions: {
          IDEA: "Fikir aşamasında",
          BUILDING: "Geliştirme aşamasında",
          TESTING: "Test kullanıcıları var",
          PREPARING: "Yakında yayında",
          LIVE: "Yayında",
          GROWING: "Büyüme aşamasında",
        },
      };

  const parsedLaunchGoals = (() => {
    if (!user?.product?.launchGoals) return {};
    try {
      return JSON.parse(user.product.launchGoals) as {
        growthGoal?: string;
        goalKey?: string;
        contextLinks?: string[];
      };
    } catch {
      return {};
    }
  })();

  const [formData, setFormData] = useState({
    productId: user?.product?.id || "",
    name: user?.name || "",
    projectName: user?.product?.name || "",
    description: user?.product?.description || "",
    website: user?.product?.website || "",
    category: user?.product?.category || "",
    targetAudience: user?.product?.targetAudience || "",
    businessModel: user?.product?.businessModel || "",
    launchStatus: user?.product?.launchStatus || "Yakında yayında",
    growthGoal: parsedLaunchGoals.growthGoal || "",
    goalKey: parsedLaunchGoals.goalKey || "",
    contextLinks: Array.isArray(parsedLaunchGoals.contextLinks)
      ? parsedLaunchGoals.contextLinks.join("\n")
      : "",
    launchDate: user?.product?.launchDate
      ? format(new Date(user.product.launchDate), "yyyy-MM-dd")
      : "",
    status: user?.product?.status || "PRE_LAUNCH",
    preferredLocale: user?.preferredLocale || locale || "en",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(isEn ? "Failed to update settings" : "Ayarlar güncellenemedi");
      }

      setSuccess(copy.success);
      if (formData.preferredLocale && formData.preferredLocale !== locale) {
        router.push(`/${formData.preferredLocale}/settings`);
        return;
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError(copy.passwordErrors.currentRequired);
      setPasswordLoading(false);
      return;
    }

    if (!isStrongPassword(passwordForm.newPassword)) {
      setPasswordError(copy.passwordErrors.rules);
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError(copy.passwordErrors.mismatch);
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || copy.errorGeneric);
      }

      setPasswordSuccess(copy.passwordSuccess);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : copy.errorGeneric);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[10px] border border-[#75fc96]/40 bg-[#75fc96]/20 px-4 py-3 text-[13px] text-[#1a7a36]">
          {success}
        </div>
      ) : null}

      {(activeSection === "profile" || activeSection === "product") && (
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeSection === "profile" ? (
        <div id="profile" className={cardCls}>
          <SectionIntro
            eyebrow={copy.personalTitle}
            title={copy.personalTitle}
            description={copy.personalDesc}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>{copy.name}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.email}</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className={inputCls + " cursor-not-allowed bg-[#f6f6f6] text-[#9ca3af]"}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.language}</label>
              <select
                value={formData.preferredLocale}
                onChange={(e) => {
                  const nextLocale = e.target.value;
                  setFormData({ ...formData, preferredLocale: nextLocale });
                  setLocaleCookie(nextLocale);
                }}
                className={inputCls}
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>
          </div>
        </div>
        ) : null}

        {activeSection === "product" ? (
        <div id="product" className={cardCls}>
          <SectionIntro
            eyebrow={copy.projectTitle}
            title={copy.projectTitle}
            description={copy.projectDesc}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>{copy.projectName}</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>{copy.description}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`${inputCls} min-h-[120px]`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>{copy.website}</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className={inputCls}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className={labelCls}>{copy.category}</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.audience}</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.businessModel}</label>
              <input
                type="text"
                value={formData.businessModel}
                onChange={(e) => setFormData({ ...formData, businessModel: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {copy.launchDate} <span className="font-normal text-[#9ca3af]">{copy.optional}</span>
              </label>
              <input
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.launchStage}</label>
              <select
                value={formData.launchStatus}
                onChange={(e) => setFormData({ ...formData, launchStatus: e.target.value })}
                className={inputCls}
              >
                <option value="Fikir aşamasında">{copy.launchStatusOptions.IDEA}</option>
                <option value="Geliştirme aşamasında">{copy.launchStatusOptions.BUILDING}</option>
                <option value="Test kullanıcıları var">{copy.launchStatusOptions.TESTING}</option>
                <option value="Yakında yayında">{copy.launchStatusOptions.PREPARING}</option>
                <option value="Yayında">{copy.launchStatusOptions.LIVE}</option>
                <option value="Büyüme aşamasında">{copy.launchStatusOptions.GROWING}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>{copy.topPriority}</label>
              <input
                type="text"
                value={formData.growthGoal}
                onChange={(e) => setFormData({ ...formData, growthGoal: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>{copy.contextLinks}</label>
              <textarea
                value={formData.contextLinks}
                onChange={(e) => setFormData({ ...formData, contextLinks: e.target.value })}
                rows={5}
                className={`${inputCls} min-h-[140px]`}
                placeholder={"https://example.com/docs\nhttps://example.com/demo"}
              />
              <p className="mt-2 text-[12px] leading-5 text-[#8a8fa0]">
                {copy.contextLinksHint}
              </p>
            </div>
          </div>
        </div>
        ) : null}

        <div className="rounded-[20px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffefe_0%,_#fff7fa_100%)] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-6 text-[#666d80]">{copy.saveHint}</p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffd7ef] px-6 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? copy.saving : copy.save}
            </button>
          </div>
        </div>
      </form>
      )}

      {activeSection === "security" ? (
      <div id="security" className={cardCls}>
        <SectionIntro
          eyebrow={copy.securityTitle}
          title={copy.securityTitle}
          description={copy.securityDescription}
        />

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {passwordError ? (
            <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {passwordError}
            </div>
          ) : null}
          {passwordSuccess ? (
            <div className="rounded-[10px] border border-[#75fc96]/40 bg-[#75fc96]/20 px-4 py-3 text-[13px] text-[#1a7a36]">
              {passwordSuccess}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>{copy.currentPassword}</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={inputCls}
                placeholder={copy.currentPasswordPlaceholder}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.newPassword}</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={inputCls}
                placeholder={copy.newPasswordPlaceholder}
              />
            </div>

            <div>
              <label className={labelCls}>{copy.confirmNewPassword}</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                className={inputCls}
                placeholder={copy.confirmNewPasswordPlaceholder}
              />
            </div>
          </div>

          <div className="rounded-[16px] border border-[#eef1f2] bg-[#fafafa] p-4">
            <PasswordChecklist
              password={passwordForm.newPassword}
              copy={copy.passwordChecklist}
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full rounded-full bg-[#111014] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#28232a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {passwordLoading ? copy.passwordSaving : copy.passwordSave}
          </button>
        </form>
      </div>
      ) : null}
    </div>
  );
}
