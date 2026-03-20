# Data Analyst Skill

**When to use:** Data analysis, metrics, analytics, SQL queries, data visualization, A/B testing, reporting, insights

---

## Overview

Data-driven decision making for product analytics, user behavior, business metrics, and growth insights. Covers SQL, analytics frameworks, visualization, and statistical analysis.

---

## Analytics Frameworks

### AARRR (Pirate Metrics)

```markdown
## Product Analytics Framework

### ACQUISITION (How do users find us?)
**Metrics:**
- Traffic sources (organic, paid, referral, direct)
- Signups per channel
- Cost per acquisition (CPA)
- Landing page conversion rate

**SQL Query:**
```sql
SELECT 
  DATE(created_at) as date,
  source,
  COUNT(*) as signups,
  COUNT(*) * 1.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE(created_at)) as percentage
FROM users
WHERE created_at >= DATE('now', '-30 days')
GROUP BY DATE(created_at), source
ORDER BY date DESC, signups DESC;
```

---

### ACTIVATION (Do they have a good first experience?)
**Metrics:**
- % who create first product
- Time to first value (TTFV)
- Onboarding completion rate
- % who reach "aha moment"

**SQL Query:**
```sql
-- Users who created a product within 7 days of signup
SELECT 
  DATE(u.created_at) as signup_date,
  COUNT(DISTINCT u.id) as total_signups,
  COUNT(DISTINCT p.user_id) as activated_users,
  COUNT(DISTINCT p.user_id) * 100.0 / COUNT(DISTINCT u.id) as activation_rate
FROM users u
LEFT JOIN products p ON p.user_id = u.id 
  AND p.created_at <= DATETIME(u.created_at, '+7 days')
WHERE u.created_at >= DATE('now', '-30 days')
GROUP BY DATE(u.created_at)
ORDER BY signup_date DESC;
```

---

### RETENTION (Do they come back?)
**Metrics:**
- Day 1, Day 7, Day 30 retention
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Churn rate

**SQL Query (Cohort Retention):**
```sql
WITH cohorts AS (
  SELECT 
    user_id,
    DATE(MIN(created_at)) as cohort_month
  FROM user_activity
  GROUP BY user_id
),
activity AS (
  SELECT 
    a.user_id,
    c.cohort_month,
    DATE(a.created_at) as activity_month,
    (julianday(DATE(a.created_at)) - julianday(c.cohort_month)) / 30 as month_number
  FROM user_activity a
  JOIN cohorts c ON a.user_id = c.user_id
)
SELECT 
  cohort_month,
  month_number,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(DISTINCT user_id) * 100.0 / 
    FIRST_VALUE(COUNT(DISTINCT user_id)) OVER (
      PARTITION BY cohort_month ORDER BY month_number
    ) as retention_rate
FROM activity
GROUP BY cohort_month, month_number
ORDER BY cohort_month DESC, month_number;
```

---

### REVENUE (How much money do we make?)
**Metrics:**
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)
- Churn MRR

**SQL Query:**
```sql
-- Monthly MRR
SELECT 
  strftime('%Y-%m', period_start) as month,
  COUNT(DISTINCT user_id) as paying_users,
  SUM(amount) / 100.0 as mrr,
  SUM(amount) / COUNT(DISTINCT user_id) / 100.0 as arpu
FROM subscriptions
WHERE status = 'active'
  AND period_start >= DATE('now', '-12 months')
GROUP BY strftime('%Y-%m', period_start)
ORDER BY month DESC;
```

---

### REFERRAL (Do they tell others?)
**Metrics:**
- Referral rate (% users who invite)
- Viral coefficient (k-factor)
- Invites sent per user
- Invite acceptance rate

**SQL Query:**
```sql
SELECT 
  COUNT(DISTINCT referrer_id) as referrers,
  COUNT(DISTINCT referrer_id) * 100.0 / 
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE('now', '-30 days')) as referral_rate,
  COUNT(*) as invites_sent,
  COUNT(*) * 1.0 / COUNT(DISTINCT referrer_id) as invites_per_referrer,
  COUNT(DISTINCT CASE WHEN accepted_at IS NOT NULL THEN referee_id END) as invites_accepted,
  COUNT(DISTINCT CASE WHEN accepted_at IS NOT NULL THEN referee_id END) * 100.0 / COUNT(*) as acceptance_rate
FROM referrals
WHERE created_at >= DATE('now', '-30 days');
```

---

## Key Product Metrics

### North Star Metric

**Definition:** The single metric that best captures core value delivered to customers.

**Examples:**
- Spotify: Time spent listening
- Facebook: Daily Active Users
- Slack: Messages sent per team
- **Tiramisup:** Products successfully launched per month

**Framework:**
```markdown
## Defining North Star Metric

**Question:** What action demonstrates users getting value?

**Candidates:**
1. Products created (acquisition-focused)
2. Checklist items completed (engagement)
3. Products launched (outcome-focused) ✅

**Why "Products Launched":**
- Represents successful outcome (user shipped!)
- Captures full product value (onboarding → tracking → launch)
- Measurable and actionable
- Aligns with business goals

**Leading Indicators:**
- Launch readiness score (correlates with completion)
- Active checklists per user
- Tasks completed per week
```

---

### Engagement Metrics

**DAU / MAU Ratio:**
```sql
-- Stickiness ratio (good: >20%)
WITH dau AS (
  SELECT DATE(activity_date) as date, COUNT(DISTINCT user_id) as dau
  FROM user_activity
  WHERE activity_date >= DATE('now', '-30 days')
  GROUP BY DATE(activity_date)
),
mau AS (
  SELECT COUNT(DISTINCT user_id) as mau
  FROM user_activity
  WHERE activity_date >= DATE('now', '-30 days')
)
SELECT 
  AVG(dau.dau) as avg_dau,
  mau.mau,
  AVG(dau.dau) * 100.0 / mau.mau as dau_mau_ratio
FROM dau, mau;
```

---

## SQL Patterns

### Common Queries for Product Analytics

**User Growth:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
FROM users
WHERE created_at >= DATE('now', '-90 days')
GROUP BY DATE(created_at)
ORDER BY date;
```

**Feature Adoption:**
```sql
-- % of users who used Feature X
SELECT 
  COUNT(DISTINCT CASE WHEN feature_used = true THEN user_id END) * 100.0 / COUNT(DISTINCT user_id) as adoption_rate
FROM users u
LEFT JOIN feature_usage f ON f.user_id = u.id AND f.feature = 'launch_scorecard'
WHERE u.created_at >= DATE('now', '-30 days');
```

**Funnel Analysis:**
```sql
WITH funnel AS (
  SELECT 
    user_id,
    MAX(CASE WHEN event = 'signup' THEN 1 ELSE 0 END) as step1_signup,
    MAX(CASE WHEN event = 'create_product' THEN 1 ELSE 0 END) as step2_create,
    MAX(CASE WHEN event = 'complete_checklist' THEN 1 ELSE 0 END) as step3_checklist,
    MAX(CASE WHEN event = 'launch' THEN 1 ELSE 0 END) as step4_launch
  FROM events
  WHERE created_at >= DATE('now', '-30 days')
  GROUP BY user_id
)
SELECT 
  SUM(step1_signup) as signups,
  SUM(step2_create) as created_product,
  SUM(step2_create) * 100.0 / SUM(step1_signup) as signup_to_create_rate,
  SUM(step3_checklist) as completed_checklist,
  SUM(step3_checklist) * 100.0 / SUM(step2_create) as create_to_checklist_rate,
  SUM(step4_launch) as launched,
  SUM(step4_launch) * 100.0 / SUM(step3_checklist) as checklist_to_launch_rate
FROM funnel;
```

**Churn Analysis:**
```sql
-- Users who haven't been active in 30+ days
SELECT 
  DATE(last_activity) as last_seen,
  COUNT(*) as churned_users
FROM (
  SELECT 
    user_id,
    MAX(activity_date) as last_activity
  FROM user_activity
  GROUP BY user_id
)
WHERE last_activity < DATE('now', '-30 days')
GROUP BY DATE(last_activity)
ORDER BY last_seen DESC;
```

---

## A/B Testing

### Experiment Framework

```markdown
## A/B Test Plan: [Feature Name]

### HYPOTHESIS
**Current State:** Launch readiness shows overall score only
**Proposed Change:** Add category-based scorecard
**Expected Impact:** Users will better understand blockers → 15% increase in task creation

### METRICS
**Primary:** Task creation rate from pre-launch page
**Secondary:** 
- Time spent on pre-launch page
- Launch readiness score improvement
- User satisfaction (survey)

**Guardrail:**
- Page load time (<2s)
- Error rate (<1%)

### SAMPLE SIZE
**Current baseline:** 10% task creation rate
**Minimum detectable effect:** 15% relative lift (10% → 11.5%)
**Power:** 80%
**Significance:** 95% (α = 0.05)
**Required sample:** ~2,500 users per variant

### DURATION
**Traffic allocation:** 50/50 split
**Expected duration:** 2 weeks (at 200 signups/day)

### VARIANTS
**Control (A):** Current design (overall score only)
**Treatment (B):** New design (category scorecard + blockers)

### SUCCESS CRITERIA
✅ Task creation rate increases by ≥15%
✅ No significant change in error rate
✅ No negative impact on retention
```

**SQL Analysis:**
```sql
-- A/B test results
SELECT 
  variant,
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT CASE WHEN task_created THEN user_id END) as created_task,
  COUNT(DISTINCT CASE WHEN task_created THEN user_id END) * 100.0 / COUNT(DISTINCT user_id) as conversion_rate,
  AVG(time_on_page_seconds) as avg_time_on_page
FROM ab_test_results
WHERE experiment = 'category_scorecard'
  AND assigned_at >= DATE('now', '-14 days')
GROUP BY variant;

-- Statistical significance (Chi-square test via SQL is complex, use Python/R)
```

---

## Data Visualization

### Chart Selection Guide

```markdown
## When to Use Each Chart Type

**Line Chart:**
- Time series data (user growth, MRR over time)
- Trends and patterns

**Bar Chart:**
- Compare categories (traffic sources, feature usage)
- Show rankings

**Pie Chart (use sparingly):**
- Part-to-whole relationships (only 2-5 slices)
- Market share, user segments

**Funnel Chart:**
- Conversion flows (signup → activation → retention)
- Drop-off analysis

**Cohort Table:**
- Retention over time
- Behavior by signup date

**Heatmap:**
- Activity patterns (day of week × hour)
- Correlation matrix
```

---

### Dashboard Best Practices

```markdown
## Analytics Dashboard Structure

### TOP: Key Metrics (Most Important)
┌───────────────────────────────────────────┐
│  MRR           WAU          Churn Rate    │
│  $12,500       1,250        3.2%          │
│  +15% ↑        +8% ↑        -0.5% ↓       │
└───────────────────────────────────────────┘

### MIDDLE: Trends (Visual)
┌───────────────────────────────────────────┐
│  [User Growth Chart - Last 90 Days]      │
│  [MRR Chart - Last 12 Months]            │
└───────────────────────────────────────────┘

### BOTTOM: Breakdowns (Detailed)
┌───────────────────────────────────────────┐
│  Traffic Sources Table                    │
│  Feature Adoption Table                   │
│  Cohort Retention Table                   │
└───────────────────────────────────────────┘
```

**Design Principles:**
- ✅ Most important metric at top
- ✅ Show trend direction (+/-)
- ✅ Use color sparingly (green = good, red = bad)
- ✅ Include comparison period (vs last month)
- ✅ Keep it simple (5-7 key metrics max)
- ❌ Don't overload with charts
- ❌ Don't use 3D charts
- ❌ Don't use too many colors

---

## Statistical Concepts

### Statistical Significance

**P-value interpretation:**
- p < 0.05: Statistically significant (95% confident)
- p < 0.01: Highly significant (99% confident)
- p ≥ 0.05: Not significant (could be random chance)

**Confidence Intervals:**
```
Conversion rate: 12% ± 2% (95% CI: 10% - 14%)
```

**Avoid common pitfalls:**
- ❌ Stopping test early (peeking problem)
- ❌ P-hacking (testing multiple hypotheses)
- ❌ Ignoring seasonality
- ❌ Small sample sizes

---

## Reporting Templates

### Weekly Metrics Report

```markdown
## Weekly Analytics Report - Week of [Date]

### 📈 KEY METRICS

| Metric | This Week | Last Week | Change | Goal |
|--------|-----------|-----------|--------|------|
| Signups | 140 | 125 | +12% ↑ | 150 |
| WAU | 1,250 | 1,180 | +6% ↑ | 1,500 |
| MRR | $12,500 | $12,000 | +4% ↑ | $15K |
| Churn | 3.2% | 3.7% | -0.5% ↓ | <3% |

### 🎯 HIGHLIGHTS
- ✅ Signup conversion improved 12% (new landing page launched)
- ✅ Churn rate dropped below 4% for first time
- ⚠️ Activation rate declined 5% (investigate onboarding flow)

### 📊 DEEP DIVES

**Activation Funnel:**
- Signup → Create Product: 65% (↓ 5%)
- Create Product → Complete Checklist: 80% (stable)
- **Action:** Review onboarding flow, add more guidance

**Traffic Sources:**
- Organic: 45% (↑ from 40%)
- Paid: 30% (stable)
- Referral: 25% (↑ from 20%)

### 🔍 EXPERIMENTS
- **Category Scorecard A/B Test:** Running (Day 8/14)
  - Variant B: +18% task creation ✅
  - On track to ship next week

### 📅 NEXT WEEK
- Conclude category scorecard test
- Investigate activation drop
- Launch email re-engagement campaign
```

---

## Tools & Stack

**SQL Databases:**
- PostgreSQL (production analytics)
- SQLite (local analysis)

**Visualization:**
- Recharts (React charts)
- Chart.js
- D3.js (custom visualizations)

**Analytics Platforms:**
- Google Analytics (web traffic)
- Mixpanel / Amplitude (product analytics)
- PostHog (open-source alternative)

**A/B Testing:**
- Statsig
- LaunchDarkly
- Feature flags + custom tracking

**Data Notebooks:**
- Jupyter Notebook (Python)
- Observable (JavaScript)

---

## Best Practices

### ✅ DO:
- Define metrics before building features
- Track both leading and lagging indicators
- Use cohort analysis for retention
- Run A/B tests for big changes
- Set up automated alerts (e.g., churn spike)
- Document metric definitions
- Use consistent date ranges for comparison
- Validate data quality regularly

### ❌ DON'T:
- Track vanity metrics (total signups without context)
- Stop A/B tests early
- Ignore statistical significance
- Compare incomparable periods (holiday vs normal)
- Build dashboards nobody uses
- Make decisions on small sample sizes
- Over-complicate visualizations
- Forget to segment data (power users vs casual)

---

## Resources

- SQL Tutorial: https://mode.com/sql-tutorial/
- A/B Testing Calculator: https://www.evanmiller.org/ab-testing/
- Statistics: https://seeing-theory.brown.edu/
- Data Viz: https://www.storytellingwithdata.com/

---

**Last Updated:** 2026-03-20  
**For:** Tiramisup analytics + general data analysis
