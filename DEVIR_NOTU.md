# Tiramisup - Devir Notu (Guncel)

**Tarih:** 29 Mart 2026  
**Durum:** Devir ve devam gelistirme icin hazir

---

## 1) Kisa Ozet

Tiramisup, kurucuyu launch-oncesinden growth calisma duzenine tasiyan founder workspace urunudur.

Guncel ana farklar:
- Onboarding artik `/{locale}/onboarding` uzerinde modal-style cok asamali akis.
- Onboarding'de `GA4` / `Stripe` secilirse urun olusturma sonrasi otomatik Integrations handoff var.
- Growth setup, bagli kaynaklara gore source-aware secim davranisi gosteriyor.
- Metric kaynagi `MetricSetup` + `MetricEntry`.

---

## 2) Ilk 20 Dakika Kurulum

```bash
git clone https://github.com/Zeroceko/Tramisup.git
cd Tramisup
npm install
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

Test signup:
- `/{locale}/signup`
- Access code: `TT31623SEN`

Unit test:
```bash
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
```

---

## 3) Kritik Akislar

1. Signup tamamlanir.
2. Kullanici onboarding'e gider.
3. Product `POST /api/products` ile olusur.
4. Onboarding source intent `GA4`/`Stripe` ise `/{locale}/integrations` sayfasina otomatik yonlenir.
5. Kaynak wizard kurulumu acilir.
6. Growth setup ve Metrics giris ritmi ile devam eder.

---

## 4) Dikkat Edilecek Teknik Noktalar

- `Product.launchGoals` yalnizca legacy goal context icin duruyor; metric source-of-truth degil.
- GA4 sync modlari:
  - `overwrite`
  - `missing_dates`
- Sync bridge: `lib/sync-to-metric-entry.ts`
- Varsayilan locale: `en`
- Cookie + DB locale persistence aktif (`NEXT_LOCALE` + `User.preferredLocale`)

---

## 5) Oncelikli Sonraki Isler

1. P1 entegrasyonlar icin gercek OAuth/sync worker implementasyonu
2. Doc setinde kalan eski/planning dosyalarinin tek bir "active docs" setine indirgenmesi
3. Onboarding ve Integrations flow icin E2E regression senaryosu

---

## 6) Kaynak Dokumanlar

- `HANDOFF.md`
- `CLAUDE.md`
- `README.md`
- `PROJECT_SNAPSHOT.md`

