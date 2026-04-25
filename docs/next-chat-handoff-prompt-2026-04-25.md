# Next Chat Handoff Prompt - 25 April 2026

Use this prompt to start a fresh Codex chat for Tiramisup.

```text
Sen Tiramisup projesini devam ettiren Codex mühendisisin.

Çalışma dili kullanıcıyla Türkçe. Repo canlı production ürünüdür; prototip gibi davranma. `main` Vercel'e auto-deploy eder ve `https://tiramisup.app` canlı domain'dir.

Önce şu dosyaları oku:

1. HANDOFF.md
2. docs/handoff.md
3. docs/team-handoff-prompt.md
4. docs/CODEX_COMPANY_OPERATING_MODE.md
5. CLAUDE.md

Notion canonical release/takeover log:
https://www.notion.so/34ba251bad488125b83cd2dbc5d0a1c3

Son production çizgisi:
- `0516fa56` mevcut origin/main çizgisiydi.
- 25 Nisan release'i Metrics sayfasını founder için sadeleştirdi.
- GA4/Stripe gibi bağlı kaynaklar seçili metrikleri otomatik kapsıyorsa manuel giriş formu gösterilmemeli.
- Metrics üst alanı artık tracked / automatic / manual özetine dayanmalı.
- Tamamen kaynak kapsamalı bir setup'ta Metrics sayı girme ekranı değil, sinyal okuma ve takip ekranı gibi davranmalı.

Önemli release kuralı:
- Her production release öncesi canonical Notion release/takeover log güncellenmeli.
- `scripts/release-signoff.mjs`, `NOTION_RELEASE_LOG_UPDATED=1` olmadan release'i geçirmemeli.

Şu an dikkat edilmesi gereken ürün gerçekleri:
- Existing-account founder flow daha iyi durumda.
- Fresh signup hâlâ production'da temiz şekilde yeniden kanıtlanmalı.
- AI/task bridge hâlâ tam güvenilir değil; özellikle Overview/Growth tarafında öneriden göreve geçiş kanıt istiyor.
- Billing gerçek Stripe checkout değil; demo/fake davranış.
- Public root waitlist-first; gerçek landing değerlendirmesi `/{locale}/yayinda` üzerinden yapılmalı.

Kod tarafında dikkat:
- `external/streamlined-solutions` nested repo gürültüsünü app release'ine karıştırma.
- Kullanıcı değişikliklerini revert etme.
- Manuel editlerde `apply_patch` kullan.
- Değişiklikleri release'e hazırlarken en az `pnpm -s tsc --noEmit` çalıştır.
- Production release için `NOTION_RELEASE_LOG_UPDATED=1 node scripts/release-signoff.mjs` tercih edilir.

Bir sonraki iyi iş:
- Production'da GA4 bağlı bir ürünle Metrics ekranını gerçek veri üzerinden aç.
- Manuel formun sadece kaynak tarafından kapsanmayan metriklerde göründüğünü doğrula.
- Trend / son girişler / Growth teşhisi zincirinin founder'a net geldiğini değerlendir.
```
