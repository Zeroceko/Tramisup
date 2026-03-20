# Product Strategist Skill

**When to use:** Product strategy, roadmap planning, feature prioritization, market analysis, user research, PRD writing

---

## Overview

Strategic product leadership toolkit for planning, prioritizing, and shipping products that users love and businesses need. Covers product vision, OKRs, roadmaps, competitive analysis, and go-to-market.

---

## Product Strategy Framework

### 1. Vision & Strategy

**Product Vision Statement:**
```
For [target customer]
Who [statement of need/opportunity]
The [product name] is a [product category]
That [key benefit, reason to buy]
Unlike [primary competitive alternative]
Our product [statement of primary differentiation]
```

**Example (Tiramisup):**
```
For indie makers and small teams
Who struggle to stay organized and ship on time
Tiramisup is a launch readiness platform
That turns chaos into clarity with smart checklists and task tracking
Unlike generic project tools
Our product focuses specifically on pre-launch preparation and shipping confidence
```

---

### 2. OKR Setting

**Structure:**
- **Objective:** Qualitative goal (inspiring, ambitious)
- **Key Results:** 3-5 measurable outcomes (quantitative)

**Example:**
```markdown
## Q2 2026 OKRs

### Objective 1: Become the go-to tool for indie makers shipping products

**Key Results:**
- KR1: 500 active products being tracked (currently: 50)
- KR2: 70% of users complete their first launch checklist (currently: 40%)
- KR3: 4.5+ App Store rating with 100+ reviews (currently: 4.2, 20 reviews)

### Objective 2: Prove product-market fit for SaaS vertical

**Key Results:**
- KR1: 50 SaaS companies using Tiramisup (currently: 5)
- KR2: 80% weekly active user rate for SaaS segment (currently: 60%)
- KR3: $10K MRR from SaaS customers (currently: $1K)
```

---

### 3. Roadmap Planning

**Now/Next/Later Framework:**

```markdown
## Product Roadmap

### NOW (This Quarter)
- ✅ Multi-product support
- 🔄 Launch Operating System (category scorecards, blockers)
- 🔄 Task management v2 (priority, overdue, linkage)

### NEXT (Next Quarter)
- 📋 Team collaboration (share products, assign tasks)
- 📋 Integrations (Slack notifications, GitHub sync)
- 📋 Analytics dashboard (launch success metrics)

### LATER (Future)
- 💡 AI-powered checklist generation
- 💡 Industry-specific templates
- 💡 Mobile apps (iOS/Android)
```

**Priority Framework (RICE):**
```
Score = (Reach × Impact × Confidence) / Effort

Reach: How many users affected? (per quarter)
Impact: How much does it move the needle? (0.25 = minimal, 3 = massive)
Confidence: How sure are we? (50%, 80%, 100%)
Effort: How much work? (person-months)

Example:
Feature: Team Collaboration
- Reach: 200 users
- Impact: 2 (large)
- Confidence: 80%
- Effort: 2 person-months
- RICE Score: (200 × 2 × 0.8) / 2 = 160
```

---

## User Research

### Jobs-to-be-Done Framework

**Template:**
```
When [situation]
I want to [motivation]
So I can [expected outcome]
```

**Example (Tiramisup users):**
```
When I'm 2 weeks from launch and feeling overwhelmed
I want to see exactly what's left to do and what's blocking me
So I can ship confidently without missing critical steps

When my checklist item is incomplete
I want to quickly create a task and assign it
So I can track blockers and unblock my launch
```

---

### User Interview Script

**Opening:**
1. Thank them (5 min)
2. Explain purpose
3. Get permission to record

**Discovery Questions:**
```
Current State:
- Walk me through your last product launch. What went well? What didn't?
- What tools do you currently use for launch preparation?
- What's the most frustrating part of getting ready to launch?

Pain Points:
- Tell me about a time you launched but felt unprepared. What happened?
- What keeps you up at night before a launch?
- What would make you feel 100% confident to ship?

Workflow:
- Show me how you currently track your launch tasks.
- How do you know when you're "ready" to launch?
- Who else is involved? How do you coordinate?

Solution Validation:
- If you could wave a magic wand, what would the perfect launch tool do?
- [Show prototype] What do you think of this approach?
- Would you pay for this? How much?
```

---

## Feature Prioritization

### Prioritization Matrix

```
         │ High Impact
         │
Quick    │  DO FIRST      │  DO NEXT
Win      │  (Quick wins)  │  (Big bets)
─────────┼────────────────┼─────────────
Slow     │  DO LATER      │  DON'T DO
         │  (Fill-ins)    │  (Time sinks)
         │
         │ Low Impact
```

**Categorize Features:**
```markdown
## DO FIRST (High Impact, Quick Win)
- Task creation from checklist item (Sprint 2)
- Overdue task indicators
- Mobile responsive fixes

## DO NEXT (High Impact, Slow)
- Team collaboration features
- Slack integration
- Analytics dashboard

## DO LATER (Low Impact, Quick)
- Dark mode
- Custom themes
- Keyboard shortcuts

## DON'T DO (Low Impact, Slow)
- White-label reseller program
- Native desktop apps
- Video tutorials library
```

---

## PRD (Product Requirements Document)

**Template:**

```markdown
# PRD: [Feature Name]

## 1. Problem Statement
What problem are we solving? For whom?

**Current State:**
Users manually track launch blockers in spreadsheets.

**Desired State:**
Users see blockers extracted automatically from incomplete checklist items.

**Success Metrics:**
- 80% of users with blockers take action within 1 week
- Blocker resolution rate increases from 60% → 85%

---

## 2. Goals & Non-Goals

**Goals:**
- Extract high-priority incomplete items as "blockers"
- Surface blockers prominently on pre-launch page
- Enable one-click task creation from blocker

**Non-Goals:**
- AI-powered blocker prediction (future)
- Cross-product blocker dependencies (v2)

---

## 3. User Stories

**As a** product owner preparing to launch  
**I want to** see what's blocking my launch readiness  
**So that** I can prioritize fixing critical gaps  

**Acceptance Criteria:**
- [ ] Blocker summary component displays on pre-launch page
- [ ] Shows incomplete + high-priority checklist items
- [ ] Sorted by severity (CRITICAL → HIGH → MEDIUM)
- [ ] "Create Task" button on each blocker
- [ ] Blocker count badge updates in real-time

---

## 4. Design

[Figma link]

**Key Screens:**
- Pre-launch page with blocker summary
- Blocker detail view
- Task creation modal

---

## 5. Technical Considerations

**Database:**
- No new tables needed
- Query: `WHERE completed = false AND priority IN ('HIGH', 'CRITICAL')`

**Performance:**
- Client-side filtering (no API call)
- Real-time updates via React state

**Edge Cases:**
- Zero blockers: Show success state
- 20+ blockers: Paginate or collapse

---

## 6. Success Metrics

**Leading Indicators:**
- Blocker summary viewed per session
- "Create Task" click rate
- Blockers resolved within 7 days

**Lagging Indicators:**
- Launch readiness score improvement
- Time to launch (days reduced)

---

## 7. Launch Plan

**Phase 1:** Beta (10 users, 1 week)
**Phase 2:** Gradual rollout (50% → 100%, 1 week)
**Phase 3:** Full launch + announcement

**Rollback Plan:**
Feature flag: `ENABLE_BLOCKER_SUMMARY`
```

---

## Competitive Analysis

**Template:**

```markdown
## Competitive Analysis

### Competitor 1: [Name]

**Strengths:**
- Feature X is best-in-class
- Strong enterprise presence
- 10K+ customers

**Weaknesses:**
- Complex setup (30+ min onboarding)
- No mobile app
- Expensive ($99/mo starting)

**Our Differentiation:**
- 5-min onboarding
- Mobile-first design
- Indie-friendly pricing ($19/mo)

**Threats:**
- They could simplify their product
- Large marketing budget

**Opportunities:**
- Target indie makers (underserved)
- Focus on launch-specific workflow
```

---

## Go-to-Market (GTM)

**Launch Strategy:**

```markdown
## Product Launch Plan

### Pre-Launch (2 weeks before)
- [ ] Update website with new feature
- [ ] Write blog post (benefits, use cases)
- [ ] Prepare social media content (3 posts)
- [ ] Email existing users (teaser)
- [ ] Product Hunt draft submission

### Launch Day
- [ ] Publish blog post
- [ ] Post on Product Hunt (7am PT)
- [ ] Social media blitz (Twitter, LinkedIn)
- [ ] Email announcement to users
- [ ] Hacker News Show HN (if relevant)

### Post-Launch (Week 1)
- [ ] Monitor feedback (support, social, reviews)
- [ ] Daily updates on Product Hunt comments
- [ ] Thank users publicly
- [ ] Quick bug fixes if needed
- [ ] Collect testimonials

### Metrics to Track
- Signups from launch traffic
- Feature adoption rate (% of users using new feature)
- Net Promoter Score (NPS)
- Social mentions/shares
```

---

## Metrics & Analytics

**Key Product Metrics:**

```markdown
## North Star Metric
Products successfully launched using Tiramisup (per month)

## AARRR Metrics

**Acquisition:**
- Signups per week
- Traffic sources (organic, paid, referral)
- Landing page conversion rate

**Activation:**
- % users who create first product
- Time to first product creation
- % who complete onboarding

**Retention:**
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Churn rate

**Revenue:**
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)

**Referral:**
- Referral rate (% users who invite others)
- Viral coefficient (how many users each user brings)
```

---

## Decision Frameworks

### Build vs Buy vs Partner

```markdown
## Should we build X or integrate with Y?

**Build if:**
- Core to product value prop
- Competitive differentiator
- Simple to build (< 2 weeks)

**Buy/Integrate if:**
- Commodity feature (calendars, payments)
- Complex to build (> 1 month)
- Users already use the tool

**Partner if:**
- Strategic opportunity (co-marketing)
- Fills a gap in our offering
- Win-win for both products

Example: Task Management
- Core to product ✅
- Differentiator (launch-focused) ✅
- Simple to build ✅
→ BUILD
```

---

## Best Practices

### ✅ DO:
- Talk to users weekly (5-10 interviews)
- Ship small, iterate fast
- Measure everything (instrument early)
- Say "no" to most feature requests
- Focus on one user segment first
- Write PRDs for big features
- Use feature flags for gradual rollouts
- Celebrate small wins with team

### ❌ DON'T:
- Build features without validating need
- Copy competitors blindly
- Optimize metrics that don't matter
- Over-engineer v1
- Skip user research
- Launch without success metrics
- Ignore qualitative feedback
- Say "yes" to every request

---

## Templates

### Quick Feature Spec Template

```markdown
## Feature: [Name]

**Problem:** [1 sentence]
**Solution:** [1 sentence]
**Success Metric:** [1 metric]
**Effort:** [S/M/L/XL]
**Priority:** [P0/P1/P2/P3]

**User Flow:**
1. User does X
2. System shows Y
3. User can Z

**Out of Scope:**
- [What we're NOT doing]
```

---

## Resources

- RICE Prioritization: https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/
- Jobs-to-be-Done: https://hbr.org/2016/09/know-your-customers-jobs-to-be-done
- Product-Market Fit: https://www.lennysnewsletter.com/p/how-to-know-if-youve-got-productmarket
- OKRs: https://www.whatmatters.com/

---

**Last Updated:** 2026-03-20  
**For:** Tiramisup product strategy + general product work
