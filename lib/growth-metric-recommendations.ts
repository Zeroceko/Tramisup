export type FunnelMetricRecommendation = {
  key: string;
  name: string;
  description: string;
  whenToUse: string;
  whenToAvoid?: string;
  recommended?: boolean;   // best pick for this product context
  vanityWarning?: string;  // shown when selected — signals low-trust data
};

export type FunnelSection = {
  stage: "Awareness" | "Acquisition" | "Activation" | "Retention" | "Referral" | "Revenue";
  whyItMatters: string;
  guidingQuestion: string;
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
  description?: string | null;
};

function isB2B(p: ProductInput) {
  const h = `${p.targetAudience ?? ""} ${p.businessModel ?? ""} ${p.category ?? ""}`.toLowerCase();
  return /team|teams|business|b2b|saas|company|startup|ekip|işletme/.test(h);
}

function isContentDriven(p: ProductInput) {
  const h = `${p.category ?? ""} ${p.description ?? ""}`.toLowerCase();
  return /content|newsletter|media|community|creator|blog/.test(h);
}

export function getGrowthMetricRecommendations(product: ProductInput): GrowthMetricPlan {
  const b2b = isB2B(product);
  const content = isContentDriven(product);
  const preLaunch = product.status === "PRE_LAUNCH";

  return {
    summary: preLaunch
      ? `${product.name} için growth ölçüm sistemini şimdiden kur. Launch öncesi hangi sayıları takip edeceğini bilmek, ilk verileri anlamlandırmayı kolaylaştırır.`
      : `${product.name} için her AARRR aşamasında tek bir ana sinyal seç. Az ama doğru metrik, çok ama anlamsız metrikten daha değerlidir.`,
    sections: [
      {
        stage: "Awareness",
        whyItMatters: "İnsanlar senden haberdar olmuyorsa diğer adımlar hiç başlamaz.",
        guidingQuestion: "Kaç kişi ürünümün varlığından haberdar oldu?",
        metrics: [
          {
            key: "website-visits",
            name: "Website ziyaretçisi",
            description: "Landing page veya ana sitene gelen toplam ziyaretçi sayısı.",
            whenToUse: "Web sitesi üzerinden ilgi topluyorsan. En evrensel ve ölçülmesi en kolay awareness metriği.",
            whenToAvoid: "Trafik kaynağını izlemeden sadece toplam ziyareti takip etme — kaynak kalitesi de önemli.",
            recommended: !content,
          },
          {
            key: "reach",
            name: content ? "İçerik erişimi" : "Toplam erişim",
            description: content
              ? "İçeriklerinin, postların veya bülteninin kaç kişiye ulaştığını gör."
              : "Organik ve paid kaynaklı görünürlüğünün toplam etkisini izle.",
            whenToUse: content
              ? "İçerik, bülten veya topluluk odaklı büyüme yapıyorsan."
              : "Organik içerik, launch postu veya topluluk dağıtımı yapıyorsan.",
            whenToAvoid: "Erişim sayısı yüksek ama dönüşüm yoksa bu metrik tek başına anlam ifade etmez.",
            recommended: content,
          },
          {
            key: "ad-impressions",
            name: "Reklam görüntülenme sayısı",
            description: "Paid kanal çalıştırıyorsan reklamın kaç kez gösterildiğini izle.",
            whenToUse: "Meta, Google veya X reklamlarına aktif bütçe ayırıyorsan.",
            whenToAvoid: "Paid reklam yoksa bu metrik boş kalır.",
            vanityWarning: "Görüntülenme sayısı yalnızca reklamın gösterildiğini söyler, ilgiyi kanıtlamaz. Dönüşüm ve tıklama oranıyla desteklenmedikçe anlamlı değil.",
          },
        ],
      },
      {
        stage: "Acquisition",
        whyItMatters: "Seni gören kişilerin kayıt, demo ya da bekleme listesine geçmesini ölçer.",
        guidingQuestion: "Ürünümle ilgilenen kaç kişi bir adım ileri gitti?",
        metrics: [
          {
            key: "visitor-to-signup",
            name: b2b ? "Visitor → demo / signup dönüşümü" : "Visitor → signup dönüşümü",
            description: "Siteye gelenlerin ne kadarının kayıt veya talep bıraktığını gösterir.",
            whenToUse: "Landing page, waitlist veya signup akışın varsa. En net acquisition sinyali.",
            whenToAvoid: "Günde 10'dan az ziyaretçin varsa dönüşüm oranı istatistiksel anlam taşımaz.",
            recommended: !preLaunch,
          },
          {
            key: "waitlist-joins",
            name: "Waitlist / erken erişim katılımı",
            description: "Launch öncesi ilgiyi ölçmek için en iyi erken sinyallerden biri.",
            whenToUse: "Henüz herkese açık değilsen ya da launch öncesi talep doğrulamak istiyorsan.",
            whenToAvoid: "Launch sonrasında bu metriğin yerine signup dönüşümüne geç.",
            recommended: preLaunch,
          },
          {
            key: "cac",
            name: b2b ? "Lead başı maliyet" : "Yeni kullanıcı başı maliyet",
            description: "Bir yeni kullanıcı veya lead kazanmak için ortalama ne harcadığını ölçer.",
            whenToUse: "Paid acquisition kullanıyorsan ve birim ekonomini anlamak istiyorsan.",
            whenToAvoid: "Paid kanalın yoksa ya da henüz yeterli veri yoksa bu metrik boş ya da yanıltıcı kalır.",
          },
        ],
      },
      {
        stage: "Activation",
        whyItMatters: "Yeni kullanıcının üründe ilk faydayı görüp görmediğini anlatır.",
        guidingQuestion: "Kaydolan kullanıcıların kaçı üründen gerçekten fayda gördü?",
        metrics: [
          {
            key: "activation-rate",
            name: "İlk faydaya ulaşan kullanıcı oranı",
            description: "Kayıt olanların ne kadarının gerçekten değerli ilk adıma ulaştığını ölçer.",
            whenToUse: "Tek bir erken başarı metriği seçmek istiyorsan. En evrensel aktivasyon sinyali.",
            whenToAvoid: "Neyin aktivasyon saydığı tanımlanmadan bu metriği takip etme.",
            recommended: !b2b,
          },
          {
            key: "first-value-action",
            name: b2b ? "İlk faydalı iş aksiyonu" : "İlk faydalı kullanıcı aksiyonu",
            description: b2b
              ? "Örn: ilk kampanya oluşturma, ilk ürün ekleme, ilk dashboard kurma."
              : "Örn: ilk içerik oluşturma, ilk paylaşım, ilk hedef tamamlama.",
            whenToUse: "Ürünün 'aha moment' noktası net tanımlanabiliyorsa.",
            whenToAvoid: "Tek bir kritik ilk aksiyon yoksa ya da kullanıcılar farklı yollarla değer buluyorsa yanıltıcı olabilir.",
            recommended: b2b,
          },
          {
            key: "onboarding-completion",
            name: "Onboarding'i tamamlayan kullanıcı",
            description: "Kayıt olanlardan kaç kişinin kurulum veya başlangıç adımlarını bitirdiğini gösterir.",
            whenToUse: "Birden fazla onboarding adımın varsa ve tamamlama oranı düşükse.",
            whenToAvoid: "Onboarding tek adımlıysa ya da yoksa bu metrik aşırı optimizasyona yönlendirebilir.",
          },
        ],
      },
      {
        stage: "Retention",
        whyItMatters: "Kullanıcıların tekrar geri gelip gelmediğini gösterir — büyümenin temelidir.",
        guidingQuestion: "Kullanıcılarım geri dönüyor mu?",
        metrics: [
          {
            key: "wau-mau",
            name: "Haftalık aktif kullanıcı (WAU)",
            description: "Ürünün bir hafta içinde ne kadar tekrar kullanıldığını gösterir.",
            whenToUse: "Düzenli kullanım beklenen ürünlerde. Günlük aktif olmayan ama sık kullanılan araçlar için ideal.",
            whenToAvoid: "Kullanım doğası gereği aylık olan ürünlerde haftalık yerine aylık aktife bak.",
            recommended: !content,
          },
          {
            key: "d1-d7-d30",
            name: "D1 / D7 / D30 geri dönüş oranı",
            description: "İlk gün, hafta ve ay içinde geri dönen kullanıcı oranını takip et.",
            whenToUse: "Kullanıcıların geri gelip gelmediğini zaman bazlı görmek istiyorsan. İçerik ve medya için ideal.",
            whenToAvoid: "10'dan az kullanıcın varsa bu oran istatistiksel anlam taşımaz.",
            recommended: content,
          },
          {
            key: "churn",
            name: b2b ? "Kaybedilen müşteri oranı" : "Kaybedilen kullanıcı oranı",
            description: "Belli bir dönemde artık dönmeyen veya ödeme yapmayan kullanıcı/müşteri sayısı.",
            whenToUse: "Düşüşü görünür kılmak istiyorsan veya ödeme yapan kullanıcı tabanın varsa.",
            whenToAvoid: "Kullanıcı tabanı küçükken churn oranı yanıltıcıdır.",
            vanityWarning: "Küçük kullanıcı tabanında churn oranı her tek ayrılmada sert dalgalanır. Mutlak sayıyı da izle.",
          },
        ],
      },
      {
        stage: "Referral",
        whyItMatters: "Mevcut kullanıcıların yeni kullanıcı getirip getirmediğini gösterir.",
        guidingQuestion: "Kullanıcılarım başkalarını getiriyor mu?",
        metrics: [
          {
            key: "referral-conversion",
            name: "Referral dönüşüm oranı",
            description: "Gönderilen davetlerin ne kadarının yeni kullanıcıya dönüştüğünü gösterir.",
            whenToUse: "Referral ya da davet kanalın varsa. Davet kalitesini ölçmenin en net yolu.",
            whenToAvoid: "Referral kanalın yoksa bu metrik boş kalır.",
            recommended: !b2b,
          },
          {
            key: "viral-coefficient",
            name: "Kullanıcı başına getirilen yeni kullanıcı",
            description: "Ortalama bir kullanıcının kaç yeni kullanıcı getirdiğini ölçer (K-faktörü).",
            whenToUse: "Ürün doğası gereği paylaşılabilir veya ekip tabanlıysa.",
            whenToAvoid: "Ürün-pazar uyumu oturmadan viral katsayıyı optimize etmeye çalışma.",
            vanityWarning: "Viral katsayı hesaplamak için yeterli kullanıcı tabanı gerekir. Erken aşamada düşük K-faktörü yanıltıcı olabilir.",
            recommended: b2b,
          },
          {
            key: "invites-sent",
            name: "Gönderilen davet sayısı",
            description: "Kullanıcıların başkalarını çağırma eğilimini ölçer.",
            whenToUse: "Davet, paylaşım veya takım arkadaşı ekleme akışı varsa ve başlangıç sinyali arıyorsan.",
            whenToAvoid: "Tek başına yeterli değil — gönderilme değil, kabul edilme önemli.",
            vanityWarning: "Gönderilen davet sayısı niyet ölçer, sonuç değil. Dönüşüm oranını da mutlaka izle.",
          },
        ],
      },
      {
        stage: "Revenue",
        whyItMatters: "Büyümenin gelire dönüşüp dönüşmediğini gösterir.",
        guidingQuestion: "Büyüme gelir olarak geri dönüyor mu?",
        metrics: [
          {
            key: "mrr",
            name: "Aylık tekrarlayan gelir (MRR)",
            description: "Her ay tekrar eden toplam geliri gösterir. Abonelik büyümesinin temel göstergesi.",
            whenToUse: "Abonelik veya düzenli ödeme modelin varsa. En evrensel gelir sinyali.",
            whenToAvoid: "Tek seferlik satışlarda MRR hesaplanamaz — aylık toplam geliri izle.",
            recommended: true,
          },
          {
            key: "trial-to-paid",
            name: "Trial'dan ücretli kullanıcıya geçiş",
            description: "Deneme veya ücretsiz kullanıcıların ne kadarının ödeme yaptığını ölçer.",
            whenToUse: "Freemium veya trial modelin varsa. Ödeme niyetini ve ürün değerini doğrudan ölçer.",
            whenToAvoid: "Trial yoksa bu metrik anlam taşımaz.",
          },
          {
            key: "arpu",
            name: b2b ? "Hesap başı ortalama gelir (ARPU)" : "Kullanıcı başı ortalama gelir (ARPU)",
            description: "Toplam gelirin kullanıcı veya hesap başına nasıl dağıldığını gösterir.",
            whenToUse: "Gelirin kalitesine — sadece toplamına değil — bakmak istiyorsan.",
            whenToAvoid: "Kullanıcı tabanı çok küçükken ARPU dalgalı ve yanıltıcı olur.",
          },
        ],
      },
    ],
  };
}
