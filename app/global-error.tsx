"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-6">
          <div className="max-w-lg text-center rounded-[20px] border border-[#e8e8e8] bg-white p-8 shadow-card">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#666d80]">Uygulama Hatası</p>
            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#0d0d12]">Bir şey ters gitti</h1>
            <p className="mt-3 text-[14px] leading-7 text-[#666d80]">
              Beklenmeyen bir hata oluştu. Sayfayı yeniden deneyebilirsin.
            </p>
            {error?.digest ? (
              <p className="mt-3 text-[12px] text-[#9ca3af]">Ref: {error.digest}</p>
            ) : null}
            <button
              onClick={() => reset()}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
