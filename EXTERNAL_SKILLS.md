# External Skills & Resources

Bu dosya Tiramisup development sürecinde kullanılabilecek dış skill ve resource'ları toplar.

---

## 1. iOS App Store Preflight Skills

**Repo:** https://github.com/truongduy2611/app-store-preflight-skills

**Amaç:** iOS/macOS Xcode projelerini App Store submission öncesi App Store rejection riskine karşı taramak.

**Ne yapar:**
- Metadata compliance (character limits, competitor terms, trademark violations)
- Subscription pricing display compliance
- Privacy manifest checks
- Sign in with Apple requirements
- Entitlements audit
- Design guideline compliance

**Tiramisup'ta nerede kullanılır:**
- **Sprint 2.5** — iOS App Store Preflight integration
- Pre-launch sayfasında "iOS App Store Scan" özelliği
- iOS developer kullanıcıları için launch readiness artırıcı

**Target kullanıcı:**
- iOS/macOS app yapan founder'lar
- Tiramisup'ı launch hazırlığı için kullanan iOS developer'lar

**Implementation notları:**
- Xcode project upload veya GitHub repo bağlantısı gerekir
- Backend'de skill'i çalıştırıp rejection risk raporu oluşturulur
- Her issue otomatik task'e dönüştürülür
- App Store readiness score dashboard'da gösterilir

**Referanslar:**
- `SPRINT_PLAN.md` — Sprint 2.5
- `DISCOVERY_QUESTIONS_AND_INTEGRATIONS.md` — Tier 3 integrations, Layer C questions

---

## 2. AITMPL Skill Library (724+ skills)

**Website:** https://www.aitmpl.com/  
**GitHub:** https://github.com/davila7/claude-code-templates

**Amaç:** Claude Code için 724+ hazır skill. Tiramisup kullanıcılarının ürün büyüme journey'sinde farklı aşamalarda kullanılabilir.

**Skill kategorileri:**
- Development (React, Next.js, TypeScript, testing, security)
- Creative Design (UI/UX, Figma, accessibility, diagrams)
- Business & Marketing (SEO, copywriting, launch strategy, CRO, pricing)
- Web Data (scraping, competitor intelligence, research)
- Workflow Automation (Zapier, n8n, Inngest, Trigger.dev)
- Analytics (Google Analytics, tracking setup)
- Enterprise Communication (Slack bots, internal comms, compliance)
- AI & Research (LangChain, LangGraph, CrewAI, RAG, LLM observability)
- Scientific & Data (PDF, Excel, data processing)

**Tiramisup'ta kullanım stratejisi:**

### Phase 1: Pre-Launch (MVP)
- `seo-audit` — SEO readiness scan
- `copywriting` — Landing page copy generator
- `ui-ux-pro-max` — Design review
- `accessibility-auditor` — A11y compliance
- `react-patterns` / `nextjs-best-practices` — Code quality

### Phase 2: Launch
- `launch-strategy` — Launch playbook generator
- `content-research-writer` — Blog post generator
- `programmatic-seo` — SEO page generator
- `app-store-optimization` — ASO for mobile apps
- `analytics-tracking` — Tracking audit

### Phase 3: Growth
- `page-cro` — Landing page CRO audit
- `signup-flow-cro` — Signup funnel optimization
- `competitive-ads-extractor` — Competitor ad intelligence
- `bright-data-mcp` — Web scraping & data
- `ab-test-setup` — A/B test designer

### Phase 4: Scale
- `workflow-automation` — Automation hub
- `slack-bot-builder` — Slack integration
- `internal-comms` — Team update generator
- `langgraph` / `crewai` — AI agent systems

**Implementation pattern:**
```typescript
async function runSkill(skillName: string, inputs: any, userId: string) {
  const skill = await loadSkill(skillName)
  const result = await skill.execute(inputs)
  await db.skillRun.create({ userId, skillName, inputs, result })
  return result
}
```

**Priority skills (high value × low effort):**
1. `seo-audit` — Sprint 3
2. `content-research-writer` — Sprint 3
3. `copywriting` — Sprint 3
4. `page-cro` — Sprint 4
5. `launch-strategy` — Sprint 4

**Referanslar:**
- `AITMPL_SKILLS_INTEGRATION.md` — detaylı integration roadmap
- `SPRINT_PLAN.md` — Sprint 3–7 skill integration plans
- `DISCOVERY_QUESTIONS_AND_INTEGRATIONS.md` — skill-based features

---

## Future Skills (placeholder)

Buraya ileride kullanılabilecek başka external skill'ler eklenebilir:
- Android Play Store preflight
- GDPR compliance checker
- Performance audit (Core Web Vitals)
- Security audit skills

---

Son güncelleme: Mart 2026
