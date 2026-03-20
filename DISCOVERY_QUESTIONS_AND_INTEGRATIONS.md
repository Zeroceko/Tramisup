# Tiramisup Discovery Questions & Integration Matrix

Son güncelleme: Mart 2026

Bu belge, ürünün kullanıcıdan hangi bilgileri hangi aşamada toplaması gerektiğini ve ileride hangi entegrasyonlarla hangi verilerin pasif olarak alınabileceğini tanımlar. Amaç, discovery, onboarding, weekly review ve automation sistemlerini geliştirici ekip için uygulanabilir hale getirmektir.

---

## 1. Soru Sistemi Tasarım İlkeleri

1. Her bilgi onboarding'te sorulmamalı.
2. Sadece inference ile güvenilir alınamayacak bilgi sorulmalı.
3. Aynı bilgi önce kullanıcıdan alınabilir, sonra entegrasyon/veri ile doğrulanabilir.
4. Her soru bir ürün kararına ya da öneri sistemine hizmet etmeli.
5. Her soru için saklama yeri, kullanım amacı ve yenilenme anı net olmalı.

---

## 2. Soru Katmanları

### Layer A - Signup / Account Setup
Amaç: account açmak ve ilk product workspace'i başlatmak.

#### Sorular
- Adın nedir?
- E-posta adresin nedir?
- Şifren nedir?

#### Saklama
- `User.name`
- `User.email`
- `User.passwordHash`

#### Kullanım
- auth
- kişiselleştirilmiş dashboard başlığı

---

### Layer B - First Product Setup (zorunlu onboarding)
Amaç: ürünü minimum gerekli seviyede tanımak.

#### Zorunlu sorular
1. Ürünün adı ne?
2. Bu ürün ne yapıyor? (kısa açıklama)
3. Hedef kitlen kim?
4. İş modelin ne?
   - Subscription
   - Freemium
   - One-time
   - Marketplace
   - Sales-led / custom pricing
5. Şu an hangi aşamadasın?
   - Idea
   - Building
   - Pre-launch
   - Just launched
   - Early traction
   - Growth
6. Şu anda en önemli hedefin ne?
   - Launch etmek
   - Aktivasyonu iyileştirmek
   - Kullanıcı kazanmak
   - Retention artırmak
   - Revenue büyütmek
7. Bir website'in var mı?
8. Hedef launch tarihi var mı?

#### Opsiyonel sorular
9. Ana acquisition kanalın ne olacak?
10. Bugün en büyük risk olarak neyi görüyorsun?
11. Başarıyı hangi metrikle ölçeceksin?
12. Ekip büyüklüğün kaç kişi?

#### Saklama
- `Product.name`
- `Product.description`
- `Product.targetAudience`
- `Product.businessModel`
- `Product.status`
- `Product.website`
- `Product.launchDate`
- ilerde eklenecek: `primaryGoal`, `northStarMetric`, `teamSize`, `primaryChannel`, `biggestRisk`

#### Kullanım
- default checklist template seçimi
- dashboard kurgusu
- recommendation engine bağlamı
- integration önerileri

---

### Layer C — Launch Readiness Discovery
Amaç: launch'a hazırlık düzeyini anlamak.

#### Sorular
1. Çekirdek kullanıcı akışın tamam mı?
2. Kullanıcı onboarding akışın var mı?
3. Launch sırasında trafik hangi kanaldan gelecek?
4. Launch başarısını neyle ölçeceksin?
5. Hangi alanlar seni en çok endişelendiriyor?
   - Product quality
   - Messaging/positioning
   - Legal/compliance
   - Technical readiness
6. Bir waitlist / email list / topluluk hazır mı?
7. Privacy / terms / billing yüzeylerin hazır mı?
8. Analytics kurulu mu?
9. **(iOS app için)** App Store submission'a hazır mısın? → App Store Preflight scan öner

#### Kullanım
- launch checklist personalisation
- blocker extraction
- launch score weighting
- recommended tasks
- iOS kullanıcıları için App Store Preflight scan trigger

---

### Layer D - Growth Readiness Discovery
Amaç: launch sonrası hangi growth sistemi eksik anlamak.

#### Sorular
1. Şu an ana darboğazın ne?
   - Acquisition
   - Activation
   - Retention
   - Revenue
2. Primary KPI'ın ne?
3. North star metric'in ne?
4. En güçlü acquisition kanalın hangisi?
5. Aktivasyonda ana kırılma noktası neresi?
6. Retention sorunu var mı?
7. Ücretli dönüşüm akışın çalışıyor mu?
8. Şu çeyrekte en önemli growth hedefin ne?

#### Kullanım
- growth checklist templating
- goals suggestions
- weekly review focus
- integration priority

---

### Layer E - Weekly Review Questions
Amaç: founder'a düzenli karar ritmi vermek.

#### Her hafta sorulacak aktif sorular
1. Bu hafta en önemli 1-3 önceliğin ne?
2. Hangi risk büyüdü?
3. Hangi deney / iş planlandığı gibi gitmedi?
4. Hangi task'ler bloklandı?
5. Bu hafta hangi metrik seni en çok endişelendirdi?
6. Gelecek hafta neyi değiştireceksin?

#### İleride AI'nin otomatik cevaplayabileceği alanlar
- "En riskli metrik hangisi?"
- "En çok sapmış goal hangisi?"
- "Hangi checklist kategorisi haftalardır ilerlemiyor?"
- "Overdue task yoğunluğu hangi alanda?"

---

### Layer F - Team / Collaboration Questions (ileride)
Amaç: sistemi ekip kullanımı için açmak.

#### Sorular
1. Kimler bu product workspace'e erişmeli?
2. Kim karar verici, kim uygulayıcı?
3. Task ownership gerekli mi?
4. Haftalık review'e kimler katılır?
5. Hangi paydaşlara rapor gidecek?

---

## 3. Sormadan Alınacak Bilgiler

### A. Internal application state
- launch checklist completion
- growth checklist completion
- task count by status
- overdue tasks
- goal progress / goal drift
- routine completion cadence
- integration connection state
- last sync state

### B. Revenue data
- MRR
- active subscriptions
- churn events
- plan mix
- upgrade/downgrade events

### C. Product usage data
- DAU / MAU
- sessions
- acquisition channel breakdown
- activation funnel completion
- retention cohort behavior

### D. Public product signals
- website exists or not
- pricing page exists or not
- docs/help center exists or not
- launch messaging surface exists or not
- changelog/blog presence

---

## 4. Entegrasyon Matrisi

### Tier 1 - MVP sonrası hemen değer üreten entegrasyonlar

#### Stripe
**Amaç:** revenue truth source
**Getirilecek veri:**
- MRR
- active subscriptions
- plan mix
- churned subscriptions
- upgrades/downgrades
**Ürün içi kullanım:**
- revenue dashboard
- revenue trend
- goal tracking
- pricing/revenue health

#### GA4
**Amaç:** traffic + acquisition visibility
**Getirilecek veri:**
- users
- sessions
- source/medium
- campaign breakdown
- landing page performance
**Ürün içi kullanım:**
- acquisition score
- channel health
- launch sonrası traffic quality

#### PostHog
**Amaç:** product analytics ve activation visibility
**Getirilecek veri:**
- event counts
- user funnels
- session patterns
- feature usage
**Ürün içi kullanım:**
- activation score
- activation bottleneck
- product engagement summary

---

### Tier 2 - Büyüme katmanı için güçlü entegrasyonlar

#### Mixpanel
- funnels
- cohorts
- retention
- user path analysis

#### Amplitude
- product analytics
- pathing
- activation/retention insights

#### Segment
- event unification layer
- source aggregation
- future routing

#### HubSpot (ileride)
- B2B lead pipeline
- demo requests
- lifecycle stage
- sales-assisted revenue

#### Salesforce (ileride)
- larger B2B teams
- pipeline/revenue visibility

---

### Tier 3 - Ops / support / product context entegrasyonları

#### Intercom / Crisp / Zendesk
- support volume
- bug / churn signals
- customer pain clustering

#### Notion / Linear / Jira
- planning and execution sync
- task context import/export

#### GitHub
- deploy frequency
- release cadence
- engineering activity signal

#### Sentry / LogRocket / PostHog session replay
- error health
- product quality risk

#### App Store Preflight (iOS developer kullanıcıları için)
**Amaç:** iOS app launch readiness ve App Store rejection risk azaltma
**Skill referansı:** [app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills)
**Getirilecek veri:**
- Rejection pattern detection (metadata, privacy, subscription, design, entitlements)
- App Store readiness score
- Critical/warning/passed issues list
**Ürün içi kullanım:**
- Launch checklist "App Store readiness" kategorisi
- Otomatik task generation her issue için
- App Store readiness score dashboard'da görünür
**Implementation:**
- Kullanıcı Xcode project upload eder veya GitHub repo bağlar
- Backend skill'i çalıştırır
- Rejection risk raporu oluşturur
- Issues → tasks conversion
**Not:** Bu iOS/macOS native app yapan kullanıcılar için optional feature. Web app kullanan kullanıcılar için geçerli değil.
- error health
- product quality risk

#### Slack
- weekly review delivery
- alerts
- digest surfaces

#### Resend / Postmark
- lifecycle email health
- email delivery / weekly summaries

---

### Tier 4 - Research / intelligence / crawl layer

#### Website crawl / browser automation stack
- pricing presence
- docs presence
- public product messaging
- launch readiness audit

#### Search / docs lookup tools
- category benchmark research
- competitor intelligence
- docs/API implementation support

---

## 5. AI ve MCP Katmanı için Önerilen Roller

### AI Tasks
1. Product profile structuring
2. Launch risk summary
3. Growth bottleneck summary
4. Weekly review draft
5. Recommended next actions
6. Investor update draft
7. Experiment brief draft

### MCP / Tool Categories (gelecekte)
1. **Vendor data MCPs**
   - Stripe
   - GA4
   - analytics tools
2. **Website intelligence MCPs**
   - crawl/browser/scrape
3. **Internal product MCPs**
   - get_product_profile
   - get_launch_risks
   - get_growth_health
   - get_next_actions
4. **Research MCPs**
   - docs lookup
   - benchmark / category research

---

## 6. Engineering Implications

### Yeni data fields (önerilen)
- `Product.primaryGoal`
- `Product.primaryChannel`
- `Product.northStarMetric`
- `Product.teamSize`
- `Product.biggestRisk`
- `Product.stageDetail`

### Yeni product surfaces
- Product creation wizard
- Launch review
- Growth readiness
- Weekly review mode
- Integration setup center
- Portfolio view

### Yeni system layers
- recommendation engine
- sync orchestration
- passive intelligence layer
- AI summary layer

---

## 7. Sprintable Backlog Themes

1. onboarding & product understanding
2. launch operating system
3. iOS App Store preflight integration (optional — iOS developer kullanıcıları için)
4. growth operating system
5. kanban / execution
6. passive data collection
7. AI summaries & weekly review
8. collaboration & reporting
