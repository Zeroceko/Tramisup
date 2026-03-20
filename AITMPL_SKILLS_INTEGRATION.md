# AIT MPL Skills for Tiramisup Users

**Kaynak:** https://www.aitmpl.com/  
**GitHub:** https://github.com/davila7/claude-code-templates  
**Toplam:** 724+ skill

Bu belge, Tiramisup kullanıcılarının ürün büyüme journey'sinde hangi aşamada hangi external skill'lerin değer üreteceğini kategorize eder.

---

## Skill Integration Stratejisi

Tiramisup'ta skill'ler **3 katmanda** entegre edilebilir:

### 1. AI Agent Skills (Backend)
- Kullanıcı Tiramisup içinde AI agent'la konuşuyor
- Agent bu skill'leri çalıştırabiliyor
- Örnek: "iOS projemi App Store'a hazırla" → app-store-preflight-skills çalışır

### 2. Dedicated Features (UI)
- Spesifik skill için UI var
- Kullanıcı button tıklıyor → skill backend'de çalışıyor
- Örnek: "SEO Audit" butonu → seo-audit skill çalışır

### 3. Integration Layer
- Skill bir entegrasyon olarak sisteme ekleniyor
- Örnek: GitHub integration → github-workflow-automation skill

---

## Phase 1: Idea → MVP (Pre-Launch)

### Product Development (Development Skills)
**Amaç:** Kullanıcının ürününü inşa etme hızını artırmak

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `react-patterns` | React best practices | "React code review" feature |
| `nextjs-best-practices` | Next.js optimization | "Next.js audit" feature |
| `frontend-dev-guidelines` | Frontend standards | Code review automation |
| `backend-dev-guidelines` | Backend standards | API review automation |
| `test-driven-development` | TDD workflow | Test generation feature |
| `security-best-practices` | Security audit | Security scan integration |
| `clean-code` | Code quality | Code quality score |
| `docker-expert` | Docker optimization | Docker audit |
| `typescript-expert` | TypeScript best practices | TS code review |

**Integration idea:**
- Pre-launch checklist'te "Code Quality Scan" section
- Kullanıcı GitHub repo bağlıyor
- Backend bu skill'leri çalıştırıp quality score üretiyor
- Her issue → task

### Design & UX (Creative Design Skills)
**Amaç:** UI/UX kalitesini artırmak

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `ui-ux-pro-max` | UI/UX intelligence | Design review feature |
| `figma-implement-design` | Figma to code | Design → code automation |
| `accessibility-auditor` | A11y compliance | Accessibility score |
| `web-design-guidelines` | Design standards | Design review |
| `mermaid-diagrams` | Diagram generation | Flow diagram generator |
| `user

interface-wiki` | UI best practices | UI pattern suggestions |

**Integration idea:**
- Pre-launch checklist'te "Design Quality" section
- Kullanıcı Figma link veya live URL veriyor
- Backend accessibility + UI guidelines check yapıyor
- Design readiness score gösteriliyor

### Analytics Setup (Analytics Skills)
**Amaç:** Launch öncesi tracking hazır olsun

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `google-analytics` | GA4 integration | Analytics setup wizard |

**Integration idea:**
- Pre-launch checklist'te "Analytics Setup" step
- GA4 property ID soruluyor
- Tracking implementation verify ediliyor

---

## Phase 2: Launch (Go-to-Market)

### Marketing & Growth (Business Marketing Skills)
**Amaç:** Launch hazırlığı ve ilk traction

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `launch-strategy` | Launch planning | Launch playbook generator |
| `copywriting` | Marketing copy | Landing page copy review |
| `seo-audit` | SEO health check | SEO readiness scan |
| `programmatic-seo` | Scale SEO pages | SEO content generator |
| `content-creator` | Content generation | Blog post generator |
| `social-content` | Social media content | Social post generator |
| `email-sequence` | Email campaigns | Email sequence builder |
| `pricing-strategy` | Pricing design | Pricing page review |
| `competitor-alternatives` | Competitor pages | Alternative page generator |
| `app-store-optimization` | ASO for mobile apps | App Store metadata optimizer |
| `analytics-tracking` | Tracking implementation | Tracking audit |
| `ab-test-setup` | A/B test planning | Experiment designer |

**Integration ideas:**
1. **Launch Playbook Generator**
   - Kullanıcı ürün tipini, hedef kitleyi, kanalları seçiyor
   - `launch-strategy` skill özelleştirilmiş launch planı üretiyor
   - Plan Tiramisup checklist'e dönüşüyor

2. **Landing Page Copy Generator**
   - Kullanıcı value prop, features, target audience veriyor
   - `copywriting` skill landing page sections yazıyor
   - Kullanıcı edit edip kullanıyor

3. **SEO Audit Dashboard**
   - Kullanıcı website URL'i veriyor
   - `seo-audit` + `programmatic-seo` skill'leri çalışıyor
   - SEO readiness score + issue list + recommended content

4. **App Store Optimizer** (iOS/Android apps için)
   - app-store-preflight-skills (zaten var) + `app-store-optimization`
   - Metadata, screenshots, keywords optimize ediliyor

### Web Data & Competitive Intelligence
**Amaç:** Rakip analizi ve market research

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `bright-data-mcp` | Web scraping | Competitor data extraction |
| `competitive-ads-extractor` | Ad analysis | Competitor ad intelligence |
| `competitor-alternatives` | Comparison pages | Alternative page generator |
| `x-twitter-scraper` | Twitter data | Social listening |

**Integration idea:**
- Growth dashboard'da "Competitor Intelligence" widget
- Kullanıcı rakip URL'leri veriyor
- Bright Data skill rakip pricing, features, messaging çekiyor
- Comparison matrix oluşturuluyor

---

## Phase 3: Post-Launch Growth

### Conversion Optimization (CRO Skills)
**Amaç:** Funnel optimize etmek

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `page-cro` | Page optimization | Landing page CRO audit |
| `signup-flow-cro` | Signup optimization | Signup funnel audit |
| `form-cro` | Form optimization | Form completion audit |
| `popup-cro` | Popup optimization | Popup effectiveness audit |
| `onboarding-cro` | Onboarding optimization | Onboarding flow audit |
| `paywall-upgrade-cro` | Upsell optimization | Paywall design review |

**Integration idea:**
- Growth dashboard'da "Conversion Health" score
- Kullanıcı funnel URL'leri veriyor
- CRO skill'leri her aşamayı audit ediyor
- Bottleneck tespit ediliyor + improvement suggestions

### Content & SEO Engine
**Amaç:** Organic growth

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `content-research-writer` | Research-backed content | Blog post writer |
| `programmatic-seo` | Template-based pages | SEO page generator |
| `seo-fundamentals` | SEO best practices | SEO education |
| `schema-markup` | Structured data | Schema generator |

**Integration idea:**
- "Content Engine" feature
- Kullanıcı target keywords veriyor
- `content-research-writer` + `programmatic-seo` blog post + SEO pages üretiyor
- Content calendar'a ekleniyor

### Workflow Automation (Growth Ops)
**Amaç:** Manuel işleri otomatize etmek

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `workflow-automation` | Automation patterns | Workflow builder |
| `zapier-make-patterns` | No-code automation | Zapier integration |
| `n8n-workflow-patterns` | n8n workflows | n8n integration |
| `inngest` | Background jobs | Task automation |
| `trigger-dev` | Async workflows | Event-driven automation |

**Integration idea:**
- "Automation Hub" feature
- Kullanıcı trigger + action tanımlıyor
- Workflow skill'leri execution oluşturuyor
- Örnek: "Stripe'ta yeni ödeme → Slack notification"

---

## Phase 4: Scale & Maturity

### Team & Communication
**Amaç:** Ekip büyüdükçe iletişimi yönetmek

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `slack-bot-builder` | Slack automation | Slack integration |
| `internal-comms` | Internal messaging | Update template generator |
| `email-composer` | Professional emails | Email draft generator |
| `frontend-to-backend-requirements` | Spec documentation | Handoff doc generator |
| `session-handoff` | Context transfer | Agent handoff docs |

**Integration idea:**
- Weekly review'da "Team Update Generator"
- Tiramisup haftalık progress özeti üretiyor
- `internal-comms` skill team update draft'ı oluşturuyor
- Slack'e veya email'e gönderilebiliyor

### Enterprise & Compliance (B2B products için)
**Amaç:** Enterprise readiness

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `data-privacy-compliance` | GDPR/privacy | Compliance audit |
| `security-compliance` | SOC2/ISO27001 | Security readiness |
| `api-security-best-practices` | API security | API audit |

**Integration idea:**
- "Enterprise Readiness" checklist
- Compliance skill'leri gap analysis yapıyor
- SOC2/GDPR readiness score

### AI & Advanced Growth (AI-powered products için)
**Amaç:** AI katmanını güçlendirmek

| Skill | Ne yapıyor | Tiramisup'ta kullanım |
|-------|-----------|---------------------|
| `langfuse` | LLM observability | AI monitoring integration |
| `langgraph` | Agent workflows | Agent builder |
| `crewai` | Multi-agent systems | Agent orchestration |
| `rag-implementation` | RAG systems | Knowledge base builder |

**Integration idea:**
- AI ürün yapan kullanıcılar için "AI Ops" dashboard
- LLM call volume, cost, latency tracking
- Langfuse integration ile observability

---

## Skill Integration Roadmap for Tiramisup

### Sprint 2.5 (zaten planlandı)
- ✅ **iOS App Store Preflight** (`app-store-preflight-skills`)

### Sprint 3–4 (Launch Operating System)
- **SEO Audit & Content Generator**
  - `seo-audit`
  - `content-research-writer`
  - `programmatic-seo`

- **Landing Page CRO Audit**
  - `page-cro`
  - `copywriting`

### Sprint 5–6 (Growth Phase)
- **Competitor Intelligence**
  - `bright-data-mcp`
  - `competitive-ads-extractor`

- **Conversion Funnel Audit**
  - `signup-flow-cro`
  - `form-cro`
  - `onboarding-cro`

### Sprint 7+ (Scale)
- **Workflow Automation Hub**
  - `zapier-make-patterns`
  - `n8n-workflow-patterns`
  - `inngest`

- **Team Communication Generator**
  - `internal-comms`
  - `slack-bot-builder`

---

## Priority Matrix (değer × implementation effort)

### High Value × Low Effort (ship first)
1. `seo-audit` — website URL in, issue list out
2. `copywriting` — inputs in, copy out
3. `content-research-writer` — topic in, blog post out
4. `competitor-alternatives` — competitor URL in, comparison page out
5. `launch-strategy` — product type in, launch plan out

### High Value × Medium Effort
6. `page-cro` — URL in, CRO audit + fixes out
7. `signup-flow-cro` — URL in, conversion improvements out
8. `bright-data-mcp` — competitor URLs in, data out
9. `competitive-ads-extractor` — competitor brand in, ad insights out
10. `app-store-optimization` — app metadata in, ASO suggestions out

### High Value × High Effort (later)
11. `workflow-automation` — trigger/action definition + execution engine
12. `langgraph` — agent builder UI + execution
13. `slack-bot-builder` — Slack OAuth + bot builder

---

## Implementation Pattern

Her skill için aynı pattern:

```typescript
// Backend skill runner
async function runSkill(skillName: string, inputs: any, userId: string) {
  // 1. Load skill from aitmpl
  const skill = await loadSkill(skillName)
  
  // 2. Run skill
  const result = await skill.execute(inputs)
  
  // 3. Store result
  await db.skillRun.create({
    userId,
    skillName,
    inputs,
    result,
    timestamp: new Date()
  })
  
  // 4. Return result to UI
  return result
}
```

UI'da:
```tsx
// Skill trigger button
<Button onClick={() => runSkill('seo-audit', { url: websiteUrl })}>
  Run SEO Audit
</Button>
```

---

## Next Steps

1. **`EXTERNAL_SKILLS.md` güncelle**
   - app-store-preflight-skills (var)
   - Priority skill'leri ekle

2. **`SPRINT_PLAN.md` güncelle**
   - Sprint 3: SEO + Content skills
   - Sprint 4: CRO skills
   - Sprint 5: Competitor intelligence

3. **Skill integration MVP**
   - Backend: skill runner service
   - UI: skill trigger components
   - DB: skill run history

4. **First 5 skills to ship**
   - `seo-audit`
   - `content-research-writer`
   - `copywriting`
   - `page-cro`
   - `launch-strategy`

---

Son güncelleme: Mart 2026
