# Sprint 5 — Güven ve Teslimat

**Başlangıç:** 22 Mart 2026
**Hedef:** Gerçek kullanıcılar davetiye e-postası alıyor, AI insights kartı tutarlı çalışıyor, settings sayfası session-gated, admin hesabı local ve production'da uyumlu.
**Milestone:** M002 kapanıyor, M003'e geçiş hazır

---

## Retrospektif — Sprint 4

### Tamamlandı ✅

- **S1 — Unauthenticated guard — inner surface'lar:** Pre-launch, tasks, metrics, growth — dört sayfada da `redirect(/${locale}/login)` doğrulandı. S5 smoke test 8/8 geçti.
- **S2 — Metrik giriş formu — end-to-end doğrulama:** `POST /api/metrics` çalışıyor, form empty submit hata mesajı gösteriyor, `router.refresh()` page'i güncelliyor, ownership check var.
- **S3 — Görev yönetimi — durum toggle doğrulama:** Status toggle çalışıyor, ownership check enforced, DB güncelleniyor.
- **S5 — Pre-launch → growth geçişi smoke testi:** LaunchButton tıklandı, PATCH `/api/products/[id]` çağrıldı, dashboard growth moduna geçti, GrowthChecklistSection toggle optimistic update + DB persist ile doğrulandı.
- **S6 — STATE.md + REQUIREMENTS.md güncelleme:** Sprint 4 çıktıları STATE.md ve REQUIREMENTS.md'ye yansıtıldı.

### Kısmi ⚠️

- **S4 — Resend API key — production wiring:** `RESEND_API_KEY` Vercel'e eklendi ama `onboarding@resend.dev` gönderen adresi yalnızca `ozerocek@gmail.com` adresine e-posta atabilir. Gerçek kullanıcı e-postaları gitmeyecek. Domain verification (`tiramisup.com` → Resend'de verified sender) yapılmadı. Kod doğru çalışıyor; sorun tamamen konfigürasyon.
- **AI insights kartı:** `extractInsights()` fonksiyonu ve better logging partial commit olarak bırakıldı, build çalıştırılmadı. "Belirgin bir eksik bulunamadı" mesajı yanlış gösteriliyor — DeepSeek `{ "insights": [] }` döndürüyor, empty array `done && insights.length === 0` state'ine düşüyor ve bu state `InsightsCard.tsx` satır 79'da "AI analiz tamamlanamadı" gösteriyor. Session bug: bu da orijinal bug değil — orijinal sorun muhtemelen `extractInsights()` öncesinde farklı bir JSON key dönmesiydi. Mevcut `extractInsights()` kodu build'e alınmadı.

### Başlamadı ❌

- **Production browser smoke testi — full PRE_LAUNCH → LAUNCHED:** `REQUIREMENTS.md` R003'te "Not started" olarak işaretli. Production'da browser ile hiç doğrulanmadı.
- **Settings session guard:** `app/[locale]/settings/page.tsx` satır 8-9'da `getServerSession` çekiliyor ama `!session?.user?.id` kontrolü ve `redirect` yok. Unauthenticated kullanıcı settings sayfasını açarsa `null` user ile SettingsForm render ediliyor.

### Drift 📄

- **HANDOFF.md "Email sending" notu:** Çelişkili iki şeyi aynı anda söylüyor — bir yerde "wired and triggered on approval" yazıyor, bir yerde "needs RESEND_API_KEY" yazıyor. Kısmen düzeltildi ama asıl sorun (onboarding@resend.dev kısıtı) hiç belgelenmiyor. Gerçek durum: RESEND_API_KEY set ama gönderim yalnızca `ozerocek@gmail.com` adresine gidiyor.
- **REQUIREMENTS.md R005:** "AI insights caching not built" ve "Dashboard AI insights card — Done" aynı anda geçiyor. Kart "Done" ama kart içindeki analiz sonuçları güvenilir çalışmıyor (empty insights bug açık). Bu tutarsızlık izlenmiyor.

---

## State Inventory

Kod kontrolüne dayanıyor (22 Mart 2026):

| Surface | Route | Gerçek Durum | Notlar |
|---|---|---|---|
| Landing | `/tr`, `/en` | ✅ Çalışıyor | CTA → WaitlistModal; session guard yok (public) |
| Waitlist thank-you | `/{locale}/waitlist/thank-you` | ✅ Çalışıyor | Redirect destination |
| Signup | `/{locale}/signup` | ✅ Çalışıyor | `TT31623SEN` + DB invite code kabul ediyor |
| Login | `/{locale}/login` | ✅ Çalışıyor | Credentials auth; hata mesajı gösteriyor |
| Dashboard (empty) | `/{locale}/dashboard` | ✅ Çalışıyor | "İlk ürününü oluştur" CTA, session-gated değil ama null product empty state gösteriyor |
| Dashboard (ürünle) | `/{locale}/dashboard` | ✅ Çalışıyor | PRE_LAUNCH / LAUNCHED'a göre farklı içerik; AI insights card mevcut |
| Product wizard | `/{locale}/products/new` | ✅ Çalışıyor | 6 soru, URL scrape, AI plan, launchStatus mapping |
| Pre-launch | `/{locale}/pre-launch` | ✅ Çalışıyor | Session guard var (redirect), LaunchButton çalışıyor |
| Tasks | `/{locale}/tasks` | ✅ Çalışıyor | Session guard var, ownership check, status toggle |
| Metrics | `/{locale}/metrics` | ✅ Çalışıyor | Session guard var, form submit çalışıyor, chart var |
| Growth | `/{locale}/growth` | ✅ Çalışıyor | Session guard var, GrowthChecklistSection + goals + routines |
| Admin | `/{locale}/admin/waitlist` | ✅ Çalışıyor | Auth guard, approve → invite code üretiliyor; e-posta kodda var ama domain kısıtlı |
| Products listing | `/{locale}/products` | ✅ Çalışıyor | Session guard var |
| Integrations | `/{locale}/integrations` | ⚠️ Kısmi | Session guard YOK (`session?.user?.id` null-safe ama redirect yok), "Coming soon" banner var, gerçek veri yok |
| Settings | `/{locale}/settings` | ⚠️ Kısmi | Session guard YOK — redirect yok, null user ile form render ediliyor; `PATCH /api/settings` 401 veriyor ama sayfa görünür |
| AI Insights | `GET /api/products/[id]/insights` | ⚠️ Kısmi | `extractInsights()` kodu yazıldı ama build'e alınmadı; empty insights bug aktif; her tıklamada scrape yapıyor |

---

## Sprint 5 — Güven ve Teslimat

**Süre:** 1 hafta
**Hedef:** Gerçek bir kullanıcıya erken erişim daveti gönderildiğinde e-postası geliyor, AI insights kartı boş sonuç göstermiyor, kayıtlı olmayan kullanıcı settings veya integrations sayfasına erişemiyor.
**Milestone ilerleme:** M002 — tüm operator loop kriterleri kapanıyor (%100); M003 — zemin hazırlanıyor
**Principal-PM alignment:** HANDOFF.md "What Still Needs Work" — Yüksek öncelik 1 ve 2; session bug tüm surface'larda kapatılıyor.

---

### Sliceler

#### S1 — AI insights bug — empty array fix + build doğrulama
- **Owner:** fullstack-developer
- **Kapsam:** `app/api/products/[id]/insights/route.ts`, `components/InsightsCard.tsx`
- **İş:** Partial commit'teki `extractInsights()` düzeltmesi build'e alınıyor ve doğrulanıyor. Asıl sorun tespit ediliyor: eğer DeepSeek `{ "insights": [] }` döndürüyorsa prompt sorunlu demektir — INSIGHTS_PROMPT'a "En az 5 insight döndür, içerik yetersizse genel tavsiye ver" talimatı ekleniyor. `InsightsCard.tsx`'deki `state === "done" && insights.length === 0` durumu için mesaj "AI analiz tamamlanamadı" yerine "Analiz hazır ama eksik bulunamadı — farklı bir URL dene" şeklinde güncelleniyor.
- **Kabul:**
  - `npm run build` temiz geçiyor
  - Dashboard'da bir ürün URL'siyle "Analiz et" tıklandığında 5+ insight dönüyor (boş array değil)
  - Eğer gerçekten içerik alınamazsa "Site içeriği okunamadı" mesajı gösteriyor (no-content state)
  - Tüm 82 test geçiyor
- **Not:** Bu slice S2'den önce tamamlanmalı — build bozuk olduğu sürece başka commit atılmaz.

#### S2 — Session guard — settings + integrations sayfaları
- **Owner:** fullstack-developer
- **Kapsam:** `app/[locale]/settings/page.tsx`, `app/[locale]/integrations/page.tsx`
- **İş:** Her iki sayfaya `if (!session?.user?.id) redirect(/${locale}/login)` ekleniyor. `settings/page.tsx`'de params'dan `locale` alınıyor (şu an yok — `IntegrationsPage`'e bakarak pattern alınıyor). `integrations/page.tsx`'de aynı pattern var ancak redirect eksik.
- **Kabul:**
  - Giriş yapmamış kullanıcı `/tr/settings` ve `/tr/integrations`'a gittiğinde `/tr/login`'e yönlendiriliyor
  - Locale prefix doğru: `/${locale}/login`
  - 82 test geçiyor, build temiz

#### S3 — Resend domain — `tiramisup.com` gönderen adresi
- **Owner:** fullstack-developer (Vercel + Resend konfigürasyon — kod değişikliği de gerekiyor)
- **Kapsam:** Resend dashboard (domain verification), `lib/email.ts`, Vercel env vars
- **İş:** Resend'de `tiramisup.com` domain'i verified sender olarak ekleniyor. DNS kayıtları ekleniyor (MX, SPF/DKIM). `lib/email.ts` satır 19'daki `from: "Tiramisup <onboarding@resend.dev>"` → `from: "Tiramisup <invite@tiramisup.com>"` (veya `onboarding@tiramisup.com`) olarak güncelleniyor. Admin panelinden bir test approval yapılıyor ve gerçek bir inbox'ta e-posta görünüyor.
- **Kabul:**
  - `waitlist` girdisi approve edildiğinde e-posta gerçek bir inbox'a gidiyor (`ozerocek@gmail.com` değil, başka bir adrese)
  - `lib/email.ts`'deki `from` adresi `resend.dev` domain'i kullanmıyor
  - `RESEND_API_KEY` kısıtı HANDOFF.md'de doğru belgelenmiş
  - `printf 'value' | vercel env add RESEND_API_KEY production` ile set edilmişti — env var doğrulanıyor, trailing newline yok
- **Bağımlılık:** S1 tamamlanmış, build temiz olmalı

#### S4 — BUG-02 — admin@tiramisup local hash senkronu
- **Owner:** fullstack-developer
- **Kapsam:** Local DB (`localhost:5432/tramisu`), `scripts/` veya migration
- **İş:** Local DB'deki `admin@tiramisup` kullanıcısının şifre hash'i `t1ram1sup` ile uyumlu hale getiriliyor. Bunun için: ya local'de şifre sıfırlanıyor (Prisma Studio veya script ile bcrypt hash üretilip update), ya da bir seed/fixture script yazılıyor. Sonuç: local'de `admin@tiramisup` / `t1ram1sup` çalışıyor.
- **Kabul:**
  - Local dev'de `admin@tiramisup` / `t1ram1sup` ile login başarılı
  - `/tr/admin/waitlist` erişilebilir
  - Değişiklik üretim DB'ye dokunmuyor (production Supabase'de zaten çalışıyor)
  - S5 smoke test'teki BUG-02 kapalı olarak işaretleniyor

#### S5 — Production smoke testi — full operator loop
- **Owner:** qa-tester
- **Kapsam:** `https://tramisup.vercel.app` (production), tarayıcı
- **İş:** R003'teki eksik production doğrulaması tamamlanıyor. Adımlar: production'da yeni hesap aç → ürün oluştur (URL'li) → pre-launch sayfasına git → "Ürünümü launch ettim →" tıkla → dashboard'ın growth moduna geçtiğini doğrula → `/tr/growth` checklist toggle'la → dashboard'daki hedef sayısını kontrol et → "Analiz et" tıkla → insights gösteriyor.
- **Kabul:**
  - Her adım geçiyor; blocker varsa derhal S6'ya taşınıp önce çözülüyor
  - Sonuçlar `S5_SMOKE_TEST.md`'nin yanına `PROD_SMOKE_TEST.md` olarak yazılıyor
  - R003 ve R005 production column'u "Verified in production" olarak güncelleniyor

#### S6 — HANDOFF + STATE + REQUIREMENTS güncelleme
- **Owner:** docs-updater
- **Kapsam:** `HANDOFF.md`, `.gsd/STATE.md`, `.gsd/REQUIREMENTS.md`
- **İş:** Sprint 5 çıktılarını yansıtacak şekilde güncelleme. Özellikle: (1) AI insights bug kapalı, (2) settings/integrations guard var, (3) e-posta domain doğrulandı, (4) BUG-02 kapandı, (5) production loop doğrulandı. HANDOFF.md "What Still Needs Work" bölümü M003'e hazırlık maddelerine taşınıyor.
- **Kabul:**
  - `HANDOFF.md` "What Still Needs Work" bölümünde Sprint 5'te kapatılan maddeler yok
  - STATE.md'deki Known Issues tablosunda BUG-02 ve MISSING-01 (email) "Resolved" olarak işaretli
  - REQUIREMENTS.md R003 production smoke test "Done" olarak güncellendi

---

## Kural Hatırlatmaları (bu sprint için)

- S1 bitmeden başka hiçbir commit atılmaz — build bozukken üstüne çalışılmaz
- `redirect` çağrılarında her zaman `/${locale}/login` — bare `/login` yok; `settings/page.tsx`'e `params: Promise<{ locale: string }>` eklenmesi gerekiyor
- Resend `onboarding@resend.dev` sadece verified kişilere gider — domain kurulumu olmadan S3 acceptance kabul edilmez
- Local DB değişikliği (S4) script veya Prisma Studio ile yapılır; migration yazmak gerekmez; production'a dokunulmaz
- S5 smoke testinde blocker çıkarsa sprint planner'a bildirilir, yeni S0 acil slice açılır

---

## Bu Sprintte Kapsam Dışı

- **AI insights caching** — her "Analiz et" tıklamasında yeniden scrape yapılıyor; pahalı ama kabul edilebilir. M003 sonrasına ertelendi (DEFERRED-01).
- **Multi-product switcher UI** — schema hazır, UX M004. Ayrı sprint gerektirir.
- **Kanban board** — M003/S04. Ayrı sprint gerektirir.
- **Şifre sıfırlama / email doğrulama** — early-access phase'inde kritik değil (R001, DEFERRED-03).
- **Stripe / gerçek analytics entegrasyonları** — M005, operator loop stabil olmadan başlanmaz.
- **Integrations gerçek veri sync** — "Coming soon" banner kalıyor; bu sprint sadece auth guard ekleniyor, içerik dokunulmuyor.
