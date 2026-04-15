import { parseStructuredDescription } from "@/lib/task-parsing";

type Locale = "en" | "tr";

type ChecklistCopy = {
  titleEn: string;
  titleTr: string;
  descriptionEn?: string;
  descriptionTr?: string;
  whyEn?: string;
  whyTr?: string;
  doneEn?: string;
  doneTr?: string;
  nextEn?: string;
  nextTr?: string;
};

type ChecklistInput = {
  title: string;
  description?: string | null;
};

type LocalizedChecklistContent = {
  title: string;
  description: string | null;
  whyItMatters: string | null;
  doneCriteria: string | null;
  nextAction: string | null;
};

const KNOWN_CHECKLIST_COPY: ChecklistCopy[] = [
  {
    titleEn: "Define the first value moment before launch",
    titleTr: "İlk değer anını launch öncesi netleştir",
    whyEn: "If the core user cannot understand the first value in seconds, launch traffic will bounce.",
    whyTr: "İlk kullanıcı değeri birkaç saniyede anlamazsa launch trafiği hızla dağılır.",
    doneEn: "This is done when the landing, onboarding, or first-run flow clearly exposes one primary value action.",
    doneTr: "Landing, onboarding veya ilk kullanım akışında tek ana değer adımı net biçimde görünür olduğunda bu madde tamamdır.",
    nextEn: "Start by writing the first-value moment in one sentence and placing it in the first-run flow.",
    nextTr: "Önce ilk değer anını tek cümlede yaz ve bunu ürünün ilk ekran akışına yerleştir.",
  },
  {
    titleEn: "Prepare launch-day messaging and distribution",
    titleTr: "Launch günü mesajını ve dağıtım planını hazırla",
    whyEn: "Scattered launch messaging weakens the signal and wastes the first feedback window.",
    whyTr: "Launch günü mesajı dağınık kalırsa ürün sinyali zayıflar ve ilk geri bildirim penceresi boşa gider.",
    doneEn: "This is done when one core message, 2-3 distribution channels, and an outreach list are ready.",
    doneTr: "Tek bir ana mesaj, 2-3 dağıtım kanalı ve hedef kişi listesi hazır olduğunda bu madde tamamdır.",
    nextEn: "Start by drafting the main message and tying it to a small launch audience list.",
    nextTr: "Önce ana launch mesajını yaz ve bunu küçük bir hedef kitle listesine bağla.",
  },
  {
    titleEn: "Run one last pass on launch-breaking bugs",
    titleTr: "Temel kullanıcı akışını kıran hataları son kez tara",
    whyEn: "If the core flow breaks on launch day, early users will not come back.",
    whyTr: "Launch günü temel akış kırılırsa erken kullanıcılar geri dönmez ve ilk güven penceresi kapanır.",
    doneEn: "This is done when signup, login, first key action, and exit paths pass a final smoke test.",
    doneTr: "Kayıt, giriş, ilk ana aksiyon ve çıkış akışları hatasız test edildiğinde bu madde tamamdır.",
    nextEn: "Start by manually testing signup and the first-value flow end-to-end.",
    nextTr: "Önce kayıt ve ilk değer aksiyonunu canlı benzeri ortamda baştan sona manuel test et.",
  },
  {
    titleEn: "Make privacy and terms visible before launch",
    titleTr: "Gizlilik ve kullanım koşulları görünürlüğünü kapat",
    whyEn: "Without trust and legal clarity, the launch message feels incomplete.",
    whyTr: "Güven ve hukuki netlik eksikse launch mesajı eksik ve zayıf görünür.",
    doneEn: "This is done when privacy and terms are reachable from landing, product, and relevant forms.",
    doneTr: "Gizlilik ve kullanım koşulları landing, ürün içi ve ilgili formlardan erişilebilir olduğunda bu madde tamamdır.",
    nextEn: "Start by listing every point where you collect user data and add the required links.",
    nextTr: "Önce kullanıcı verisi topladığın tüm noktaları listele ve gerekli linkleri buralara ekle.",
  },
  {
    titleEn: "Set up one clear channel for the first 10 users",
    titleTr: "İlk 10 kullanıcı geri bildirimi için net bir kanal kur",
    whyEn: "If early feedback is scattered, you learn too slowly.",
    whyTr: "İlk kullanıcı geri bildirimi dağınık toplanırsa neyin çalışmadığını geç anlarsın.",
    doneEn: "This is done when one simple feedback channel is ready for early users.",
    doneTr: "İlk kullanıcıların ulaşacağı tek bir form, WhatsApp hattı veya destek kanalı hazır olduğunda bu madde tamamdır.",
    nextEn: "Start by choosing one feedback channel and placing it inside the product.",
    nextTr: "Önce ilk 10 kullanıcıya göstereceğin tek geri bildirim kanalını seç ve ürün içine yerleştir.",
  },
  {
    titleEn: "Define the first acquisition source",
    titleTr: "İlk trafik veya kurulum kaynağını netleştir",
    descriptionEn: "Growth decisions stay blurry until you separate where new users came from.",
    descriptionTr: "Yeni kullanıcıların hangi kanaldan geldiğini ayırmadan growth kararı bulanık kalır.",
  },
  {
    titleEn: "Track the first value action in one metric",
    titleTr: "İlk değer aksiyonunu tek metrikte sabitle",
    descriptionEn: "Track the aha moment with one clear number.",
    descriptionTr: "Aha moment noktasını tek ve net bir sayıyla izle.",
  },
  {
    titleEn: "Measure returning-user rhythm",
    titleTr: "Geri dönen kullanıcı ritmini ölç",
    descriptionEn: "Returning-user behavior in week one shows whether the product sticks.",
    descriptionTr: "İlk haftada geri dönen kullanıcı davranışı ürünün kalıcılığını gösterir.",
  },
  {
    titleEn: "Track paid conversion or revenue rhythm",
    titleTr: "Ücretliye geçiş veya gelir ritmini izle",
    descriptionEn: "Revenue behavior should be as visible as acquisition.",
    descriptionTr: "Gelir davranışı acquisition kadar net okunmalı.",
  },
];

function normalize(text?: string | null) {
  return (text ?? "").trim().toLocaleLowerCase("tr-TR");
}

function buildStructuredDescription(
  locale: Locale,
  whyItMatters?: string | null,
  doneCriteria?: string | null,
  nextAction?: string | null,
  fallback?: string | null,
) {
  const lines: string[] = [];
  if (whyItMatters) lines.push(`${locale === "tr" ? "Neden" : "Why"}: ${whyItMatters}`);
  if (doneCriteria) lines.push(`${locale === "tr" ? "Biten hali" : "Done when"}: ${doneCriteria}`);
  if (nextAction) lines.push(`${locale === "tr" ? "Sonraki adım" : "Next action"}: ${nextAction}`);
  if (lines.length === 0) return fallback?.trim() || null;
  return lines.join("\n");
}

function matchKnownChecklist(
  title: string,
  parsed: ReturnType<typeof parseStructuredDescription>,
) {
  const normalizedTitle = normalize(title);
  const normalizedWhy = normalize(parsed.why);
  const normalizedDone = normalize(parsed.doneCriteria);
  const normalizedNext = normalize(parsed.nextAction);
  const normalizedLeftover = normalize(parsed.leftover);

  return KNOWN_CHECKLIST_COPY.find((item) => {
    return (
      normalizedTitle === normalize(item.titleEn) ||
      normalizedTitle === normalize(item.titleTr) ||
      (normalizedWhy.length > 0 &&
        (normalizedWhy === normalize(item.whyEn) || normalizedWhy === normalize(item.whyTr))) ||
      (normalizedDone.length > 0 &&
        (normalizedDone === normalize(item.doneEn) || normalizedDone === normalize(item.doneTr))) ||
      (normalizedNext.length > 0 &&
        (normalizedNext === normalize(item.nextEn) || normalizedNext === normalize(item.nextTr))) ||
      (normalizedLeftover.length > 0 &&
        (normalizedLeftover === normalize(item.descriptionEn) ||
          normalizedLeftover === normalize(item.descriptionTr)))
    );
  });
}

export function localizeChecklistContent(
  input: ChecklistInput,
  locale: Locale,
): LocalizedChecklistContent {
  const parsed = parseStructuredDescription(input.description);
  const known = matchKnownChecklist(input.title, parsed);

  const title = known
    ? locale === "tr"
      ? known.titleTr
      : known.titleEn
    : input.title;
  const whyItMatters = known
    ? locale === "tr"
      ? known.whyTr ?? parsed.why
      : known.whyEn ?? parsed.why
    : parsed.why;
  const doneCriteria = known
    ? locale === "tr"
      ? known.doneTr ?? parsed.doneCriteria
      : known.doneEn ?? parsed.doneCriteria
    : parsed.doneCriteria;
  const nextAction = known
    ? locale === "tr"
      ? known.nextTr ?? parsed.nextAction
      : known.nextEn ?? parsed.nextAction
    : parsed.nextAction;
  const fallbackDescription = known
    ? locale === "tr"
      ? known.descriptionTr ?? parsed.leftover
      : known.descriptionEn ?? parsed.leftover
    : parsed.leftover;

  return {
    title,
    description: buildStructuredDescription(locale, whyItMatters, doneCriteria, nextAction, fallbackDescription),
    whyItMatters: whyItMatters ?? null,
    doneCriteria: doneCriteria ?? null,
    nextAction: nextAction ?? null,
  };
}
