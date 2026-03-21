export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-6">
      <div className="max-w-md text-center rounded-[20px] border border-[#e8e8e8] bg-white p-8 shadow-card">
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#666d80]">404</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#0d0d12]">Sayfa bulunamadı</h1>
        <p className="mt-3 text-[14px] leading-7 text-[#666d80]">
          İstediğin sayfa taşınmış olabilir ya da bağlantı hatalı olabilir.
        </p>
      </div>
    </div>
  );
}
