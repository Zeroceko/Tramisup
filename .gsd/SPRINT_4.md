# Sprint 4 — Core Loop Derinleştirme

**Başlangıç:** 22 Mart 2026
**Hedef:** Kullanıcı kayıt olduktan sonra işe yarayan, gerçek veriyle dolu bir workspace'e kavuşur. Davetiye e-postası çalışır, metriklere veri girilebilir, görevler yönetilebilir.
**Milestone:** M002 → M003 geçiş köprüsü

---

## Retrospektif — Sprint 3

### Tamamlandı ✅

- **S1 — launchStatus → product.status mapping:** `app/api/products/route.ts` satır 79'da `["Launch oldu", "Büyüme aşamasında"].includes(launchStatus)` kontrolü doğru çalışıyor. Wizard'dan gelen status DB'ye doğru yazılıyor.
- **S2 — "Ürünümü launch ettim" butonu:** `LaunchButton` component mevcut, `PATCH /api/products/[id]/route.ts` çalışıyor, pre-launch sayfasında `product.status === "PRE_LAUNCH"` koşuluyla gösteriliyor.
- **S3 — Dashboard launch durumuna göre değişir:** Dashboard `product.status === "LAUNCHED"` karşılaştırmasına göre farklı quick-action listesi ve CTA gösteriyor. İki durum için farklı içerik doğrulandı.
- **S4 — Dashboard AI insights kartı:** `InsightsCard` component mevcut, `GET /api/products/[id]/insights/route.ts` DeepSeek primary + Gemini fallback ile çalışıyor. `product.website` varsa kart gösteriliyor.
- **S5 — Growth checklist erişimi:** `GrowthChecklistSection` component `app/[locale]/growth/page.tsx`'te mevcut, `PATCH /api/growth-checklist/[id]/route.ts` toggle için çalışıyor.
- **S6 — Build + test + smoke:** 58/58 test geçiyor (doğrulandı, az önce çalıştırıldı). Build temiz.

### Kısmi ⚠️

- **E-posta gönderimi:** `lib/email.ts` ve `sendInviteEmail` fonksiyonu tam yazılmış. `PATCH /api/waitlist/[id]` approve edildiğinde `sendInviteEmail` çağrılıyor. Ancak `RESEND_API_KEY` ne production'da ne local'de set edilmiş — dolayısıyla e-postalar gönderilmiyor, sadece console'a loglama yapılıyor. Kod doğru, tetikleyici doğru, yalnızca env var eksik.
- **Pre-launch session guard:** `app/[locale]/pre-launch/page.tsx` session'ı çekiyor ama unauthenticated kullanıcıyı `redirect` ile dışarı atmıyor — `session?.user?.id` ile null-safe sorgu yapıyor, product bulunamayınca sessizce boş checklist gösteriyor. Güvenlik açığı değil ama hatalı UX var.
- **Growth/tasks/metrics session guard:** Aynı pattern. Session yoksa `session?.user?.id` undefined gelince DB'den sonuç dönmüyor, sayfalar "Ürün bulunamadı" empty state gösteriyor ama `redirect` yok.

### Başlamadı ❌

- **DB-backed davetiye kodu wiring:** Admin paneli `inviteCode` üretiyor ve DB'ye yazıyor. Signup route `waitlist.inviteCode` alanını kontrol ediyor. Ama bu kodların kullanıcıya ulaşması için Resend API key gerekmeli.
- **Kullanıcı profil/ayarlar sayfası:** `app/[locale]/settings/page.tsx` mevcut ama içeriği bilinmiyor.
- **Metrik giriş formunun validasyonu:** Form var ama submit edince ne olduğu test edilmedi.

### Drift 📄

- **HANDOFF.md "Email sending on waitlist approval — not triggered yet":** Bu yanlış. Kod trigger ediliyor, `sendInviteEmail` çağrılıyor. Sorun sadece `RESEND_API_KEY` eksikliği. Docs bunu "kod yok" olarak gösteriyor ama "API key eksik" olarak düzeltilmeli.
- **STATE.md:** Sprint 2 öncesi state. Growth readiness checklist ve AI insights gibi sprint 3 çıktılarını yansıtmıyor.

---

## State Inventory

| Surface | Route | Gerçek Durum | Notlar |
|---|---|---|---|
| Landing | `/tr`, `/en` | ✅ Çalışıyor | CTA → WaitlistModal, yeni messaging |
| Waitlist | modal + `/api/waitlist/join` | ✅ Çalışıyor | DB'ye yazıyor, thank-you redirect var |
| Signup | `/{locale}/signup` | ✅ Çalışıyor | `TT31623SEN` veya DB invite code kabul ediyor |
| Dashboard (empty) | `/{locale}/dashboard` | ✅ Çalışıyor | "İlk ürününü oluştur" CTA, temiz empty state |
| Dashboard (ürünle) | `/{locale}/dashboard` | ✅ Çalışıyor | Status'a göre farklı içerik, AI insights kartı |
| Product wizard | `/{locale}/products/new` | ✅ Çalışıyor | 6 soru, URL scrape, AI plan, launchStatus mapping |
| Pre-launch | `/{locale}/pre-launch` | ⚠️ Kısmi | Checklist + score + LaunchButton var; unauthenticated guard yok |
| Tasks | `/{locale}/tasks` | ⚠️ Kısmi | Liste var; unauthenticated guard yok, empty state sonrası UX test edilmedi |
| Metrics | `/{locale}/metrics` | ⚠️ Kısmi | Form + chart var; gerçek veri girişi doğrulanmadı, guard yok |
| Growth | `/{locale}/growth` | ✅ Çalışıyor | GrowthChecklistSection toggle çalışıyor, goals + routines mevcut |
| Admin | `/{locale}/admin/waitlist` | ✅ Çalışıyor | Auth guard var, approve → invite code üretiliyor, email silently fails |
| Products listing | `/{locale}/products` | ✅ Çalışıyor | Session guard var, product switcher çalışıyor |
| Integrations | `/{locale}/integrations` | ⚠️ Kısmi | UI var, gerçek veri sync yok (v1 banner ile belirtilmiş) |
| Settings | `/{locale}/settings` | ? | Kontrol edilmedi |

---

## Sprint 4 — Core Loop Derinleştirme

**Süre:** 1 hafta
**Hedef:** Kullanıcı ürün oluşturduktan sonra günlük kullanımda kaybolmuyor: metrik girebilir, görevi işaretleyebilir, davetiye e-postasını alır. Tüm inner surface'lar unauthenticated kullanıcıyı doğru yönlendiriyor.
**Milestone ilerleme:** M002 tamamlanıyor, M003 başlıyor
**Principal-PM alignment:** HANDOFF'daki "High Priority" ve "Medium Priority" sırasını takip ediyor: önce post-product flow doğrulama, sonra davetiye kodu wiring.

### Sliceler

#### S1 — Unauthenticated guard — inner surface'lar
- **Owner:** fullstack-developer
- **Kapsam:** `app/[locale]/pre-launch/page.tsx`, `app/[locale]/tasks/page.tsx`, `app/[locale]/metrics/page.tsx`, `app/[locale]/growth/page.tsx`
- **İş:** Her sayfada `getServerSession` sonucu kontrol edilip `!session?.user?.id` ise `redirect(/${locale}/login)` yapılıyor. Products listing'deki pattern örnek alınacak.
- **Kabul:**
  - Giriş yapmamış kullanıcı `/tr/pre-launch`, `/tr/tasks`, `/tr/metrics`, `/tr/growth` adreslerine gittiğinde login sayfasına yönlendiriliyor
  - Locale prefix doğru: `/${locale}/login`
  - Mevcut 58 test geçiyor, build temiz

#### S2 — Metrik giriş formu — end-to-end doğrulama
- **Owner:** fullstack-developer
- **Kapsam:** `app/api/metrics/route.ts`, `components/MetricEntryForm.tsx`
- **İş:** `POST /api/metrics` ile metrik kaydediliyor mu? `MetricEntryForm` submit sonrası `revalidatePath` yapıyor mu? Form submit → sayfa güncelleniyor mu? Hataları kontrol et, eksikleri tamamla.
- **Kabul:**
  - Metrics sayfasında form doldurulup submit edildiğinde yeni metrik DB'ye yazılıyor
  - Sayfa yenilenmeden DAU/MRR değerleri güncelleniyor (revalidatePath veya router.refresh)
  - Boş submit → hata mesajı gösteriyor
  - 58 test geçiyor

#### S3 — Görev yönetimi — durum toggle doğrulama
- **Owner:** fullstack-developer
- **Kapsam:** `app/api/actions/[id]/route.ts`, `components/TasksList.tsx`
- **İş:** Tasks sayfasında görev durumu (TODO → IN_PROGRESS → DONE) değiştirilebiliyor mu? `PATCH /api/actions/[id]` çalışıyor mu? UI güncelleniniyor mu? Eksiği varsa tamamla.
- **Kabul:**
  - Görev kartında status değiştirilebiliyor
  - Değişiklik sonrası DB güncelleniyor ve UI yansıtıyor
  - Başka kullanıcının görevi değiştirilemez (ownership check)
  - 58 test geçiyor

#### S4 — Resend API key — production wiring
- **Owner:** fullstack-developer
- **Kapsam:** Vercel env var (production), `.env.local` örnek, `HANDOFF.md`
- **İş:** `RESEND_API_KEY` Vercel production'a ekleniyor: `printf 'key' | vercel env add RESEND_API_KEY production`. Sonra admin panelinden bir waitlist girişi approve edilerek e-postanın gittiği doğrulanıyor.
- **Kabul:**
  - Waitlist girdisi approve edildiğinde `sendInviteEmail` e-postayı gerçekten gönderiyor
  - E-posta inbox'ta görünüyor (admin@tiramisup hesabıyla smoke test)
  - `HANDOFF.md`'daki "Email sending — not triggered yet" notu güncelleniyor
  - Fallback (`RESEND_API_KEY` yokken sadece log) davranışı korunuyor

#### S5 — Pre-launch → growth geçişi smoke testi
- **Owner:** qa-tester
- **Kapsam:** `app/[locale]/pre-launch/page.tsx`, `components/LaunchButton.tsx`, `app/[locale]/dashboard/page.tsx`
- **İş:** Wizard'dan PRE_LAUNCH ürün oluştur → pre-launch sayfasında LaunchButton ile LAUNCHED'a geç → dashboard'ın growth moduna geçtiğini doğrula → growth sayfasında checklist'e tick at → dashboard'da hedef sayısının güncellendiğini doğrula. Sorun varsa kaydet.
- **Kabul:**
  - Tam akış browser'da end-to-end çalışıyor
  - Her adımda locale prefix doğru
  - Regresyon varsa S5 blocker olarak açılıp önce çözülüyor
  - Test sonuçları HANDOFF'a yazılıyor

#### S6 — HANDOFF + STATE + REQUIREMENTS güncelleme
- **Owner:** docs-updater
- **Kapsam:** `HANDOFF.md`, `.gsd/STATE.md`, `.gsd/REQUIREMENTS.md`
- **İş:** Sprint 4 sonundaki gerçek durumu yansıtacak şekilde güncelle. Email drift'ini düzelt. State Inventory'yi güncel tut.
- **Kabul:**
  - `HANDOFF.md` "What Still Needs Work" bölümü S1–S5 çıktılarını yansıtıyor
  - Email drift düzeltildi
  - `STATE.md` Sprint 3 + 4 çıktılarını içeriyor
  - `REQUIREMENTS.md`'de R003 (launch readiness) ve R004 (metrics) validation durumu güncellendi

---

## Kural Hatırlatmaları (bu sprint için)

- `redirect` çağrılarında her zaman `/${locale}/login` — bare `/login` yok
- `RESEND_API_KEY` Vercel'e eklenirken: `printf 'value' | vercel env add RESEND_API_KEY production` — `echo` kullanılmaz (trailing newline bozar)
- S1 bitmeden S2 ve S3 başlamaz (auth guard test edilmemiş surface'larda çalışma yapılmaz)
- S4 için Resend account ve domain verification kontrol edilmeli (`tiramisup.com` Resend'de verified mi?)
- S5 blocker olarak çıkan şey S5'te değil ayrı bir acil slice olarak açılır

---

## Bu Sprintte Kapsam Dışı

- Multi-product switcher UI (M004 — schema hazır ama UX için ayrı sprint gerekiyor)
- Gerçek analytics entegrasyonları / Stripe (M005 — S4 stabilleşmeden başlanmaz)
- Şifre sıfırlama / email doğrulama (R001'in eksik kısmı — kritik değil, erken erişim phase'inde)
- Kanban board deneyimi (M003/S04 — görsel tasarım kararı gerektiriyor, ayrı sprint)
- AI insights için caching (tekrar scrape pahalı — ilerideki sprint, önce doğrulama yeterli)
