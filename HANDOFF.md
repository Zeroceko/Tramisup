# Tramisu — Handoff Belgesi

**Tarih:** Mart 2025  
**Durum:** Geliştirme ortamı çalışır, build yeşil, temel fonksiyonlar tamamlandı

---

## Projenin Ne Olduğu

Tramisu, startup kurucuları için "launch'tan growth'a" aşamasını yöneten bir operasyon panosu. Tek bir yerden:

- Pre-launch checklist ve aksiyon takibi
- Metrik girişi (DAU, MAU, MRR, aktivasyon) ve görselleştirme
- Growth rutinleri ve hedef yönetimi
- Entegrasyon bağlantı altyapısı (UI tamam, gerçek sync henüz yok)

---

## Geliştirme Ortamı

```bash
# Port 3000 LALALaunchBoard tarafından kullanılıyor — her zaman 3001 kullan
npm run dev -- --port 3001
```

```
http://localhost:3001
```

### Gereksinimler

- Node.js 18+
- PostgreSQL (lokal, aşağıdaki URL ile)
- `.env` dosyasındaki değerler (aşağıya bak)

### `.env` durumu

```
DATABASE_URL="postgresql://tramisu:tramisu_dev_password@localhost:5432/tramisu"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="<gerçek secret — .env dosyasında mevcut>"
```

> ⚠️ `NEXTAUTH_SECRET` oturum açıp kapatmadan değiştirilirse mevcut JWT token'lar geçersiz olur. Tarayıcı çerezlerini temizle.

---

## Mimari

```
Next.js 15 (App Router)
├── app/
│   ├── page.tsx                  → Landing page (public)
│   ├── login/page.tsx            → İki panelli giriş formu
│   ├── signup/page.tsx           → İki panelli kayıt formu
│   ├── dashboard/                → Ana özet (auth guard)
│   ├── pre-launch/               → Checklist + aksiyonlar (auth guard)
│   ├── metrics/                  → Metrik girişi + grafik (auth guard)
│   ├── growth/                   → Hedefler + rutinler + timeline (auth guard)
│   ├── integrations/             → Entegrasyon bağlantı UI (auth guard)
│   ├── settings/                 → Kullanıcı ayarları (auth guard)
│   └── api/
│       ├── auth/[...nextauth]/   → NextAuth handler
│       ├── auth/signup/          → Kayıt + otomatik seed
│       ├── seed/                 → Demo veri yükleme (POST, auth gerektirir)
│       ├── actions/[id]/         → Pre-launch aksiyon PATCH
│       ├── checklist/[id]/       → Checklist item PATCH
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
│   ├── ChecklistSection.tsx      → Kategori bazlı checklist (client, API calls)
│   ├── ActionsSection.tsx        → Öncelikli aksiyon listesi (client, API calls)
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
    └── seed.ts                   → Demo veri oluşturma fonksiyonu
```

---

## Veritabanı

**ORM:** Prisma 6 (schema `prisma/schema.prisma`)

**Modeller:**

| Model | Açıklama |
|---|---|
| `User` | Kimlik doğrulama, bcrypt hash |
| `Project` | Her kullanıcıya ait tek proje (1:1) |
| `PreLaunchChecklist` | Kategori bazlı (PRODUCT/MARKETING/LEGAL/TECH) |
| `PreLaunchAction` | Öncelikli aksiyon öğeleri |
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
Yeni kayıt olduğunda otomatik çalışır. Mevcut kullanıcı için:
```bash
curl -X POST http://localhost:3001/api/seed \
  -H "Cookie: <session cookie>"
```
Ya da login olduktan sonra dashboard'dan çağır.

---

## Auth Akışı

1. `/signup` → `POST /api/auth/signup` → user + project oluştur + seed veri → `signIn()` → `/dashboard`
2. `/login` → `signIn("credentials")` → `/dashboard`
3. Her korumalı route'un `layout.tsx`'i `getServerSession` → `redirect("/login")`
4. JWT session, `authOptions.callbacks.jwt` üzerinden `user.id` taşıyor

---

## Mevcut Durum

### Çalışanlar ✅

- Signup → login → dashboard akışı (uçtan uca)
- Auth guard tüm iç sayfalarda
- Pre-launch checklist toggle (client-side optimistic + API)
- Metrik girişi ve grafik görselleştirme
- Growth hedefleri ve rutinler
- Entegrasyon bağlantı UI (mock test)
- Demo veri seed (signup'ta otomatik)
- Build temiz (`next build` hatasız)
- Tüm `[id]/route.ts` dosyaları Next.js 15 `params: Promise<{id}>` formatında

### Eksik / Yarım ✅

- **Entegrasyon sync:** UI var, gerçek webhook/OAuth akışı yok
- **E-posta doğrulama:** Signup'ta e-posta onayı yok
- **Şifre sıfırlama:** Yok
- **Çoklu proje:** Schema destekliyor, UI tek proje varsayıyor
- **Inner page tasarımı:** `pre-launch`, `metrics`, `growth`, `integrations` sayfaları eski `container mx-auto` stiliyle — `AppShell` içinde çalışıyor ama `PageHeader`/`StatCard` pattern'i uygulanmamış

### Bilinen Sorunlar

- `globals.css` bazen dev server başlangıcında `@layer base` uyarısı veriyor — Tailwind CSS compilation sırası sorunu. Production build'i etkilemiyor.
- JWT_SESSION_ERROR: `NEXTAUTH_SECRET` değiştirilince eski çerezler geçersiz olur. Tarayıcı çerezleri temizlenince düzelir.

---

## Sonraki Adımlar (Öncelik Sırasıyla)

1. **Hosted DB:** Neon veya Supabase (Vercel ile en kolay entegrasyon)
2. **GitHub push:** `git push origin main`
3. **Vercel deploy:**
   - `NEXTAUTH_URL` → production domain
   - `DATABASE_URL` → hosted DB bağlantı string
   - `NEXTAUTH_SECRET` → yeni güçlü secret
4. **Inner page tasarım güncellemesi:** `pre-launch`, `metrics`, `growth`, `integrations` → `PageHeader` + `StatCard` pattern
5. **Şifre sıfırlama:** Resend/Postmark ile magic link
6. **Gerçek entegrasyon sync:** Stripe webhook'tan MRR çekme öncelikli

---

## Vercel Deploy için `.env` Şablonu

```env
DATABASE_URL="postgresql://<user>:<pass>@<host>/<db>?sslmode=require"
NEXTAUTH_URL="https://tramisu.vercel.app"
NEXTAUTH_SECRET="<openssl rand -base64 32 çıktısı>"
```
