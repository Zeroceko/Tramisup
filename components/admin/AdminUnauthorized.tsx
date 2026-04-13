export default function AdminUnauthorized({ locale }: { locale: string }) {
  const isEn = locale === "en";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-[24px] border border-[#e8e4de] bg-white px-8 py-10 text-center shadow-[0_18px_50px_rgba(17,16,20,0.06)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b8393]">
          {isEn ? "Unauthorized" : "Yetkisiz erişim"}
        </p>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "You do not have access to this admin area." : "Bu admin alanına erişim yetkin yok."}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "Only approved admin accounts can view internal ops data."
            : "İç operasyon verilerini yalnızca yetkili admin hesapları görebilir."}
        </p>
      </div>
    </div>
  );
}
