# Sprint 6 — AI Danışman: Sürekli Varlık

**Başlangıç:** 22 Mart 2026
**Hedef:** AI wizard'da bir kez plan üretip kaybolan bir araçtan, kullanıcının her gün gördüğü, bağlamsal öneri veren, aşamasına göre konuşan bir danışmana dönüşüyor.
**Temel insight:** Şu an AI → plan üretir → sessizleşir. S6 sonunda AI → her dashboard yüklemesinde görünür, bu haftanın aksiyonlarını söyler, aşamaya özel konuşur.

**Ertelenenler (S5'ten):**
- E-posta özelliği: süresiz ertelendi
- Settings guard, integrations guard, BUG-02, Resend domain: ertelendi
- Bu sprint bunlara dokunmuyor

---

## Sıralama Mantığı

```
S1 (schema) → S2 (AI insights bug) → S3 (advice API) → S4 (wizard branching)
                                   ↘                  ↗
                                     S2 ile paralel: S4
S5 (dashboard UI) ← S3 + S4 tamamlandıktan sonra
S6 (docs)         ← S5 tamamlandıktan sonra
```

**S2 ve S4 paralel çalışabilir** — ikisi de S1'e bağımlı, birbirine bağımlı değil.
**S3, S2'ye bağımlı değil** — ama S1 (launchStatus alanı) tamamlanmış olmalı.
**S5, S3 + S4 tamamlanmadan başlamaz** — dashboard yeni API'yi ve wizard verisini kullanacak.

---

## Sliceler

---

### S1 — Schema: `launchStatus` alanı + migrasyon

**Öncelik:** Kritik — başka hiçbir slice bu olmadan başlayamaz
**Owner:** fullstack-developer
**Süre tahmini:** 1-2 saat

**Sorun:**
`Product` modelinde `launchStatus` alanı yok. Şu an wizard bu değeri alıyor, `productStatus` (PRE_LAUNCH / LAUNCHED) eşlemesi için kullanıyor, ama string değeri DB'ye yazılmıyor. Dashboard ve advice API bu değere erişemiyor.

**Dosyalar:**
- `prisma/schema.prisma` — `Product` modeline alan ekleniyor
- `app/api/products/route.ts` — POST handler'da `launchStatus` alanı `product.create`'e ekleniyor
- Yeni migrasyon dosyası

**İş:**

1. `prisma/schema.prisma` içindeki `Product` modeline ekle:
   ```
   launchStatus  String?
   ```
   `businessModel` alanının hemen altına, alfabetik sıraya uygun şekilde.

2. Migrasyon oluştur:
   ```
   npx prisma migrate dev --name add_launch_status
   ```

3. `app/api/products/route.ts` — `tx.product.create` içindeki `data:` bloğuna `launchStatus` ekle:
   ```ts
   launchStatus,   // yeni satır — wizard'dan gelen string olarak sakla
   ```

4. `npm run build` temiz geçmeli.

**Kabul:**
- `prisma/schema.prisma` içinde `launchStatus String?` mevcut
- Migrasyon dosyası commit'te yer alıyor
- Yeni oluşturulan ürünlerde `launchStatus` DB'ye yazılıyor (Prisma Studio ile doğrulanıyor)
- Eski ürünler null döndürüyor — bu beklenen davranış, kırmıyor
- `npm run build` temiz, tüm testler geçiyor

---

### S2 — AI Insights bug fix + prompt güçlendirme

**Öncelik:** Yüksek — S5'ten taşınan, S3 bu altyapıyı referans alıyor
**Owner:** fullstack-developer
**Bağımlılık:** S1 tamamlanmış (build ortamı temiz olmalı)
**Paralel:** S4 ile paralel çalışabilir

**Sorun:**
`extractInsights()` kodu S5'te partial commit olarak bırakıldı. Mevcut kod aslında **doğru yazılmış** (`app/api/products/[id]/insights/route.ts` satır 53-65 — multi-key fallback mantığı var). Asıl sorun: DeepSeek `{ "insights": [] }` döndürüyor yani prompt zayıf, içerik yetersiz olunca boş array üretiyor. Prompt "En az 5 insight döndür" şartını içermiyor, fallback yok.

**Dosyalar:**
- `app/api/products/[id]/insights/route.ts` — INSIGHTS_PROMPT güçlendirme
- `components/InsightsCard.tsx` — boş array state mesajı güncelleme

**İş:**

1. `INSIGHTS_PROMPT`'a şu kuralı ekle (kurallar bölümüne):
   ```
   - Kesinlikle en az 5 insight döndür. Eğer site içeriği yetersizse veya erişilemediyse, genel SaaS/startup best practice'leri üzerinden insight üret — ama yine de ürün adını ve kategorisini kullan
   - "Insights bulunamadı" veya boş array döndürme. Her zaman en az 5 madde olsun.
   ```

2. `InsightsCard.tsx` içindeki `done && insights.length === 0` state'i (satır ~79) için mesajı güncelle:
   - Eski: "AI analiz tamamlanamadı" (veya benzeri)
   - Yeni: "Site içeriği okunamadı — farklı bir URL ile tekrar dene"

3. `npm run build` çalıştır, temiz geçtiğini doğrula.

**Kabul:**
- Dashboard'da URL'li bir ürün için "Analiz et" tıklandığında 5+ insight dönüyor
- Boş array üretilmiyor
- Eğer scrape başarısız olursa kullanıcı "Site içeriği okunamadı" mesajı görüyor (crash değil)
- `npm run build` temiz, 82 test geçiyor

---

### S3 — Yeni endpoint: `GET /api/products/[id]/advice`

**Öncelik:** Yüksek — "Bu hafta" AI Advisor kartının veri kaynağı
**Owner:** fullstack-developer
**Bağımlılık:** S1 tamamlanmış (launchStatus alanı var)
**Paralel:** S2 ile paralel çalışabilir, S4 ile paralel çalışabilir

**Dosyalar:**
- `app/api/products/[id]/advice/route.ts` — yeni dosya (yoktu)
- `lib/ai-advice.ts` — yeni dosya, advice prompt ve generator

**İş:**

Endpoint şu verilere bakarak 3-5 aksiyonable "bu hafta" önerisi döndürüyor:

| Girdi | Nereden gelir |
|---|---|
| `launchStatus` | `product.launchStatus` (S1 ile eklendi) |
| `productStatus` | `product.status` (PRE_LAUNCH / LAUNCHED) |
| Checklist tamamlanma % | `launchChecklists` count query |
| Son metrik tarihi | `metrics` en son kayıt tarihi |
| Tamamlanmamış HIGH görevler | `tasks` where status != DONE, priority = HIGH |

**`lib/ai-advice.ts` yapısı:**

```ts
export type AdviceItem = {
  action: string;    // "Ne yapılacak" — 1 cümle, maks 80 karakter, Türkçe
  reason: string;    // "Neden şimdi" — 1-2 cümle, bağlamsal
  href?: string;     // Yönlendirme: "/tr/tasks", "/tr/metrics" vb.
};

export type AdviceContext = {
  productName: string;
  launchStatus: string | null;
  productStatus: string;
  checklistCompletionPct: number;
  daysSinceLastMetric: number | null;
  highPriorityPendingCount: number;
};
```

AI prompt aşamaya göre farklı talimat bloğu içeriyor:
- "Fikir aşamasında" → problem validasyonu, 10 kullanıcı ile konuş, problem net mi
- "Geliştirme aşamasında" → beta kullanıcı bul, MVP'yi daralt, gereksiz feature'ı kes
- "Beta'da" → feedback loop, NPS al, ilk ödeme yapan müşteri
- "Yakında launch" → launch checklist %80+ hedefi, waitlist, PR outreach
- "Launch oldu" → DAU takip et, churn nedenlerini anla, growth kanal testi
- "Büyüme aşamasında" → ölçeklendirilebilir kanal, retansiyon ritüeli, MRR büyüme oranı

**`app/api/products/[id]/advice/route.ts`:**
- Session check (401 if unauthenticated)
- Ownership check (product.userId === session.user.id)
- Context verilerini topla (DB queries)
- `generateAdvice(context)` çağır
- `{ items: AdviceItem[], generatedAt: string }` döndür

**Yanıt formatı:**
```json
{
  "items": [
    {
      "action": "Bu hafta 5 potansiyel kullanıcıyla problem görüşmesi yap",
      "reason": "Fikir aşamasında validasyon her şeyden önce gelir. Plan yazmadan önce gerçek acıyı doğrula.",
      "href": "/tr/tasks"
    }
  ],
  "generatedAt": "2026-03-22T10:00:00Z"
}
```

**Fallback:** AI çağrısı başarısız olursa statik rule-based öneri seti dön (AI değil, `launchStatus` + context'e göre hardcoded). Hiçbir zaman 500 dönme.

**Kabul:**
- `GET /api/products/[id]/advice` 200 ve 3-5 item dönüyor
- Unauthenticated istek → 401
- Başka kullanıcının ürünü → 404
- `launchStatus` null olan eski ürünler için fallback advice dönüyor (500 yok)
- AI çağrısı başarısız olursa statik fallback devreye giriyor (response hâlâ 200)
- 82 test geçiyor, build temiz

---

### S4 — Wizard branching: launchStatus sonrası takip soruları

**Öncelik:** Yüksek — AI plan kalitesini ve dashboard 6-aşama farklılaştırmasını besliyor
**Owner:** fullstack-developer
**Bağımlılık:** S1 tamamlanmış
**Paralel:** S2 ve S3 ile paralel çalışabilir

**Dosyalar:**
- `app/[locale]/products/new/page.tsx` — tek dosya, wizard logic burada

**Sorun:**
Şu an wizard 2 pill'de sabit 6 soru soruyor. `launchStatus` seçildikten sonra wizard kapanıp submit'e gidiyor. Aşamaya özgü ek sorular yok, bu yüzden AI çok az bağlam ile plan üretiyor.

**İş:**

Wizard'a 3. bir pill ekleniyor: **"Bağlam"**. Bu pill sadece `launchStatus` seçildikten sonra aktif hale geliyor ve içeriği seçilen aşamaya göre değişiyor.

`WizardData` tipine 3 yeni opsiyonel alan ekle:
```ts
followUp1?: string;   // aşamaya göre soru 1
followUp2?: string;   // aşamaya göre soru 2
followUp3?: string;   // aşamaya göre soru 3 (opsiyonel, bazı aşamalarda yok)
```

`PILLS` dizisine `{ id: 3, label: "Bağlam" }` ekle.

`PILL_QUESTIONS[3]` dinamik olarak `launchStatus`'a göre üretilecek:

| launchStatus | Soru 1 | Soru 2 | Soru 3 |
|---|---|---|---|
| Fikir aşamasında | "Problemi hangi kullanıcı grubunda gözlemledin?" (text) | "Şimdiye kadar kaç kişiyle konuştun?" (radio: 0 / 1-5 / 5+) | — |
| Geliştirme aşamasında | "Şu an kaç aktif test kullanıcın var?" (radio: 0 / 1-10 / 10+) | "En büyük teknik engel nedir?" (textarea) | — |
| Beta'da | "Beta'dan şimdiye kadar aldığın en kritik feedback neydi?" (textarea) | "İlk ödeme yapan müşteriye ne kadar yakınsın?" (radio: Çok uzak / 1-2 ay / Bu ay) | — |
| Yakında launch | "Launch için hedeflediğin ilk kullanıcı sayısı?" (radio: 10 / 100 / 1000+) | "Launch öncesi en büyük risk nedir?" (textarea) | — |
| Launch oldu | "Şu anki DAU yaklaşık kaç?" (radio: < 10 / 10-100 / 100+) | "En yüksek churn nedeni nedir?" (textarea) | "MRR şu an hangi aralıkta?" (radio: $0 / $1-500 / $500+) |
| Büyüme aşamasında | "Hangi growth kanalı şu an en iyi çalışıyor?" (text) | "Retansiyon sorununun farkında mısın?" (radio: Evet/analiz yaptım / Hayır/bakmadım) | — |

Pill 3 soruları `required: false` — kullanıcı skip edebilir ("Şimdilik geç" butonu).

Bu soruların cevapları `followUp1/2/3` olarak `handleSubmit`'te API'ye gönderiliyor, `lib/ai-plan.ts`'teki `WizardInput`'a ve PROMPT'a ekleniyor:
```
AŞAMAYA ÖZEL BAĞLAM:
${followUp1 ilgili sorusu}: ${followUp1 cevabı}
${followUp2 ilgili sorusu}: ${followUp2 cevabı}
```

**Kabul:**
- `launchStatus` seçilince pill 3 aktif hale geliyor (disabled → clickable)
- Her aşama için doğru sorular gösteriliyor
- Sorular atlanabilir ("Şimdilik geç")
- Follow-up cevapları AI plan promptuna dahil ediliyor
- Wizard state'i pill geri-ileri navigasyonunda koruyor
- Mevcut 2-pill flow bozulmuyor (pill 3 eklentidir)
- 82 test geçiyor, build temiz

---

### S5 — Dashboard: AI Advisor kartı + 6-aşama farklılaştırma

**Öncelik:** Yüksek — kullanıcının gördüğü yüzey
**Owner:** fullstack-developer
**Bağımlılık:** S3 (advice endpoint) + S4 (launchStatus DB'de var)
**Paralel:** S6 ile paralel başlatılabilir ama S6, S5 kapanmadan tamamlanamaz

**Dosyalar:**
- `app/[locale]/dashboard/page.tsx` — server component, launchStatus query'sine + advice section'a genişletiliyor
- `components/AdvisorCard.tsx` — yeni component (client component, fetch + render)
- `components/InsightsCard.tsx` — mevcut, dokunulmuyor (S2'de zaten düzeltildi)

**İş:**

**1. Dashboard server component'i güncelle:**

`prisma.product.findFirst`'teki `select` / `include`'e `launchStatus` ekle.

```ts
// Şu an productInclude'e eklenmesi gereken:
select: {
  id, name, status, launchStatus, website, ...
}
```

**2. `components/AdvisorCard.tsx` — yeni client component:**

```
[AI Danışman — Bu Hafta]
─────────────────────────────────────────
Yükleniyor... → spinner

Yüklenince:
• [action] — [reason]           → href linki
• [action] — [reason]           → href linki
• [action] — [reason]           → href linki

[Danışmanla konuş →]  (şimdilik yok, S7'ye placeholder)
─────────────────────────────────────────
```

Kart tasarımı: beyaz arka plan, teal left-border (4px, `#95dbda`), eyebrow "AI DANIŞMAN", başlık "Bu Hafta Yapman Gerekenler", her item küçük bir numaralı liste.

Fetch: `GET /api/products/[id]/advice` — loading state, error state (sessizce hata yut, "Öneri yüklenemedi" göster), success state.

**3. Dashboard layout değişikliği:**

AdvisorCard, mevcut stat card grid'inin **üstüne** yerleştiriliyor. Yeni sıra:

```
PageHeader
↓
AdvisorCard          ← YENİ — tam genişlik
↓
StatCard grid (4'lü)
↓
Quick actions | Hedef nabzı
↓
InsightsCard (URL varsa)
```

**4. 6-aşama farklılaştırma:**

`product.launchStatus` veya `product.status`'a göre dashboard içeriği değişiyor:

| launchStatus | PageHeader description | Quick actions başlığı | Quick actions içeriği |
|---|---|---|---|
| Fikir aşamasında | "Fikrinden ürüne — validasyon aşaması" | "Bu hafta validasyon yap" | Problem görüşmeleri / Tasks / — |
| Geliştirme aşamasında | "MVP'ni inşa ederken beta kullanıcı bul" | "Build & Beta" | Pre-launch / Tasks / Metrics |
| Beta'da | "Beta'dan feedback topla, ilk ödemeye hazırlan" | "Feedback döngüsü" | Pre-launch / Tasks / Metrics |
| Yakında launch | "Launch geri sayımı başladı" | "Launch hazırlığı" | Pre-launch checklist / Tasks / — |
| Launch oldu | "Kullanıcı kazan, churn'ü anla" | "Büyümeyi sürdür" | Growth / Metrics / Tasks |
| Büyüme aşamasında | "Ölçeklenebilir büyüme için optimize et" | "Scale modu" | Growth / Metrics / Tasks |
| null (eski ürünler) | Mevcut description korunuyor | PRE_LAUNCH/LAUNCHED binary mantığı korunuyor | Değişmez |

`launchStatus` null ise eski PRE_LAUNCH/LAUNCHED binary mantığı çalışmaya devam ediyor — geriye dönük uyumluluk bozulmuyor.

**Kabul:**
- Dashboard ilk yüklendiğinde AdvisorCard görünüyor (loading state'i de görülmeli)
- AdvisorCard stat kartların üstünde
- `launchStatus` değerine göre description ve quick actions başlığı değişiyor
- `launchStatus` null olan eski ürünlerde dashboard kırılmıyor
- AdvisorCard advice endpoint hatası verse bile dashboard render oluyor
- `npm run build` temiz, 82 test geçiyor

---

### S6 — HANDOFF + STATE + REQUIREMENTS güncelleme

**Öncelik:** Normal
**Owner:** docs-updater
**Bağımlılık:** S5 tamamlanmış
**Paralel:** S5'in son aşamasıyla hafif paralel başlatılabilir

**Dosyalar:**
- `HANDOFF.md`
- `.gsd/STATE.md`
- `.gsd/REQUIREMENTS.md` (varsa)

**İş:**

1. **`HANDOFF.md`** güncelle:
   - "What Still Needs Work" bölümüne Sprint 6 çıktılarını yansıt
   - AI Advisor endpoint, wizard branching, schema değişikliği "Done" olarak işaret
   - S5'ten ertelenen maddeler (settings guard, integrations guard, BUG-02, Resend domain) "Deferred indefinitely" olarak güncelleme
   - E-posta özelliği "Deferred indefinitely" olarak güncelleme

2. **`.gsd/STATE.md`** güncelle:
   - Surfaces tablosuna `GET /api/products/[id]/advice` satırı ekle (Working)
   - Wizard `launchStatus branching` satırı ekle (Working)
   - Known Issues tablosunda S6'da kapatılanları "Resolved" yap
   - AI Insights bug (S2 kapandıysa) — Resolved
   - Test sayısını güncelle (yeni testler eklenirse)
   - Sprint 6 tamamlandı olarak güncelle

3. **Sprint 5 ertelemelerini belgele:**
   - DEFERRED-06: Settings session guard — ertelendi (S6+ scope dışında)
   - DEFERRED-07: Integrations session guard — ertelendi
   - DEFERRED-08: BUG-02 (admin hash) — ertelendi
   - DEFERRED-09: Resend domain — ertelendi
   - DEFERRED-10: Email özelliği — süresiz ertelendi

**Kabul:**
- `HANDOFF.md` S6'da teslim edilenleri doğru yansıtıyor
- STATE.md yeni endpoint ve wizard branching'i listeliyor
- Ertelenen maddeler açıkça belgelenmiş, neden ertelendiği yazıyor
- SPRINT_6.md bu dosya — tamamlanmış kabul ediliyor

---

## Kural Hatırlatmaları (bu sprint için)

- **S1 bitene kadar başka commit atılmaz** — schema + migrasyon olmadan launchStatus'a dokunan hiçbir kod anlamsız
- **S2 ve S4 paralel yürüyebilir** — ama ikisi de S1'den sonra başlar
- **S3, S2 ile paralel yürüyebilir** — advice endpoint insights'a bağımlı değil
- **S5, S3 + S4 tamamlanmadan başlamaz** — dashboard yeni endpoint'e ve branching verisine ihtiyaç duyuyor
- **Geriye dönük uyumluluk** — `launchStatus` null olan eski ürünlerde hiçbir şey kırılmıyor; null-safe kontroller zorunlu
- **Advice endpoint hiçbir zaman 500 dönmez** — AI çağrısı başarısız olsa bile statik fallback devreye girer
- **Test coverage** — S3 için `lib/ai-advice.ts`'te unit testler yazılıyor (context builder, fallback logic); slice tamamlandığında toplam test sayısı güncellenecek

---

## Bu Sprintte Kapsam Dışı

- **E-posta özelliği (Resend domain, invite email)** — süresiz ertelendi, bu sprinte değil
- **Settings + integrations session guard** — ertelendi
- **BUG-02 (admin local hash)** — ertelendi
- **AI sohbet / chat interface** — S7+ fikri, bu sprint sadece card tabanlı advisor
- **AI insights caching** — hâlâ ertelendi (DEFERRED-01), her "Analiz et" tıklamasında scrape yapmaya devam
- **Multi-product switcher UI** — hâlâ M004
- **Advice endpoint rate limiting / caching** — S7+; bu sprint her yüklemede fresh call yapıyor
- **Kanban board** — M003/S04, hâlâ ertelendi
