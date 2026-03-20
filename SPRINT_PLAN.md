# Sprint Plan - Tiramisup

Son güncelleme: Mart 2026

Bu belge roadmap'i geliştirici ekip için uygulanabilir sprint paketlerine böler. Her sprint, net teslimatlar, bağımlılıklar ve doğrulama kriterleri içerir.

---

## Sprint 0 - Foundation Reset
### Goal
Ürünü güvenilir geliştirme ve teslim ortamına oturtmak.

### Scope
- docs truth pass
- runtime stabilization
- auth/session cleanup
- seed reliability
- empty/error/loading state standardization

### Developer Tasks
- [ ] `.next` cache sorunlarını azaltacak local dev playbook yaz
- [ ] `globals.css` / Tailwind dev uyarısını kök neden bazlı düzelt
- [ ] auth flow'u smoke-test et (signup/login/logout/session refresh)
- [ ] seed akışını verify et
- [ ] stale docs alanlarını temizle

### Verification
- [ ] `next build` temiz
- [ ] signup -> dashboard akışı çalışıyor
- [ ] docs kod gerçeğiyle uyumlu

---

## Sprint 1 - Product Creation & Understanding
### Goal
Kullanıcının ürünü generic seed yerine kendi bağlamıyla başlatmasını sağlamak.

### Scope
- products page
- create product wizard
- active product context
- product profile fields

### Developer Tasks
- [ ] `app/products/page.tsx` oluştur
- [ ] `app/products/new/page.tsx` wizard oluştur
- [ ] API: `POST /api/products`
- [ ] nav'a active product selector ekle
- [ ] `Product` modeline eksik onboarding alanları ekle/gerekirse migration hazırla
- [ ] template-aware seed mantığı tasarla

### Verification
- [ ] kullanıcı ikinci ürün oluşturabiliyor
- [ ] aktif product değişince dashboard context değişiyor
- [ ] ilk ürün oluşturma akışı 5 dakikanın altında tamamlanıyor

---

## Sprint 2 — Launch Operating System
### Goal
Launch readiness'i gerçek karar sistemine dönüştürmek.

### Scope
- launch checklist redesign
- blocker extraction
- task linkage
- launch review surface

### Developer Tasks
- [ ] `app/pre-launch/page.tsx` redesign
- [ ] kategori bazlı scorecards ekle
- [ ] checklist item -> task create action ekle
- [ ] task priority / overdue visibility artır
- [ ] blocker summary component yaz
- [ ] launch review summary state tasarla

### Verification
- [ ] kullanıcı launch readiness neden düşük anlıyor
- [ ] eksik checklist item'lardan task üretebiliyor
- [ ] en az bir blocker summary görünümü var

---

## Sprint 2.5 — iOS App Store Preflight (optional — iOS developer kullanıcıları için)
### Goal
iOS app yapan kullanıcıların App Store rejection riskini Tiramisup içinden azaltmak.

### Scope
- iOS App Store preflight scan integration
- Rejection pattern detection
- Automated task creation from issues
- App Store readiness score

### Reference
- Skill: [app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills)
- Bu skill iOS/macOS Xcode projelerini App Store submission öncesi tarar
- Common rejection patterns, privacy manifest, metadata compliance, subscription pricing checks

### Developer Tasks
- [ ] Pre-launch sayfasına "iOS App Store Scan" section ekle
- [ ] Project upload mechanism (local file upload veya GitHub repo bağlantısı)
- [ ] Backend: app-store-preflight-skills integration
  - [ ] Xcode project parse
  - [ ] Rule checks (metadata, privacy, subscription, design, entitlements)
  - [ ] Rejection risk report generation
- [ ] UI: App Store readiness score card
- [ ] UI: Issues list (Critical / Warning / Passed)
- [ ] "Create tasks from issues" action — her rejection pattern → task
- [ ] Task descriptions include fix guides from skill rules

### User Flow
1. Kullanıcı pre-launch sayfasında "Scan iOS Project" butonuna tıklar
2. Xcode project path veya GitHub repo bağlar
3. Backend skill'i çalıştırır, rejection patterns tespit eder
4. Dashboard'da App Store readiness score gösterilir
5. Her issue için "Create Task" ile otomatik task üretilir
6. Tasks board'a düşer, kullanıcı fix'ler

### Verification
- [ ] Kullanıcı iOS project upload edebiliyor veya GitHub bağlayabiliyor
- [ ] Scan tamamlandığında rejection risk raporu gösteriliyor
- [ ] Critical/Warning/Passed kategorilerde issues listeleniyor
- [ ] Her issue'dan task oluşturulabiliyor
- [ ] App Store readiness score dashboard'da görünüyor

### Future Enhancement
- [ ] GitHub integration: her commit'te otomatik scan
- [ ] Weekly review'a App Store readiness dahil et
- [ ] Multi-platform support (Android Play Store checks)

---

## Sprint 3 - SEO & Content Skills Integration
### Goal
Launch-ready kullanıcılara SEO ve content generation desteği sağlamak.

### Scope
- SEO audit skill integration
- Content generator integration
- Copywriting assistant integration
- Pre-launch checklist'e skill-based features

### Reference
- Skill library: [AITMPL](https://www.aitmpl.com/)
- Skills: `seo-audit`, `content-research-writer`, `copywriting`
- Pattern: Backend skill runner + UI trigger + result storage

### Developer Tasks

#### Foundation
- [ ] `lib/skills/runner.ts` — generic skill execution engine
  ```typescript
  async function runSkill(skillName: string, inputs: any, userId: string)
  ```
- [ ] `prisma/schema.prisma` — SkillRun model ekle
  ```prisma
  model SkillRun {
    id          String   @id @default(cuid())
    userId      String
    productId   String?
    skillName   String
    inputs      Json
    result      Json
    status      String   // pending/running/completed/failed
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```
- [ ] API: `POST /api/skills/run` — skill execution endpoint
- [ ] API: `GET /api/skills/runs` — skill run history

#### SEO Audit Integration
- [ ] Pre-launch page'e "SEO Audit" section ekle
- [ ] UI: Website URL input + "Run SEO Audit" button
- [ ] Backend: `seo-audit` skill integration
  - [ ] URL in → lighthouse audit + meta tags check + sitemap verify
  - [ ] SEO readiness score (0-100)
  - [ ] Issue list (Critical / Warning / Passed)
- [ ] UI: SEO score card component
- [ ] UI: Issues list + "Create tasks from issues" action
- [ ] Task descriptions include fix guides

#### Content Generator Integration
- [ ] Growth page'e "Content Generator" section ekle
- [ ] UI: Topic/keywords input + target audience + tone selection
- [ ] Backend: `content-research-writer` skill integration
  - [ ] Research → outline → full blog post
  - [ ] Include citations + SEO optimization
- [ ] UI: Generated content preview + edit + save
- [ ] Content calendar'a save (future: content calendar model)

#### Copywriting Assistant Integration
- [ ] Pre-launch page'e "Landing Page Copy Review" section ekle
- [ ] UI: Landing page URL input + "Review Copy" button
- [ ] Backend: `copywriting` skill integration
  - [ ] Value prop analysis
  - [ ] CTA effectiveness check
  - [ ] Messaging clarity score
- [ ] UI: Copy review report + improvement suggestions
- [ ] "Apply suggestions" action → task list

### User Flow - SEO Audit
1. Kullanıcı pre-launch page'de "SEO Audit" section görür
2. Website URL'i girer, "Run Audit" tıklar
3. Backend skill çalışır (~30 saniye)
4. SEO score (0-100) + issue list gösterilir
5. Her issue için "Create Task" ile task oluşturulur
6. Tasks board'a düşer

### User Flow - Content Generator
1. Kullanıcı growth page'de "Generate Content" tıklar
2. Topic, keywords, audience, tone seçer
3. Backend skill research + outline + content üretir (~60 saniye)
4. Generated content preview gösterilir
5. Edit edip save veya discard

### Verification
- [ ] Kullanıcı website URL girip SEO audit alabiliyor
- [ ] SEO score + issue list gösteriliyor
- [ ] SEO issues'lardan task oluşturulabiliyor
- [ ] Kullanıcı topic girip blog post generate edebiliyor
- [ ] Generated content edit edilip save edilebiliyor
- [ ] Skill run history görülebiliyor

### Technical Notes
- Skills AITMPL repo'dan import edilecek (npm package veya git submodule)
- Skill execution async job olarak çalışacak (bg_shell veya separate worker)
- Long-running skill'ler için progress indicator
- Skill results cache'lenebilir (same URL + same skill → cached result)

---

## Sprint 4 - CRO & Launch Strategy Skills
### Goal
Launch-ready kullanıcılara conversion optimization ve launch planning desteği sağlamak.

### Scope
- CRO audit skill integration
- Launch strategy generator integration
- Metrics Health Layer foundation

### Reference
- Skills: `page-cro`, `launch-strategy`, `signup-flow-cro`

### Developer Tasks

#### CRO Audit Integration
- [ ] Pre-launch page'e "Conversion Audit" section ekle
- [ ] UI: Landing page URL + funnel URL'leri input
- [ ] Backend: `page-cro` + `signup-flow-cro` skill integration
  - [ ] Page structure analysis
  - [ ] CTA effectiveness check
  - [ ] Form friction analysis
  - [ ] Conversion bottleneck detection
- [ ] UI: Conversion health score
- [ ] UI: Bottleneck list + improvement suggestions
- [ ] "Create tasks from suggestions" action

#### Launch Strategy Generator
- [ ] Growth page'e "Launch Playbook" section ekle
- [ ] UI: Product type, target audience, channels selection
- [ ] Backend: `launch-strategy` skill integration
  - [ ] Product Hunt strategy
  - [ ] Social media launch plan
  - [ ] Email announcement strategy
  - [ ] Influencer/press outreach list
- [ ] UI: Generated launch plan preview
- [ ] "Convert to checklist" action → launch checklist items

#### Metrics Health Layer
- [ ] metric entry form UX iyileştir
- [ ] latest vs previous period delta hesapları ekle
- [ ] KPI config modelini tasarla veya geçici config oluştur
- [ ] metrics dashboard summary cards ekle
- [ ] no-data states yönlendirici hale getir

### Verification
- [ ] Kullanıcı landing page CRO audit alabiliyor
- [ ] Conversion bottleneck'ler tespit ediliyor
- [ ] Improvement suggestions task'e dönüştürülebiliyor
- [ ] Kullanıcı product type seçip launch playbook generate edebiliyor
- [ ] Generated launch plan checklist'e dönüştürülebiliyor
- [ ] Kullanıcı son 30 gün sağlığını tek sayfada okuyabiliyor

---

## Sprint 5 - Growth Operating System & Competitor Intelligence
### Goal
Growth tarafını launch sonrası decision loop'a dönüştürmek + competitor intelligence eklemek.

### Scope
- growth readiness page
- goals/routines cleanup
- weekly growth review basis
- competitor intelligence skill integration

### Reference
- Skills: `bright-data-mcp`, `competitive-ads-extractor`

### Developer Tasks

#### Growth Readiness
- [ ] `app/growth-readiness/page.tsx` oluştur
- [ ] API: growth checklist CRUD/toggle ekle
- [ ] goals section UX sadeleştir
- [ ] routine completion history ekle
- [ ] growth score hesabı tasarla

#### Competitor Intelligence Integration
- [ ] Growth page'e "Competitor Intelligence" section ekle
- [ ] UI: Competitor URL'leri input (max 3)
- [ ] Backend: `bright-data-mcp` skill integration
  - [ ] Pricing extraction
  - [ ] Feature list extraction
  - [ ] Messaging/positioning extraction
- [ ] Backend: `competitive-ads-extractor` skill integration
  - [ ] Ad creative analysis
  - [ ] Ad messaging patterns
- [ ] UI: Competitor comparison matrix
- [ ] UI: Competitive insights summary

### Verification
- [ ] acquisition/activation/retention/revenue alanları net görünüyor
- [ ] growth checklist çalışıyor
- [ ] growth page bir karar yüzeyi gibi davranıyor
- [ ] Kullanıcı competitor URL girip pricing/features çekebiliyor
- [ ] Competitor comparison matrix görüntülenebiliyor

---

## Sprint 6 - Execution Layer / Kanban
### Goal
Task modelini gerçek execution engine'e çevirmek.

### Scope
- kanban board
- task filters
- task movement
- task linkage

### Developer Tasks
- [ ] `app/board/page.tsx` oluştur
- [ ] `components/KanbanBoard.tsx` yaz
- [ ] `TaskCard` component'i yaz
- [ ] `PATCH /api/tasks/[id]` veya mevcut route standardizasyonu yap
- [ ] filter/search/sort ekle

### Verification
- [ ] task'ler TODO/IN_PROGRESS/DONE arasında taşınabiliyor
- [ ] overdue task'ler görünür
- [ ] execution layer Notion/Trello'ya ihtiyaç azaltıyor

---

## Sprint 7 - Dashboard 2.0 & Cohesion
### Goal
Tüm sistemi tek bir operating cockpit hissine getirmek.

### Scope
- dashboard redesign
- page cohesion
- nav improvements

### Developer Tasks
- [ ] dashboard'da launch score + growth score + task burden + revenue summary ekle
- [ ] recommended next actions widget oluştur
- [ ] page header / section rhythm standardize et
- [ ] nav'a products + board + selector ekle

### Verification
- [ ] ürün tek sistem gibi hissediyor
- [ ] dashboard "what now?" sorusuna cevap veriyor

---

## Sprint 8 - Real Integrations v1
### Goal
Kullanıcıdan sormadan ilk gerçek verileri toplamak.

### Scope
- Stripe
- GA4 veya PostHog
- sync jobs
- source mapping

### Developer Tasks
- [ ] integration credential storage güvenli hale getir
- [ ] Stripe revenue sync implement et
- [ ] bir analytics provider seç ve first sync implement et
- [ ] `SyncJob` lifecycle implement et
- [ ] sync history UI yaz
- [ ] manual vs integration source labeling ekle

### Verification
- [ ] en az bir revenue metriği otomatik geliyor
- [ ] en az bir acquisition/usage metriği otomatik geliyor
- [ ] sync failure görünür

---

## Sprint 9 - Weekly Review & AI Summary Layer
### Goal
Ürünü karar desteği sistemine dönüştürmek.

### Scope
- weekly review mode
- AI-generated summaries
- next best action suggestions

### Developer Tasks
- [ ] review entry point oluştur
- [ ] launch review prompt/context yapısı tasarla
- [ ] growth review prompt/context yapısı tasarla
- [ ] summary persistence stratejisi belirle
- [ ] actionable recommendation cards ekle

### Verification
- [ ] founder haftalık review çıktısı alabiliyor
- [ ] öneriler ürün state'ine dayanıyor

---

## Sprint 10 - Collaboration Layer
### Goal
Küçük ekip kullanımını açmak.

### Scope
- invites
- roles
- task ownership
- shared review surfaces

### Developer Tasks
- [ ] team/member model tasarla
- [ ] invite flow yaz
- [ ] task owner alanı ekle
- [ ] role-based access rules tasarla

### Verification
- [ ] iki kullanıcı aynı workspace'i kullanabiliyor
- [ ] görevler kişilere atanabiliyor

---

## Sprint 11 - Reporting & Platformization
### Goal
Ürünü stakeholder ve platform katmanına taşımak.

### Scope
- exports
- benchmark views
- external reporting
- API/webhook groundwork

### Developer Tasks
- [ ] weekly summary export
- [ ] investor update mode
- [ ] benchmark data model planı
- [ ] internal API abstraction planı

### Verification
- [ ] ürün sadece iç kullanım değil, dış iletişim için de kullanılabiliyor

---

## Notes for Developers

### Build order recommendation
1. Sprint 0
2. Sprint 1
3. Sprint 2
4. Sprint 2.5 (optional — iOS developers için)
5. Sprint 3 (SEO & Content Skills)
6. Sprint 4 (CRO & Launch Strategy Skills)
7. Sprint 5 (Growth Operating System & Competitor Intelligence)
8. Sprint 6 (Kanban)
9. Sprint 7 (Dashboard 2.0)
10. Sprint 8+

### Do not do yet
- pixel-perfect landing page work
- early mobile app
- overbuilt AI chat surface
- enterprise permissions before collaboration basics

### Definition of progress
Progress = a stronger operator loop, not just more screens.
