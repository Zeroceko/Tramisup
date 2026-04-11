import { ProductStatus } from "@prisma/client";
import type { GrowthCheckinAnswers } from "@/lib/growth-transition-checkin";

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
  platforms?: string[] | null;
  goalKey?: string | null;
  locale?: string;
  growthCheckinAnswers?: GrowthCheckinAnswers | null;
};

function pick(locale: string | undefined, en: string, tr: string) {
  return locale === "en" ? en : tr;
}

function isB2B(p: ProductInput) {
  const h = `${p.targetAudience ?? ""} ${p.businessModel ?? ""} ${p.category ?? ""}`.toLowerCase();
  return /team|teams|business|b2b|saas|company|startup|ekip|işletme/.test(h);
}

function isContentDriven(p: ProductInput) {
  const h = `${p.category ?? ""} ${p.description ?? ""}`.toLowerCase();
  return /content|newsletter|media|community|creator|blog/.test(h);
}

function isMobileProduct(p: ProductInput) {
  const h = `${p.category ?? ""} ${(p.platforms ?? []).join(" ")} ${p.description ?? ""}`.toLowerCase();
  return /mobil|mobile|ios|android|app/.test(h);
}

function prefersRevenueSignal(p: ProductInput) {
  const h = `${p.businessModel ?? ""} ${p.goalKey ?? ""} ${p.growthCheckinAnswers?.growth_goal ?? ""} ${p.growthCheckinAnswers?.revenue_motion ?? ""}`.toLowerCase();
  return /abonelik|subscription|freemium|trial|revenue|get_first_revenue/.test(h);
}

function prefersActivationSignal(p: ProductInput) {
  const h = `${p.goalKey ?? ""} ${p.description ?? ""} ${p.growthCheckinAnswers?.growth_goal ?? ""} ${p.growthCheckinAnswers?.first_value_action ?? ""}`.toLowerCase();
  return /validate_product|reach_first_value_usage|onboarding|activation|aha/.test(h);
}

function prefersRetentionSignal(p: ProductInput) {
  const h = `${p.goalKey ?? ""} ${p.growthCheckinAnswers?.growth_goal ?? ""} ${p.growthCheckinAnswers?.retention_rhythm ?? ""}`.toLowerCase();
  return /build_growth_rhythm|weekly|repeat_usage/.test(h);
}

function prefersWebsiteAwareness(p: ProductInput) {
  return p.growthCheckinAnswers?.acquisition_source === "website_organic";
}

function prefersReachAwareness(p: ProductInput) {
  return (
    p.growthCheckinAnswers?.acquisition_source === "partners" ||
    p.growthCheckinAnswers?.acquisition_source === "app_store"
  );
}

function prefersWaitlistSignal(p: ProductInput) {
  return p.growthCheckinAnswers?.acquisition_source === "direct_outreach";
}

function getFirstValueExamples(p: ProductInput, locale: string | undefined) {
  const action = p.growthCheckinAnswers?.first_value_action?.trim();
  if (action) {
    return locale === "en"
      ? `Current first value definition: ${action}.`
      : `Şu anki ilk değer tanımı: ${action}.`;
  }

  return isB2B(p)
    ? pick(locale, "For example: first campaign created, first product added, first dashboard configured.", "Örn: ilk kampanya oluşturma, ilk ürün ekleme, ilk dashboard kurma.")
    : pick(locale, "For example: first content created, first share, first goal completed.", "Örn: ilk içerik oluşturma, ilk paylaşım, ilk hedef tamamlama.");
}

function buildPlanSummary(product: ProductInput) {
  const locale = product.locale;
  const dataConfidence = product.growthCheckinAnswers?.source_confidence;
  const source = product.growthCheckinAnswers?.acquisition_source;

  if (dataConfidence === "low") {
    return pick(
      locale,
      `Start with a measurement system that stays trustworthy even when data flow is rough. Choose the smallest set of signals you can update reliably before chasing deeper diagnosis.`,
      `Veri akışı henüz pürüzlüyken bile güvenilir kalacak bir ölçüm sistemiyle başla. Derin teşhise geçmeden önce güvenle güncelleyebileceğin en küçük sinyal setini seç.`
    );
  }

  if (source === "website_organic") {
    return pick(
      locale,
      `This product appears to discover users through the website and organic channels. Favor metrics that keep traffic quality, signup conversion, and first value visible together.`,
      `Bu ürün kullanıcıyı daha çok website ve organik kanallardan buluyor gibi görünüyor. Trafik kalitesini, signup dönüşümünü ve ilk değeri birlikte görünür kılan metrikleri öne al.`
    );
  }

  return product.status === ProductStatus.PRE_LAUNCH
    ? pick(locale, `Set up the growth measurement system for ${product.name} now. Knowing which numbers to track before launch makes the first data much easier to interpret.`, `${product.name} için growth ölçüm sistemini şimdiden kur. Launch öncesi hangi sayıları takip edeceğini bilmek, ilk verileri anlamlandırmayı kolaylaştırır.`)
    : pick(locale, `Choose one primary signal for each AARRR stage in ${product.name}. Fewer but sharper metrics beat a long list of meaningless numbers.`, `${product.name} için her AARRR aşamasında tek bir ana sinyal seç. Az ama doğru metrik, çok ama anlamsız metrikten daha değerlidir.`);
}

export function getGrowthMetricRecommendations(product: ProductInput): GrowthMetricPlan {
  const locale = product.locale;
  const b2b = isB2B(product);
  const content = isContentDriven(product);
  const mobile = isMobileProduct(product);
  const preLaunch = product.status === ProductStatus.PRE_LAUNCH;
  const revenueFocused = prefersRevenueSignal(product);
  const activationFocused = prefersActivationSignal(product);
  const retentionFocused = prefersRetentionSignal(product);

  return {
    summary: buildPlanSummary(product),
    sections: [
      {
        stage: "Awareness",
        whyItMatters: pick(locale, "If people are not aware of you, nothing else in the funnel starts.", "İnsanlar senden haberdar olmuyorsa diğer adımlar hiç başlamaz."),
        guidingQuestion: pick(locale, "How many people became aware that my product exists?", "Kaç kişi ürünümün varlığından haberdar oldu?"),
        metrics: [
          {
            key: "website-visits",
            name: pick(locale, "Website visitors", "Website ziyaretçisi"),
            description: pick(locale, "The total number of visitors reaching your landing page or main site.", "Landing page veya ana sitene gelen toplam ziyaretçi sayısı."),
            whenToUse: pick(locale, "Use this if you collect demand through a website. It is the most universal and easiest awareness metric to measure.", "Web sitesi üzerinden ilgi topluyorsan. En evrensel ve ölçülmesi en kolay awareness metriği."),
            whenToAvoid: pick(locale, "Do not track only total traffic without looking at traffic source quality.", "Trafik kaynağını izlemeden sadece toplam ziyareti takip etme — kaynak kalitesi de önemli."),
            recommended: prefersWebsiteAwareness(product) || (!prefersReachAwareness(product) && !content && !mobile),
          },
          {
            key: "reach",
            name: content ? pick(locale, "Content reach", "İçerik erişimi") : pick(locale, "Total reach", "Toplam erişim"),
            description: content
              ? pick(locale, "Track how many people your content, posts, or newsletter reached.", "İçeriklerinin, postların veya bülteninin kaç kişiye ulaştığını gör.")
              : pick(locale, "Track the combined visibility impact of your organic and paid distribution.", "Organik ve paid kaynaklı görünürlüğünün toplam etkisini izle."),
            whenToUse: content
              ? pick(locale, "Use this if growth is driven by content, newsletters, or community.", "İçerik, bülten veya topluluk odaklı büyüme yapıyorsan.")
              : pick(locale, "Use this if you rely on organic content, launch posts, or community distribution.", "Organik içerik, launch postu veya topluluk dağıtımı yapıyorsan."),
            whenToAvoid: pick(locale, "High reach with no downstream conversion is not meaningful on its own.", "Erişim sayısı yüksek ama dönüşüm yoksa bu metrik tek başına anlam ifade etmez."),
            recommended: prefersReachAwareness(product) || content || mobile,
          },
          {
            key: "ad-impressions",
            name: pick(locale, "Ad impressions", "Reklam görüntülenme sayısı"),
            description: pick(locale, "If you are running paid channels, track how many times the ad was shown.", "Paid kanal çalıştırıyorsan reklamın kaç kez gösterildiğini izle."),
            whenToUse: pick(locale, "Use this when you are actively spending on Meta, Google, or X ads.", "Meta, Google veya X reklamlarına aktif bütçe ayırıyorsan."),
            whenToAvoid: pick(locale, "If there is no paid acquisition, this metric stays empty.", "Paid reklam yoksa bu metrik boş kalır."),
            vanityWarning: pick(locale, "Impressions only show that the ad was served, not that it created interest. Without click-through and conversion context, it is weak.", "Görüntülenme sayısı yalnızca reklamın gösterildiğini söyler, ilgiyi kanıtlamaz. Dönüşüm ve tıklama oranıyla desteklenmedikçe anlamlı değil."),
          },
        ],
      },
      {
        stage: "Acquisition",
        whyItMatters: pick(locale, "This measures whether people who see you move to signup, demo, or waitlist intent.", "Seni gören kişilerin kayıt, demo ya da bekleme listesine geçmesini ölçer."),
        guidingQuestion: pick(locale, "How many interested people moved one step closer to using the product?", "Ürünümle ilgilenen kaç kişi bir adım ileri gitti?"),
        metrics: [
          {
            key: "visitor-to-signup",
            name: b2b ? pick(locale, "Visitor → demo / signup conversion", "Visitor → demo / signup dönüşümü") : pick(locale, "Visitor → signup conversion", "Visitor → signup dönüşümü"),
            description: pick(locale, "Shows what portion of site visitors leave a signup or demand signal.", "Siteye gelenlerin ne kadarının kayıt veya talep bıraktığını gösterir."),
            whenToUse: pick(locale, "Use this if you have a landing page, waitlist, or signup flow. It is the clearest acquisition signal.", "Landing page, waitlist veya signup akışın varsa. En net acquisition sinyali."),
            whenToAvoid: pick(locale, "If you have fewer than 10 visitors per day, the conversion rate may be too noisy to trust.", "Günde 10'dan az ziyaretçin varsa dönüşüm oranı istatistiksel anlam taşımaz."),
            recommended: !prefersWaitlistSignal(product) && !preLaunch && !mobile,
          },
          {
            key: "waitlist-joins",
            name: pick(locale, "Waitlist / early-access joins", "Waitlist / erken erişim katılımı"),
            description: pick(locale, "One of the best early signals for measuring interest before launch.", "Launch öncesi ilgiyi ölçmek için en iyi erken sinyallerden biri."),
            whenToUse: pick(locale, "Use this when the product is not public yet or when you want to validate demand before launch.", "Henüz herkese açık değilsen ya da launch öncesi talep doğrulamak istiyorsan."),
            whenToAvoid: pick(locale, "After launch, move from this metric to signup conversion.", "Launch sonrasında bu metriğin yerine signup dönüşümüne geç."),
            recommended: prefersWaitlistSignal(product) || preLaunch || mobile,
          },
          {
            key: "cac",
            name: b2b ? pick(locale, "Cost per lead", "Lead başı maliyet") : pick(locale, "Cost per new user", "Yeni kullanıcı başı maliyet"),
            description: pick(locale, "Measures the average amount you spend to acquire a new user or lead.", "Bir yeni kullanıcı veya lead kazanmak için ortalama ne harcadığını ölçer."),
            whenToUse: pick(locale, "Use this if you run paid acquisition and want to understand your unit economics.", "Paid acquisition kullanıyorsan ve birim ekonomini anlamak istiyorsan."),
            whenToAvoid: pick(locale, "Without paid channels or enough data, this metric stays empty or misleading.", "Paid kanalın yoksa ya da henüz yeterli veri yoksa bu metrik boş ya da yanıltıcı kalır."),
          },
        ],
      },
      {
        stage: "Activation",
        whyItMatters: pick(locale, "This tells you whether a new user actually reached first value in the product.", "Yeni kullanıcının üründe ilk faydayı görüp görmediğini anlatır."),
        guidingQuestion: pick(locale, "How many signed-up users actually experienced value?", "Kaydolan kullanıcıların kaçı üründen gerçekten fayda gördü?"),
        metrics: [
          {
            key: "activation-rate",
            name: pick(locale, "Rate of users reaching first value", "İlk faydaya ulaşan kullanıcı oranı"),
            description: pick(locale, "Measures what portion of signups actually reached the first valuable step.", "Kayıt olanların ne kadarının gerçekten değerli ilk adıma ulaştığını ölçer."),
            whenToUse: pick(locale, "Use this when you want one early success metric. It is the most universal activation signal.", "Tek bir erken başarı metriği seçmek istiyorsan. En evrensel aktivasyon sinyali."),
            whenToAvoid: pick(locale, "Do not track this before defining what counts as activation.", "Neyin aktivasyon saydığı tanımlanmadan bu metriği takip etme."),
            recommended: !b2b && activationFocused,
          },
          {
            key: "first-value-action",
            name: b2b ? pick(locale, "First valuable business action", "İlk faydalı iş aksiyonu") : pick(locale, "First valuable user action", "İlk faydalı kullanıcı aksiyonu"),
            description: getFirstValueExamples(product, locale),
            whenToUse: pick(locale, "Use this when the product's aha moment can be defined clearly.", "Ürünün 'aha moment' noktası net tanımlanabiliyorsa."),
            whenToAvoid: pick(locale, "If there is no single critical first action or users find value in different ways, this can mislead.", "Tek bir kritik ilk aksiyon yoksa ya da kullanıcılar farklı yollarla değer buluyorsa yanıltıcı olabilir."),
            recommended: b2b || (!activationFocused && (revenueFocused || retentionFocused)),
          },
          {
            key: "onboarding-completion",
            name: pick(locale, "Users who complete onboarding", "Onboarding'i tamamlayan kullanıcı"),
            description: pick(locale, "Shows how many of your signups completed the initial setup or getting-started flow.", "Kayıt olanlardan kaç kişinin kurulum veya başlangıç adımlarını bitirdiğini gösterir."),
            whenToUse: pick(locale, "Use this if onboarding has multiple steps and completion is low.", "Birden fazla onboarding adımın varsa ve tamamlama oranı düşükse."),
            whenToAvoid: pick(locale, "If onboarding is one-step or nonexistent, this can push you toward over-optimization.", "Onboarding tek adımlıysa ya da yoksa bu metrik aşırı optimizasyona yönlendirebilir."),
          },
        ],
      },
      {
        stage: "Retention",
        whyItMatters: pick(locale, "This shows whether users come back again, which is the foundation of growth.", "Kullanıcıların tekrar geri gelip gelmediğini gösterir — büyümenin temelidir."),
        guidingQuestion: pick(locale, "Are my users coming back?", "Kullanıcılarım geri dönüyor mu?"),
        metrics: [
          {
            key: "wau-mau",
            name: pick(locale, "Weekly active users (WAU)", "Haftalık aktif kullanıcı (WAU)"),
            description: pick(locale, "Shows how much repeat usage the product gets inside a week.", "Ürünün bir hafta içinde ne kadar tekrar kullanıldığını gösterir."),
            whenToUse: pick(locale, "Use this when regular repeat usage is expected. Ideal for products used often but not necessarily every day.", "Düzenli kullanım beklenen ürünlerde. Günlük aktif olmayan ama sık kullanılan araçlar için ideal."),
            whenToAvoid: pick(locale, "If the product is naturally monthly, use a monthly active metric instead.", "Kullanım doğası gereği aylık olan ürünlerde haftalık yerine aylık aktife bak."),
            recommended: !content && !mobile && retentionFocused,
          },
          {
            key: "d1-d7-d30",
            name: pick(locale, "D1 / D7 / D30 return rate", "D1 / D7 / D30 geri dönüş oranı"),
            description: pick(locale, "Track the percentage of users who return within the first day, week, and month.", "İlk gün, hafta ve ay içinde geri dönen kullanıcı oranını takip et."),
            whenToUse: pick(locale, "Use this if you want a time-based view of return behavior. Ideal for content and media products.", "Kullanıcıların geri gelip gelmediğini zaman bazlı görmek istiyorsan. İçerik ve medya için ideal."),
            whenToAvoid: pick(locale, "With fewer than 10 users, this rate is too noisy to trust.", "10'dan az kullanıcın varsa bu oran istatistiksel anlam taşımaz."),
            recommended: content || mobile || !retentionFocused,
          },
          {
            key: "churn",
            name: b2b ? pick(locale, "Customer churn rate", "Kaybedilen müşteri oranı") : pick(locale, "User churn rate", "Kaybedilen kullanıcı oranı"),
            description: pick(locale, "The number of users or customers who no longer return or no longer pay over a period.", "Belli bir dönemde artık dönmeyen veya ödeme yapmayan kullanıcı/müşteri sayısı."),
            whenToUse: pick(locale, "Use this if you want to make decline visible or if you already have a paying base.", "Düşüşü görünür kılmak istiyorsan veya ödeme yapan kullanıcı tabanın varsa."),
            whenToAvoid: pick(locale, "With a small user base, churn rate can mislead.", "Kullanıcı tabanı küçükken churn oranı yanıltıcıdır."),
            vanityWarning: pick(locale, "In a small user base, churn rate swings hard with every single departure. Track absolute count too.", "Küçük kullanıcı tabanında churn oranı her tek ayrılmada sert dalgalanır. Mutlak sayıyı da izle."),
          },
        ],
      },
      {
        stage: "Referral",
        whyItMatters: pick(locale, "This shows whether existing users bring new users.", "Mevcut kullanıcıların yeni kullanıcı getirip getirmediğini gösterir."),
        guidingQuestion: pick(locale, "Are my users bringing in others?", "Kullanıcılarım başkalarını getiriyor mu?"),
        metrics: [
          {
            key: "referral-conversion",
            name: pick(locale, "Referral conversion rate", "Referral dönüşüm oranı"),
            description: pick(locale, "Shows what portion of sent invites turns into new users.", "Gönderilen davetlerin ne kadarının yeni kullanıcıya dönüştüğünü gösterir."),
            whenToUse: pick(locale, "Use this if you already have a referral or invite channel. It is the clearest way to measure invite quality.", "Referral ya da davet kanalın varsa. Davet kalitesini ölçmenin en net yolu."),
            whenToAvoid: pick(locale, "If there is no referral channel, this stays empty.", "Referral kanalın yoksa bu metrik boş kalır."),
            recommended: !b2b,
          },
          {
            key: "viral-coefficient",
            name: pick(locale, "New users brought per user", "Kullanıcı başına getirilen yeni kullanıcı"),
            description: pick(locale, "Measures how many new users the average user brings in (K-factor).", "Ortalama bir kullanıcının kaç yeni kullanıcı getirdiğini ölçer (K-faktörü)."),
            whenToUse: pick(locale, "Use this if the product is inherently shareable or team-based.", "Ürün doğası gereği paylaşılabilir veya ekip tabanlıysa."),
            whenToAvoid: pick(locale, "Do not optimize viral coefficient before product-market fit starts to settle.", "Ürün-pazar uyumu oturmadan viral katsayıyı optimize etmeye çalışma."),
            vanityWarning: pick(locale, "You need a large enough user base to trust viral coefficient. At the early stage, a low K-factor can mislead.", "Viral katsayı hesaplamak için yeterli kullanıcı tabanı gerekir. Erken aşamada düşük K-faktörü yanıltıcı olabilir."),
            recommended: b2b || /invite|team|collaboration|ekip/.test(`${product.description ?? ""} ${product.category ?? ""}`.toLowerCase()),
          },
          {
            key: "invites-sent",
            name: pick(locale, "Invites sent", "Gönderilen davet sayısı"),
            description: pick(locale, "Measures the tendency of users to invite others.", "Kullanıcıların başkalarını çağırma eğilimini ölçer."),
            whenToUse: pick(locale, "Use this if you have an invite, sharing, or teammate-adding flow and you need an early signal.", "Davet, paylaşım veya takım arkadaşı ekleme akışı varsa ve başlangıç sinyali arıyorsan."),
            whenToAvoid: pick(locale, "By itself this is not enough — what matters is not sending, but acceptance.", "Tek başına yeterli değil — gönderilme değil, kabul edilme önemli."),
            vanityWarning: pick(locale, "Invite count measures intent, not result. Always pair it with conversion rate.", "Gönderilen davet sayısı niyet ölçer, sonuç değil. Dönüşüm oranını da mutlaka izle."),
          },
        ],
      },
      {
        stage: "Revenue",
        whyItMatters: pick(locale, "This shows whether growth is turning into revenue.", "Büyümenin gelire dönüşüp dönüşmediğini gösterir."),
        guidingQuestion: pick(locale, "Is growth coming back as revenue?", "Büyüme gelir olarak geri dönüyor mu?"),
        metrics: [
          {
            key: "mrr",
            name: pick(locale, "Monthly recurring revenue (MRR)", "Aylık tekrarlayan gelir (MRR)"),
            description: pick(locale, "Shows the total recurring revenue each month. It is the core signal of subscription growth.", "Her ay tekrar eden toplam geliri gösterir. Abonelik büyümesinin temel göstergesi."),
            whenToUse: pick(locale, "Use this if you have a subscription or recurring payment model. It is the most universal revenue signal.", "Abonelik veya düzenli ödeme modelin varsa. En evrensel gelir sinyali."),
            whenToAvoid: pick(locale, "MRR does not apply to one-time sales. Track monthly total revenue instead.", "Tek seferlik satışlarda MRR hesaplanamaz — aylık toplam geliri izle."),
            recommended: revenueFocused || /abonelik|subscription|recurring/.test(`${product.businessModel ?? ""}`.toLowerCase()),
          },
          {
            key: "trial-to-paid",
            name: pick(locale, "Trial-to-paid conversion", "Trial'dan ücretli kullanıcıya geçiş"),
            description: pick(locale, "Measures what portion of trial or free users move to payment.", "Deneme veya ücretsiz kullanıcıların ne kadarının ödeme yaptığını ölçer."),
            whenToUse: pick(locale, "Use this if you have a freemium or trial model. It directly measures payment intent and product value.", "Freemium veya trial modelin varsa. Ödeme niyetini ve ürün değerini doğrudan ölçer."),
            whenToAvoid: pick(locale, "If there is no trial model, this metric is not meaningful.", "Trial yoksa bu metrik anlam taşımaz."),
            recommended: /freemium|trial/.test(`${product.businessModel ?? ""}`.toLowerCase()),
          },
          {
            key: "arpu",
            name: b2b ? pick(locale, "Average revenue per account (ARPU)", "Hesap başı ortalama gelir (ARPU)") : pick(locale, "Average revenue per user (ARPU)", "Kullanıcı başı ortalama gelir (ARPU)"),
            description: pick(locale, "Shows how total revenue is distributed per user or account.", "Toplam gelirin kullanıcı veya hesap başına nasıl dağıldığını gösterir."),
            whenToUse: pick(locale, "Use this if you want to examine the quality of revenue, not just the total.", "Gelirin kalitesine — sadece toplamına değil — bakmak istiyorsan."),
            whenToAvoid: pick(locale, "With a very small user base, ARPU becomes volatile and misleading.", "Kullanıcı tabanı çok küçükken ARPU dalgalı ve yanıltıcı olur."),
            recommended: /marketplace|kullanıma göre ödeme|usage|reklam|enterprise|kurumsal/.test(`${product.businessModel ?? ""}`.toLowerCase()),
          },
        ],
      },
    ],
  };
}
