type ProductShape = {
  category?: string | null;
  targetAudience?: string | null;
  businessModel?: string | null;
  description?: string | null;
  launchGoals?: string | null;
};

export type GrowthCheckinQuestionId =
  | "growth_goal"
  | "acquisition_source"
  | "first_value_action"
  | "retention_rhythm"
  | "revenue_motion"
  | "bottleneck_self_report"
  | "source_confidence";

export type GrowthCheckinAnswerValue = string;

export type GrowthCheckinAnswers = Partial<Record<GrowthCheckinQuestionId, GrowthCheckinAnswerValue>>;

export type GrowthCheckinQuestion = {
  id: GrowthCheckinQuestionId;
  prompt: string;
  helper: string;
  type: "choice" | "text";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export type GrowthCheckinSetupContext = {
  title: string;
  description: string;
};

type StoredGrowthCheckin = {
  version: 1;
  completedAt: string;
  answers: GrowthCheckinAnswers;
};

type AdditionalContextEnvelope = {
  version: 1;
  legacyText: string | null;
  growthCheckin: StoredGrowthCheckin | null;
};

function parseGoalKey(launchGoals?: string | null) {
  if (!launchGoals) return null;
  try {
    const parsed = JSON.parse(launchGoals);
    return typeof parsed?.goalKey === "string" ? parsed.goalKey : null;
  } catch {
    return null;
  }
}

export function readGrowthCheckinFromAdditionalContext(value: string | null | undefined) {
  if (!value) return { legacyText: null, growthCheckin: null };

  try {
    const parsed = JSON.parse(value) as Partial<AdditionalContextEnvelope>;
    if (parsed?.version === 1 && "growthCheckin" in parsed) {
      return {
        legacyText: typeof parsed.legacyText === "string" ? parsed.legacyText : null,
        growthCheckin:
          parsed.growthCheckin &&
          typeof parsed.growthCheckin === "object" &&
          parsed.growthCheckin.version === 1
            ? (parsed.growthCheckin as StoredGrowthCheckin)
            : null,
      };
    }
  } catch {
    // Legacy plain-text additionalContext is still valid.
  }

  return {
    legacyText: value,
    growthCheckin: null,
  };
}

export function buildAdditionalContextWithGrowthCheckin(
  currentValue: string | null | undefined,
  answers: GrowthCheckinAnswers
) {
  const current = readGrowthCheckinFromAdditionalContext(currentValue);
  const nextEnvelope: AdditionalContextEnvelope = {
    version: 1,
    legacyText: current.legacyText,
    growthCheckin: {
      version: 1,
      completedAt: new Date().toISOString(),
      answers,
    },
  };

  return JSON.stringify(nextEnvelope);
}

function pickGoalLabel(value: string | undefined, locale: string) {
  const isEn = locale === "en";
  switch (value) {
    case "reach_first_value_usage":
      return isEn ? "helping more users reach first value" : "daha fazla kullanıcıyı ilk değere ulaştırmak";
    case "get_first_revenue":
      return isEn ? "turning usage into first revenue" : "kullanımı ilk gelire çevirmek";
    case "build_growth_rhythm":
      return isEn ? "building a repeatable growth rhythm" : "tekrarlayan bir growth ritmi kurmak";
    case "fix_weak_link":
      return isEn ? "fixing the main weak link" : "ana zayıf halkayı düzeltmek";
    default:
      return null;
  }
}

function pickSourceLabel(value: string | undefined, locale: string) {
  const isEn = locale === "en";
  switch (value) {
    case "direct_outreach":
      return isEn ? "founder-led outreach" : "founder outreach ve birebir görüşmeler";
    case "website_organic":
      return isEn ? "website and organic discovery" : "website ve organik keşif";
    case "app_store":
      return isEn ? "App Store / Play Store discovery" : "App Store / Play Store keşfi";
    case "partners":
      return isEn ? "partners, communities, or referrals" : "partnerler, topluluklar veya referral";
    case "unknown":
      return isEn ? "an unclear acquisition source" : "henüz net olmayan bir acquisition kaynağı";
    default:
      return null;
  }
}

export function summarizeGrowthCheckinForSetup(input: {
  answers: GrowthCheckinAnswers | null | undefined;
  locale: string;
}): GrowthCheckinSetupContext | null {
  const answers = input.answers;
  if (!answers) return null;

  const isEn = input.locale === "en";
  const goalLabel = pickGoalLabel(answers.growth_goal, input.locale);
  const sourceLabel = pickSourceLabel(answers.acquisition_source, input.locale);
  const firstValueAction = answers.first_value_action?.trim();
  const dataConfidence = answers.source_confidence;

  const title = isEn ? "Metric setup context" : "Ölçüm sistemi bağlamı";
  const sentences: string[] = [];

  if (goalLabel) {
    sentences.push(
      isEn
        ? `We will bias this setup toward ${goalLabel}.`
        : `Bu setup'ı ${goalLabel} odağına göre ağırlıklandıracağız.`
    );
  }

  if (firstValueAction) {
    sentences.push(
      isEn
        ? `Your first value action is currently "${firstValueAction}".`
        : `Şu an tanımladığın ilk değer aksiyonu "${firstValueAction}".`
    );
  }

  if (sourceLabel) {
    sentences.push(
      isEn
        ? `Early acquisition seems to come from ${sourceLabel}.`
        : `Erken acquisition tarafı daha çok ${sourceLabel} üzerinden geliyor gibi görünüyor.`
    );
  }

  if (dataConfidence === "low") {
    sentences.push(
      isEn
        ? "Because data confidence is still low, safer and manually trackable signals matter more than ambitious automation."
        : "Veri güveni henüz düşük olduğu için iddialı otomasyondan çok güvenli ve manuel takip edilebilir sinyaller önemli."
    );
  }

  if (sentences.length === 0) return null;

  return {
    title,
    description: sentences.join(" "),
  };
}

export function selectGrowthCheckinQuestions(input: {
  product: ProductShape;
  locale: string;
  connectedSourceCount: number;
}) {
  const isEn = input.locale === "en";
  const goalKey = parseGoalKey(input.product.launchGoals);
  const businessModel = `${input.product.businessModel ?? ""}`.toLowerCase();
  const audience = `${input.product.targetAudience ?? ""}`.toLowerCase();
  const category = `${input.product.category ?? ""}`.toLowerCase();

  const questionPool: Record<GrowthCheckinQuestionId, GrowthCheckinQuestion> = {
    growth_goal: {
      id: "growth_goal",
      type: "choice",
      prompt: isEn ? "What matters most in growth right now?" : "Growth tarafında şu an en kritik hedef ne?",
      helper: isEn
        ? "Pick the outcome you most want the operating system to optimize around."
        : "Sistemin en çok hangi sonucu optimize etmesini istediğini seç.",
      options: [
        {
          value: "reach_first_value_usage",
          label: isEn ? "Help more users reach first value" : "Daha fazla kullanıcıyı ilk değere ulaştır",
        },
        {
          value: "get_first_revenue",
          label: isEn ? "Turn usage into first revenue" : "Kullanımı ilk gelire çevir",
        },
        {
          value: "build_growth_rhythm",
          label: isEn ? "Build a repeatable growth rhythm" : "Tekrarlayan bir growth ritmi kur",
        },
        {
          value: "fix_weak_link",
          label: isEn ? "Find and fix the main weak link" : "Ana zayıf halkayı bul ve düzelt",
        },
      ],
    },
    acquisition_source: {
      id: "acquisition_source",
      type: "choice",
      prompt: isEn ? "Where do your first users mainly come from?" : "İlk kullanıcılar ağırlıklı olarak nereden geliyor?",
      helper: isEn
        ? "This keeps early growth decisions grounded in a real channel."
        : "Bu cevap, growth kararlarını gerçek bir dağıtım kanalına bağlar.",
      options: [
        { value: "direct_outreach", label: isEn ? "Founder outreach / direct conversations" : "Founder outreach / birebir görüşmeler" },
        { value: "website_organic", label: isEn ? "Website / content / organic" : "Website / içerik / organik" },
        { value: "app_store", label: isEn ? "App Store / Play Store" : "App Store / Play Store" },
        { value: "partners", label: isEn ? "Partners / communities / referrals" : "Partner / topluluk / referral" },
        { value: "unknown", label: isEn ? "Not clear yet" : "Henüz net değil" },
      ],
    },
    first_value_action: {
      id: "first_value_action",
      type: "text",
      prompt: isEn ? "What exact action counts as first value?" : "İlk değer tam olarak hangi aksiyonla oluşuyor?",
      helper: isEn
        ? "Write the one behavior that tells you the product started working for the user."
        : "Ürünün kullanıcı için işe yaramaya başladığını gösteren tek davranışı yaz.",
      placeholder: isEn
        ? "Example: creates the first report, sends the first invite, publishes the first page"
        : "Örn: ilk raporu oluşturur, ilk daveti gönderir, ilk sayfayı yayınlar",
    },
    retention_rhythm: {
      id: "retention_rhythm",
      type: "choice",
      prompt: isEn ? "What tells you a user is really returning?" : "Bir kullanıcının gerçekten geri döndüğünü ne gösterir?",
      helper: isEn
        ? "Pick the closest rhythm you care about now."
        : "Şu anda önem verdiğin geri dönüş ritmini seç.",
      options: [
        { value: "same_day", label: isEn ? "Comes back in the same day" : "Aynı gün içinde geri gelir" },
        { value: "weekly", label: isEn ? "Comes back within the week" : "Hafta içinde geri gelir" },
        { value: "repeat_usage", label: isEn ? "Repeats the core action multiple times" : "Ana aksiyonu tekrar tekrar yapar" },
        { value: "not_defined", label: isEn ? "We have not defined this yet" : "Bunu henüz tanımlamadık" },
      ],
    },
    revenue_motion: {
      id: "revenue_motion",
      type: "choice",
      prompt: isEn ? "How does this product turn value into revenue?" : "Bu ürün değeri gelire nasıl çeviriyor?",
      helper: isEn
        ? "This helps the system choose better revenue and monetization signals."
        : "Bu cevap, gelir ve monetization sinyallerini daha doğru seçmeye yardımcı olur.",
      options: [
        { value: "subscription", label: isEn ? "Subscription / recurring" : "Abonelik / tekrar eden gelir" },
        { value: "one_time", label: isEn ? "One-time payment" : "Tek seferlik ödeme" },
        { value: "sales_led", label: isEn ? "Sales-led / demos / contracts" : "Sales-led / demo / kontrat" },
        { value: "not_revenue_yet", label: isEn ? "Revenue is not the focus yet" : "Gelir henüz ana odak değil" },
      ],
    },
    bottleneck_self_report: {
      id: "bottleneck_self_report",
      type: "choice",
      prompt: isEn ? "Where does growth feel most stuck today?" : "Bugün growth en çok nerede sıkışmış hissediliyor?",
      helper: isEn
        ? "Your self-report helps us avoid pushing the wrong execution area first."
        : "Kendi teşhisin, sistemi yanlış execution alanına itmemeye yardımcı olur.",
      options: [
        { value: "acquisition", label: isEn ? "Getting enough qualified traffic" : "Yeterli nitelikli trafik almak" },
        { value: "activation", label: isEn ? "Helping users reach first value" : "Kullanıcıyı ilk değere ulaştırmak" },
        { value: "retention", label: isEn ? "Getting users to come back" : "Kullanıcının geri gelmesini sağlamak" },
        { value: "revenue", label: isEn ? "Turning value into paid behavior" : "Değeri ücretli davranışa çevirmek" },
      ],
    },
    source_confidence: {
      id: "source_confidence",
      type: "choice",
      prompt: isEn ? "How trustworthy is your current data flow?" : "Mevcut veri akışına ne kadar güveniyorsun?",
      helper: isEn
        ? "If data confidence is low, the system should favor setup over strong diagnosis."
        : "Veri güveni düşükse sistem güçlü teşhis yerine setup tarafını öne almalı.",
      options: [
        { value: "high", label: isEn ? "High — I trust the numbers" : "Yüksek — sayılara güveniyorum" },
        { value: "medium", label: isEn ? "Medium — partly trustworthy" : "Orta — kısmen güvenilir" },
        { value: "low", label: isEn ? "Low — still rough or manual" : "Düşük — hâlâ kaba veya manuel" },
      ],
    },
  };

  const selectedIds: GrowthCheckinQuestionId[] = [];

  if (!goalKey) {
    selectedIds.push("growth_goal");
  }

  selectedIds.push("acquisition_source");
  selectedIds.push("first_value_action");

  const isSubscriptionLike = /subscription|abonelik|freemium|trial/.test(businessModel);
  const isB2BLike = /saas|team|startup|business|b2b|ekip|işletme/.test(`${businessModel} ${audience} ${category}`);

  if (isSubscriptionLike || isB2BLike) {
    selectedIds.push("revenue_motion");
  } else {
    selectedIds.push("retention_rhythm");
  }

  if (input.connectedSourceCount === 0) {
    selectedIds.push("source_confidence");
  } else {
    selectedIds.push("bottleneck_self_report");
  }

  return selectedIds.slice(0, 5).map((id) => questionPool[id]);
}
