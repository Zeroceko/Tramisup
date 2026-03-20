# Research Synthesizer Skill

**When to use:** Deep research, literature review, synthesis, competitive analysis, market research, trend analysis, knowledge gathering

---

## Overview

Comprehensive research methodology for gathering, analyzing, and synthesizing information from multiple sources. Transforms scattered data into actionable insights.

---

## Research Process Framework

### 5-Stage Research Method

```markdown
## Research Process

1. DEFINE → What do we need to know?
2. GATHER → Collect sources
3. ANALYZE → Extract insights
4. SYNTHESIZE → Connect patterns
5. PRESENT → Actionable findings
```

---

## Stage 1: DEFINE (Research Question)

### Creating Strong Research Questions

**Bad research question:**
> "What's the competition?"

**Good research question:**
> "What features do successful launch readiness tools offer, and which ones correlate with high user retention?"

**Framework:**
```markdown
## Research Question Template

**Context:** [What we already know]
**Gap:** [What we don't know]
**Question:** [Specific question]
**Why it matters:** [Business impact]
**Success criteria:** [What answers would be useful]

### Example (Tiramisup):

**Context:** We have a checklist-based launch tool
**Gap:** Don't know which features drive retention
**Question:** What features do competitors offer that correlate with >70% weekly retention?
**Why it matters:** Informs Sprint 3+ roadmap priorities
**Success criteria:** Ranked list of features with retention data
```

---

### Research Types

**Exploratory (What's out there?):**
- Competitive landscape
- Market trends
- User behavior patterns

**Descriptive (What is it?):**
- Feature comparison
- Pricing analysis
- User demographic analysis

**Explanatory (Why?):**
- Causation analysis (Feature X → Retention Y)
- User motivation research
- Churn root cause analysis

**Predictive (What will happen?):**
- Market forecasts
- Feature impact modeling
- Growth projections

---

## Stage 2: GATHER (Source Collection)

### Source Types

**Primary Sources (Direct data):**
```markdown
## Primary Research Methods

### 1. User Interviews
**Format:** 1-on-1, 30-45 min
**Sample size:** 10-15 for qualitative insights
**Questions:** Open-ended (see Product Strategist skill)

### 2. Surveys
**Format:** Online questionnaire
**Sample size:** 100+ for quantitative data
**Tools:** Typeform, Google Forms, SurveyMonkey

### 3. User Testing
**Format:** Observed task completion
**Sample size:** 5-8 users per iteration
**Method:** Think-aloud protocol

### 4. Analytics Data
**Source:** Google Analytics, Mixpanel, PostHog
**Data:** Usage patterns, funnels, retention
**Period:** 30-90 days for trends
```

**Secondary Sources (Existing research):**
```markdown
## Secondary Research Sources

### Industry Reports
- Gartner, Forrester (paid)
- Product Hunt reports (free)
- State of SaaS reports

### Academic Papers
- Google Scholar
- ResearchGate
- arXiv (for technical topics)

### Competitor Analysis
- Websites, blogs, changelogs
- App Store reviews
- G2, Capterra reviews
- Product Hunt launches

### News & Trends
- TechCrunch, The Verge
- Hacker News, Reddit
- Twitter (product launches, discussions)
```

---

### Search Strategy

**Google Search Operators:**
```
"exact phrase"           - Exact match
site:productfirms.com   - Search specific site
filetype:pdf            - Find PDFs
2024..2026              - Date range
-exclude                - Exclude term
related:tiramisup.com   - Similar sites
```

**Example:**
```
"launch readiness" OR "product launch" site:medium.com 2024..2026
"SaaS checklist" filetype:pdf
"startup launch" -marketing (exclude marketing articles)
```

---

### Source Evaluation (CRAAP Test)

```markdown
## Source Quality Checklist

**Currency:** How recent is it?
- ✅ <2 years for tech topics
- ⚠️ 2-5 years (verify still relevant)
- ❌ >5 years for fast-moving industries

**Relevance:** Does it answer our question?
- ✅ Directly addresses research question
- ⚠️ Tangentially related (use selectively)
- ❌ Off-topic

**Authority:** Who wrote it?
- ✅ Domain expert, reputable company
- ⚠️ Anonymous but well-sourced
- ❌ Unknown source, no credentials

**Accuracy:** Is it correct?
- ✅ Cites sources, data-driven
- ⚠️ Opinion but credible
- ❌ No sources, anecdotal only

**Purpose:** Why was it written?
- ✅ Educational, research-driven
- ⚠️ Promotional but still useful
- ❌ Pure advertising
```

---

## Stage 3: ANALYZE (Extract Insights)

### Note-Taking System

**Zettelkasten Method (for deep research):**

```markdown
## Note Structure

### Fleeting Notes (Quick captures)
- Raw quotes from sources
- Initial thoughts
- Questions raised

### Literature Notes (Source summaries)
**Source:** [Author, Title, Date, URL]
**Key Points:**
- Point 1
- Point 2
**Quotes:**
> "Exact quote with page number"
**My Thoughts:**
- [Your analysis]

### Permanent Notes (Insights)
**Insight:** [One clear idea]
**Evidence:** [Links to literature notes]
**Connections:** [Related insights]
**Action:** [What to do with this]
```

**Example:**

```markdown
## Literature Note: Competitor Analysis - Notion

**Source:** Notion.so, explored 2026-03-20
**Category:** Project management / Wiki

**Key Features:**
- Block-based editor (drag-drop)
- Databases with multiple views
- Templates library
- Team collaboration
- API + integrations

**Pricing:**
- Free: Unlimited pages, 10 guests
- Plus: $10/user/mo (unlimited guests)
- Business: $18/user/mo (advanced permissions)

**Strengths:**
- Extremely flexible
- Strong community (templates)
- All-in-one workspace

**Weaknesses:**
- Steep learning curve
- Performance issues with large databases
- No offline mode

**Relevance to Tiramisup:**
- Template library inspiration ✅
- Block-based editor = overkill for our use case
- Pricing: We're simpler, can be cheaper

**Action Items:**
- Consider adding checklist templates library
- Don't over-complicate with flexible editors
```

---

### Data Analysis Frameworks

**Competitive Analysis Matrix:**

```markdown
## Competitor Feature Comparison

| Feature | Notion | Asana | ClickUp | Tiramisup | Importance |
|---------|--------|-------|---------|-----------|------------|
| Checklists | ✅ | ✅ | ✅ | ✅ | High |
| Launch-specific | ❌ | ❌ | ❌ | ✅ | High |
| Task mgmt | ✅✅ | ✅✅✅ | ✅✅✅ | ✅ | Medium |
| Templates | ✅✅✅ | ✅ | ✅✅ | ❌ | High |
| Mobile app | ✅ | ✅ | ✅ | ❌ | Medium |
| Pricing | $10+ | $11+ | $7+ | $19 | - |

**Gaps to fill:**
1. Templates library (HIGH priority)
2. Mobile app (MEDIUM priority)

**Differentiators:**
1. Launch-specific workflow (unique)
2. Simpler than competition
```

---

**SWOT Analysis:**

```markdown
## SWOT Analysis: Tiramisup

### STRENGTHS
- Focus on launch readiness (niche)
- Simple, fast onboarding
- No learning curve
- Indie-friendly pricing

### WEAKNESSES
- Limited feature set vs competitors
- No mobile app yet
- Small team (slow development)
- No template library

### OPPORTUNITIES
- Underserved indie maker market
- Content marketing (launch guides)
- Integrations (Slack, GitHub)
- AI-powered checklist generation

### THREATS
- Notion/Asana could add launch features
- Low switching costs
- Competitive market
- Economic downturn (budget cuts)
```

---

**Porter's Five Forces (Market Analysis):**

```markdown
## Porter's Five Forces: Launch Tool Market

### 1. Threat of New Entrants: HIGH
- Low barriers to entry (SaaS is easy to build)
- Many project management tools exist
- Mitigation: Focus on niche, build community

### 2. Bargaining Power of Suppliers: LOW
- Many hosting providers (Vercel, AWS, etc.)
- Commoditized infrastructure
- Easy to switch

### 3. Bargaining Power of Buyers: HIGH
- Many free alternatives (Notion, Trello)
- Low switching costs
- Price-sensitive indie makers
- Mitigation: Provide clear unique value

### 4. Threat of Substitutes: MEDIUM
- Generic tools (spreadsheets, notes)
- Notion templates
- Paper checklists
- Mitigation: Superior UX, launch-specific workflow

### 5. Competitive Rivalry: HIGH
- Many project management tools
- Established players (Asana, ClickUp)
- Mitigation: Niche focus, simpler product
```

---

## Stage 4: SYNTHESIZE (Connect Patterns)

### Finding Patterns

**Pattern Recognition Framework:**

```markdown
## Pattern Analysis

### 1. FREQUENCY
**What appears repeatedly?**
- 8/10 competitors offer templates
- All successful tools have mobile apps
- Launch-specific tools don't exist

### 2. OUTLIERS
**What's unique or surprising?**
- Notion has 100+ templates but not launch-focused
- ClickUp has every feature but complex UX
- Trello simple but lacks launch workflow

### 3. CONTRADICTIONS
**What conflicts?**
- Users want "simple" but competitors keep adding features
- Users say "price doesn't matter" but churn on price increases
- Launch tools needed but no successful ones exist

### 4. GAPS
**What's missing?**
- No launch-specific tool for indie makers
- No template library for common launches
- No AI-powered checklist generation

### 5. TRENDS
**What's changing?**
- AI integration (ChatGPT, Notion AI)
- Mobile-first usage
- Async collaboration
```

---

### Insight Formulation

**Insight Template:**

```markdown
## Insight: [Title]

**Pattern observed:**
[What did you notice across multiple sources?]

**Evidence:**
- Source 1: [Finding]
- Source 2: [Finding]
- Source 3: [Finding]

**Why it matters:**
[Business implication]

**Action:**
[Specific next step]

**Confidence:**
- High (10+ sources, consistent)
- Medium (5-10 sources, mostly consistent)
- Low (1-4 sources, speculative)
```

**Example:**

```markdown
## Insight: Template Libraries Drive Adoption

**Pattern observed:**
Competitors with template libraries (Notion, ClickUp, Asana) have higher user activation rates than those without.

**Evidence:**
- Notion: 100+ templates, 85% activation rate (user interviews)
- Asana: 50+ templates, 78% activation
- Trello: 10 templates, 60% activation
- Linear: No templates, 55% activation

**Why it matters:**
Templates reduce time-to-value. Users don't start from scratch → faster activation → better retention.

**Action:**
Build template library for Sprint 3:
- SaaS product launch checklist
- Mobile app launch checklist
- Side project launch checklist

**Confidence:** HIGH (multiple sources, consistent pattern)
```

---

## Stage 5: PRESENT (Actionable Findings)

### Research Report Structure

```markdown
# Research Report: [Topic]

**Date:** [Date]
**Researcher:** [Name]
**Stakeholders:** [Who needs this]

---

## EXECUTIVE SUMMARY (1 page)

**Research Question:**
[What we investigated]

**Key Findings:**
1. [Most important insight]
2. [Second most important]
3. [Third most important]

**Recommendations:**
1. [Prioritized action 1]
2. [Prioritized action 2]
3. [Prioritized action 3]

**Impact:**
[Expected business outcome if recommendations are followed]

---

## METHODOLOGY

**Research approach:** [Exploratory/Descriptive/Explanatory]
**Sources:** [Number and types of sources]
**Date range:** [When research was conducted]
**Limitations:** [What we couldn't answer]

---

## DETAILED FINDINGS

### Finding 1: [Title]
**Insight:** [What we learned]
**Evidence:** [Sources, data]
**Implication:** [What it means for us]

### Finding 2: [Title]
...

---

## COMPETITIVE LANDSCAPE

[Competitor analysis matrix]
[SWOT analysis]

---

## OPPORTUNITIES

**Immediate (Sprint 3):**
- Opportunity 1
- Opportunity 2

**Near-term (Q2 2026):**
- Opportunity 3
- Opportunity 4

**Long-term (2027+):**
- Opportunity 5

---

## RISKS

**High Priority:**
- Risk 1 + Mitigation
- Risk 2 + Mitigation

**Medium Priority:**
- Risk 3 + Mitigation

---

## RECOMMENDATIONS (Prioritized)

### Priority 1: [Action]
**Why:** [Reasoning]
**Effort:** [S/M/L/XL]
**Impact:** [High/Medium/Low]
**Owner:** [Team/Person]
**Deadline:** [When]

### Priority 2: [Action]
...

---

## APPENDIX

### Sources (Bibliography)
1. [Source 1 - full citation]
2. [Source 2 - full citation]

### Raw Data
[Links to spreadsheets, interview transcripts, etc.]
```

---

## Research Tools & Methods

### Competitive Intelligence Tools

**Manual Methods:**
```markdown
- Website exploration (features, pricing)
- App Store reviews (ratings, complaints)
- G2/Capterra reviews (pros/cons)
- Changelog tracking (new features)
- Product Hunt launches (community feedback)
- Twitter search (user complaints, praise)
- LinkedIn (team size, hiring)
```

**Automated Tools:**
```markdown
- SimilarWeb (traffic estimates)
- BuiltWith (tech stack)
- Ahrefs (SEO, backlinks)
- Product Hunt API (launch data)
- App Store scraping (review analysis)
```

---

### Trend Analysis

**Google Trends:**
```
Compare search interest over time:
- "project management" vs "launch readiness"
- "notion" vs "asana" vs "clickup"
- Regional interest (US, EU, Asia)
- Related queries (what else users search)
```

**Reddit/HN Monitoring:**
```
Subreddits to watch:
- r/SaaS
- r/startups
- r/indiehackers
- r/Entrepreneur

Keywords:
- "launch checklist"
- "ready to launch"
- "product launch"
```

---

## Best Practices

### ✅ DO:
- Start with clear research question
- Use multiple source types (primary + secondary)
- Take structured notes (literature notes)
- Look for patterns across sources
- Cite all sources (track URLs, dates)
- Synthesize, don't just summarize
- Make findings actionable (clear next steps)
- State confidence level (high/medium/low)
- Update research quarterly (markets change)
- Share findings with team (not just report)

### ❌ DON'T:
- Start research without clear question
- Rely on single source
- Copy-paste without analysis
- Ignore contradictory evidence (confirmation bias)
- Present raw data without insights
- Make vague recommendations ("improve UX")
- Forget to track sources
- Do research and never act on it
- Over-research (diminishing returns)
- Research forever (set time limits)

---

## Research Templates

### 1-Page Research Brief

```markdown
# Research Brief: [Topic]

**Question:** [One sentence]
**Why:** [Business impact]
**Timeline:** [Deadline]
**Resources:** [Time budget, tools]
**Success:** [What answers would be useful]

---

**Initial Hypothesis:**
[What do we think the answer is?]

**Sources to explore:**
- [ ] Source type 1
- [ ] Source type 2
- [ ] Source type 3

**Deliverable:**
- [ ] 1-page summary
- [ ] Competitor matrix
- [ ] 3 actionable recommendations
```

---

### User Interview Research Template

```markdown
# User Interview Synthesis

**Research question:** [What we're investigating]
**Participants:** [Number and demographics]
**Date range:** [When interviews conducted]

---

## KEY THEMES

### Theme 1: [Title]
**Quote:** "[Representative quote]" - Participant 3
**Frequency:** 7/10 participants mentioned this
**Insight:** [What it means]
**Action:** [What to do]

### Theme 2: [Title]
...

---

## PAIN POINTS (Ranked)

1. **[Pain point 1]** - Mentioned by 8/10 users
   - Quote: "[Example]"
   - Opportunity: [How we can solve]

2. **[Pain point 2]** - Mentioned by 6/10 users
   ...

---

## FEATURE REQUESTS (Ranked by demand)

| Feature | Mentions | Priority | Effort |
|---------|----------|----------|--------|
| Templates | 9/10 | High | Medium |
| Mobile app | 7/10 | High | Large |
| AI checklist | 5/10 | Medium | Large |

---

## UNEXPECTED FINDINGS

- [Surprising discovery 1]
- [Surprising discovery 2]

---

## RECOMMENDATIONS

**P0 (Must have):**
- [Action based on strongest signal]

**P1 (Should have):**
- [Action based on common request]

**P2 (Nice to have):**
- [Action based on minor signal]
```

---

## Research Cadence

**Continuous (Weekly):**
- Monitor competitor changes
- Track App Store reviews
- Read industry news

**Monthly:**
- Analyze usage data
- Review user feedback
- Update competitive matrix

**Quarterly:**
- Deep research project (new market, feature set)
- User interviews (10-15 users)
- Market trend analysis

**Annually:**
- Full market landscape research
- Customer satisfaction survey (NPS)
- Strategic planning input

---

## Resources

**Research Tools:**
- Google Scholar: https://scholar.google.com
- SimilarWeb: https://www.similarweb.com
- G2 Reviews: https://www.g2.com
- Product Hunt: https://www.producthunt.com

**Learning:**
- Research Methods: https://www.nngroup.com/articles/
- Competitive Analysis: https://www.crazyegg.com/blog/competitive-analysis/

---

**Last Updated:** 2026-03-20  
**For:** Tiramisup research + general research synthesis
