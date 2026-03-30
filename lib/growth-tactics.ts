import { ProductStatus } from "@prisma/client";
import type { FunnelHealthSummary, FunnelStageHealth } from "@/lib/funnel-health";

export type GrowthTactic = {
  title: string;
  channel: string;
  whyNow: string;
  howToStart: string;
  successSignal: string;
  confidence: "high" | "medium" | "low";
};

export type GrowthTacticsPlan = {
  title: string;
  diagnosis: string;
  readinessNote?: string;
  tactics: GrowthTactic[];
};

type ProductInput = {
  status: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
  category?: string | null;
  targetAudience?: string | null;
  businessModel?: string | null;
  description?: string | null;
  website?: string | null;
  platforms?: string[] | null;
  goalKey?: string | null;
};

type Input = {
  product: ProductInput;
  hasMetricSetup: boolean;
  hasMetricEntries: boolean;
  connectedSourceCount: number;
  funnelHealth: FunnelHealthSummary | null;
};

function isB2B(product: ProductInput) {
  const haystack = `${product.targetAudience ?? ""} ${product.businessModel ?? ""} ${product.category ?? ""}`.toLowerCase();
  return /team|teams|business|b2b|saas|company|startup|ekip|işletme/.test(haystack);
}

function isDeveloperTool(product: ProductInput) {
  const haystack = `${product.category ?? ""} ${product.description ?? ""}`.toLowerCase();
  return /developer|api|sdk|platform|geliştirici|webhook/.test(haystack);
}

function isContentProduct(product: ProductInput) {
  const haystack = `${product.category ?? ""} ${product.description ?? ""}`.toLowerCase();
  return /content|newsletter|media|creator|community|blog|podcast|içerik/.test(haystack);
}

function isMobileProduct(product: ProductInput) {
  const haystack = `${product.category ?? ""} ${(product.platforms ?? []).join(" ")} ${product.description ?? ""}`.toLowerCase();
  return /mobile|mobil|ios|android|app store|play store|uygulama/.test(haystack);
}

function getAtRiskStage(funnelHealth: FunnelHealthSummary | null) {
  return funnelHealth?.stages.find((item) => item.status === "AT_RISK") ?? null;
}

function awarenessTactics(product: ProductInput): GrowthTactic[] {
  if (isDeveloperTool(product)) {
    return [
      {
        title: "X ve GitHub etrafında problem odaklı görünürlük kur",
        channel: "X / GitHub / Hacker News",
        whyNow: "Developer ürünlerinde ilk kaliteli trafik çoğu zaman genel reklamdan değil, ürünün konuşulduğu teknik ortamlardan gelir.",
        howToStart: "Bu hafta 3 kısa X postu yayınla, bir kullanım örneği yaz ve ilgili GitHub repo veya dokümantasyona giriş noktası ekle.",
        successSignal: "İlk hafta içinde kaynak bazlı tıklama ve signup akışında anlamlı artış gör.",
        confidence: "medium",
      },
      {
        title: "Topluluk konuşmalarına cevap vererek niyet yakala",
        channel: "Reddit / Hacker News / Discord",
        whyNow: "Zaten var olan problem konuşmalarına girersen soğuk dağıtımdan daha kaliteli erken trafik alırsın.",
        howToStart: "Hedef problemle ilgili 10 konuşma bul, 3 tanesine ürün pitch'i değil problem çözümü odağında yanıt ver.",
        successSignal: "Topluluktan gelen referans trafik ve cevap sonrası profil/landing ziyaretleri artsın.",
        confidence: "medium",
      },
      {
        title: "Docs veya demo sayfasını dağıtım için optimize et",
        channel: "Website / docs",
        whyNow: "Teknik kitle önce ürünün ne yaptığını değil, ne kadar hızlı deneyebileceğini görmek ister.",
        howToStart: "Ana sayfaya 'ilk 5 dakikada ne olur' bölümü ekle ve tek CTA'yı demo veya docs girişine bağla.",
        successSignal: "Landing ziyaretinden docs/demo açılışına geçiş oranı yükselsin.",
        confidence: "high",
      },
    ];
  }

  if (isB2B(product)) {
    return [
      {
        title: "Founder-led outreach ile ilk sıcak konuşmaları başlat",
        channel: "LinkedIn / email warm outreach",
        whyNow: "B2B ürünlerde ilk kazanım genelde performans reklamından değil, doğru kişiye doğru problemle gitmekten gelir.",
        howToStart: "İdeal müşteri profilinden 20 kişi çıkar, 5 kişiye ürün demosu satmadan önce problemi nasıl çözdüklerini soran kısa mesaj gönder.",
        successSignal: "Yanıt oranı, demo talebi veya problem görüşmesi sayısı artsın.",
        confidence: "high",
      },
      {
        title: "Problem dilini içerikte test et",
        channel: "LinkedIn content",
        whyNow: "Outreach mesajında hangi dilin çalıştığını içerikte de test etmek daha sürdürülebilir bir acquisition ritmi kurar.",
        howToStart: "Bu hafta tek bir problem etrafında 2 içerik paylaş: biri acıyı, biri çözüm yaklaşımını anlatsın.",
        successSignal: "Profil ziyareti, gelen DM veya landing tıklamaları artsın.",
        confidence: "medium",
      },
      {
        title: "Yakın ekosistem ortaklarını kullan",
        channel: "Partner distribution",
        whyNow: "Aynı kitleye giden ama rakip olmayan araçlar ilk güvenli dağıtım hızlandırıcısı olabilir.",
        howToStart: "Aynı kitleye konuşan 5 araç/ajans/topluluk listesi çıkar ve ortak webinar, newsletter mention veya bundle fikri öner.",
        successSignal: "Bir ortak kaynak üzerinden ilk kaliteli lead veya trafik gelsin.",
        confidence: "medium",
      },
    ];
  }

  if (isMobileProduct(product)) {
    return [
      {
        title: "Store görünürlüğünü önce temizle",
        channel: "App Store / Google Play",
        whyNow: "Mobil ürünlerde erken acquisition'ın büyük bölümü store listing kalitesi ve ilk kreatiflerden etkilenir.",
        howToStart: "Başlık, açıklama ve ilk 3 screenshot'u tek bir kullanım vaadi etrafında yeniden hizala.",
        successSignal: "Store listing görüntüleme -> install dönüşümü artsın.",
        confidence: "high",
      },
      {
        title: "Tek yaratıcı açıyla düşük bütçeli paid test yap",
        channel: "Meta / TikTok ads",
        whyNow: "Mobil ürünlerde küçük paid testler mesaj-market uyumunu hızlı okur; ama yalnızca tek hipotezle yapılmalı.",
        howToStart: "Bir hedef kitle, bir mesaj, bir kreatif seç ve sınırlı bütçeyle 3-5 gün test et.",
        successSignal: "Install başına maliyet ve install -> activation oranı kabul edilebilir seviyede olsun.",
        confidence: "medium",
      },
      {
        title: "UGC tarzı ürün anlatımı üret",
        channel: "Short-form social",
        whyNow: "Mobil kullanıcı ürün vaadini çoğu zaman polished reklamdan değil, kullanım hissini gösteren kreatiften daha hızlı anlar.",
        howToStart: "Gerçek kullanım senaryosunu gösteren 3 kısa video/script hazırla.",
        successSignal: "Video izlenme -> store tıklama oranı yükselsin.",
        confidence: "medium",
      },
    ];
  }

  if (isContentProduct(product)) {
    return [
      {
        title: "Yayın ritmini sabitle",
        channel: "Newsletter / blog / social",
        whyNow: "İçerik ürünlerinde awareness kaotik patlamalardan değil, tekrar eden yayın ritminden birikir.",
        howToStart: "Bu hafta tek format seç ve 3 içerik slotu planla: eğitim, sonuç, problem çözümü.",
        successSignal: "Düzenli yayın sonrası ziyaretçi ve abone büyümesi hızlansın.",
        confidence: "high",
      },
      {
        title: "Topluluk konuşmalarından içerik çıkar",
        channel: "Community-led content",
        whyNow: "Kitle zaten hangi soruları soruyorsa en hızlı traction o sorulara cevap veren içerikle gelir.",
        howToStart: "Reddit, X veya Discord'dan 10 soru topla ve bunlardan 3 post çıkar.",
        successSignal: "İçerik başına tıklama, reply veya subscribe sayısı artsın.",
        confidence: "medium",
      },
      {
        title: "Yakın creator çapraz dağıtımını dene",
        channel: "Creator cross-promotion",
        whyNow: "Aynı kitlenin dikkatini zaten taşıyan creator'larla küçük çaplı iş birlikleri cold reach'ten daha sıcak sonuç verir.",
        howToStart: "Benzer kitleye konuşan 5 creator listesi çıkar ve mini swap/collab öner.",
        successSignal: "Yeni trafik kaynağında daha yüksek etkileşim veya abone kazanımı gör.",
        confidence: "medium",
      },
    ];
  }

  return [
    {
      title: "Tek bir dağıtım kanalını net seç",
      channel: "Primary distribution channel",
      whyNow: "Birden fazla kanalda zayıf görünürlük yerine tek kanalda güçlü sinyal üretmek daha hızlı öğrenme sağlar.",
      howToStart: "Kitlenin en doğal bulunduğu bir kanalı seç ve bir hafta boyunca sadece oraya odaklan.",
      successSignal: "Tek kanaldan ölçülebilir trafik ve signup artışı gelsin.",
      confidence: "medium",
    },
    {
      title: "Problem odaklı içerik veya outreach denemesi yap",
      channel: "Content / outreach",
      whyNow: "Erken acquisition'da en önemli şey hacim değil, doğru problem dilinin çalışıp çalışmadığını öğrenmektir.",
      howToStart: "Bir problem mesajı seç ve 5 konuşma, 2 içerik veya 1 landing varyasyonu ile test et.",
      successSignal: "Mesaj sonrası reply, click veya signup sinyali artsın.",
      confidence: "medium",
    },
  ];
}

function activationTactics(product: ProductInput): GrowthTactic[] {
  return [
    {
      title: "İlk değer anına giden yolu kısalt",
      channel: "Onboarding / product flow",
      whyNow: "Kullanıcı kazanmak yetmez; ürünün işe yaradığını mümkün olduğunca erken hissettirmek gerekir.",
      howToStart: "İlk değer için şart olmayan adımları kaldır ve kullanıcıyı tek kritik aksiyona yönlendir.",
      successSignal: "Signup -> first-value-action dönüşüm oranı yükselsin.",
      confidence: "high",
    },
    {
      title: "İlk 10 kullanıcıyla manuel aktivasyon görüşmesi yap",
      channel: "Founder follow-up",
      whyNow: "Erken aşamada aktivasyon kırığı çoğu zaman funnel raporundan değil, gerçek kullanıcıyı izlemekten çözülür.",
      howToStart: "Kayıt olup ilerlemeyen kullanıcılara kısa mesaj at ve nerede takıldıklarını sor.",
      successSignal: "Takıldıkları ortak nokta netleşsin ve sonraki hafta bu adımın tamamlama oranı artsın.",
      confidence: "high",
    },
    {
      title: "İlk 24 saatlik yönlendirme akışını ekle",
      channel: "Email / in-product nudges",
      whyNow: "Kullanıcının ilk gün içinde tekrar dönmesi aktivasyon kalitesini yükseltir.",
      howToStart: "İlk başarı aksiyonuna götüren tek bir email veya in-app reminder tasarla.",
      successSignal: "İlk gün içinde geri dönme ve ilk değer aksiyonu tamamlama oranı artsın.",
      confidence: "medium",
    },
  ];
}

function retentionTactics(): GrowthTactic[] {
  return [
    {
      title: "Geri dönmeyen kullanıcılarla pattern bul",
      channel: "User interviews",
      whyNow: "Retention sorunu varken yeni acquisition eklemek deliği olan kovayı doldurmaya benzer.",
      howToStart: "Son dönemde aktif olmayan 5-10 kullanıcıya ulaşıp neden geri dönmediklerini sor.",
      successSignal: "Tekrarlayan 1-2 churn nedeni netleşsin ve bunlara yönelik iş listesi çıksın.",
      confidence: "high",
    },
    {
      title: "Geri gelme sebebini üründe görünür yap",
      channel: "Product habit loop",
      whyNow: "Kullanıcıya neden geri dönmesi gerektiği görünmüyorsa retention tesadüfi kalır.",
      howToStart: "Düzenli değer üreten feature veya çıktı için hatırlatıcı/trigger ekle.",
      successSignal: "D7 veya haftalık aktif kullanıcı ritmi iyileşsin.",
      confidence: "medium",
    },
    {
      title: "Lifecycle akışını tek işe bağla",
      channel: "Lifecycle messaging",
      whyNow: "Genel hatırlatmalar yerine tek faydalı aksiyona dönen mesajlar daha iyi retention üretir.",
      howToStart: "Bir reactivation email'i veya notification'ı tek kullanım sonucuna bağla.",
      successSignal: "Mesaj alan kullanıcıların geri dönüş oranı artsın.",
      confidence: "medium",
    },
  ];
}

function referralTactics(): GrowthTactic[] {
  return [
    {
      title: "Davet isteğini değer anında göster",
      channel: "In-product referral",
      whyNow: "Referral en iyi kullanıcı değer gördüğü anda görünür olduğunda çalışır.",
      howToStart: "İlk başarılı sonuçtan hemen sonra tek tıklamalı davet CTA'sı göster.",
      successSignal: "Invite send -> accepted invite oranı artsın.",
      confidence: "medium",
    },
    {
      title: "Paylaşmayı tek cümleye indir",
      channel: "Sharing flow",
      whyNow: "Referral mekanizması varsa bile paylaşım sürtünmesi yüksekse kullanıcı başkalarını getirmez.",
      howToStart: "Önceden yazılmış kısa paylaşım mesajı ve tek tıklama kopyalama ekle.",
      successSignal: "Gönderilen davet sayısı ve referral conversion artsın.",
      confidence: "medium",
    },
  ];
}

function revenueTactics(product: ProductInput): GrowthTactic[] {
  return [
    {
      title: "Ödeme kararını engelleyen tek friksiyonu bul",
      channel: "Pricing / checkout",
      whyNow: "Revenue zayıfken yeni acquisition eklemek yerine ödeme anındaki kırılmayı çözmek daha hızlı sonuç verir.",
      howToStart: "Pricing veya checkout akışını gözden geçir; kullanıcıların neden durduğunu 5 konuşma ile öğren.",
      successSignal: "Trial-to-paid, demo-to-close veya ödeme tamamlama oranı yükselsin.",
      confidence: "high",
    },
    {
      title: "Tek bir ödeme argümanını test et",
      channel: "Pricing message",
      whyNow: "Erken revenue artışı çoğu zaman yeni özellikten değil, değeri daha net anlatmaktan gelir.",
      howToStart: "Pricing sayfasında veya satış görüşmesinde tek bir değer cümlesini değiştir ve etkisini izle.",
      successSignal: "Ödeme soruları azalsın ve conversion artsın.",
      confidence: "medium",
    },
    {
      title: "Ücretli deneme geçişini sadeleştir",
      channel: "Trial / sales handoff",
      whyNow: "Kullanıcı ürünün değerini görse bile geçiş anı karmaşıksa gelir birikmez.",
      howToStart: "Trial sonu, plan seçimi veya demo sonrası takip mesajını tek sonraki adımla sadeleştir.",
      successSignal: "Plan seçimi veya ödeme başlatma oranı artsın.",
      confidence: "medium",
    },
  ];
}

export function getGrowthTacticsPlan(input: Input): GrowthTacticsPlan | null {
  const { product, hasMetricSetup, hasMetricEntries, connectedSourceCount, funnelHealth } = input;
  const launched =
    product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;

  if (!launched) return null;

  if (!hasMetricSetup) {
    return {
      title: "Taktik öncesi hazırla",
      diagnosis: "Henüz hangi büyüme sinyalini takip ettiğin net değil.",
      readinessNote:
        "Tiramisup bu aşamada kanal tavsiyesi yerine önce ölçüm sistemini kurmanı önerir. Aksi halde taktikler öğrenme üretmez.",
      tactics: [
        {
          title: "AARRR boyunca tek ana metrikleri seç",
          channel: "Metrics setup",
          whyNow: "Önce neyi hareket ettirmeye çalıştığını netleştirmeden kanal seçmek erken olur.",
          howToStart: "Metrics ekranında her aşama için bir ana sinyal seç.",
          successSignal: "İlk setup tamamlanmış olsun.",
          confidence: "high",
        },
        {
          title: connectedSourceCount > 0 ? "Kaynakları ölçümle hizala" : "İlk veri kaynağını bağla",
          channel: "Source health",
          whyNow: "Veri akışı ne kadar güvenilir olursa sonraki taktik önerisi o kadar güvenilir olur.",
          howToStart: connectedSourceCount > 0 ? "Bağlı kaynakların seçtiğin metrikleri gerçekten kapsayıp kapsamadığını kontrol et." : "GA4, Stripe veya uygun kaynağı bağla.",
          successSignal: "Seçili metriklerin en az bir kısmı için veri akışı netleşsin.",
          confidence: "high",
        },
      ],
    };
  }

  if (!hasMetricEntries) {
    return {
      title: "Önce baz çizgiyi oluştur",
      diagnosis: "Metrikler seçili ama henüz güvenilir günlük ritim yok.",
      readinessNote:
        "Henüz zayıf halka netleşmediği için Tiramisup kanal önerilerini sınırlı tutar ve önce öğrenme hızını artırır.",
      tactics: [
        {
          title: "İlk 7 günlük veri ritmini kur",
          channel: "Metrics cadence",
          whyNow: "Bir taktiğin işe yarayıp yaramadığını görebilmek için önce baz çizgi gerekir.",
          howToStart: "Önümüzdeki 7 gün boyunca aynı saatte veri girişi yap veya kaynak sync'ini doğrula.",
          successSignal: "En az 3-5 giriş oluşsun.",
          confidence: "high",
        },
        {
          title: "İlk kullanıcı konuşmalarını notla",
          channel: "Founder learning loop",
          whyNow: "Veri henüz erkenken en güçlü sinyal kullanıcı dili ve kullanım sebebidir.",
          howToStart: "İlk 5 kullanıcıya ürünün hangi anında değer gördüklerini sor.",
          successSignal: "Aktivasyon veya retention kırığı için tekrar eden dil ortaya çıksın.",
          confidence: "medium",
        },
      ],
    };
  }

  const atRiskStage = getAtRiskStage(funnelHealth);
  const targetStage: FunnelStageHealth["stage"] | null =
    atRiskStage?.stage ??
    funnelHealth?.stages.find((item) => item.status === "NEEDS_BASELINE")?.stage ??
    null;

  let title = "Bu hafta önerilen taktikler";
  let diagnosis = funnelHealth?.nextFocus ?? "Şu anki büyüme ritmine göre odak gerektiren alan için taktikler sıralandı.";
  let tactics: GrowthTactic[] = [];

  switch (targetStage) {
    case "Awareness":
    case "Acquisition":
      title = "Acquisition tarafı için önerilen taktikler";
      tactics = awarenessTactics(product);
      break;
    case "Activation":
      title = "Activation tarafı için önerilen taktikler";
      tactics = activationTactics(product);
      break;
    case "Retention":
      title = "Retention tarafı için önerilen taktikler";
      tactics = retentionTactics();
      break;
    case "Referral":
      title = "Referral tarafı için önerilen taktikler";
      tactics = referralTactics();
      break;
    case "Revenue":
      title = "Revenue tarafı için önerilen taktikler";
      tactics = revenueTactics(product);
      break;
    default:
      tactics = awarenessTactics(product).slice(0, 2);
      break;
  }

  return {
    title,
    diagnosis,
    tactics: tactics.slice(0, 3),
  };
}
