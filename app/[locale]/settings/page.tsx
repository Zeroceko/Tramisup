import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import PageHeader from "@/components/PageHeader";
import SettingsWorkspace from "@/components/SettingsWorkspace";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations("settings");
  const activeProductId = await getActiveProductId();

  const userWithProducts = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { products: true },
  });

  const user = userWithProducts
    ? {
        ...userWithProducts,
        product:
          userWithProducts.products.find((product) => product.id === activeProductId) ||
          userWithProducts.products[0] ||
          null,
      }
    : null;

  const activeProduct = user?.product;
  const isEn = locale === "en";

  const integrations = activeProduct
    ? await prisma.integration.findMany({
        where: { productId: activeProduct.id },
        select: { provider: true, status: true, lastSyncAt: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const connectedCount = integrations.filter((i) => i.status === "CONNECTED").length;
  const latestSync = integrations
    .filter((integration) => integration.lastSyncAt)
    .sort((a, b) => new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime())[0]
    ?.lastSyncAt;

  const copy = isEn
    ? {
        overviewLabel: "Workspace overview",
        overviewTitle: "Keep profile, project, and data settings tidy",
        overviewDesc:
          "Use this area to manage your account details, update your active product settings, and keep source connections healthy.",
        profileCard: "Profile",
        profileReady: "Account ready",
        projectCard: "Active product",
        noProduct: "No active product",
        languageCard: "Language",
        sectionsLabel: "Sections",
        sectionsValue: "personal, project, security",
        sourcesLabel: "Sources",
        sourcesTitle: "Manage data sources",
        sourcesWithCountLabel: "source connected. Add new sources or manage existing ones.",
        sourcesEmpty: "No sources connected yet. Connect GA4 or Stripe to pull metrics automatically.",
        lastSync: "Last sync",
        latestSync: "Latest sync",
        noSyncYet: "No sync yet",
        connected: "Connected",
        error: "Error",
        disconnected: "Not connected",
        manageSources: "Manage sources",
        connectSource: "Connect source",
        growthLabel: "Growth tracking",
        growthTitle: "Update growth tracking metrics",
        growthDesc:
          "You can update AARRR tracking metrics for this product anytime. This takes you back to the metric setup step in Growth.",
        growthCta: "Open growth tracking",
        navOverview: "Overview",
        navProfile: "Profile",
        navProduct: "Product",
        navSources: "Sources",
        navTracking: "Tracking",
        navSecurity: "Security",
      }
    : {
        overviewLabel: "Genel görünüm",
        overviewTitle: "Profil, proje ve veri ayarlarını tek yerde toparla",
        overviewDesc:
          "Bu alan hesap bilgilerini güncellemek, aktif ürün ayarlarını net tutmak ve veri bağlantılarını sağlıklı yönetmek için kullanılır.",
        profileCard: "Profil",
        profileReady: "Hesap hazır",
        projectCard: "Aktif ürün",
        noProduct: "Aktif ürün yok",
        languageCard: "Dil",
        sectionsLabel: "Bölümler",
        sectionsValue: "kişisel, proje, güvenlik",
        sourcesLabel: "Kaynaklar",
        sourcesTitle: "Veri kaynaklarını yönet",
        sourcesWithCountLabel: "kaynak bağlı. Yeni kaynak ekle veya mevcut bağlantıları yönet.",
        sourcesEmpty: "Henüz bağlı kaynak yok. GA4 veya Stripe bağlayarak metrik verisini otomatik çek.",
        lastSync: "Son senkron",
        latestSync: "En son senkron",
        noSyncYet: "Henüz senkron yok",
        connected: "Bağlı",
        error: "Hata",
        disconnected: "Bağlı değil",
        manageSources: "Kaynakları yönet",
        connectSource: "Kaynak bağla",
        growthLabel: "Büyüme takibi",
        growthTitle: "Büyüme metriklerini güncelle",
        growthDesc:
          "Seçili ürün için AARRR takip metriklerini istediğin zaman güncelleyebilirsin. Bu alan seni Growth tarafındaki metrik kurulumuna geri götürür.",
        growthCta: "Büyüme takibini aç",
        navOverview: "Genel görünüm",
        navProfile: "Profil",
        navProduct: "Ürün",
        navSources: "Kaynaklar",
        navTracking: "Takip sistemi",
        navSecurity: "Güvenlik",
      };

  const latestSyncLabel = latestSync
    ? new Intl.DateTimeFormat(isEn ? "en-US" : "tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(latestSync))
    : copy.noSyncYet;

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <section className="mb-6 overflow-hidden rounded-[24px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffefe_0%,_#fff7fa_100%)]">
        <div className="border-b border-[#f1e5eb] px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
            {copy.overviewLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
            {copy.overviewTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-7 text-[#666d80]">
            {copy.overviewDesc}
          </p>
        </div>

        <div className="grid gap-3 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.profileCard}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">
              {user?.name || user?.email || "—"}
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">{copy.profileReady}</p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.projectCard}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">
              {activeProduct?.name || copy.noProduct}
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {activeProduct?.status || "—"}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.sourcesLabel}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">{connectedCount}</p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {copy.latestSync}: {latestSyncLabel}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.languageCard}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">
              {user?.preferredLocale === "tr" ? "Türkçe" : "English"}
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {copy.sectionsLabel}: {copy.sectionsValue}
            </p>
          </div>
        </div>
      </section>

      <SettingsWorkspace
        locale={locale}
        user={user}
        activeProduct={activeProduct}
        integrations={integrations}
        connectedCount={connectedCount}
        copy={copy}
        isEn={isEn}
      />
    </div>
  );
}
