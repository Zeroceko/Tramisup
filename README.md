# Tramisup

Startup kurucuları için **launch'tan growth'a** aşamayı yöneten çok-ürünlü operasyon panosu.

Pre-launch hazırlık, growth readiness, kanban görev yönetimi, metrik takibi, growth rutinleri ve entegrasyon altyapısını tek bir yerden yönet.

**Live:** [tramisup.vercel.app](https://tramisup.vercel.app)

---

## Başlarken

### Gereksinimler

- Node.js 18+
- Docker (lokal PostgreSQL için) — ya da Supabase'i kullan

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla (lokal)
cp .env.example .env
# .env dosyasını düzenle (DATABASE_URL, NEXTAUTH_SECRET)

# Lokal DB'yi başlat (Docker varsa)
docker compose up -d

# Veritabanı şemasını uygula
npx prisma db push

# Geliştirme sunucusunu başlat
npm run dev -- --port 3001
```

Uygulama `http://localhost:3001` adresinde açılır.

> **Not:** Port 3000 başka bir uygulama tarafından kullanılıyorsa `--port 3001` bayrağını kullan.

### İlk Kullanım

1. `/signup` adresine git ve hesap oluştur
2. Kayıt sırasında demo veri otomatik yüklenir (15 launch checklist, 12 growth checklist, 6 task, 30 günlük metrik)
3. Dashboard'da gerçek veriyle dolu bir ekran görürsün

---

## Özellikler

| Modül | Açıklama |
|---|---|
| **Products** | Çok-ürün desteği, 7 adımlı yeni ürün wizard'ı |
| **Launch Readiness** | PRODUCT / MARKETING / LEGAL / TECH kategorilerinde checklist + ilerleme skoru |
| **Growth Readiness** | ACQUISITION / ACTIVATION / RETENTION / REVENUE kategorilerinde checklist |
| **Kanban Board** | To Do / In Progress / Done görev yönetimi |
| **Metrics** | DAU, MAU, MRR, aktivasyon oranı manuel girişi; Recharts görselleştirme; retention kohort tablosu |
| **Growth** | Ölçülebilir hedefler, haftalık/aylık rutinler, milestone timeline |
| **Integrations** | Stripe, GA4, Mixpanel, Segment, Amplitude, PostHog bağlantı UI (sync altyapısı hazır) |

---

## Teknoloji Yığını

- **Framework:** Next.js 15 (App Router)
- **Dil:** TypeScript
- **Stil:** Tailwind CSS 3
- **Auth:** NextAuth.js 4 (JWT + credentials)
- **ORM:** Prisma 6 (PostgreSQL)
- **Veritabanı:** Supabase PostgreSQL
- **Deploy:** Vercel
- **Grafikler:** Recharts
- **Test:** Vitest
- **Şifreleme:** bcryptjs

---

## Proje Yapısı

```
app/
  page.tsx              → Landing page
  login/                → Giriş
  signup/               → Kayıt
  dashboard/            → Ana özet (stat cards, quick actions, goal pulse)
  pre-launch/           → Launch readiness checklist + kanban tasks
  metrics/              → Metrik panosu (grafik, form, funnel, cohort)
  growth/               → Hedefler, rutinler, timeline
  integrations/         → Entegrasyon bağlantıları
  settings/             → Kullanıcı + ürün ayarları
  api/
    auth/               → NextAuth + signup
    actions/            → Task CRUD
    checklist/          → LaunchChecklist toggle
    goals/              → Goal CRUD + progress
    integrations/       → Integration bağlantı + test
    metrics/            → Metrik upsert + activation funnel
    routines/           → GrowthRoutine CRUD + complete
    seed/               → Demo veri yenile
    settings/           → Profil güncelleme

components/             → UI bileşenleri
lib/
  auth.ts               → NextAuth yapılandırması
  prisma.ts             → Prisma client singleton
  seed.ts               → Demo veri yükleyici (seedProductData)
prisma/
  schema.prisma         → Veritabanı şeması (14 model)
```

---

## Veritabanı Modelleri

| Model | Açıklama |
|---|---|
| `User` | Kimlik doğrulama, bcrypt hash |
| `Product` | Kullanıcıya ait ürünler (1:N), onboarding alanları |
| `LaunchChecklist` | PRODUCT/MARKETING/LEGAL/TECH kategorileri |
| `GrowthChecklist` | ACQUISITION/ACTIVATION/RETENTION/REVENUE kategorileri |
| `Task` | Kanban görevleri (TODO/IN_PROGRESS/DONE) |
| `Metric` | Günlük DAU/MAU/MRR kayıtları |
| `RetentionCohort` | Aylık kohort retention verileri |
| `ActivationFunnel` | SIGNUP→ONBOARDING→FIRST_ACTION→ACTIVATED |
| `Goal` | Hedef + ilerleme |
| `GrowthRoutine` | Haftalık/aylık rutinler |
| `TimelineEvent` | Milestone/launch/metric threshold olayları |
| `Integration` | Provider bağlantı durumu |
| `SyncJob` | Entegrasyon sync log |

---

## Komutlar

```bash
npm run dev          # Geliştirme sunucusu (port 3001)
npm run build        # Production build
npm run start        # Production sunucusu
npm test             # Test suite (Vitest)

npx prisma studio    # Veritabanı görsel editörü
npx prisma db push   # Şema değişikliklerini uygula
npx prisma generate  # Prisma client'ı yeniden oluştur

docker compose up -d  # Lokal PostgreSQL başlat
docker compose down   # Lokal PostgreSQL durdur
```

---

## Ortam Değişkenleri

### Lokal Geliştirme

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı URL'si (lokal: `localhost:5432`) |
| `NEXTAUTH_SECRET` | JWT imzalama secret (en az 32 karakter) |
| `NEXTAUTH_URL` | Uygulamanın tam URL'si (`http://localhost:3001`) |

Secret üretmek için:
```bash
openssl rand -base64 32
```

### Prodüktif (Vercel)

Vercel dashboard'da ayarlanmış:
- `DATABASE_URL`: Supabase connection string (transaction mode pooler)
- `NEXTAUTH_URL`: `https://tramisup.vercel.app`
- `NEXTAUTH_SECRET`: Production secret

---

## Deploy

### Live Deploy

Vercel'de otomatik deploy aktif. GitHub'a push et:

```bash
git push origin main
```

Vercel GitHub'dan algılar ve otomatik deploy eder.

### Lokal Deploy Testi

```bash
npm run build
npm run start
```

---

## GitHub

**Repo:** [github.com/Zeroceko/Tramisup](https://github.com/Zeroceko/Tramisup) (private)

---

## Lisans

MIT
