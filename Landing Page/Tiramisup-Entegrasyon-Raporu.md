# Tiramisup - Landing Page Entegrasyon Raporu

Bu belge, Vite / React tabanlı Landing Page projesinin, **Next.js (App Router) tabanlı Tiramisup** projesine entegrasyonu sırasındaki teknik adımları ekibe aktarmak için hazırlanmıştır.

## 1. Bağımlılıkların (Dependencies) Taşınması
Landing Page içerisinde kullanılan Shadcn UI, Tailwind ve Radix bileşenleri Tiramisup projesi içerisine yüklendi.
- **Eklenen Paketler:** `lucide-react`, `tailwindcss-animate`, `clsx`, `tailwind-merge`, `@radix-ui/react-*` vb. (package.json içerisine eklendi). 

## 2. Bileşen ve Utils Transferi
- `Landing Page/src/lib/utils.ts` içindeki `cn` (Tailwind Merge) fonksiyonu `Tiramisup/lib/utils.ts` (veya ilgili dizin) içine kopyalandı.
- UI klasöründeki (`src/components/`) tüm buton, dropdown, form vb. bileşen yapıları Next.js uyumlu olarak (gereken yerlerde `'use client'` eklenerek) `Tiramisup/components/` dizinine taşındı.
- Landing page içerisindeki resim dosyaları (`illus-*.png`, `screen-*.png` vb.) `Tiramisup/public/assets` klasörünün altına taşındı.

## 3. Sayfa Yönlendirme ve Image Düzenlemeleri (Next.js Uyarlaması)
Vite altındaki React projesi (Index.tsx) Next.js'e şu şekilde adapte edilmiştir:
- **Router Değişikliği:** `react-router-dom` içindeki `useNavigate` kullanımları, `next/navigation` altındaki `useRouter()` ile güncellendi. Buton linklemeleri (`navigate('/login')`) Next.js router yapısı ile çalışacak şekilde değiştirildi (`router.push('/login')`).
- **Resim Importları:** Vite'daki `import imgSrc from '@/assets/img.png'` şeklindeki module import yapısı, derleme (build) esnasında Next.js'in statik varlık akışıyla çelişmemesi için `const imgSrc = '/assets/img.png'` formatına çevrildi.
- **Client Component Yapısı:** Lifecycle yönetimi parçaları (`useState`, `useEffect`, IntersectionObserver kullanımları) içeren ana sayfa layout'unun en başına `'use client';` ibaresi eklendi (Next.js App Router kısıtlamaları gereği).

## 4. Stiller ve Tailwind CSS Entegrasyonu
- **CSS Değişkenleri:** Kaynak projenin `index.css` dosyasında bulunan Shadow, Renk ve Shadcn yapılandırmalarını içeren tüm `hsl(var(--...))` kök (root) css değişkenleri ve özel `keyframes` animasyonları, `Tiramisup/app/[locale]/globals.css` içine inject edildi.
- **Tailwind Config:** Tailwind config dosyasındaki tema tanımları (extend, colors, keyframes) başarıyla Tiramisup içerisindeki `tailwind.config.ts` ile birleştirildi. Content yoluna `app` ve `components` klasörleri düzgünce tanımlandı.

## Sonuç
Proje şu anda `localhost:3000` (veya `3001` vb.) portunda, Next.js içerisinde uluslararasılaştırma (i18n) destekli kendi `app/[locale]/page.tsx` rotası altında çalışmaya hazırdır. Herhangi bir Tailwind css hatası vs. olmaksızın tüm bileşenler Next.js eko-sistemine devredilmiştir.

*- Antigravity AI tarafından ekibinizin kolayca dahil olabilmesi için oluşturuldu.*
