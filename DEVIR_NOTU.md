# Tiramisup — Devir Notu (v0.2.0)

**Tarih:** 26 Mart 2026
**Hazirlayan:** Ozer + Claude (AI dev pair)
**Versiyon:** 0.2.0
**Prod URL:** https://tramisup.vercel.app
**Repo:** https://github.com/Zeroceko/Tramisup

---

## Proje Nedir?

Tiramisup, erken asamadaki startup kurucularini launch'tan growth'a kadar yonlendiren bir "founder co-pilot" uygulamasi. Kullanici urununu tanimlar, neyi takip edecegini secer, gunluk veri girer, trendleri gorur ve AI mentorluk alir.

Turkce-first bir urun. Arayuz ve AI ciktilari Turkce.

---

## Calistigin Ilk 30 Dakika

```bash
# 1. Repo'yu kur
git clone https://github.com/Zeroceko/Tramisup.git
cd Tramisup
npm install

# 2. Env dosyasini olustur
cp .env.example .env.local
# .env.local icine asagidaki key'leri doldur (Ozer'den al):
# DATABASE_URL, NEXTAUTH_SECRET, QWEN_API_KEY, DEEPSEEK_API_KEY,
# GEMINI_API_KEY, GEMINI_API_KEY_2, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
# STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET

# 3. Prisma'yi hazirla
npx prisma generate
npx prisma db push

# 4. Dev server'i baslat
npm run dev
# http://localhost:3002 acilir

# 5. Test kullanicisi olustur
# /tr/signup adresine git, erisim kodu: TT31623SEN

# 6. Testleri calistir
npm test
# 65 test gecmeli
```

**Onemli:** Supabase free tier kullaniliyor. DB uzun sure kullanilmazsa pause'a girer. Supabase dashboard'dan resume et.

---

## Teknik Yapi (Kisa Ozet)

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS 3 |
| Dil | TypeScript 5 |
| Auth | NextAuth 4 (Credentials + JWT) |
| DB | Prisma + PostgreSQL (Supabase) |
| AI | Qwen → DeepSeek → Gemini (fallback zinciri) |
| Grafikler | Recharts |
| i18n | next-intl |
| Test | Vitest (unit) + Playwright (E2E) |
| Deploy | Vercel (auto-deploy on push to main) |

---

## Uygulama Akisi

```
Signup → Urun olustur → [PRE_LAUNCH] → Launch checklist tamamla → [LAUNCHED]
→ AARRR metrik sec → Gunluk veri gir → Trendleri gor → Hedef koy → Growth checklist
→ AI mentor'dan tavsiye al
```

### Sayfa Haritasi

| Sayfa | Yol | Ne Yapar |
|-------|-----|----------|
| Dashboard | `/[locale]/dashboard` | Next-step karti, ozet, quick link'ler |
| Growth | `/[locale]/growth` | AARRR metrik secimi, checklist, hedefler, routineler |
| Metrics | `/[locale]/metrics` | Gunluk veri girisi, trend chart, funnel health |
| Tasks | `/[locale]/tasks` | Gorev listesi, hizli baslat/tamamla |
| Pre-launch | `/[locale]/pre-launch` | Launch checklist (Product/Marketing/Legal/Tech) |
| Settings | `/[locale]/settings` | 3 bolum: Entegrasyonlar, Growth Tracking, Profil |
| Integrations | `/[locale]/integrations` | GA4/Stripe baglantisi, sync kontrol, roadmap |
| Overview | `/[locale]/products/[id]/overview` | Urun olusturma sonrasi ozet |

---

## Veritabani Modelleri (Onemli Olanlar)

### MetricSetup (YENi — v0.2.0)
Urun basina 1 tane. Kullanicinin sectigi AARRR metrikleri, platformlar, ve founder ozeti burada.

```
MetricSetup
├── selections: Json (FunnelMetricSelection[])
├── platforms: String[]
├── ignoredChecklistIds: String[]
├── founderSummary: Json?
└── entries: MetricEntry[]
```

### MetricEntry (YENi — v0.2.0)
Urun + gun basina 1 satir. Kullanicinin girdigi AARRR funnel degerleri.

```
MetricEntry
├── productId + date (unique)
├── values: Json (Record<stage, number>)
└── metricSetupId (FK)
```

### Metric (Entegrasyon verisi)
GA4/Stripe'dan sync edilen gunluk metrikler (DAU, MAU, MRR, churn vs.)

### Product
Ana calisma alani. Status: `PRE_LAUNCH | LAUNCHED | GROWING`

> **Not:** `Product.launchGoals` kolonu hala schema'da ama hicbir kod tarafindan kullanilmiyor. Guvenle silinebilir.

Tam schema: `prisma/schema.prisma`

---

## AI Sistemi

### Provider Zinciri
```
Qwen (qwen-plus) → DeepSeek (deepseek-chat) → Gemini (2.0-flash) → Gemini backup → Static fallback
```
Hepsi basarisiz olursa hardcoded Turkce cevaplar doner. Uygulama crash etmez.

### Onemli Dosyalar
| Dosya | Gorev |
|-------|-------|
| `lib/founder-coach.ts` | Ana AI motoru, AARRR verisi enjekte eder |
| `lib/founder-coach-context.ts` | Product state'ini AI icin toplar |
| `lib/founder-coach-agent.ts` | Skill-based routing (hangi bilgi lazim?) |
| `lib/metric-context.ts` | Metrik snapshot + Turkce context string |
| `lib/ai-advice.ts` | Genel AI tavsiye cagrilari |
| `orchestrator.ts` | Provider fallback zinciri |

### AI Kurali
AI **asla** elinde veri olmadan sorun varsaymaz. "Churn'un yuksek" demez eger churn verisi yoksa. Bu temel prensip.

---

## Entegrasyon Sistemi

| Oncelik | Provider'lar | Durum |
|---------|-------------|-------|
| **P0** | GA4, Stripe | Calisiyor — OAuth + sync aktif |
| **P1** | RevenueCat, App Store Connect, Google Play, Meta Ads | Enum var, kod yazilmadi |
| **P2** | Google Ads, TikTok Ads, AppsFlyer | Sadece placeholder |

Entegrasyon dosyalari:
- `lib/integrations-catalog.ts` — Tum provider tanimlari
- `lib/integration-recommendations.ts` — Secilen metriklere gore oneri
- `lib/ga4-admin.ts` — Google Analytics Admin API
- `BrandLib/sync/ga4.ts` — GA4 sync worker
- `app/api/integrations/` — OAuth callback ve sync API route'lari

---

## Bilmen Gereken Pattern'ler

### 1. Unified Next-Step (`lib/next-step.ts`)
Tum sayfalarda ayni mantik: kullanicinin siradaki en onemli adimini dondurur.
```
CREATE_PRODUCT → COMPLETE_LAUNCH_CHECKLIST → SETUP_METRICS →
ENTER_FIRST_VALUES → DEFINE_GOAL → ADVANCE_CHECKLIST → DAILY_METRICS
```

### 2. Stage-Aware Navigation (`components/DashboardNav.tsx`)
- **Pre-launch:** Overview → Launch → Tasks (Growth preview)
- **Launched:** Overview → Tasks → Metrics → Growth (Launch preview)

### 3. MetricSetup CRUD (`lib/metric-setup.ts`)
DB-backed CRUD fonksiyonlari:
- `getMetricSetup(productId)` — Setup + entries getirir
- `saveMetricSelections(productId, selections)` — AARRR secimlerini kaydeder
- `saveMetricEntry(productId, date, values)` — Gunluk deger kaydeder
- `updateIgnoredChecklistIds(productId, ids)` — Checklist ignore listesini gunceller
- `updateFounderSummary(productId, summary)` — AI ozetini kaydeder

### 4. Settings Hub (`app/[locale]/settings/page.tsx`)
3 bolum: Entegrasyonlar (bagli provider durumu), Growth Tracking (metrik setup'a link), Profil (SettingsForm).

---

## Test Durumu

**Unit testler:** 7 dosya, 65 test (Vitest)
```
__tests__/api/auth/signup.test.ts    — 12 assertion
__tests__/api/waitlist/join.test.ts  — 11 assertion
__tests__/api/waitlist/check.test.ts
__tests__/api/waitlist/admin.test.ts
__tests__/lib/auth.test.ts
__tests__/lib/metric-context.test.ts — 7 test case
```

**E2E testler:** 5 Playwright dosyasi (`npm run test:e2e`)

**Calistirmak icin:**
```bash
npm test          # unit testler
npm run test:e2e  # e2e testler (Playwright)
```

---

## Yapilmasi Gerekenler (Oncelik Sirasina Gore)

### Yuksek Oncelik
1. **P1 entegrasyon sync worker'lari** — RevenueCat, App Store Connect, Google Play, Meta Ads icin OAuth + sync kodu yazilacak
2. **Email bildirim akisi** — Waitlist onay, onboarding emailleri
3. **Coklu urun gecis UX'i** — Urun secici var ama daha akici olabilir
4. **`Product.launchGoals` kolonunu sil** — Schema'da duruyor, hicbir kod kullanmiyor. `prisma migrate dev` ile kaldir

### Orta Oncelik
5. Founder Coach'a yeni modlar ekle (taslak gorev / taslak metrik / taslak checklist olusturma)
6. Website / SEO analizi (sadece context tetiklediginde)
7. Retention cohort gorsellestirme
8. Activation funnel drill-down

### Dusuk Oncelik
9. Figma design system uyumu
10. PWA / mobil optimizasyon
11. Takim / isbirligi ozellikleri

---

## Bozulmamasi Gerekenler (Mutlaka Oku)

1. **Signup'ta sahte veri yok.** Yeni kullanici bos workspace gorur.
2. **Launched urunler pre-launch UX'inde sikisamaz.** Stage-aware navigation bunu onler.
3. **Growth pre-launch icin preview, launched icin workspace.** Bu ayrim kasitli.
4. **Metrik girisi secilen setup'a bagli.** `MetricSetup` tablosu kaynak.
5. **AI veri olmadan sorun varsaymaz.** Evidence-first prensip.
6. **Kullanicinin urun aciklamasi merkezi context.** AI prompt'larinda her zaman kullanilir.
7. **Urun yonlendirir, ders vermez.** Ton sakince, yardimci.
8. **`MetricSetup`/`MetricEntry` tablolari kaynak.** Asla `launchGoals` JSON'a geri donme.

---

## Klasor Yapisi (Onemli Parcalar)

```
app/
├── [locale]/
│   ├── dashboard/      — Ana sayfa
│   ├── growth/         — AARRR setup + checklist
│   ├── metrics/        — Veri girisi + trendler
│   ├── tasks/          — Gorev yonetimi
│   ├── pre-launch/     — Launch checklist
│   ├── settings/       — Ayarlar hub'i
│   ├── integrations/   — Entegrasyon marketplace
│   └── products/       — Urun olusturma + overview
├── api/
│   ├── advisor/        — AI mentor endpoint
│   ├── auth/           — Signup/signin
│   ├── metrics/        — MetricEntry CRUD
│   ├── products/       — Product + MetricSetup CRUD
│   ├── integrations/   — OAuth + sync
│   ├── checklist/      — Checklist toggle
│   └── waitlist/       — Waitlist yonetimi
components/             — React componentleri
lib/                    — Is mantigi, AI, metrik, entegrasyon
prisma/                 — Schema + migration'lar
scripts/                — Migration script'leri
BrandLib/               — Sync worker'lar
```

---

## Iletisim

Key'ler ve Supabase/Vercel erisimi icin Ozer'e ulas.

---

*Bu dokuman v0.2.0 icin gecerlidir. Detayli teknik referans icin `HANDOFF.md` dosyasina bak.*
