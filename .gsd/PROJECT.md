# Project

## What This Is

Tiramisup, founder ve küçük startup ekipleri için launch-to-growth operating workspace. Tek bir ürün veya ileride birden fazla ürün için launch hazırlığı, growth readiness, görev takibi, metrik takibi, hedefler, rutinler ve entegrasyon durumunu tek sistemde toplamayı hedefler.

Bugün ürünün çalışan çekirdeği şudur: kullanıcı kayıt olur, ilk login’de kısa bir welcome/onboarding yüzeyi görür, ilk ürününü wizard ile oluşturur, ürün stage’ine göre launch veya growth yüzeylerine ilerler, launched ürünlerde önce hangi sayıları takip edeceğini seçer, sonra günlük metrik girişi yapar, sonra değişimi ve görev yüzeyini takip eder.

## Core Value

Founder’ın “ürünüm şu an nerede, risk nerede ve sıradaki doğru adım ne?” sorusunu tek product workspace içinde cevaplayabilmesi.

## Current State

- Credentials tabanlı auth çalışıyor (signup/login/next-auth JWT session)
- Signup sonrası varsayılan `Product` yaratılmıyor; ilk ürün kullanıcı tarafından wizard içinde oluşturuluyor
- Multi-product veri modeli schema’de hazır (`User -> Product[]`), ama UX hâlâ büyük ölçüde tek aktif ürün varsayıyor
- Dashboard stage-aware çalışıyor: no-product durumda welcome/profile onboarding, pre-launch durumda launch yönlendirmesi, launched durumda next-step yönlendirmesi
- Pre-launch yüzeyi çalışıyor: launch checklist + task listesi + readiness score
- Metrics yüzeyi çalışıyor: seçilen ana metrikler için günlük giriş, last-value yardımı, trend görünümü ve previous-entry karşılaştırması
- Growth yüzeyi çalışıyor: neyin takip edileceğini seçme ve takip odağını yönetme yüzeyi
- Integrations yüzeyi çalışıyor ama mostly façade: bağlanma/test shell’i var, gerçek veri senkronu yok
- Settings yüzeyi çalışıyor: user + ilk ürün ayarları güncellenebiliyor
- `GrowthChecklist` ve gerçek kanban board deneyimi schema’de var ama ayrı ürün akışı olarak tamamlanmış değil
- Build temiz; dev runtime tarafında zaman zaman cache/manifest kaynaklı Next.js sorunları görülebiliyor

## Architecture / Key Patterns

- Next.js 15 App Router
- Server components by default; interaktif yüzeyler client component
- NextAuth credentials provider + JWT session
- Prisma client singleton (`lib/prisma.ts`)
- Ana domain modeli `Product`; feature verilerinin çoğu `productId` ile bağlı
- Authenticated sayfalar `AppShell` ile sarılıyor
- Tasarım sistemi çekirdeği: `PageHeader`, `StatCard`, `DashboardNav`, `AppShell`
- Seed mantığı `lib/seed.ts` içinde; ancak AI unavailable olduğunda generic fake workspace verisi üretmemek artık ürün kuralı
- Integrations için `Integration` + `SyncJob` modeli var; gerçek sync orchestration henüz yok

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: Product Foundation Reset — runtime, docs ve auth/seed tabanını güvenilir hale getir
- [ ] M002: True MVP Operator Loop — tek ürün için create product → launch control → metrics → growth loop’unu tamamla
- [ ] M003: Cohesive Product Experience — tüm iç sayfaları tek sistem hissi verecek şekilde hizala
- [ ] M004: Multi-Product Experience — schema’deki multi-product modelini gerçek UX’e dönüştür
- [ ] M005: Real Integrations — Stripe ve analytics kaynaklarından gerçek veri akışı kur
- [ ] M006: Collaboration and Automation — ekip, review ritmi, alert ve automation katmanını ekle
