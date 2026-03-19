# Tramisu

Startup kurucuları için **launch'tan growth'a** aşamayı yöneten operasyon panosu.

Pre-launch hazırlık, metrik takibi, growth rutinleri ve entegrasyon altyapısını tek bir yerden yönet.

---

## Başlarken

### Gereksinimler

- Node.js 18+
- PostgreSQL

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle (DATABASE_URL, NEXTAUTH_SECRET)

# Veritabanı şemasını uygula
npx prisma db push

# Geliştirme sunucusunu başlat
npm run dev -- --port 3001
```

Uygulama `http://localhost:3001` adresinde açılır.

> **Not:** Port 3000 başka bir uygulama tarafından kullanılıyorsa `--port 3001` bayrağını kullan.

### İlk Kullanım

1. `/signup` adresine git ve hesap oluştur
2. Kayıt sırasında demo veri otomatik yüklenir
3. Dashboard'da gerçek veriyle dolu bir ekran görürsün

---

## Özellikler

| Modül | Açıklama |
|---|---|
| **Pre-Launch** | PRODUCT / MARKETING / LEGAL / TECH kategorilerinde checklist, öncelikli aksiyon takibi |
| **Metrics** | DAU, MAU, MRR, aktivasyon oranı manuel girişi; Recharts ile görselleştirme; retention kohort tablosu |
| **Growth** | Ölçülebilir hedefler, haftalık/aylık rutinler, milestone timeline |
| **Integrations** | Stripe, GA4, Mixpanel, Segment, Amplitude, PostHog bağlantı UI (sync altyapısı hazır) |

---

## Teknoloji Yığını

- **Framework:** Next.js 15 (App Router)
- **Dil:** TypeScript
- **Stil:** Tailwind CSS 3
- **Auth:** NextAuth.js 4 (JWT + credentials)
- **ORM:** Prisma 6
- **Veritabanı:** PostgreSQL
- **Grafikler:** Recharts
- **Şifreleme:** bcryptjs

---

## Proje Yapısı

```
app/
  page.tsx              → Landing page
  login/                → Giriş
  signup/               → Kayıt
  dashboard/            → Ana özet
  pre-launch/           → Launch hazırlık
  metrics/              → Metrik panosu
  growth/               → Hedefler ve rutinler
  integrations/         → Entegrasyon bağlantıları
  settings/             → Kullanıcı ayarları
  api/                  → API route'ları

components/             → UI bileşenleri
lib/
  auth.ts               → NextAuth yapılandırması
  prisma.ts             → Prisma client singleton
  seed.ts               → Demo veri yükleyici
prisma/
  schema.prisma         → Veritabanı şeması
```

---

## Komutlar

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm test             # Test suite

npx prisma studio    # Veritabanı görsel editörü
npx prisma db push   # Şema değişikliklerini uygula
```

---

## Ortam Değişkenleri

`.env.example` dosyasına bak. Zorunlu değişkenler:

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı URL'si |
| `NEXTAUTH_SECRET` | JWT imzalama secret (en az 32 karakter) |
| `NEXTAUTH_URL` | Uygulamanın tam URL'si |

Secret üretmek için:
```bash
openssl rand -base64 32
```

---

## Deploy

### Vercel (Önerilen)

1. GitHub'a push et
2. Vercel'de projeyi import et
3. Environment variables'ı ayarla:
   - `DATABASE_URL` → Neon veya Supabase bağlantı string'i
   - `NEXTAUTH_URL` → `https://tramisu.vercel.app`
   - `NEXTAUTH_SECRET` → yeni üretilmiş secret

### Hosted Veritabanı

Vercel ile en kolay entegrasyon için **Neon** (serverless Postgres) önerilir.

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

---

## Lisans

MIT
