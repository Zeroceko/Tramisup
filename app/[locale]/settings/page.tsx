import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import SettingsForm from "@/components/SettingsForm";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

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

  const user = userWithProducts ? {
    ...userWithProducts,
    product: userWithProducts.products.find((product) => product.id === activeProductId) || userWithProducts.products[0] || null,
  } : null;

  const activeProduct = user?.product;
  const isEn = locale === "en";

  // Fetch connected integrations for active product
  const integrations = activeProduct
    ? await prisma.integration.findMany({
        where: { productId: activeProduct.id },
        select: { provider: true, status: true, lastSyncAt: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const connectedCount = integrations.filter((i) => i.status === "CONNECTED").length;
  const copy = isEn
    ? {
        sourcesLabel: "Sources",
        sourcesTitle: "Manage data sources",
        sourcesWithCount: (count: number) =>
          `${count} source${count === 1 ? "" : "s"} connected. Add new sources or manage existing ones.`,
        sourcesEmpty: "No sources connected yet. Connect GA4 or Stripe to pull metrics automatically.",
        lastSync: "Last sync",
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
      }
    : {
        sourcesLabel: "Kaynaklar",
        sourcesTitle: "Veri kaynaklarını yönet",
        sourcesWithCount: (count: number) =>
          `${count} kaynak bağlı. Yeni kaynak ekle veya mevcut bağlantıları yönet.`,
        sourcesEmpty: "Henüz bağlı kaynak yok. GA4 veya Stripe bağlayarak metrik verisini otomatik çek.",
        lastSync: "Son senkron",
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
      };

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      {/* Integrations section */}
      {activeProduct && (
        <section className="mb-4 rounded-[18px] border border-[#e8e8e8] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                {copy.sourcesLabel}
              </p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                {copy.sourcesTitle}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                {connectedCount > 0
                  ? copy.sourcesWithCount(connectedCount)
                  : copy.sourcesEmpty}
              </p>
            </div>
            {connectedCount > 0 && (
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0fffe] text-[13px] font-bold text-[#0d9488]">
                {connectedCount}
              </span>
            )}
          </div>

          {/* Connected integrations list */}
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
                    className="flex items-center justify-between gap-3 rounded-[12px] bg-[#fafafa] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-[#0d9488]" : integration.status === "ERROR" ? "bg-[#ef4444]" : "bg-[#d1d5db]"}`} />
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
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isConnected
                        ? "bg-[#f0fffe] text-[#0d9488]"
                        : integration.status === "ERROR"
                          ? "bg-[#fee2e2] text-[#ef4444]"
                          : "bg-[#f5f5f5] text-[#8b93a6]"
                    }`}>
                      {isConnected ? copy.connected : integration.status === "ERROR" ? copy.error : copy.disconnected}
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
      )}

      {/* Growth tracking section */}
      {activeProduct ? (
        <section className="mb-4 rounded-[18px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff7fa_100%)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
            {copy.growthLabel}
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {copy.growthTitle}
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
            {copy.growthDesc}
          </p>
          <Link
            href={`/${locale}/growth#tracking-metrics`}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#111014] px-5 text-[13px] font-semibold text-white transition hover:bg-[#28232a]"
          >
            {copy.growthCta}
          </Link>
        </section>
      ) : null}

      {/* Profile & project settings form */}
      <SettingsForm user={user} locale={locale} />
    </div>
  );
}
