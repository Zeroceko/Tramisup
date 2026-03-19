# Tramisu — Implementation Plan

Son güncelleme: Mart 2025

---

## Tamamlananlar

### Temel Altyapı ✅
- [x] Next.js 15 App Router + TypeScript + Tailwind CSS kurulumu
- [x] Prisma 6 + PostgreSQL şeması (12 model)
- [x] NextAuth.js 4 — JWT session + credentials provider
- [x] `lib/auth.ts`, `lib/prisma.ts`, `lib/seed.ts`

### Auth Akışı ✅
- [x] `/signup` — form + `POST /api/auth/signup` + otomatik login
- [x] `/login` — NextAuth credentials signIn
- [x] Auth guard — tüm iç route layout'larında `getServerSession` + redirect
- [x] Kayıt sırasında otomatik demo veri seed (`lib/seed.ts`)
- [x] `NEXTAUTH_SECRET` gerçek değerle güncellendi
- [x] `NEXTAUTH_URL` port 3001'e güncellendi

### API Route'lar ✅
- [x] `POST /api/auth/signup` — kayıt + proje oluştur + seed
- [x] `POST /api/seed` — mevcut kullanıcı için demo veri yenile
- [x] `PATCH /api/actions/[id]` — aksiyon tamamlama
- [x] `PATCH /api/checklist/[id]` — checklist toggle
- [x] `GET|POST /api/goals` — hedef listesi + oluşturma
- [x] `GET|POST /api/integrations` — entegrasyon listesi + kayıt
- [x] `POST /api/integrations/[id]/test` — mock bağlantı testi
- [x] `GET|POST /api/metrics` — metrik listesi + giriş
- [x] `GET /api/metrics/activation-funnel` — funnel verisi
- [x] `GET|POST /api/routines` — rutin listesi + oluşturma
- [x] `POST /api/routines/[id]/complete` — rutin tamamlama
- [x] `GET|PUT /api/settings` — kullanıcı profil güncelleme
- [x] Tüm `[id]/route.ts` → Next.js 15 `params: Promise<{id}>` formatına güncellendi

### UI Bileşenleri ✅
- [x] `AppShell` — tüm auth sayfaları için wrapper
- [x] `DashboardNav` — sticky header, pill nav, signout
- [x] `PageHeader` — eyebrow + başlık + aksiyon slot
- [x] `StatCard` — renkli stat kartı (4 accent)
- [x] `ChecklistSection` — kategorili checklist, optimistic toggle
- [x] `ActionsSection` — öncelikli aksiyon listesi
- [x] `MetricsOverview` — Recharts line chart (DAU/MRR)
- [x] `MetricEntryForm` — manuel metrik giriş formu
- [x] `RetentionCohortTable` — kohort tablosu
- [x] `ActivationFunnelChart` — funnel adım chart
- [x] `GoalsSection` — hedef progress kartları
- [x] `GrowthRoutines` — rutin listesi + tamamlama
- [x] `TimelineFeed` — milestone/event timeline
- [x] `IntegrationCard` — entegrasyon bağlantı + test UI

### Sayfa Dosyaları ✅
- [x] `app/page.tsx` — landing page (public)
- [x] `app/login/page.tsx` — iki panelli giriş
- [x] `app/signup/page.tsx` — iki panelli kayıt
- [x] `app/dashboard/page.tsx` — PageHeader + StatCard + quick actions
- [x] `app/pre-launch/page.tsx` — checklist + aksiyon (eski stil, çalışıyor)
- [x] `app/metrics/page.tsx` — grafik + form (eski stil, çalışıyor)
- [x] `app/growth/page.tsx` — hedefler + rutinler (eski stil, çalışıyor)
- [x] `app/integrations/page.tsx` — entegrasyon grid (eski stil, çalışıyor)
- [x] `app/settings/page.tsx` — profil formu

### Build & Test ✅
- [x] `next build` — hatasız, tüm route'lar compile
- [x] TypeScript hataları yalnızca test dosyasında (prod kodu temiz)
- [x] `prisma db push` — şema DB ile senkron

---

## Devam Eden Çalışma

### Faz 1 — İç Sayfa Tasarım Güncellemesi
_Öncelik: Orta | Engel yok_

- [ ] `app/pre-launch/page.tsx` → `PageHeader` + `StatCard` pattern
- [ ] `app/metrics/page.tsx` → `PageHeader` + `StatCard` pattern
- [ ] `app/growth/page.tsx` → `PageHeader` + `StatCard` pattern
- [ ] `app/integrations/page.tsx` → `PageHeader` + `StatCard` pattern
- [ ] `globals.css` `@layer base` Tailwind uyarısını düzelt

### Faz 2 — Deploy Altyapısı
_Öncelik: Yüksek | Kullanıcı onayı gerekiyor_

- [ ] **Hosted DB seç:** Neon (önerilen) veya Supabase
- [ ] `DATABASE_URL` hosted bağlantıya güncelle
- [ ] `vercel.json` oluştur (gerekirse)
- [ ] GitHub repo oluştur ve push yap _(onay gerekli)_
- [ ] Vercel'e import et ve env vars gir _(onay gerekli)_
- [ ] `NEXTAUTH_URL` → production domain güncelle
- [ ] Production `NEXTAUTH_SECRET` set et

### Faz 3 — Auth İyileştirmeleri
_Öncelik: Orta_

- [ ] Şifre sıfırlama — Resend/Postmark ile magic link
- [ ] E-posta doğrulama (opsiyonel, login engelini artırır)
- [ ] "Şifremi unuttum" sayfası

### Faz 4 — Gerçek Entegrasyonlar
_Öncelik: Düşük (altyapı hazır)_

- [ ] **Stripe webhook:** `mrr` ve `activeSubscriptions`'ı otomatik güncelle
- [ ] **GA4 Data API:** DAU/MAU'yu otomatik çek
- [ ] OAuth bağlantı akışı (mevcut mock UI'ın gerçek implementation'ı)
- [ ] `SyncJob` modeli ile sync geçmişi

### Faz 5 — Ürün Olgunluğu
_Öncelik: Düşük_

- [ ] Çoklu proje desteği (schema hazır, UI tek proje varsayıyor)
- [ ] Takım üyesi daveti
- [ ] Export (CSV, PDF)
- [ ] Metrik hedef eşiği bildirimleri

---

## Bilinen Sorunlar

| Sorun | Etki | Çözüm |
|---|---|---|
| `globals.css` `@layer base` uyarısı | Dev server log'u kirletiyor, production etkilenmiyor | Tailwind CSS compile sırası düzeltmesi |
| JWT_SESSION_ERROR sonrası oturum | `NEXTAUTH_SECRET` değişince eski çerezler geçersiz | Tarayıcı çerezleri temizle |
| Inner page tasarım tutarsızlığı | Görsel uyumsuzluk (Faz 1'de düzelecek) | Faz 1 çalışması |

---

## Mimari Kararlar

| Karar | Tercih | Neden |
|---|---|---|
| Port | 3001 | 3000 LALALaunchBoard tarafından kullanılıyor |
| Auth | JWT session | Stateless, Vercel serverless ile uyumlu |
| Seed | Signup'ta otomatik | Yeni kullanıcı boş dashboard görmesin |
| Prisma version | 6 (7'den düşürüldü) | Prisma 7 breaking change (PrismaClientOptions) |
| Component pattern | AppShell + PageHeader + StatCard | Tutarlı layout, auth guard tek yerden |
| Params typing | `Promise<{id: string}>` | Next.js 15 dynamic route zorunluluğu |
