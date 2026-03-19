# Tramisup — Handoff Belgesi

**Tarih:** Mart 2026
**Durum:** Phase 1 tamamlandı — multi-product schema, build temiz, GitHub'da

---

## Projenin Ne Olduğu

Tramisup, startup kurucuları için "launch'tan growth'a" aşamasını yöneten çok-ürünlü operasyon panosu. Tek bir yerden:

- Birden fazla ürün yönetimi (1:N User→Product)
- Launch Readiness checklist (PRODUCT/MARKETING/LEGAL/TECH)
- Growth Readiness checklist (ACQUISITION/ACTIVATION/RETENTION/REVENUE)
- Kanban görev yönetimi (TODO/IN_PROGRESS/DONE)
- Metrik girişi (DAU, MAU, MRR, aktivasyon) ve görselleştirme
- Growth rutinleri ve hedef yönetimi
- Entegrasyon bağlantı altyapısı (UI tamam, gerçek sync henüz yok)

---

## Geliştirme Ortamı

```bash
# Port 3000 başka uygulama tarafından kullanılıyor — her zaman 3001 kullan
docker compose up -d          # PostgreSQL başlat
npm run dev -- --port 3001    # Dev server
```

```
http://localhost:3001
```

### Gereksinimler

- Node.js 18+
- Docker (lokal PostgreSQL için)
- `.env` dosyasındaki değerler

### `.env` durumu

```
DATABASE_URL="postgresql://tramisu:tramisu_dev_password@localhost:5432/tramisu"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="<gerçek secret — .env dosyasında mevcut>"
```

> ⚠️ `NEXTAUTH_SECRET` değiştirilirse mevcut JWT token'lar geçersiz olur. Tarayıcı çerezlerini temizle.

---

## GitHub

**Repo:** `https://github.com/Zeroceko/Tramisup` (private)
**Branch:** `main`
**Son commit:** Phase 1 schema + tüm kod güncellemeleri

```bash
git push origin main   # Değişiklikleri push et
```

---

## Deploy Durumu

| Servis | Durum |
|---|---|
| GitHub | Aktif — `Zeroceko/Tramisup` |
| Supabase | Bekliyor — proje oluşturulmadı |
| Vercel | Bekliyor — deploy yapılmadı |

### Deploy için yapılacaklar

1. [supabase.com](https://supabase.com) → New Project (`tramisup`, EU West)
2. Settings → Database → Connection string (Transaction mode) kopyala
3. [vercel.com](https://vercel.com) → GitHub'dan import et
4. Env vars gir (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET)
5. `npx prisma db push` ile remote DB'ye schema push

---

## Mimari

```
Next.js 15 (App Router)
├── app/
│   ├── page.tsx                  → Landing page (public)
│   ├── login/page.tsx            → İki panelli giriş formu
│   ├── signup/page.tsx           → İki panelli kayıt formu
│   ├── dashboard/                → Ana özet (auth guard)
│   ├── pre-launch/               → Launch checklist + kanban tasks (auth guard)
│   ├── metrics/                  → Metrik girişi + grafik (auth guard)
│   ├── growth/                   → Hedefler + rutinler + timeline (auth guard)
│   ├── integrations/             → Entegrasyon bağlantı UI (auth guard)
│   ├── settings/                 → Kullanıcı ayarları (auth guard)
│   └── api/
│       ├── auth/[...nextauth]/   → NextAuth handler
│       ├── auth/signup/          → Kayıt + otomatik seed
│       ├── seed/                 → Demo veri yükleme (POST, auth gerektirir)
│       ├── actions/[id]/         → Task PATCH (status, priority)
│       ├── checklist/[id]/       → LaunchChecklist item PATCH
│       ├── goals/                → Goal CRUD
│       ├── integrations/         → Integration bağlantı + test
│       ├── metrics/              → Metrik POST + activation-funnel GET
│       ├── routines/[id]/complete → Rutin tamamlama
│       └── settings/             → Profil güncelleme
├── components/
│   ├── AppShell.tsx              → Tüm auth sayfaları için wrapper (nav + layout)
│   ├── DashboardNav.tsx          → Sticky header + pill nav + signout
│   ├── PageHeader.tsx            → Eyebrow + başlık + aksiyonlar
│   ├── StatCard.tsx              → Renkli stat kartı (blue/violet/emerald/amber)
│   ├── ChecklistSection.tsx      → Kategori bazlı launch checklist (client)
│   ├── ActionsSection.tsx        → Task listesi + tamamlama (client, Task modeli)
│   ├── MetricsOverview.tsx       → Recharts line chart
│   ├── MetricEntryForm.tsx       → Manuel metrik giriş formu
│   ├── RetentionCohortTable.tsx  → Cohort retention tablosu
│   ├── ActivationFunnelChart.tsx → Funnel adım görselleştirme
│   ├── GoalsSection.tsx          → Hedef progress kartları
│   ├── GrowthRoutines.tsx        → Rutin listesi + tamamlama
│   ├── TimelineFeed.tsx          → Milestone/event timeline
│   └── IntegrationCard.tsx       → Entegrasyon bağlantı kartı
└── lib/
    ├── auth.ts                   → NextAuth options (JWT + credentials)
    ├── prisma.ts                 → PrismaClient singleton
    └── seed.ts                   → seedProductData() — demo veri oluşturma
```

---

## Veritabanı

**ORM:** Prisma 6 (schema `prisma/schema.prisma`)

**Modeller:**

| Model | Açıklama |
|---|---|
| `User` | Kimlik doğrulama, bcrypt hash |
| `Product` | Her kullanıcıya ait ürünler (1:N), onboarding wizard alanları |
| `LaunchChecklist` | PRODUCT/MARKETING/LEGAL/TECH kategorileri |
| `GrowthChecklist` | ACQUISITION/ACTIVATION/RETENTION/REVENUE kategorileri |
| `Task` | Kanban görevleri (TODO/IN_PROGRESS/DONE), Priority enum |
| `Metric` | Günlük DAU/MAU/MRR kayıtları |
| `RetentionCohort` | Aylık kohort retention verileri |
| `ActivationFunnel` | SIGNUP→ONBOARDING→FIRST_ACTION→ACTIVATED |
| `Goal` | Hedef + ilerleme |
| `GrowthRoutine` | Haftalık/aylık rutinler |
| `TimelineEvent` | Milestone/launch/metric threshold olayları |
| `Integration` | Provider bağlantı durumu |
| `SyncJob` | Entegrasyon sync log (altyapı hazır) |

**Şema ile DB senkron:**
```bash
npx prisma db push
```

**Demo veri yükleme:**
Yeni kayıt olduğunda otomatik çalışır (`seedProductData`). Mevcut kullanıcı için:
```bash
curl -X POST http://localhost:3001/api/seed \
  -H "Cookie: <session cookie>"
```

---

## Auth Akışı

1. `/signup` → `POST /api/auth/signup` → user + product oluştur + seed veri → `signIn()` → `/dashboard`
2. `/login` → `signIn("credentials")` → `/dashboard`
3. Her korumalı route'un `layout.tsx`'i `getServerSession` → `redirect("/login")`
4. JWT session, `authOptions.callbacks.jwt` üzerinden `user.id` taşıyor

---

## Mevcut Durum

### Tamamlananlar ✅

- GitHub repo: `Zeroceko/Tramisup` (private)
- Signup → login → dashboard akışı (uçtan uca)
- Auth guard tüm iç sayfalarda
- **Multi-product schema:** User → Product (1:N), LaunchChecklist, GrowthChecklist, Task modelleri
- **Build temiz:** `next build` hatasız, 21 route compile
- Pre-launch checklist toggle (client-side + API)
- Task yönetimi (ActionsSection — Task modeline bağlı)
- Metrik girişi ve grafik görselleştirme
- Growth hedefleri ve rutinler
- Entegrasyon bağlantı UI (mock test)
- Demo veri seed (signup'ta otomatik, 15 launch + 12 growth checklist + 6 task + 30 gün metrik)
- Tüm `[id]/route.ts` Next.js 15 `params: Promise<{id}>` formatında
- PageHeader + StatCard + AppShell component pattern'i

### Eksik / Yarım

- **Supabase + Vercel deploy:** Tokens bekleniyor
- **Products sayfası:** Ürün listesi ve yeni ürün wizard (Phase 2)
- **Launch Readiness sayfası:** PageHeader + StatCard pattern ile yeniden tasarım (Phase 3)
- **Growth Readiness sayfası:** GrowthChecklist kategorileri ile yeni sayfa (Phase 4)
- **Kanban Board:** Task'ları sütunlarla görselleştirme (Phase 5)
- **Dashboard yeniden tasarım:** Figma tasarımına uygun (Phase 6)
- **Nav & Layout güncellemesi:** Product selector, yeni nav yapısı (Phase 7)
- **Entegrasyon sync:** UI var, gerçek webhook/OAuth akışı yok
- **E-posta doğrulama / şifre sıfırlama:** Yok

### Bilinen Sorunlar

- `globals.css` bazen dev server başlangıcında `@layer base` uyarısı veriyor — production'ı etkilemiyor
- JWT_SESSION_ERROR: `NEXTAUTH_SECRET` değiştirilince eski çerezler geçersiz. Tarayıcı çerezleri temizlenince düzelir
- IDE TypeScript hataları: Prisma client cache bazen eski modelleri gösteriyor — `npx prisma generate` ile düzelir

---

## Sonraki Adımlar (Öncelik Sırasıyla)

1. **Supabase proje oluştur** → DB connection string al
2. **Vercel deploy** → `Zeroceko/Tramisup` import et, env vars gir
3. **Phase 2:** Products sayfası + 7 adımlı yeni ürün wizard
4. **Phase 3:** Launch Readiness yeniden tasarım
5. **Phase 4:** Growth Readiness sayfası
6. **Phase 5:** Kanban Board
7. **Phase 6:** Dashboard yeniden tasarım (Figma'ya uygun)
8. **Phase 7:** Nav & Layout güncellemesi (product selector)

---

## Vercel Deploy için `.env` Şablonu

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXTAUTH_URL="https://tramisup.vercel.app"
NEXTAUTH_SECRET="<openssl rand -base64 32 çıktısı>"
```

---

## Mimari Kararlar

| Karar | Tercih | Neden |
|---|---|---|
| Port | 3001 | 3000 başka uygulama tarafından kullanılıyor |
| Auth | JWT session | Stateless, Vercel serverless ile uyumlu |
| Seed | Signup'ta otomatik | Yeni kullanıcı boş dashboard görmesin |
| ORM | Prisma 6 | Prisma 7 breaking change (PrismaClientOptions) |
| Component pattern | AppShell + PageHeader + StatCard | Tutarlı layout, auth guard tek yerden |
| Params typing | `Promise<{id: string}>` | Next.js 15 dynamic route zorunluluğu |
| Multi-product | User→Product 1:N | Figma tasarımı çok ürün gösteriyor |
| Task modeli | `Task` (TODO/IN_PROGRESS/DONE) | `PreLaunchAction` kaldırıldı, Kanban'a hazır |
