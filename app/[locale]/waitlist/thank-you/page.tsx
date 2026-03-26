import Link from "next/link"

export default async function ThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <img src="/assets/illus-tiramisu-slice.png" alt="Tiramisup" className="h-20 w-20 object-contain" />
        </div>

        {/* Heading */}
        <h1 className="text-[32px] font-bold text-[#0d0d12] mb-3">Teşekkürler!</h1>

        {/* Subheading */}
        <p className="text-[16px] text-[#666d80] mb-8 leading-relaxed">
          Waitlist&apos;e başarıyla katıldın. Sıradayısın ve en kısa sürede seni davet edeceğiz.
        </p>

        {/* Secondary message */}
        <div className="bg-[#f6f6f6] rounded-[15px] p-6 mb-8">
          <p className="text-[14px] text-[#0d0d12] font-medium mb-2 flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email takip et
          </p>
          <p className="text-[13px] text-[#666d80]">
            Onay emailini spam klasöründe kontrol etmeyi unutma. Yakında bir davet linki göndereceğiz.
          </p>
        </div>

        {/* Social share (optional) */}
        <div className="mb-8">
          <p className="text-[12px] text-[#666d80] font-medium mb-4">Arkadaşlarına söyle (opsiyonel)</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=Tiramisup&apos;u kaydettim! Launch hazırlığını tek platformda yönetmeyi deneyin &url=https://tiramisup.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1da1f2] text-white hover:opacity-80 transition"
              title="Twitter'da paylaş"
            >
              𝕏
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=https://tiramisup.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0077b5] text-white hover:opacity-80 transition"
              title="LinkedIn'de paylaş"
            >
              in
            </a>
          </div>
        </div>

        {/* Back to home */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center px-6 h-11 rounded-full bg-[#f6f6f6] text-[14px] font-semibold text-[#0d0d12] hover:bg-[#e8e8e8] transition"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  )
}
