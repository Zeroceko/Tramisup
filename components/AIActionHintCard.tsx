type AIActionHintCardProps = {
  locale: string;
  title: string;
  description: string;
  bullets: string[];
};

export default function AIActionHintCard({
  locale,
  title,
  description,
  bullets,
}: AIActionHintCardProps) {
  const isEn = locale === "en";

  return (
    <div className="rounded-[20px] border border-[#e8e4de] bg-[#faf8f4] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b8393]">
        {isEn ? "Tiramisup AI" : "Tiramisup AI"}
      </p>
      <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
        {title}
      </h3>
      <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
        {description}
      </p>
      <div className="mt-4 space-y-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0d0d12]" />
            <p className="text-[12px] leading-5 text-[#3d4658]">{bullet}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-5 text-[#7b8393]">
        {isEn
          ? "Open the recommendations panel from the left rail when you want the next action turned into work."
          : "Sıradaki adımı işe çevirmek istediğinde soldaki öneri panelini aç."}
      </p>
    </div>
  );
}
