# Tramisup — Implementation Plan

Son güncelleme: Mart 2026

---

## Tamamlananlar

### Altyapı ✅
- [x] GitHub repo: `https://github.com/Zeroceko/Tramisup` (private, main branch)
- [x] Docker Compose ile lokal PostgreSQL 16
- [x] Vercel CLI kuruldu (`v50.34.1`)
- [x] Supabase CLI kuruldu (`v2.75.0`)
- [x] `.env` `.gitignore`'da (güvenli)
- [x] Vercel: Auto-deploy from GitHub
- [x] Supabase: EU West (Paris) PostgreSQL
- [x] Vercel env vars: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

### Schema (Phase 1) ✅
- [x] `Project` → `Product` rename (1:1 → 1:N)
- [x] `PreLaunchChecklist` → `LaunchChecklist` (enum: `LaunchCategory`)
- [x] Yeni: `GrowthChecklist` (enum: `GrowthCategory`: ACQUISITION/ACTIVATION/RETENTION/REVENUE)
- [x] Yeni: `Task` modeli (enum: `TaskStatus`: TODO/IN_PROGRESS/DONE)
- [x] `PreLaunchAction` kaldırıldı → `Task` ile değiştirildi
- [x] `Product`'a onboarding wizard alanları eklendi
- [x] `prisma db push --force-reset` ile DB sıfırlandı ve yeni schema uygulandı
- [x] `prisma generate` ile client yeniden oluşturuldu
- [x] Schema push remote DB'ye yapılıyor

### Kod Güncellemeleri (Phase 1) ✅
- [x] `lib/seed.ts` → `seedProductData()`, LaunchChecklist + GrowthChecklist + Task seed
- [x] `app/api/auth/signup/route.ts` → `prisma.product.create`
- [x] `app/api/seed/route.ts` → product bazlı temizle + seed
- [x] `app/dashboard/page.tsx` → `prisma.product.findFirst`
- [x] `app/pre-launch/page.tsx` → `launchChecklist` + `task` sorguları
- [x] `app/metrics/page.tsx` → `productId` referansları
- [x] `app/growth/page.tsx` → `productId` referansları
- [x] `app/integrations/page.tsx` → `productId` referansları
- [x] `app/settings/page.tsx` → `products: { take: 1 }` include
- [x] Tüm `app/api/*` route'ları → `productId` referansları
- [x] Tüm `components/*` → `productId` prop rename
- [x] `components/ActionsSection.tsx` → `Task` modeline göre yeniden yazıldı
- [x] `next build` temiz — 21 route hatasız derlendi
- [x] `package.json`: "name": "tramisup"
- [x] `vercel.json`: buildCommand, framework, env vars

### Temel Auth Akışı ✅
- [x] `/signup` → user + product + seed → signIn → `/dashboard`
- [x] `/login` → NextAuth credentials
- [x] Auth guard tüm layout'larda
- [x] JWT session `user.id` taşıyor

### UI Bileşenleri ✅
- [x] `AppShell` — auth sayfa wrapper
- [x] `DashboardNav` — sticky header, pill nav, signout
- [x] `PageHeader` — eyebrow + başlık + aksiyon slot
- [x] `StatCard` — 4 accent rengi (blue/violet/emerald/amber)

### Deploy ✅
- [x] Vercel: `tramisup` projesi oluşturuldu
- [x] Supabase: `tramisup` projesi (ref: `ojecebxxcbxrofnbkaae`)
- [x] Vercel env vars ayarlandı
- [x] GitHub auto-deploy bağlandı
- [x] Production URL: `https://tramisup.vercel.app`

---

## Devam Eden Fazlar

### Phase 2 — Products Sayfası + Yeni Ürün Wizard
_Öncelik: Yüksek | Figma: Products screen_

- [ ] `app/products/page.tsx` — ürün listesi (her ürün: launch score, growth score, status badge)
- [ ] `app/products/new/page.tsx` — 7 adımlı onboarding wizard
  - Step 1: Ürün adı + kısa açıklama
  - Step 2: Kategori seçimi (SaaS, E-commerce, Marketplace, vb.)
  - Step 3: Hedef kitle
  - Step 4: Business model (Subscription, Freemium, One-time)
  - Step 5: Website + logo
  - Step 6: Launch hedefleri
  - Step 7: Özet + oluştur
- [ ] `POST /api/products` — yeni ürün API route
- [ ] DashboardNav'a product selector dropdown ekle

### Phase 3 — Launch Readiness Sayfası Yeniden Tasarım
_Öncelik: Yüksek | Figma: Launch Readiness screen_

- [ ] `app/pre-launch/page.tsx` → PageHeader + StatCard pattern
- [ ] 4 kategori için ayrı progress bar'lar (PRODUCT/MARKETING/LEGAL/TECH)
- [ ] Genel launch score hesabı
- [ ] Checklist item'lar için hover state iyileştirme

### Phase 4 — Growth Readiness Sayfası
_Öncelik: Yüksek | Figma: Growth Readiness screen_

- [ ] `app/growth-readiness/page.tsx` — yeni sayfa
- [ ] 4 kategori: ACQUISITION/ACTIVATION/RETENTION/REVENUE
- [ ] `GrowthChecklist` CRUD API route'ları
- [ ] `PATCH /api/growth-checklist/[id]` — toggle

### Phase 5 — Kanban Board
_Öncelik: Yüksek | Figma: Kanban screen_

- [ ] `app/board/page.tsx` — 3 sütunlu kanban (To Do / In Progress / Done)
- [ ] `components/KanbanBoard.tsx` — drag & drop veya buton ile status değiştirme
- [ ] `components/TaskCard.tsx` — priority badge, due date, ürün etiketi
- [ ] `PATCH /api/tasks/[id]` — status güncelleme
- [ ] `POST /api/tasks` — yeni task oluşturma

### Phase 6 — Dashboard Yeniden Tasarım
_Öncelik: Orta | Figma: Dashboard screen_

- [ ] Stat card'lar: Launch Score, Growth Score, Active Tasks, MRR
- [ ] Task özeti widget (son 5 görev)
- [ ] Metrics mini chart (7 günlük MRR trend)
- [ ] Aktif goals widget
- [ ] Product selector entegrasyonu

### Phase 7 — Nav & Layout Güncellemesi
_Öncelik: Orta | Figma: Navigation_

- [ ] DashboardNav'a product selector dropdown
- [ ] Yeni nav item'ları: Products, Board
- [ ] Aktif product context (URL param veya cookie)
- [ ] Mobile responsive iyileştirme

---

## Sonraki Yapılacaklar: Auth + Entegrasyon

- [ ] Şifre sıfırlama — Resend ile magic link
- [ ] E-posta doğrulama (opsiyonel)
- [ ] Stripe webhook: MRR otomatik güncelle
- [ ] GA4 Data API: DAU/MAU otomatik çek

---

## Bilinen Sorunlar

| Sorun | Etki | Çözüm |
|---|---|---|
| `globals.css` `@layer base` uyarısı | Dev log'u kirletiyor | Tailwind compile sırası düzeltmesi |
| JWT_SESSION_ERROR | NEXTAUTH_SECRET değişince | Tarayıcı çerezleri temizle |
| IDE TypeScript cache | Eski Prisma tipleri gösterilebilir | `npx prisma generate` + TS server restart |

---

## Mimari Kararlar

| Karar | Tercih | Neden |
|---|---|---|
| Port | 3001 | 3000 başka uygulama |
| Auth | JWT session | Vercel serverless uyumlu |
| Multi-product | 1:N User→Product | Figma tasarımı çok ürün gösteriyor |
| Task modeli | TaskStatus enum | PreLaunchAction kaldırıldı, Kanban'a hazır |
| Seed | Signup'ta otomatik | Yeni kullanıcı boş dashboard görmesin |
| Prisma | v6 | v7 breaking change (PrismaClientOptions) |
| Params | `Promise<{id}>` | Next.js 15 zorunluluğu |
| Deploy | Vercel + Supabase | GitHub integration, serverless, managed DB |
| Region | EU West (Paris) | GDPR + Türkiye'ye yakınlık |
