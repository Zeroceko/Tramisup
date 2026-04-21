# New Team Handoff Prompt

Use the prompt below as the kickoff brief for the new product and engineering team taking over Tiramisup.

---

```text
Sen Tiramisup'ı kurucu ekipten devralıyorsun.

Tiramisup, erken aşama ürün ekipleri için bir kurucu işletim sistemidir. Kullanıcı lansman hazırlığını, growth metriklerini ve günlük execution'ı tek bir yerde takip eder. Her şey ürün bazlıdır: bir kullanıcının birden fazla ürünü olabilir, bir seferde biri aktiftir.

Bunu canlı production sistemi olarak ele al — prototip sandbox değil. Gerçek kullanıcılar zaten sistemde veya sisteme girmeye hazır. İş şu: production baseline'ı koru, ürünü gerçek kullanıcılarla doğrula, şirketi ücretli kullanıma taşı.

---

ÖNCE: Herhangi bir kod değiştirmeden önce şu sırayla bu belgeleri oku.

1. HANDOFF.md                                   — production durumu ve açık bulgular
2. CLAUDE.md                                    — kod kuralları ve neyin bozulmaması gerektiği
3. docs/handoff.md                              — mühendislik delta notları
4. docs/ai-agent-system-playbook.md             — AI pipeline mimarisi
5. docs/product-intake-question-playbook.md     — onboarding soru seti ve normalizasyon
6. docs/growth-transition-checkin-spec.md       — growth check-in spec

---

PRODUCTION DURUMU (21 Nisan 2026 itibarıyla)

- Production domain: https://tiramisup.app
- main branch Vercel'e otomatik deploy edilir
- Aktif main line: 0ec4162f commit'ine kadar tüm commit'leri içerir

Çalışan şeyler:
- Signup çalışıyor: step 1 (ad + email) → step 2 (şifre) → email doğrulama → auto-login
- Email doğrulama linki kullanıcıyı otomatik app'e alır, tekrar giriş gerekmez
- Auth hızlı: signup ~2.3s, login ~2.1s (bcrypt cost factor 8'e düşürüldü)
- Rate limiting: signup 5/15dk, forgot-password 3/15dk (IP başına)
- Onboarding animasyonlu adım geçişleri var
- AARRR metrik adımı LIVE + GROWING aşamaları için görünür
- Growth kickoff (?onboarding=1) sadece check-in formunu gösteriyor — eski banner/tracker/coach kart kaldırıldı
- Empty state temiz: ürün yokken settings, ürün seçici ve "ekle" linkleri gizli
- AI önerileri stage-aware ve kanıtsız spekülasyon yapmıyor
- Admin panel /{locale}/admin/* altında canlı

Bilinen UX sorunları (kod hatası değil, ürün kararı gerekir):
- Landing sayfasından signup'a direkt yol yok — "Join waitlist" inline email formu, signup sayfasına götürmüyor
- Email doğrulama duvarı: signup sonrası kullanıcı inbox'ını kontrol etmek zorunda, direkt app'e giremiyor
- Nav linkleri (Growth, Metrics, Tasks) sadece ürün oluşturduktan sonra görünür

---

EN ÖNEMLİ AÇIK SORULAR

Bu soruların cevabı yok. Yeni ekibin öncelikli görevi bunları gerçek kullanıcılarla doğrulamak.

1. AI gerçekten yardımcı oluyor mu?
   Founder Coach önerileri, gerçek kurucu olmayan gerçek kullanıcılarla, gerçek ürünler üzerinde test edilmedi.
   Çıktı, jenerik startup tavsiyesinden anlamlı ölçüde daha iyi mi? Bilinmiyor.

2. Core loop sticky mi?
   Ürün oluştur → metrik gir → teşhis al → task oluştur → tekrar et.
   Kullanıcılar ilk oturumdan sonra geri dönüyor mu? Bilinmiyor.

3. Onboarding'den değere yol çalışıyor mu?
   Sıfır kullanıcı → onboarding → growth teşhisi akışı iyileşti ama fresh account'la temiz bir end-to-end doğrulama henüz yapılmadı.

Bu üç soruyu çözene kadar büyük feature geliştirmeye başlama. Önce ürünün işe yarayıp yaramadığını öğren.

---

LOCAL KURULUM

  git clone <repo-url> && cd Tiramisup
  npm install
  npx prisma generate
  npx prisma db push
  npm run dev               # :3002 üzerinde çalışır

Doğrulama:
  npx tsc --noEmit
  npx next build
  QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run

Notlar:
  - Local dev port 3002 — Google ve Stripe OAuth redirect'leri bu porta göre ayarlı
  - DATABASE_URL PgBouncer'a işaret etmeli (port 6543)
  - DIRECT_URL direkt Postgres'e işaret etmeli (port 5432)
  - SUPABASE_SERVICE_ROLE_KEY upload flow için gerekli
  - __tests__/api/waitlist/admin.test.ts içinde 8 test 401 ile fail ediyor — bu pre-existing mock sorunu, mevcut işle ilgisi yok

Production E2E (gerçek kullanıcı yolculuğu testi):
  E2E_BASE_URL="https://tiramisup.app" \
  E2E_EMAIL="<doğrulanmış hesap>" \
  E2E_PASSWORD="<şifre>" \
  npx playwright test prod-real-user-journey --config playwright-prod.config.ts --headed

---

MİMARİ GERÇEKLER

- AgentLayoutShell: sol agent panel + sağ içerik — Dashboard, Pre-Launch, Growth için kullanılır
- PlainPageShell: full-width — Settings, Metrics, Integrations için
- Ürün oluşturma iki aşamalı:
    POST /api/products (hızlı create)
    POST /api/products/[id]/generate-plan (async AI plan)
    poll /api/products/[id]/plan-status
- Growth workspace modları:
    intake_needed → metric_setup_needed → baseline_needed → diagnosis_ready
- Growth intake cevapları Product.additionalContext.growthCheckin içinde saklanır
- AI provider chain değiştirilmemeli:
    Qwen → DeepSeek → Gemini → Gemini backup → static fallback
- MetricSetup ve MetricEntry veritabanı tabloları; Product.launchGoals legacy, üzerine yeni mantık kurma
- bcrypt cost factor: 8 (Vercel serverless performansı için optimize edildi)

---

BOZULMAMASI GEREKENLER

1. Signup'ta sahte ürün oluşturulmamalı — ürün verisi sadece onboarding'den sonra başlar
2. Yayındaki ürünler pre-launch dili veya nav'ı görmemeli
3. Growth rehberliği teşhis-odaklı kalmalı — jenerik startup tavsiyesi değil
4. Metrik girişi yapılandırılmış metriklere bağlı kalmalı
5. AI kanıt yokken spekülasyon yapmamalı
6. Kullanıcının yazdığı ürün açıklaması tüm AI çağrıları için merkezi bağlam olmaya devam etmeli
7. İngilizce master locale'dir
8. Agent panel kartları task oluşturmalı — chat mesajı göndermemeli
9. Billing gerçek Stripe commerce olarak sunulmamalı
10. HIGH öncelik sadece gerçek bir blocker anlamına gelir
11. Canlı email şablonlarını kasıtsız yeniden yazma
12. GROWING onboarding'i belirsiz AARRR preview'a geri döndürme

---

BİLİNEN TEKNIK BORÇ

- Billing: hâlâ fake/demo activation
- Landing → signup yolu: direkt link yok
- i18n gaps: bazı authenticated ekranlarda hardcoded stringler var
- Roadmap integrations: RevenueCat, App Store Connect, Google Play, reklam konnektörleri UI-first placeholder
- Product.launchGoals: legacy field — üzerine yeni mantık kurma
- Growth kickoff check-in'deki bazı sorular onboarding'de zaten soruluyor — deduplication eksik
- RESEND_FROM_EMAIL Vercel env'de "Tiramisup <hello@tiramisup.app>" olarak set edilmeli

---

ERİŞİM DEVİR LİSTESİ

- GitHub repo erişimi
- Vercel proje erişimi (zerocekos-projects/tramisup)
- Supabase proje erişimi (ojecebxxcbxrofnbkaae, eu-west-3)
- Google Cloud Console erişimi (OAuth)
- Stripe Dashboard erişimi
- Resend hesap erişimi
- Domain / DNS erişimi (tiramisup.app)
- Tüm Vercel production environment variables

---

Şüphe durumunda: production baseline'ı koru, tradeoff'u belgele, bir yüzeyi değiştir.
```
