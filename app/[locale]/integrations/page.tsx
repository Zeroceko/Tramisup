import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import IntegrationCard from "@/components/IntegrationCard";
import PageHeader from "@/components/PageHeader";

const AVAILABLE_INTEGRATIONS = [
  { provider: "STRIPE",    name: "Stripe",             description: "Gelir, abonelik ve müşteri verilerini içe aktar", icon: "💳" },
  { provider: "GA4",       name: "Google Analytics 4", description: "Kullanıcı davranışı ve trafik verilerini senkronize et", icon: "📊" },
  { provider: "MIXPANEL",  name: "Mixpanel",           description: "Etkinlikleri ve kullanıcı analitiğini takip et", icon: "📈" },
  { provider: "SEGMENT",   name: "Segment",            description: "Merkezi veri toplama platformu", icon: "🔄" },
  { provider: "AMPLITUDE", name: "Amplitude",          description: "Ürün analitiği ve kullanıcı içgörüleri", icon: "📉" },
  { provider: "POSTHOG",   name: "PostHog",            description: "Açık kaynak ürün analitiği", icon: "🦔" },
];

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("integrations");

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return <div className="text-center py-20 text-[#666d80]">Ürün bulunamadı</div>;
  }

  const existingIntegrations = await prisma.integration.findMany({
    where: { productId: product.id },
  });

  const integrationMap = new Map(existingIntegrations.map((i) => [i.provider, i]));

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="mb-6 p-4 bg-[#fafafa] border border-[#e8e8e8] rounded-[12px] flex items-start gap-3">
        <span className="text-[18px] shrink-0">ℹ️</span>
        <div>
          <p className="text-[13px] font-semibold text-[#0d0d12] mb-0.5">Entegrasyon Temeli (v1)</p>
          <p className="text-[13px] text-[#666d80]">
            Bu sürüm entegrasyon mimarisini ve bağlantı arayüzünü içerir. Gerçek veri senkronizasyonu ilerideki sürümlerde gelecek.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {AVAILABLE_INTEGRATIONS.map((integration) => {
          const existing = integrationMap.get(integration.provider as Parameters<typeof integrationMap.get>[0]);
          return (
            <IntegrationCard
              key={integration.provider}
              integration={integration}
              existingIntegration={existing}
              productId={product.id}
            />
          );
        })}
      </div>

      {existingIntegrations.length > 0 && (
        <div className="mt-4 bg-white rounded-[15px] border border-[#e8e8e8] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1">Senkronizasyon</p>
          <h2 className="text-[16px] font-semibold text-[#0d0d12] mb-4">Son Sync İşlemleri</h2>
          <p className="text-center text-[13px] text-[#9ca3af] py-6">
            Entegrasyonlar aktif olunca sync geçmişi burada görünecek
          </p>
        </div>
      )}
    </div>
  );
}
