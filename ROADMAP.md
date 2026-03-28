# Tiramisup Product Roadmap

Son güncelleme: 29 Mart 2026  
Durum: **Temel ürün çekirdeği var; EN/TR dil desteği ve dil tercihi kalıcılığı shipped**

---

## 0. Executive Summary

Tiramisup bugün bir founder/operator workspace olma yolunda. Kod tabanı ürünün geleceğini taşıyacak kadar zengin:

- multi-product veri modeli hazır
- launch ve growth readiness için ayrı checklist yapıları hazır
- task/kanban modeli hazır
- metrics, retention, funnel, goals, routines, timeline, integrations modelleri hazır
- auth, signup, seed, dashboard ve temel sayfa yüzeyleri hazır

Ama ürün hâlâ **feature-complete** değil; daha doğru ifade şu:

> **Tiramisup bugün, olgun bir ürün mimarisine sahip erken aşama bir operational prototype.**

Son sprint notu:
- EN/TR dil desteği landing + settings üzerinde tamamlandı
- Varsayılan dil İngilizce, kullanıcı tercihi DB + cookie ile kalıcı

Bu roadmap’in amacı, onu üç katmanda büyütmek:

1. **Gerçek MVP** — tek ürün için düzenli ve güvenilir operator loop
2. **Takımca kullanılabilir ürün** — çok ürün, collaboration, gerçek integrations
3. **Olgun platform** — otomasyon, raporlama, benchmark, extensibility

Bu versiyonda roadmap yalnızca ekran ve özellik listesi değil; aynı zamanda:
- kullanıcıya hangi faydaları nasıl sağlayacağımızı
- bunu sağlamak için kullanıcıdan hangi bilgileri hangi sırayla isteyeceğimizi
- hangi bilgileri hiç sormadan hangi entegrasyonlarla alacağımızı
- yapay zeka ve ileride eklenecek MCP katmanlarının nerede devreye gireceğini
- ürün tanıma → yön verme → büyütme akışını
bir sistem olarak tanımlar.

---

## 1. Ürün Tezi

### Ürün ne iş çözüyor?
Founder’lar ve küçük startup ekipleri launch ile growth arasındaki dönemde çok fazla dağınık yüzey kullanıyor:

- Notion / docs
- spreadsheets
- analytics tools
- project boards
- investor updates
- random recurring rituals in Slack / Calendar

Tiramisup’ın tezi şu:

> “Launch-to-growth operating rhythm tek bir product workspace içinde yönetilebilir.”

### Ana kullanıcılar

#### Birincil kullanıcı
- solo founder
- technical founder
- startup operator / growth lead

#### İkincil kullanıcı
- 2–8 kişilik erken ekip
- PM / growth / product marketing karışımı ekipler

### Ana kullanım şekli
Kullanıcı Tiramisup’a her gün tüm günü geçirmek için değil, **ürünün operasyonel durumunu netleştirmek ve sonraki doğru adımı seçmek için** gelir.

Bu yüzden ürünün en kritik niteliği “çok özellik” değil:
- net state
- net priority
- net next action
- tekrar edilebilir ritim

---

## 2. Kullanıcıya Sağlanacak Temel Faydalar

Roadmap’in geri kalanı bu faydaların sistematik olarak nasıl üretileceğine dayanır.

### Fayda 1 — “Ürünümün şu an nerede olduğunu anlayabileyim”
Bunu sağlayan sistem:
- dashboard summary
- launch score
- growth score
- key metrics
- at-risk tasks/goals
- product status

### Fayda 2 — “Sıradaki doğru adımı görebileyim”
Bunu sağlayan sistem:
- checklist → task linkage
- risk detection
- weekly review mode
- AI-assisted recommendation layer (ileride)
- overdue / blocked states

### Fayda 3 — “Ürünü launch’tan growth’a taşıyan ritmi kurayım”
Bunu sağlayan sistem:
- launch readiness workflow
- growth readiness workflow
- goals
- routines
- timeline
- recurring review cycle

### Fayda 4 — “Elle veri toplamak yerine sistem bana veri getirsin”
Bunu sağlayan sistem:
- metrics integrations
- sync jobs
- event ingestion
- source mapping
- automation layer

### Fayda 5 — “Tek ürün değil, ürün portföyümü yönetebileyim”
Bunu sağlayan sistem:
- multi-product model
- product portfolio view
- product selector
- comparative scorecards

### Fayda 6 — “Kendi kafamdan değil, ürünün gerçek durumundan karar alayım”
Bunu sağlayan sistem:
- passive data collection
- active clarification questions
- benchmarks / templates / AI summaries
- structured weekly review

---

## 3. Ürünün Bilgi Mimarisi: Neyi Bilmek Zorundayız?

Tiramisup kullanıcıya fayda üretmek için ürün hakkında üç tip bilgiye ihtiyaç duyar:

### A. Kullanıcıdan sorulması gereken bilgiler
Bunlar inference ile güvenilir alınamaz; kullanıcıdan istemek gerekir.

#### Kimlik / işletim bağlamı
- ürün adı
- ürün kategorisi
- hedef kitle
- business model
- launch stage
- team size
- temel hedef (ör. launch, growth, retention fix, revenue)

#### Stratejik bağlam
- ürünün ana değer önerisi
- ana acquisition kanalları
- monetization mantığı
- north star metric veya primary KPI
- yakın dönem hedefleri

#### Operasyon tercihleri
- review sıklığı
- task yönetim yaklaşımı
- hangi entegrasyonların bağlanacağı
- hangi paydaşlarla paylaşım yapılacağı

### B. Kullanıcıya hiç sormadan alınabilecek bilgiler
Bunlar entegrasyon, telemetry veya pasif analizle alınabilir.

#### Product/traffic data
- sessions / users / DAU / MAU
- activation event counts
- retention davranışları
- revenue / subscriptions / churn
- campaign/referrer dağılımı

#### Usage/ops data
- son sync zamanı
- açık task sayısı
- overdue task sayısı
- goal progress
- routine completion cadence

#### Web presence intelligence (opsiyonel)
- website var mı
- pricing page var mı
- docs/help center var mı
- public launch surfaces var mı

### C. Kullanıcıdan kısmen sorulup sonra doğrulanabilecek bilgiler
Bu kısım en değerli katman.

Örnekler:
- “Primary acquisition channel nedir?” → kullanıcıdan ilk cevap alınır, GA4/PostHog ile zaman içinde doğrulanır
- “North star metric ne?” → kullanıcı söyler, sistem metric mapping önerir
- “Launch hazır mısın?” → checklist + tasks + metrics + integration data ile desteklenir

---

## 4. Tiramisup’ın Soru Sistemi

Bu ürün yalnızca form toplamaz; doğru anda doğru soruyu sorması gerekir.

### İlke
Her şeyi başta sormak yanlış. Soru sistemi üç katmanlı olmalı:

1. **Onboarding soruları** — ürünü tanımak için minimum veri
2. **Progressive questions** — kullanıcı ürünü kullandıkça daha iyi yönlendirmek için
3. **Review questions** — haftalık karar üretmek için

---

## 5. Kullanıcıyı Tanıma Akışı (Product Understanding System)

### Phase A — Minimum onboarding interview
İlk girişte ya da ilk product creation wizard’ında sorulacak sorular:

#### Kim?
- Bu ürünün adı ne?
- Ne satıyorsun / ne çözüyor?
- Kime satıyorsun?

#### Ne aşamadasın?
- Henüz launch etmedin mi?
- Yeni launch ettin mi?
- İlk traction var mı?
- Düzenli revenue var mı?

#### Nasıl para kazanıyorsun?
- subscription
- one-time
- marketplace cut
- freemium
- lead-gen / sales-led

#### Başarı nasıl ölçülecek?
- kullanıcı sayısı mı?
- MRR mi?
- activation mı?
- retention mı?
- pipeline/revenue mi?

### Bu neden gerekli?
Bu bilgi olmadan checklist, metrics, dashboard ve AI yorumları bağlamdan kopuk olur.

### Sistem karşılığı
- Product wizard
- Product profile
- Default templates / seed selection
- Goal suggestions

---

## 6. Sormadan Toplanacak Bilgiler Sistemi

Bu katman ürünün “akıllı” hissini verir.

### 6.1 İlk dalga entegrasyonlar
#### Stripe
Pasif alınacak bilgi:
- MRR
- active subscriptions
- churned subscriptions
- ARPU türevleri

#### GA4 veya PostHog
Pasif alınacak bilgi:
- traffic
- sessions
- users
- top channels
- acquisition trend
- event-based activation proxies

#### Mixpanel / Amplitude
Pasif alınacak bilgi:
- funnel drop-off
- cohort behavior
- event completion patterns

### 6.2 İkinci dalga entegrasyonlar
#### Segment
Çok kaynaklı event birleştirme

#### CRM / sales tools (ileride)
- HubSpot
- Salesforce
- Pipedrive

Bunlar özellikle sales-led / B2B motion için değerli olur.

### 6.3 Web intelligence katmanı (opsiyonel)
İleride ürün bağlamını sormadan anlamak için:
- website crawl
- pricing page detection
- docs/faq/support presence
- public messaging extraction

Bu katmanla sistem şunu yapabilir:
> “Sen B2B SaaS olduğunu söyledin; pricing page’in var, docs yüzeyin var, ama onboarding/activation instrumentation eksik görünüyor.”

---

## 7. AI ve MCP Katmanı: Nerede Devreye Girecek?

Bugün projede MCP server yok. Bu yüzden aşağıdaki kısım **gelecek mimari önerisi** olarak ele alınmalı, mevcut durum gibi değil.

### 7.1 AI’nin gerçek işlevi ne olacak?
AI burada “chatbot” olmamalı. Dört işe yaramalı:

#### 1. Product interpretation
Kullanıcıdan gelen dağınık cevabı yapılandırmak
- “Biz KOBİ’lere yönelik AI destekli finans aracı yapıyoruz” → kategori, audience, business model çıkarımı

#### 2. Recommendation engine
Checklist, tasks, metrics ve integrations üzerinden öneri üretmek
- hangi alan riskli
- hangi goal sapıyor
- hangi routine eksik
- next best action ne

#### 3. Weekly review synthesis
- geçen haftanın özeti
- bu haftanın riskleri
- önerilen 3 öncelik

#### 4. Auto-drafting
- launch plan outline
- weekly summary
- investor snapshot
- experiment brief

### 7.2 Olası MCP / AI provider rolleri
#### Context7 / docs MCP benzeri katman
Amaç: provider integration implementation sırasında doğru API pattern’lerini çekmek

#### Browser / crawl MCP
Amaç: kullanıcının public website’ini analiz etmek, pricing/docs presence çıkarmak

#### Analytics/vendor MCP’leri
Amaç: GA4 / Stripe / PostHog gibi servislerden doğrudan veri çekmek

#### Internal Tiramisup MCP (ileride)
Amaç: ürün içindeki data model’i AI’ye kontrollü, tool-based erişimle açmak

### 7.3 AI kullanırken güvenlik ilkesi
AI’ye yalnızca şu verilmelidir:
- ürün bağlamı
- metric summary
- task/checklist state
- integration status

Şunlar default olarak verilmemeli:
- ham gizli credential’lar
- tam event payload’ları
- PII-heavy data

---

## 8. Ürünü Tanıma → Ürünü Büyütme Sistemi

Bu ürünün olgun versiyonu kullanıcıyı yalnızca “tanıyan” değil, zaman içinde “öğrenen” sistem olmalı.

### Katman 1 — Product identity
Kullanıcının bize söylediği:
- ürün ne
- kime satılıyor
- nasıl para kazanıyor
- hangi aşamada

### Katman 2 — Operational state
Sistemin gördüğü:
- checklist completion
- task backlog
- overdue items
- goals progress
- routine completion

### Katman 3 — Performance state
Sistemin veri kaynaklarından gördüğü:
- traffic
- signups
- activation
- retention
- revenue

### Katman 4 — Growth intelligence
AI’nin ürettiği:
- ana riskler
- öncelikli darboğazlar
- eksik sistemler
- next best actions

### Katman 5 — Compounding system
Uzun vadede ürünün asıl değeri burada:
- template’ler
- benchmark’lar
- “benzer şirketler bu aşamada ne yaptı?” önerileri
- playbook suggestions

---

## 9. Akış Bazlı Büyük Yol Haritası

Aşağıdaki fazlar yalnızca özellik değil; her biri yukarıdaki bilgi sistemi ve fayda sistemiyle bağlıdır.

---

## Phase 1 — Product Foundation Reset
### Amaç
Runtime, docs ve mevcut feature set’i güvenilir bir tabana oturtmak.

### Kullanıcı faydası
Kullanıcı ürünün kırılgan olmadığını hisseder; ekip doğru yüzeyin üstünde çalışır.

### Sistem çalışması
- auth/session temizliği
- docs truth pass
- state/error surfaces standardization
- seed stabilization

### Soru sistemi
Bu fazda yeni soru yok; mevcut onboarding yalnızca güvenilir hale getirilir.

### AI/MCP rolü
Yok veya çok sınırlı.

---

## Phase 2 — Product Understanding MVP
### Amaç
Kullanıcıyı ve ürününü minimum gerekli derinlikte tanımak.

### Kullanıcı faydası
Kullanıcı “generic dashboard” değil, kendi ürününe göre şekillenmiş workspace görür.

### Sorulacaklar
- ürün adı
- kategori
- hedef kitle
- business model
- current stage
- primary goal
- optional website

### Sormadan alınacaklar
- signup metadata
- first session behavior
- default product seed template selection

### Sistem bileşenleri
- Products page
- Create product wizard
- Product profile
- Active product selector
- Template-aware seed

### AI/MCP rolü
- kullanıcı cevaplarını yapılandırılmış kategoriye dönüştürme
- business model / stage inference önerisi

### Done when
Kullanıcı ilk ürününü oluşturduğunda dashboard kendisiyle alakalı olur.

---

## Phase 3 — Launch Operating System
### Amaç
Launch readiness’i founder için gerçek bir karar sistemine çevirmek.

### Kullanıcı faydası
“Launch’a ne kadar hazırım, hangi açıklarım var?” sorusunun cevabı netleşir.

### Sorulacaklar
- target launch date
- launch channel priority
- launch success definition
- launch blockers var mı

### Sormadan alınacaklar
- checklist completion
- task count / overdue state
- timeline events
- public website presence (ileride)

### Sistem bileşenleri
- Launch checklist redesign
- category scorecards
- blocker extraction
- task linkage
- launch review mode

### AI/MCP rolü
- launch blocker summary
- eksik alanlardan task önerme
- website crawl ile public launch readiness audit (opsiyonel, ileride)

### Done when
Kullanıcı yalnızca “checklist işaretleyen” biri değil, launch kararı verebilen biri olur.

---

## Phase 4 — Metrics and Health Layer
### Amaç
Kullanıcıya ürün sağlığına dair düzenli ve güvenilir sinyal vermek.

### Kullanıcı faydası
Kullanıcı veri görmek için spreadsheet açmak zorunda kalmaz.

### Sorulacaklar
- primary KPI
- north star metric
- hangi metrikler düzenli takip edilmeli

### Sormadan alınacaklar
- manual metric history
- later: GA4/PostHog/Mixpanel data
- trend deltas

### Sistem bileşenleri
- metric entry refinement
- metric templates by business model
- KPI card configuration
- weekly change summaries

### AI/MCP rolü
- metric anomaly explanation
- KPI mapping suggestions
- data completeness warnings

### Done when
Kullanıcı “ürün sağlığı”nı haftalık tek bakışta anlar.

---

## Phase 5 — Growth Operating System
### Amaç
Launch sonrası büyüme akışını yapılandırmak.

### Kullanıcı faydası
Kullanıcı growth’ü rastgele değil, sistematik yürütür.

### Sorulacaklar
- primary growth bottleneck
- dominant growth channel
- current retention problem var mı
- pricing/revenue hedefleri

### Sormadan alınacaklar
- goal progress
- routine completion
- growth checklist completion
- activation/retention/revenue metrics

### Sistem bileşenleri
- Growth readiness page
- goals + routines improvement
- growth review mode
- experiment/task linkage

### AI/MCP rolü
- bottleneck inference
- “next best growth action” önerileri
- growth weekly brief

### Done when
Kullanıcı growth sayfasında yapılacak iş listesinden çok, yön duygusu görür.

---

## Phase 6 — Execution Layer / Kanban
### Amaç
Tüm checklist ve kararları uygulanabilir görev akışına çevirmek.

### Kullanıcı faydası
Kullanıcı ayrı task tool’a gitmeden execution yönetir.

### Sorulacaklar
- görev owner gerekiyor mu
- due date policy
- priority system

### Sormadan alınacaklar
- overdue task counts
- completion velocity
- task churn
- blocked task patterns

### Sistem bileşenleri
- kanban board
- task filters
- task linkage to checklist/goals
- task templates

### AI/MCP rolü
- task prioritization suggestions
- overdue risk summaries

### Done when
Tiramisup yalnızca plan yüzeyi değil, execution yüzeyi olur.

---

## Phase 7 — Passive Data Collection via Real Integrations
### Amaç
Kullanıcıdan her şeyi istemek yerine sistemin kendisinin veri toplaması.

### Kullanıcı faydası
Daha az veri girişi, daha fazla karar kalitesi.

### İlk entegrasyon seti
- Stripe
- GA4 veya PostHog
- Mixpanel / Amplitude
- Segment (opsiyonel ikinci dalga)

### Sorulacaklar
- hangi provider kullanılıyor
- hangi account bağlanacak
- hangi product/property/source of truth

### Sormadan alınacaklar
- revenue
- subscriptions
- traffic
- active users
- events
- funnels

### Sistem bileşenleri
- credential capture
- sync job orchestration
- sync status/history
- provider mapping layer

### AI/MCP rolü
- sync issue explanation
- metric-source reconciliation
- passive intelligence summaries

### Done when
Kullanıcı için “metrics page” manuel veri formundan ziyade birleşik sağlık ekranına dönüşür.

---

## Phase 8 — Multi-Product Portfolio Intelligence
### Amaç
Founder’ın birden fazla ürününü karşılaştırmalı şekilde yönetmesini sağlamak.

### Kullanıcı faydası
Hangi ürüne yatırım yapacağını daha net seçer.

### Sorulacaklar
- product priority
- portfolio goals
- hangi ürünler aktif/yan proje

### Sormadan alınacaklar
- launch/growth score by product
- momentum by product
- revenue by product
- task burden by product

### Sistem bileşenleri
- products portfolio page
- portfolio dashboard
- compare mode
- focus recommendation

### AI/MCP rolü
- “which product needs attention now?” önerisi
- portfolio summary

### Done when
Tiramisup tek ürün workspace değil, founder portfolio cockpit olur.

---

## Phase 9 — Collaboration and Shared Operating Rhythm
### Amaç
Sistemi küçük ekipler için kullanılabilir yapmak.

### Kullanıcı faydası
Operasyon founder’ın kafasında değil, paylaşılan sistemde yaşar.

### Sorulacaklar
- ekip rolleri
- hangi kullanıcı hangi ürüne erişir
- görev ownership modeli

### Sormadan alınacaklar
- team activity
- routine completion by person
- task ownership load

### Sistem bileşenleri
- invites
- roles
- task ownership
- comments/notes
- shared review surfaces

### AI/MCP rolü
- team summary
- bottleneck ownership analysis

### Done when
2–8 kişilik ekip Tiramisup’ı gerçekten birlikte kullanabilir.

---

## Phase 10 — AI Review and Recommendation Layer
### Amaç
Tiramisup’ın yalnızca data gösteren değil, karar öneren bir sistem haline gelmesi.

### Kullanıcı faydası
Kullanıcı “bana ne oluyor?” değil, “şimdi ne yapmalıyım?” cevabını alır.

### Sorulacaklar
Bu fazda soru miktarı azaltılır; sistem daha çok mevcut sinyallerden öneri üretir.

### Sormadan alınacaklar
- metric trends
- task velocity
- goal slippage
- checklist stagnation
- sync anomalies

### Sistem bileşenleri
- weekly AI review
- launch risk summary
- growth bottleneck summary
- next best actions
- investor-ready summary draft

### Olası MCP / AI stack
- provider docs / API research için docs MCP türü araçlar
- website intelligence için crawl/browser MCP
- internal Tiramisup tool layer (MCP veya benzeri)

### Done when
Kullanıcı Tiramisup’ı “dashboard” değil, “operating advisor” gibi kullanmaya başlar.

---

## Phase 11 — Reporting, Benchmarks, Platformization
### Amaç
Ürünü olgun SaaS ve sonrasında platform seviyesine taşımak.

### Kullanıcı faydası
Kullanıcı yalnızca iç operasyon değil, dış iletişim ve stratejik kıyaslama da yapabilir.

### Çalışma başlıkları
- weekly / monthly exports
- investor update mode
- benchmark views
- template library
- API/webhooks
- billing/plans
- audit/security hardening

### Done when
Tiramisup bir founder cockpit’ten, genişleyebilir startup operating system platform’una dönüşür.

---

## 10. Sistem Tasarımı Özeti

### Kullanıcıdan sorulacak minimum veri
- product identity
- audience
- business model
- current stage
- primary goal

### Kullanıcıdan sorulacak ilerleyen veri
- primary KPI
- dominant channel
- strategic bottleneck
- team/ownership preferences

### Sormadan toplanacak veri
- task/load state
- checklist progression
- metrics history
- sync health
- provider data
- public website intelligence (ileride)

### AI’nin rolü
- yapılandırma
- özetleme
- öneri üretme
- haftalık review hazırlama

### MCP’nin rolü (gelecek mimari)
- integration APIs ile güvenilir bağlantılar
- crawl/browser intelligence
- internal tool abstraction

---

## 11. Yakın Vade İçin Net Tavsiye

Hemen şimdi yapılması gereken sıralama:

1. Foundation reset
2. Product understanding MVP
3. Launch operating system
4. Metrics/health layer cleanup
5. Growth operating system
6. Execution layer
7. First real integrations

Yani ürünün yakın vadede sorması gereken ana soru şu:

> “Bu founder’ın ürünü nedir, hangi aşamada, ana darboğazı ne ve bunu çözmek için hangi minimum veri + hangi minimum ritim gerekir?”

Roadmap’in geri kalanı bu soruya sistematik cevap vermek üzere tasarlanmalı.
