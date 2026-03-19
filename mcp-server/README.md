# Tramisu Growth Advisor MCP

AI-powered growth insights and recommendations for startup metrics.

## What is this?

An MCP (Model Context Protocol) server that provides intelligent growth advice to Tramisu users based on their metrics data.

## Features

### 1. Metric Analysis
- Analyze DAU/MAU trends
- Detect anomalies (sudden drops/spikes)
- Compare against industry benchmarks

### 2. Growth Recommendations
- "Your churn increased 5% → investigate user feedback"
- "Activation funnel: 40% drop at step 2 → simplify onboarding"
- "LTV:CAC ratio is 2.1 → increase pricing or reduce CAC"

### 3. Predictive Insights
- "At current rate, you'll hit 1000 users in 45 days"
- "If churn continues, MRR will plateau in 2 months"
- "Seasonal trend detected: DAU drops 15% on weekends"

### 4. Actionable Playbooks
- Pre-launch: "Complete 80% of checklist before announcing"
- Growth: "Run weekly user interviews until activation > 60%"
- Scale: "Hire first growth PM when MRR > $10k"

## Architecture

```
Tramisu App (Next.js)
    ↓
MCP Client (inside app)
    ↓
Tramisu MCP Server (this repo)
    ↓
[Metric DB] → [AI Analysis] → [Recommendations]
```

## How it Works

### 1. User opens dashboard
```tsx
// app/dashboard/page.tsx
const insights = await getAIInsights(projectId)
```

### 2. MCP server analyzes
```typescript
// mcp-server/src/tools/analyze-metrics.ts
async function analyzeMetrics(projectId: string) {
  // Get metrics from DB
  const metrics = await prisma.metric.findMany(...)
  
  // Run analysis
  const insights = await analyzeWithAI(metrics)
  
  return insights
}
```

### 3. Display to user
```tsx
<InsightsWidget insights={insights} />
```

## Available MCP Tools

### 1. `analyze_metrics`
Analyze all metrics and provide insights

**Input:**
```json
{
  "projectId": "abc123",
  "timeRange": "30d"
}
```

**Output:**
```json
{
  "insights": [
    {
      "type": "warning",
      "metric": "churn_rate",
      "message": "Churn increased 5% this week",
      "action": "Survey churned users to understand why"
    }
  ]
}
```

### 2. `benchmark_compare`
Compare metrics against industry benchmarks

**Input:**
```json
{
  "projectId": "abc123",
  "industry": "B2B SaaS"
}
```

**Output:**
```json
{
  "comparisons": {
    "dau_mau_ratio": {
      "yours": 0.15,
      "benchmark": 0.20,
      "status": "below"
    }
  }
}
```

### 3. `predict_growth`
Predict future metrics based on trends

**Input:**
```json
{
  "projectId": "abc123",
  "metric": "mrr",
  "horizon": "90d"
}
```

**Output:**
```json
{
  "prediction": {
    "current": 5000,
    "predicted": 7500,
    "confidence": 0.85
  }
}
```

### 4. `get_playbook`
Get actionable playbook for current stage

**Input:**
```json
{
  "projectId": "abc123",
  "stage": "pre-launch"
}
```

**Output:**
```json
{
  "playbook": {
    "title": "Pre-Launch Checklist",
    "actions": [
      "Complete product page",
      "Set up analytics",
      "Prepare launch announcement"
    ]
  }
}
```

## Installation

### 1. Add to Tramisu project

```bash
# In Tramisu root
cd mcp-server
npm install
npm run build
```

### 2. Configure MCP

Add to `.mcp.json`:
```json
{
  "tramisu-advisor": {
    "command": "node",
    "args": ["./mcp-server/dist/index.js"],
    "type": "stdio"
  }
}
```

### 3. Use in app

```typescript
import { useMCP } from '@/lib/mcp-client'

const insights = await useMCP('tramisu-advisor', 'analyze_metrics', {
  projectId: project.id,
  timeRange: '30d'
})
```

## Growth Knowledge Base

### Pre-Launch Benchmarks
- Checklist completion: aim for 90%+
- Action items: complete critical ones before launch
- Readiness score: 85%+ for soft launch, 95%+ for public

### Post-Launch Benchmarks (B2B SaaS)
- DAU/MAU: 0.20 (20% stickiness)
- Activation rate: 60%+
- Day 1 retention: 40%+
- Day 7 retention: 25%+
- Day 30 retention: 15%+
- Churn rate: < 5% monthly
- LTV:CAC: > 3:1
- MRR growth: 10-20% MoM (early stage)

### Red Flags
⚠️ Churn > 7% monthly
⚠️ Activation < 40%
⚠️ Day 1 retention < 25%
⚠️ LTV:CAC < 2:1
⚠️ No growth for 3+ months

### Green Flags
✅ DAU/MAU > 0.25
✅ Activation > 70%
✅ Day 30 retention > 20%
✅ LTV:CAC > 4:1
✅ MoM growth > 15%

## Example Insights

### Insight 1: Stickiness Alert
```
"Your DAU/MAU ratio is 0.12 (12%). 
This means only 12% of your monthly users come back daily.

🎯 Target: 20%+ (industry benchmark)

💡 Actions:
- Add daily email digests
- Implement push notifications
- Create daily use case (e.g., daily standup)
- Add streak/habit tracking"
```

### Insight 2: Activation Funnel
```
"40% of users drop off at 'Connect Integration' step.

This is your biggest bottleneck!

💡 Actions:
- Make integration optional
- Add 'Skip for now' button
- Simplify OAuth flow
- Show value before asking for integration"
```

### Insight 3: Goal Projection
```
"Goal: Reach 1000 users by March 31

Current: 250 users
Daily growth: 8 users/day
Days remaining: 45

📊 Projection: 610 users (39% short)

💡 Need to achieve: 17 users/day

Recommendations:
- Double down on Product Hunt launch
- Run paid ads (estimated $500 budget)
- Activate referral program"
```

## Development

```bash
npm install
npm run dev

# Test tools
npm run test
```

## Tech Stack

- TypeScript
- MCP SDK
- Prisma (to read Tramisu DB)
- OpenAI (optional, for advanced analysis)

---

**Status:** Prototype ready
**Integration:** Drop-in to Tramisu
**Usage:** Can be used via MCP client or REST API
