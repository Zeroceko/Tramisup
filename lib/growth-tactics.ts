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
  locale?: string;
};

function pick(locale: string | undefined, en: string, tr: string) {
  return locale === "en" ? en : tr;
}

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

function awarenessTactics(product: ProductInput, locale?: string): GrowthTactic[] {
  if (isDeveloperTool(product)) {
    return [
      {
        title: pick(locale, "Build problem-led visibility around X and GitHub", "X ve GitHub etrafında problem odaklı görünürlük kur"),
        channel: "X / GitHub / Hacker News",
        whyNow: pick(locale, "For developer products, the first high-quality traffic usually comes from technical environments where the product category is already being discussed, not broad ads.", "Developer ürünlerinde ilk kaliteli trafik çoğu zaman genel reklamdan değil, ürünün konuşulduğu teknik ortamlardan gelir."),
        howToStart: pick(locale, "Publish 3 short X posts this week, write one practical use case, and add a clear entry point to your GitHub repo or docs.", "Bu hafta 3 kısa X postu yayınla, bir kullanım örneği yaz ve ilgili GitHub repo veya dokümantasyona giriş noktası ekle."),
        successSignal: pick(locale, "See a meaningful rise in source-based clicks and signups within the first week.", "İlk hafta içinde kaynak bazlı tıklama ve signup akışında anlamlı artış gör."),
        confidence: "medium",
      },
      {
        title: pick(locale, "Capture intent by replying in community threads", "Topluluk konuşmalarına cevap vererek niyet yakala"),
        channel: "Reddit / Hacker News / Discord",
        whyNow: pick(locale, "If you enter existing problem conversations, you get higher-quality early traffic than from cold distribution.", "Zaten var olan problem konuşmalarına girersen soğuk dağıtımdan daha kaliteli erken trafik alırsın."),
        howToStart: pick(locale, "Find 10 discussions about the target problem and reply to 3 of them with useful problem-solving context, not a product pitch.", "Hedef problemle ilgili 10 konuşma bul, 3 tanesine ürün pitch'i değil problem çözümü odağında yanıt ver."),
        successSignal: pick(locale, "Referral traffic from communities and profile or landing visits after your replies should increase.", "Topluluktan gelen referans trafik ve cevap sonrası profil/landing ziyaretleri artsın."),
        confidence: "medium",
      },
      {
        title: pick(locale, "Optimize docs or the demo page for distribution", "Docs veya demo sayfasını dağıtım için optimize et"),
        channel: "Website / docs",
        whyNow: pick(locale, "Technical audiences first want to know how fast they can try the product, not just what it does.", "Teknik kitle önce ürünün ne yaptığını değil, ne kadar hızlı deneyebileceğini görmek ister."),
        howToStart: pick(locale, "Add a “what happens in the first 5 minutes” section to the homepage and route the main CTA to demo or docs.", "Ana sayfaya 'ilk 5 dakikada ne olur' bölümü ekle ve tek CTA'yı demo veya docs girişine bağla."),
        successSignal: pick(locale, "The conversion rate from landing visits to docs or demo opens should rise.", "Landing ziyaretinden docs/demo açılışına geçiş oranı yükselsin."),
        confidence: "high",
      },
    ];
  }

  if (isB2B(product)) {
    return [
      {
        title: pick(locale, "Start your first warm conversations with founder-led outreach", "Founder-led outreach ile ilk sıcak konuşmaları başlat"),
        channel: "LinkedIn / email warm outreach",
        whyNow: pick(locale, "In B2B, the first wins usually come from taking the right problem to the right person, not from performance ads.", "B2B ürünlerde ilk kazanım genelde performans reklamından değil, doğru kişiye doğru problemle gitmekten gelir."),
        howToStart: pick(locale, "List 20 people from your ideal customer profile and send 5 of them a short message asking how they solve the problem today, before trying to sell a demo.", "İdeal müşteri profilinden 20 kişi çıkar, 5 kişiye ürün demosu satmadan önce problemi nasıl çözdüklerini soran kısa mesaj gönder."),
        successSignal: pick(locale, "Reply rate, demo requests, or problem interview count should increase.", "Yanıt oranı, demo talebi veya problem görüşmesi sayısı artsın."),
        confidence: "high",
      },
      {
        title: pick(locale, "Test problem language in content", "Problem dilini içerikte test et"),
        channel: "LinkedIn content",
        whyNow: pick(locale, "Testing the language that works in outreach inside content helps build a more sustainable acquisition rhythm.", "Outreach mesajında hangi dilin çalıştığını içerikte de test etmek daha sürdürülebilir bir acquisition ritmi kurar."),
        howToStart: pick(locale, "Publish 2 pieces of content around one problem this week: one about the pain, one about your solution angle.", "Bu hafta tek bir problem etrafında 2 içerik paylaş: biri acıyı, biri çözüm yaklaşımını anlatsın."),
        successSignal: pick(locale, "Profile visits, inbound DMs, or landing clicks should increase.", "Profil ziyareti, gelen DM veya landing tıklamaları artsın."),
        confidence: "medium",
      },
      {
        title: pick(locale, "Use nearby ecosystem partners", "Yakın ekosistem ortaklarını kullan"),
        channel: "Partner distribution",
        whyNow: pick(locale, "Tools that reach the same audience without competing with you can become safe early distribution accelerators.", "Aynı kitleye giden ama rakip olmayan araçlar ilk güvenli dağıtım hızlandırıcısı olabilir."),
        howToStart: pick(locale, "Make a list of 5 tools, agencies, or communities that talk to the same audience and propose a joint webinar, newsletter mention, or bundle.", "Aynı kitleye konuşan 5 araç/ajans/topluluk listesi çıkar ve ortak webinar, newsletter mention veya bundle fikri öner."),
        successSignal: pick(locale, "You should get the first qualified lead or traffic spike from a partner source.", "Bir ortak kaynak üzerinden ilk kaliteli lead veya trafik gelsin."),
        confidence: "medium",
      },
    ];
  }

  if (isMobileProduct(product)) {
    return [
      {
        title: pick(locale, "Fix store visibility first", "Store görünürlüğünü önce temizle"),
        channel: "App Store / Google Play",
        whyNow: pick(locale, "In mobile products, early acquisition is heavily shaped by store listing quality and the first creatives.", "Mobil ürünlerde erken acquisition'ın büyük bölümü store listing kalitesi ve ilk kreatiflerden etkilenir."),
        howToStart: pick(locale, "Realign your title, description, and first 3 screenshots around one clear use-case promise.", "Başlık, açıklama ve ilk 3 screenshot'u tek bir kullanım vaadi etrafında yeniden hizala."),
        successSignal: pick(locale, "Store listing view-to-install conversion should improve.", "Store listing görüntüleme -> install dönüşümü artsın."),
        confidence: "high",
      },
      {
        title: pick(locale, "Run a low-budget paid test with one creative angle", "Tek yaratıcı açıyla düşük bütçeli paid test yap"),
        channel: "Meta / TikTok ads",
        whyNow: pick(locale, "Small paid tests in mobile products can read message-market fit quickly, but only when they stay focused on one hypothesis.", "Mobil ürünlerde küçük paid testler mesaj-market uyumunu hızlı okur; ama yalnızca tek hipotezle yapılmalı."),
        howToStart: pick(locale, "Pick one target audience, one message, and one creative; test for 3-5 days with a limited budget.", "Bir hedef kitle, bir mesaj, bir kreatif seç ve sınırlı bütçeyle 3-5 gün test et."),
        successSignal: pick(locale, "Cost per install and install-to-activation rate should land in an acceptable range.", "Install başına maliyet ve install -> activation oranı kabul edilebilir seviyede olsun."),
        confidence: "medium",
      },
      {
        title: pick(locale, "Create UGC-style product explainers", "UGC tarzı ürün anlatımı üret"),
        channel: "Short-form social",
        whyNow: pick(locale, "Mobile users often understand the product promise faster through creatives that show actual use, rather than polished ads.", "Mobil kullanıcı ürün vaadini çoğu zaman polished reklamdan değil, kullanım hissini gösteren kreatiften daha hızlı anlar."),
        howToStart: pick(locale, "Prepare 3 short videos or scripts that show real usage scenarios.", "Gerçek kullanım senaryosunu gösteren 3 kısa video/script hazırla."),
        successSignal: pick(locale, "Video view-to-store-click rate should improve.", "Video izlenme -> store tıklama oranı yükselsin."),
        confidence: "medium",
      },
    ];
  }

  if (isContentProduct(product)) {
    return [
      {
        title: pick(locale, "Stabilize your publishing rhythm", "Yayın ritmini sabitle"),
        channel: "Newsletter / blog / social",
        whyNow: pick(locale, "In content products, awareness compounds through repeatable publishing rhythm, not chaotic spikes.", "İçerik ürünlerinde awareness kaotik patlamalardan değil, tekrar eden yayın ritminden birikir."),
        howToStart: pick(locale, "Choose one format this week and plan 3 content slots: education, result, and problem-solving.", "Bu hafta tek format seç ve 3 içerik slotu planla: eğitim, sonuç, problem çözümü."),
        successSignal: pick(locale, "Visitor and subscriber growth should speed up after consistent publishing.", "Düzenli yayın sonrası ziyaretçi ve abone büyümesi hızlansın."),
        confidence: "high",
      },
      {
        title: pick(locale, "Turn community conversations into content", "Topluluk konuşmalarından içerik çıkar"),
        channel: "Community-led content",
        whyNow: pick(locale, "The fastest traction often comes from content that answers the questions your audience is already asking.", "Kitle zaten hangi soruları soruyorsa en hızlı traction o sorulara cevap veren içerikle gelir."),
        howToStart: pick(locale, "Collect 10 questions from Reddit, X, or Discord and turn them into 3 posts.", "Reddit, X veya Discord'dan 10 soru topla ve bunlardan 3 post çıkar."),
        successSignal: pick(locale, "Clicks, replies, or subscribes per piece of content should increase.", "İçerik başına tıklama, reply veya subscribe sayısı artsın."),
        confidence: "medium",
      },
      {
        title: pick(locale, "Try creator cross-promotion with adjacent voices", "Yakın creator çapraz dağıtımını dene"),
        channel: "Creator cross-promotion",
        whyNow: pick(locale, "Small collaborations with creators who already hold your audience's attention usually perform warmer than cold reach.", "Aynı kitlenin dikkatini zaten taşıyan creator'larla küçük çaplı iş birlikleri cold reach'ten daha sıcak sonuç verir."),
        howToStart: pick(locale, "List 5 creators who talk to a similar audience and suggest a small swap or collaboration.", "Benzer kitleye konuşan 5 creator listesi çıkar ve mini swap/collab öner."),
        successSignal: pick(locale, "See higher engagement or subscriber growth from the new traffic source.", "Yeni trafik kaynağında daha yüksek etkileşim veya abone kazanımı gör."),
        confidence: "medium",
      },
    ];
  }

  return [
    {
      title: pick(locale, "Pick one primary distribution channel clearly", "Tek bir dağıtım kanalını net seç"),
      channel: "Primary distribution channel",
      whyNow: pick(locale, "Generating a strong signal in one channel teaches faster than weak visibility across many channels.", "Birden fazla kanalda zayıf görünürlük yerine tek kanalda güçlü sinyal üretmek daha hızlı öğrenme sağlar."),
      howToStart: pick(locale, "Choose the most natural channel for your audience and focus only there for one week.", "Kitlenin en doğal bulunduğu bir kanalı seç ve bir hafta boyunca sadece oraya odaklan."),
      successSignal: pick(locale, "See measurable traffic and signup lift from that single channel.", "Tek kanaldan ölçülebilir trafik ve signup artışı gelsin."),
      confidence: "medium",
    },
    {
      title: pick(locale, "Run a problem-led content or outreach experiment", "Problem odaklı içerik veya outreach denemesi yap"),
      channel: "Content / outreach",
      whyNow: pick(locale, "Early acquisition is less about volume and more about learning whether the right problem framing resonates.", "Erken acquisition'da en önemli şey hacim değil, doğru problem dilinin çalışıp çalışmadığını öğrenmektir."),
      howToStart: pick(locale, "Pick one problem message and test it through 5 conversations, 2 content pieces, or 1 landing variation.", "Bir problem mesajı seç ve 5 konuşma, 2 içerik veya 1 landing varyasyonu ile test et."),
      successSignal: pick(locale, "Replies, clicks, or signup signals should improve after the message test.", "Mesaj sonrası reply, click veya signup sinyali artsın."),
      confidence: "medium",
    },
  ];
}

function activationTactics(product: ProductInput, locale?: string): GrowthTactic[] {
  return [
    {
      title: pick(locale, "Shorten the path to first value", "İlk değer anına giden yolu kısalt"),
      channel: "Onboarding / product flow",
      whyNow: pick(locale, "Winning a user is not enough; they need to feel the product working as early as possible.", "Kullanıcı kazanmak yetmez; ürünün işe yaradığını mümkün olduğunca erken hissettirmek gerekir."),
      howToStart: pick(locale, "Remove steps that are not required for first value and direct the user to one critical action.", "İlk değer için şart olmayan adımları kaldır ve kullanıcıyı tek kritik aksiyona yönlendir."),
      successSignal: pick(locale, "Signup-to-first-value-action conversion should improve.", "Signup -> first-value-action dönüşüm oranı yükselsin."),
      confidence: "high",
    },
    {
      title: pick(locale, "Run manual activation interviews with your first 10 users", "İlk 10 kullanıcıyla manuel aktivasyon görüşmesi yap"),
      channel: "Founder follow-up",
      whyNow: pick(locale, "At the early stage, activation problems are often solved by watching real users, not just reading funnel reports.", "Erken aşamada aktivasyon kırığı çoğu zaman funnel raporundan değil, gerçek kullanıcıyı izlemekten çözülür."),
      howToStart: pick(locale, "Message users who signed up but did not progress and ask where they got stuck.", "Kayıt olup ilerlemeyen kullanıcılara kısa mesaj at ve nerede takıldıklarını sor."),
      successSignal: pick(locale, "A common stuck point should become clear and completion on that step should rise next week.", "Takıldıkları ortak nokta netleşsin ve sonraki hafta bu adımın tamamlama oranı artsın."),
      confidence: "high",
    },
    {
      title: pick(locale, "Add a first-24-hours guidance flow", "İlk 24 saatlik yönlendirme akışını ekle"),
      channel: "Email / in-product nudges",
      whyNow: pick(locale, "Getting users back within the first day improves activation quality.", "Kullanıcının ilk gün içinde tekrar dönmesi aktivasyon kalitesini yükseltir."),
      howToStart: pick(locale, "Design one email or in-app reminder that points to the first success action.", "İlk başarı aksiyonuna götüren tek bir email veya in-app reminder tasarla."),
      successSignal: pick(locale, "Return rate and first-value completion within day one should improve.", "İlk gün içinde geri dönme ve ilk değer aksiyonu tamamlama oranı artsın."),
      confidence: "medium",
    },
  ];
}

function retentionTactics(locale?: string): GrowthTactic[] {
  return [
    {
      title: pick(locale, "Find the pattern among users who do not return", "Geri dönmeyen kullanıcılarla pattern bul"),
      channel: "User interviews",
      whyNow: pick(locale, "Adding new acquisition while retention is broken is like filling a bucket with a hole.", "Retention sorunu varken yeni acquisition eklemek deliği olan kovayı doldurmaya benzer."),
      howToStart: pick(locale, "Reach out to 5-10 recently inactive users and ask why they did not come back.", "Son dönemde aktif olmayan 5-10 kullanıcıya ulaşıp neden geri dönmediklerini sor."),
      successSignal: pick(locale, "1-2 repeated churn reasons should become clear and turn into a focused worklist.", "Tekrarlayan 1-2 churn nedeni netleşsin ve bunlara yönelik iş listesi çıksın."),
      confidence: "high",
    },
    {
      title: pick(locale, "Make the reason to return visible inside the product", "Geri gelme sebebini üründe görünür yap"),
      channel: "Product habit loop",
      whyNow: pick(locale, "If users cannot see why they should return, retention stays accidental.", "Kullanıcıya neden geri dönmesi gerektiği görünmüyorsa retention tesadüfi kalır."),
      howToStart: pick(locale, "Add a reminder or trigger around a feature or output that creates recurring value.", "Düzenli değer üreten feature veya çıktı için hatırlatıcı/trigger ekle."),
      successSignal: pick(locale, "D7 retention or weekly active usage rhythm should improve.", "D7 veya haftalık aktif kullanıcı ritmi iyileşsin."),
      confidence: "medium",
    },
    {
      title: pick(locale, "Tie lifecycle messaging to one useful action", "Lifecycle akışını tek işe bağla"),
      channel: "Lifecycle messaging",
      whyNow: pick(locale, "Messages that drive one concrete useful action outperform generic reminders for retention.", "Genel hatırlatmalar yerine tek faydalı aksiyona dönen mesajlar daha iyi retention üretir."),
      howToStart: pick(locale, "Tie one reactivation email or notification to a single usage outcome.", "Bir reactivation email'i veya notification'ı tek kullanım sonucuna bağla."),
      successSignal: pick(locale, "Return rate among messaged users should increase.", "Mesaj alan kullanıcıların geri dönüş oranı artsın."),
      confidence: "medium",
    },
  ];
}

function referralTactics(locale?: string): GrowthTactic[] {
  return [
    {
      title: pick(locale, "Show the invite ask at the value moment", "Davet isteğini değer anında göster"),
      channel: "In-product referral",
      whyNow: pick(locale, "Referral works best when it appears exactly when the user feels value.", "Referral en iyi kullanıcı değer gördüğü anda görünür olduğunda çalışır."),
      howToStart: pick(locale, "Show a one-click invite CTA right after the first successful outcome.", "İlk başarılı sonuçtan hemen sonra tek tıklamalı davet CTA'sı göster."),
      successSignal: pick(locale, "Invite-send to accepted-invite conversion should increase.", "Invite send -> accepted invite oranı artsın."),
      confidence: "medium",
    },
    {
      title: pick(locale, "Reduce sharing to a single sentence", "Paylaşmayı tek cümleye indir"),
      channel: "Sharing flow",
      whyNow: pick(locale, "Even if referral exists, users will not bring others if sharing friction stays high.", "Referral mekanizması varsa bile paylaşım sürtünmesi yüksekse kullanıcı başkalarını getirmez."),
      howToStart: pick(locale, "Add a pre-written short share message and one-click copy action.", "Önceden yazılmış kısa paylaşım mesajı ve tek tıklama kopyalama ekle."),
      successSignal: pick(locale, "Invite volume and referral conversion should improve.", "Gönderilen davet sayısı ve referral conversion artsın."),
      confidence: "medium",
    },
  ];
}

function revenueTactics(product: ProductInput, locale?: string): GrowthTactic[] {
  return [
    {
      title: pick(locale, "Find the single friction blocking the payment decision", "Ödeme kararını engelleyen tek friksiyonu bul"),
      channel: "Pricing / checkout",
      whyNow: pick(locale, "When revenue is weak, fixing the break at the payment moment usually delivers faster results than adding new acquisition.", "Revenue zayıfken yeni acquisition eklemek yerine ödeme anındaki kırılmayı çözmek daha hızlı sonuç verir."),
      howToStart: pick(locale, "Review pricing or checkout flow and learn why users stop through 5 short conversations.", "Pricing veya checkout akışını gözden geçir; kullanıcıların neden durduğunu 5 konuşma ile öğren."),
      successSignal: pick(locale, "Trial-to-paid, demo-to-close, or payment completion rate should improve.", "Trial-to-paid, demo-to-close veya ödeme tamamlama oranı yükselsin."),
      confidence: "high",
    },
    {
      title: pick(locale, "Test one payment argument", "Tek bir ödeme argümanını test et"),
      channel: "Pricing message",
      whyNow: pick(locale, "Early revenue gains often come from explaining value more clearly, not from shipping a new feature.", "Erken revenue artışı çoğu zaman yeni özellikten değil, değeri daha net anlatmaktan gelir."),
      howToStart: pick(locale, "Change one value statement on the pricing page or in the sales conversation and watch the result.", "Pricing sayfasında veya satış görüşmesinde tek bir değer cümlesini değiştir ve etkisini izle."),
      successSignal: pick(locale, "Payment objections should drop and conversion should improve.", "Ödeme soruları azalsın ve conversion artsın."),
      confidence: "medium",
    },
    {
      title: pick(locale, "Simplify the transition to paid", "Ücretli deneme geçişini sadeleştir"),
      channel: "Trial / sales handoff",
      whyNow: pick(locale, "Even when users see the value, revenue will not accumulate if the transition moment is messy.", "Kullanıcı ürünün değerini görse bile geçiş anı karmaşıksa gelir birikmez."),
      howToStart: pick(locale, "Reduce the trial-ending, plan selection, or post-demo follow-up to one clean next step.", "Trial sonu, plan seçimi veya demo sonrası takip mesajını tek sonraki adımla sadeleştir."),
      successSignal: pick(locale, "Plan selection or payment-start rate should improve.", "Plan seçimi veya ödeme başlatma oranı artsın."),
      confidence: "medium",
    },
  ];
}

export function getGrowthTacticsPlan(input: Input): GrowthTacticsPlan | null {
  const { product, hasMetricSetup, hasMetricEntries, connectedSourceCount, funnelHealth, locale } = input;
  const launched =
    product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;

  if (!launched) return null;

  if (!hasMetricSetup) {
    return {
      title: pick(locale, "Prepare before tactics", "Taktik öncesi hazırla"),
      diagnosis: pick(locale, "It is not clear yet which growth signal you are tracking.", "Henüz hangi büyüme sinyalini takip ettiğin net değil."),
      readinessNote:
        pick(locale, "At this stage, Tiramisup recommends setting up measurement before channel tactics. Otherwise tactics produce noise instead of learning.", "Tiramisup bu aşamada kanal tavsiyesi yerine önce ölçüm sistemini kurmanı önerir. Aksi halde taktikler öğrenme üretmez."),
      tactics: [
        {
          title: pick(locale, "Choose one main metric across AARRR", "AARRR boyunca tek ana metrikleri seç"),
          channel: "Metrics setup",
          whyNow: pick(locale, "It is too early to choose channels before you define what you are trying to move.", "Önce neyi hareket ettirmeye çalıştığını netleştirmeden kanal seçmek erken olur."),
          howToStart: pick(locale, "Choose one core signal for each stage on the Metrics screen.", "Metrics ekranında her aşama için bir ana sinyal seç."),
          successSignal: pick(locale, "The first setup should be completed.", "İlk setup tamamlanmış olsun."),
          confidence: "high",
        },
        {
          title: connectedSourceCount > 0 ? pick(locale, "Align sources with measurement", "Kaynakları ölçümle hizala") : pick(locale, "Connect your first data source", "İlk veri kaynağını bağla"),
          channel: "Source health",
          whyNow: pick(locale, "The more reliable the data flow, the more reliable the next tactic recommendation becomes.", "Veri akışı ne kadar güvenilir olursa sonraki taktik önerisi o kadar güvenilir olur."),
          howToStart: connectedSourceCount > 0 ? pick(locale, "Check whether your connected sources truly cover the metrics you selected.", "Bağlı kaynakların seçtiğin metrikleri gerçekten kapsayıp kapsamadığını kontrol et.") : pick(locale, "Connect GA4, Stripe, or the most relevant source.", "GA4, Stripe veya uygun kaynağı bağla."),
          successSignal: pick(locale, "Data flow should become clear for at least some of the selected metrics.", "Seçili metriklerin en az bir kısmı için veri akışı netleşsin."),
          confidence: "high",
        },
      ],
    };
  }

  if (!hasMetricEntries) {
    return {
      title: pick(locale, "Build your baseline first", "Önce baz çizgiyi oluştur"),
      diagnosis: pick(locale, "Metrics are selected, but there is no reliable daily rhythm yet.", "Metrikler seçili ama henüz güvenilir günlük ritim yok."),
      readinessNote:
        pick(locale, "Because the weak link is not clear yet, Tiramisup limits channel advice and prioritizes learning speed first.", "Henüz zayıf halka netleşmediği için Tiramisup kanal önerilerini sınırlı tutar ve önce öğrenme hızını artırır."),
      tactics: [
        {
          title: pick(locale, "Create the first 7-day data rhythm", "İlk 7 günlük veri ritmini kur"),
          channel: "Metrics cadence",
          whyNow: pick(locale, "You need a baseline before you can tell whether a tactic is working.", "Bir taktiğin işe yarayıp yaramadığını görebilmek için önce baz çizgi gerekir."),
          howToStart: pick(locale, "For the next 7 days, enter data at the same time or verify source sync.", "Önümüzdeki 7 gün boyunca aynı saatte veri girişi yap veya kaynak sync'ini doğrula."),
          successSignal: pick(locale, "At least 3-5 entries should be created.", "En az 3-5 giriş oluşsun."),
          confidence: "high",
        },
        {
          title: pick(locale, "Document your first user conversations", "İlk kullanıcı konuşmalarını notla"),
          channel: "Founder learning loop",
          whyNow: pick(locale, "When data is still early, the strongest signal is user language and the reason they use the product.", "Veri henüz erkenken en güçlü sinyal kullanıcı dili ve kullanım sebebidir."),
          howToStart: pick(locale, "Ask your first 5 users when exactly they felt the product's value.", "İlk 5 kullanıcıya ürünün hangi anında değer gördüklerini sor."),
          successSignal: pick(locale, "Repeated language should appear around the activation or retention break.", "Aktivasyon veya retention kırığı için tekrar eden dil ortaya çıksın."),
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

  let title = pick(locale, "Recommended tactics for this week", "Bu hafta önerilen taktikler");
  let diagnosis = funnelHealth?.nextFocus ?? pick(locale, "Tactics are ranked for the area that needs focus in the current growth rhythm.", "Şu anki büyüme ritmine göre odak gerektiren alan için taktikler sıralandı.");
  let tactics: GrowthTactic[] = [];

  switch (targetStage) {
    case "Awareness":
    case "Acquisition":
      title = pick(locale, "Recommended tactics for Acquisition", "Acquisition tarafı için önerilen taktikler");
      tactics = awarenessTactics(product, locale);
      break;
    case "Activation":
      title = pick(locale, "Recommended tactics for Activation", "Activation tarafı için önerilen taktikler");
      tactics = activationTactics(product, locale);
      break;
    case "Retention":
      title = pick(locale, "Recommended tactics for Retention", "Retention tarafı için önerilen taktikler");
      tactics = retentionTactics(locale);
      break;
    case "Referral":
      title = pick(locale, "Recommended tactics for Referral", "Referral tarafı için önerilen taktikler");
      tactics = referralTactics(locale);
      break;
    case "Revenue":
      title = pick(locale, "Recommended tactics for Revenue", "Revenue tarafı için önerilen taktikler");
      tactics = revenueTactics(product, locale);
      break;
    default:
      tactics = awarenessTactics(product, locale).slice(0, 2);
      break;
  }

  return {
    title,
    diagnosis,
    tactics: tactics.slice(0, 3),
  };
}
