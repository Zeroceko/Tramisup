import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import IntegrationCard from "@/components/IntegrationCard";
import type { IntegrationDef } from "@/components/IntegrationCard";

// Ozenle secilmis P0, P1, P2 Growth Stack Entegrasyonlari
const AVAILABLE_INTEGRATIONS: IntegrationDef[] = [
  // P0 - Active & Ready
  { provider: "GA4",       name: "Google Analytics",  description: "Ürün içi DAU, retention, funnel ve organik site trafiği analizi.", icon: "📊" },
  { provider: "STRIPE",    name: "Stripe",            description: "Finansal veriler: MRR, yeni abonelikler ve Churn takibi.", icon: "💳" },
  
  // P1 - Marketing & Monetization (Coming Soon)
  { provider: "REVENUECAT",name: "RevenueCat",        description: "App Store ve Play Store abonelik analitiği.", icon: "😼", comingSoon: true },
  { provider: "META",      name: "Meta Ads API",      description: "Reklam harcamaları (Spend) ve dönüşüm (CAC, ROAS) verileri.", icon: "♾️", comingSoon: true },
  
  // P2 - Enterprise & Stores (Coming Soon)
  { provider: "APPSTORE",  name: "App Store Connect", description: "iOS App verisi, organik install dönüşümleri ve yorumlar.", icon: "🍏", comingSoon: true },
  { provider: "GPLAY",     name: "Google Play",       description: "Android App vitals, organik edinim metrikleri.", icon: "🤖", comingSoon: true },
  { provider: "APPSFLYER", name: "AppsFlyer",         description: "Attribution doğrulama ve gelişmiş Mobil MMP çözümü.", icon: "🚀", comingSoon: true },
  { provider: "TIKTOK",    name: "TikTok Ads",        description: "TikTok Manager Ads performansı ve harcamaları.", icon: "🎵", comingSoon: true },
  { provider: "BIGQUERY",  name: "BigQuery (Firebase)", description: "Ham event akışı ve gelişmiş SQL ürün performans merkezi.", icon: "☁️", comingSoon: true },
];

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return <div className="text-center py-20 text-[#666d80]">Product not found</div>;
  }

  const existingIntegrations = await prisma.integration.findMany({
    where: { productId: product.id },
  });

  const integrationMap = new Map(existingIntegrations.map((i) => [i.provider, i]));

  return (
    // DARK MODE WRAPPER FOR PREMIUM VIBE
    <div className="min-h-screen bg-[#0a0a0a] text-white -m-4 sm:-m-6 md:-m-8 p-6 sm:p-10 lg:p-16 selection:bg-[#fff]/20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#f4f4f5] mb-2">Connectors</h1>
          <p className="text-[15px] text-[#a1a1aa] max-w-2xl">
            Ürününüzün büyüme sistemine güç katın. Uygulamaları tek tıkla bağlayarak Tiramisup Mentor AI'ın gerçek veriler üzerinden koçluk yapmasını sağlayabilirsiniz.
          </p>
        </div>

        {/* SEARCH BAR MOCK (Like in the image) */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search integrations..." 
            className="w-full h-11 bg-[#141414] border border-[#27272a] rounded-lg pl-11 pr-4 text-[14px] text-white placeholder-[#71717a] outline-none focus:border-[#52525b] focus:ring-1 focus:ring-[#52525b] transition"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-[18px] font-medium text-[#f4f4f5] mb-1">Growth Stack Connectors</h2>
          <p className="text-[13px] text-[#71717a] mb-6">
            Özer'in (Admin) kurduğu bir defaya mahsus ayarlar sayesinde tüm workspace'iniz bu entegrasyonları anında aktif edebilir.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>

      </div>
    </div>
  );
}
