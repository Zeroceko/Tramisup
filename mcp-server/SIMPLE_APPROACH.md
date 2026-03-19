# Tramisu AI Advisor - Knowledge Base Implementation

## Approach 2: Use AITMPL as Knowledge Base

Instead of building a full MCP server, we can use AITMPL skills as a **knowledge base** for generating growth insights.

## How It Works

```
User Dashboard
    ↓
Fetch current metrics
    ↓
Run AI prompt with context:
  - User's metrics
  - AITMPL growth best practices
  - Industry benchmarks
    ↓
Generate personalized insights
    ↓
Display to user
```

## Implementation

### 1. Create Growth Knowledge Embeddings

```typescript
// lib/growth-advisor/knowledge-base.ts

const GROWTH_KNOWLEDGE = {
  dau_mau_benchmarks: {
    b2b_saas: 0.20,
    consumer: 0.30,
    social: 0.40,
  },
  
  activation_benchmarks: {
    minimum: 0.40,
    good: 0.60,
    excellent: 0.80,
  },
  
  playbooks: {
    low_activation: [
      "Simplify onboarding to 3 steps max",
      "Show value before asking for input",
      "Add progress indicators",
      "Implement activation emails",
    ],
    high_churn: [
      "Survey churned users within 24h",
      "Identify common drop-off points",
      "Implement win-back campaigns",
      "Add customer success check-ins",
    ],
    slow_growth: [
      "Double down on best acquisition channel",
      "Implement referral program",
      "Launch on Product Hunt",
      "Run paid experiments",
    ],
  },
  
  red_flags: {
    churn_rate: { threshold: 0.07, message: "Monthly churn above 7% is concerning" },
    activation: { threshold: 0.40, message: "Activation below 40% needs immediate attention" },
    dau_mau: { threshold: 0.15, message: "Stickiness below 15% suggests weak engagement" },
  }
}
```

### 2. AI Advisor API Route

```typescript
// app/api/advisor/insights/route.ts

export async function POST(request: Request) {
  const { projectId } = await request.json()
  
  // Get user's metrics
  const metrics = await getMetrics(projectId)
  
  // Analyze against benchmarks
  const analysis = analyzeMetrics(metrics)
  
  // Generate insights with AI
  const insights = await generateInsights(analysis)
  
  return NextResponse.json({ insights })
}

function analyzeMetrics(metrics: Metrics) {
  const issues = []
  const wins = []
  
  // Check DAU/MAU
  const dauMau = metrics.dau / metrics.mau
  if (dauMau < 0.15) {
    issues.push({
      type: 'stickiness',
      severity: 'high',
      current: dauMau,
      benchmark: 0.20,
      delta: -25
    })
  }
  
  // Check activation
  if (metrics.activationRate < 0.40) {
    issues.push({
      type: 'activation',
      severity: 'critical',
      current: metrics.activationRate,
      benchmark: 0.60
    })
  }
  
  // Check growth
  const growthRate = calculateGrowthRate(metrics)
  if (growthRate > 0.10) {
    wins.push({
      type: 'growth',
      current: growthRate,
      message: 'Strong MoM growth'
    })
  }
  
  return { issues, wins }
}
```

### 3. Dashboard Widget

```tsx
// components/AIInsightsWidget.tsx

'use client'

import { useEffect, useState } from 'react'

export function AIInsightsWidget({ projectId }: { projectId: string }) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/advisor/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    })
      .then(res => res.json())
      .then(data => setInsights(data.insights))
      .finally(() => setLoading(false))
  }, [projectId])
  
  if (loading) return <div>Analyzing your metrics...</div>
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">💡 AI Insights</h3>
      
      {insights.map((insight, i) => (
        <div 
          key={i}
          className={`p-4 rounded-lg border ${
            insight.severity === 'critical' ? 'bg-red-50 border-red-200' :
            insight.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{insight.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{insight.title}</p>
              <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
              
              {insight.actions && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">Recommended Actions:</p>
                  {insight.actions.map((action, j) => (
                    <div key={j} className="text-xs text-gray-600 flex items-start gap-2">
                      <span>→</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 4. Add to Dashboard

```tsx
// app/dashboard/page.tsx

import { AIInsightsWidget } from '@/components/AIInsightsWidget'

export default async function DashboardPage() {
  const project = await getProject()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing dashboard content */}
      
      <div className="mt-8">
        <AIInsightsWidget projectId={project.id} />
      </div>
    </div>
  )
}
```

## Using AITMPL Skills as Context

### Option A: Static Knowledge Base

Copy key insights from AITMPL skills into our knowledge base:

```typescript
// lib/growth-advisor/playbooks.ts

export const GROWTH_PLAYBOOKS = {
  // From AITMPL: startup-growth skills
  prelaunch: [
    "Complete 90%+ of checklist before announcing",
    "Build email list: aim for 100+ before launch",
    "Create launch assets: screenshots, demo video",
    "Prepare Product Hunt/HN announcement",
  ],
  
  // From AITMPL: retention optimization
  improve_retention: [
    "Analyze cohort retention curves",
    "Identify 'aha moment' - correlate with retained users",
    "Implement email re-engagement campaigns",
    "Add in-app nudges for inactive users",
  ],
  
  // From AITMPL: activation funnel optimization
  improve_activation: [
    "Map your activation funnel with real data",
    "Find biggest drop-off point (highest %)",
    "A/B test removing friction at that step",
    "Show value BEFORE asking for input",
  ],
}
```

### Option B: Dynamic AI Analysis

Use AI to analyze metrics against AITMPL knowledge:

```typescript
// lib/growth-advisor/ai-analyzer.ts

export async function generateInsights(metrics: Metrics) {
  const prompt = `
You are a growth advisor for a startup tracking tool called Tramisu.

Current metrics:
- DAU: ${metrics.dau}
- MAU: ${metrics.mau}
- MRR: $${metrics.mrr}
- Activation Rate: ${metrics.activationRate}%
- Churn Rate: ${metrics.churnRate}%

Benchmarks (B2B SaaS):
- DAU/MAU: 20%+
- Activation: 60%+
- Monthly Churn: <5%

Analyze these metrics and provide:
1. Top 3 issues (if any)
2. Top 2 wins (if any)
3. Most impactful action to take this week

Format as JSON.
`

  const response = await ai.generateText(prompt)
  return JSON.parse(response)
}
```

## Benefits of This Approach

✅ **No new infrastructure** - just API routes + components
✅ **Fast to implement** - 1-2 hours
✅ **Uses existing data** - Prisma queries
✅ **Can add AI later** - start with rules, upgrade to AI
✅ **In-app experience** - users don't leave Tramisu

## Roadmap

### Phase 1: Rule-Based (Now)
- Hard-coded benchmarks
- Simple if/then analysis
- Static playbooks

### Phase 2: AI-Enhanced (Week 2)
- OpenAI analysis
- Personalized recommendations
- Natural language insights

### Phase 3: Learning System (Month 2)
- Learn from user actions
- A/B test recommendations
- Predictive analytics

---

**Recommendation:** Start with Phase 1 (rule-based), it's 80% of the value with 20% of the complexity.

Want me to implement Phase 1 now?
