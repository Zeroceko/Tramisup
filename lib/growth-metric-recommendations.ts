export type FunnelMetricRecommendation = {
  key: string;
  name: string;
  description: string;
  whenToUse: string;
};

export type FunnelSection = {
  stage: "Awareness" | "Acquisition" | "Activation" | "Retention" | "Referral" | "Revenue";
  whyItMatters: string;
  metrics: FunnelMetricRecommendation[];
};

export type GrowthMetricPlan = {
  summary: string;
  sections: FunnelSection[];
};

type ProductInput = {
  name: string;
  status: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
  category?: string | null;
  targetAudience?: string | null;
  businessModel?: string | null;
  website?: string | null;
};

function isB2B(product: ProductInput) {
  const haystack = `${product.targetAudience ?? ""} ${product.businessModel ?? ""} ${product.category ?? ""}`.toLowerCase();
  return /team|teams|business|b2b|saas|company|startup|ekip|işletme/.test(haystack);
}

function isContentDriven(product: ProductInput & { description?: string | null }) {
  const haystack = `${product.category ?? ""} ${product.description ?? ""}`.toLowerCase();
  return /content|newsletter|media|community|creator|blog/.test(haystack);
}

export function getGrowthMetricRecommendations(product: ProductInput & { description?: string | null }): GrowthMetricPlan {
  const b2b = isB2B(product);
  const contentDriven = isContentDriven(product);
  const launched = product.status !== "PRE_LAUNCH";

  return {
    summary: launched
      ? `${product.name} için growth takibini AARRR mantığıyla kur. İlk odak her başlıkta tek bir ana metriği netleştirmek olmalı.`
      : `${product.name} henüz launch öncesindeyse bile growth hazırlığını AARRR çerçevesiyle kurmak, neyi ölçeceğini baştan netleştirir.`,
    sections: [
      {
        stage: "Awareness",
        whyItMatters: "İnsanlar seni hiç görmüyorsa diğer funnel katmanları çalışmaz.",
        metrics: [
          {
            key: "ad-impressions",
            name: "Reklam görüntülenme sayısı",
            description: "Paid kanal çalıştırıyorsan reklamın kaç kez gösterildiğini izle.",
            whenToUse: "Meta, Google veya X reklamları kullanıyorsan.",
          },
          {
            key: "website-visits",
            name: "Website ziyaretçisi",
            description: "Landing page veya ana sitene gelen toplam ziyaretçi sayısı.",
            whenToUse: "Web sitesi üzerinden ilgi topluyorsan.",
          },
          {
            key: "reach",
            name: contentDriven ? "İçerik erişimi" : "Toplam erişim",
            description: contentDriven
              ? "İçeriklerinin kaç kişiye ulaştığını gör.": "Organik ve paid görünürlüğün toplam etkisini izle.",
            whenToUse: "Organik içerik, launch postu veya topluluk dağıtımı yapıyorsan.",
          },
        ],
      },
      {
        stage: "Acquisition",
        whyItMatters: "Gören kişilerin ürüne yaklaşmasını ölçer.",
        metrics: [
          {
            key: "visitor-to-signup",
            name: b2b ? "Visitor → demo/signup dönüşümü" : "Visitor → signup dönüşümü",
            description: "Siteye gelenlerin ne kadarının kayıt veya talep bıraktığını gösterir.",
            whenToUse: "Landing page, waitlist veya signup akışın varsa.",
          },
          {
            key: "waitlist-joins",
            name: "Waitlist / erken erişim katılımı",
            description: "Launch öncesi ilgiyi ölçmek için en iyi erken sinyallerden biri.",
            whenToUse: "Henüz herkese açık değilsen.",
          },
          {
            key: "cac",
            name: b2b ? "Lead başı maliyet / CAC" : "Kullanıcı edinme maliyeti",
            description: "Bir kullanıcı veya lead kazanmak için ne harcadığını ölçer.",
            whenToUse: "Paid acquisition kullanıyorsan.",
          },
        ],
      },
      {
        stage: "Activation",
        whyItMatters: "Kullanıcının gerçek değeri ilk kez ne zaman gördüğünü tanımlar.",
        metrics: [
          {
            key: "onboarding-completion",
            name: "Onboarding tamamlama oranı",
            description: "Kayıt olanların ne kadarının onboarding’i bitirdiğini gösterir.",
            whenToUse: "Onboarding adımların varsa.",
          },
          {
            key: "first-value-action",
            name: b2b ? "İlk değerli iş aksiyonu" : "İlk değerli kullanıcı aksiyonu",
            description: b2b
              ? "Örn: ilk kampanya oluşturma, ilk ürün ekleme, ilk dashboard kurma."
              : "Örn: ilk içerik oluşturma, ilk paylaşım, ilk hedef tamamlama.",
            whenToUse: "Ürünün 'aha moment' noktası tanımlanabiliyorsa.",
          },
          {
            key: "activation-rate",
            name: "Activation rate",
            description: "Signup olanların ne kadarının değerli ilk aksiyona ulaştığını ölçer.",
            whenToUse: "Growth takibinde tek ana erken başarı metriği istiyorsan.",
          },
        ],
      },
      {
        stage: "Retention",
        whyItMatters: "İlk değer gördükten sonra kullanıcı neden kalıyor veya düşüyor sorusunu yanıtlar.",
        metrics: [
          {
            key: "d1-d7-d30",
            name: "D1 / D7 / D30 retention",
            description: "İlk gün, ilk hafta ve ilk ay geri dönüş oranlarını takip et.",
            whenToUse: "Temel retention resmi kurmak istiyorsan.",
          },
          {
            key: "wau-mau",
            name: "WAU / MAU veya kullanım sıklığı",
            description: "Ürünün ne kadar tekrar kullanıldığını gösterir.",
            whenToUse: "Düzenli kullanım beklenen ürünlerde.",
          },
          {
            key: "churn",
            name: b2b ? "Logo churn / account churn" : "User churn",
            description: "Kaybedilen kullanıcı veya müşteri oranı.",
            whenToUse: "Launch sonrası düşüşü görünür kılmak istiyorsan.",
          },
        ],
      },
      {
        stage: "Referral",
        whyItMatters: "Memnun kullanıcıların seni büyütme etkisini ölçer.",
        metrics: [
          {
            key: "invites-sent",
            name: "Gönderilen davet sayısı",
            description: "Kullanıcıların başkalarını çağırma eğilimini ölçer.",
            whenToUse: "Davet, paylaşım veya takım arkadaşı ekleme akışı varsa.",
          },
          {
            key: "referral-conversion",
            name: "Referral dönüşüm oranı",
            description: "Gönderilen davetlerin ne kadarının yeni kullanıcıya dönüştüğünü gösterir.",
            whenToUse: "Referral kanalın varsa.",
          },
          {
            key: "viral-coefficient",
            name: "Viral coefficient",
            description: "Bir kullanıcının ortalama kaç yeni kullanıcı getirdiğini ölçer.",
            whenToUse: "Ürün doğası gereği paylaşılabilir veya team-based ise.",
          },
        ],
      },
      {
        stage: "Revenue",
        whyItMatters: "Büyümenin finansal kaliteye dönüşüp dönüşmediğini gösterir.",
        metrics: [
          {
            key: "trial-to-paid",
            name: "Trial → paid dönüşümü",
            description: "Deneme veya ücretsiz kullanıcıların ne kadarının ödeme yaptığını ölçer.",
            whenToUse: "Freemium veya trial varsa.",
          },
          {
            key: "mrr",
            name: "MRR / recurring gelir",
            description: "Aylık tekrar eden gelirin temel north star finans metriği.",
            whenToUse: "Abonelik veya düzenli ödeme modeli varsa.",
          },
          {
            key: "arpu",
            name: b2b ? "ARPA / hesap başı gelir" : "ARPU / kullanıcı başı gelir",
            description: "Gelir kalitesinin kullanıcı veya hesap bazında değişimini gösterir.",
            whenToUse: "Gelirin sadece toplamına değil kalite dağılımına da bakmak istiyorsan.",
          },
        ],
      },
    ],
  };
}
