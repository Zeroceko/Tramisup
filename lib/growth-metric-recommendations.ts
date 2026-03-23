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
        whyItMatters: "İnsanlar senden haberdar olmuyorsa diğer adımlar hiç başlamaz.",
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
              ? "İçeriklerinin kaç kişiye ulaştığını gör."
              : "Organik ve reklam kaynaklı görünürlüğünün toplam etkisini izle.",
            whenToUse: "Organik içerik, launch postu veya topluluk dağıtımı yapıyorsan.",
          },
        ],
      },
      {
        stage: "Acquisition",
        whyItMatters: "Seni gören kişilerin kayıt, demo ya da bekleme listesine geçmesini ölçer.",
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
            name: b2b ? "Lead başı maliyet" : "Yeni kullanıcı başı maliyet",
            description: "Bir yeni kullanıcı veya lead kazanmak için ortalama ne harcadığını ölçer.",
            whenToUse: "Paid acquisition kullanıyorsan.",
          },
        ],
      },
      {
        stage: "Activation",
        whyItMatters: "Yeni kullanıcının üründe ilk faydayı görüp görmediğini anlatır.",
        metrics: [
          {
            key: "onboarding-completion",
            name: "Onboarding'i tamamlayan kullanıcı",
            description: "Kayıt olanlardan kaç kişinin kurulum veya başlangıç adımlarını bitirdiğini gösterir.",
            whenToUse: "Onboarding adımların varsa.",
          },
          {
            key: "first-value-action",
            name: b2b ? "İlk faydalı iş aksiyonu" : "İlk faydalı kullanıcı aksiyonu",
            description: b2b
              ? "Örn: ilk kampanya oluşturma, ilk ürün ekleme, ilk dashboard kurma."
              : "Örn: ilk içerik oluşturma, ilk paylaşım, ilk hedef tamamlama.",
            whenToUse: "Ürünün 'aha moment' noktası tanımlanabiliyorsa.",
          },
          {
            key: "activation-rate",
            name: "İlk faydaya ulaşan kullanıcı oranı",
            description: "Kayıt olanların ne kadarının gerçekten değerli ilk adıma ulaştığını ölçer.",
            whenToUse: "Tek bir erken başarı metriği seçmek istiyorsan.",
          },
        ],
      },
      {
        stage: "Retention",
        whyItMatters: "Kullanıcıların tekrar geri gelip gelmediğini gösterir.",
        metrics: [
          {
            key: "d1-d7-d30",
            name: "Ertesi gün / hafta / ay geri gelen kullanıcı",
            description: "İlk gün, ilk hafta ve ilk ay içinde geri dönen kullanıcı oranını takip et.",
            whenToUse: "Kullanıcıların geri gelip gelmediğini basit şekilde görmek istiyorsan.",
          },
          {
            key: "wau-mau",
            name: "Bu hafta geri gelen kullanıcı",
            description: "Ürünün bir hafta içinde ne kadar tekrar kullanıldığını gösterir.",
            whenToUse: "Düzenli kullanım beklenen ürünlerde.",
          },
          {
            key: "churn",
            name: b2b ? "Kaybedilen müşteri hesabı" : "Kaybedilen kullanıcı",
            description: "Belli bir dönemde artık dönmeyen veya ödeme yapmayan kullanıcı/müşteri sayısı.",
            whenToUse: "Düşüşü görünür kılmak istiyorsan.",
          },
        ],
      },
      {
        stage: "Referral",
        whyItMatters: "Mevcut kullanıcıların yeni kullanıcı getirip getirmediğini gösterir.",
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
            name: "Bir kullanıcının getirdiği yeni kullanıcı",
            description: "Ortalama bir kullanıcının kaç yeni kullanıcı getirdiğini ölçer.",
            whenToUse: "Ürün doğası gereği paylaşılabilir veya ekip tabanlıysa.",
          },
        ],
      },
      {
        stage: "Revenue",
        whyItMatters: "Büyümenin gelire dönüşüp dönüşmediğini gösterir.",
        metrics: [
          {
            key: "trial-to-paid",
            name: "Ücretli kullanıcıya geçenler",
            description: "Deneme veya ücretsiz kullanıcıların ne kadarının ödeme yaptığını ölçer.",
            whenToUse: "Freemium veya trial varsa.",
          },
          {
            key: "mrr",
            name: "Aylık düzenli gelir",
            description: "Her ay tekrar eden toplam geliri gösterir.",
            whenToUse: "Abonelik veya düzenli ödeme modeli varsa.",
          },
          {
            key: "arpu",
            name: b2b ? "Hesap başı ortalama gelir" : "Kullanıcı başı ortalama gelir",
            description: "Toplam gelirin kullanıcı veya müşteri hesabı başına nasıl dağıldığını gösterir.",
            whenToUse: "Gelirin sadece toplamına değil kişi/hesap başına kalitesine de bakmak istiyorsan.",
          },
        ],
      },
    ],
  };
}
