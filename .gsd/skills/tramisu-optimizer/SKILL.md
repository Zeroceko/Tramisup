# Tramisu Code Optimizer

Optimize Tramisu codebase for performance, bundle size, and code quality.

## When to Use

Triggers:
- "optimize tramisu"
- "improve tramisu performance"
- "reduce bundle size"
- "find tramisu bottlenecks"
- "code review tramisu"

## What This Skill Does

1. **Next.js Optimization**
   - Check for dynamic imports
   - Analyze bundle size
   - Review Server vs Client components
   - Check for image optimization

2. **Database Optimization**
   - Review Prisma queries
   - Check for N+1 queries
   - Analyze index usage
   - Review connection pooling

3. **React Performance**
   - Find unnecessary re-renders
   - Check for missing React.memo
   - Review useState/useEffect usage
   - Analyze component tree depth

4. **Bundle Analysis**
   - Check recharts bundle size
   - Review unused dependencies
   - Analyze code splitting
   - Check for tree-shaking

## Instructions

### Step 1: Analyze Current State

```bash
# Check bundle size
npm run build
du -sh .next

# Analyze dependencies
npx depcheck

# Check for unused exports
npx ts-prune
```

### Step 2: Database Query Analysis

Review all Prisma queries in:
- `app/api/**/route.ts`
- Check for `.findMany()` without `take`
- Look for missing `select` (overfetching)
- Ensure indexes exist for frequently queried fields

### Step 3: Component Optimization

For each component in `components/`:
1. Check if it should be Server Component (default)
2. Only use "use client" if:
   - Uses hooks (useState, useEffect, etc.)
   - Uses browser APIs
   - Uses event handlers
3. Consider React.memo for expensive components

### Step 4: Chart Performance

Recharts is heavy (600KB+). Consider:
- Lazy load chart components
- Use dynamic imports: `const Chart = dynamic(() => import('./Chart'), { ssr: false })`
- Or replace with lightweight alternative (visx, nivo)

### Step 5: Image Optimization

Ensure all images use Next.js `<Image>`:
```tsx
import Image from 'next/image'
<Image src="/hero.png" width={800} height={600} alt="..." />
```

### Step 6: Report Findings

Output format:
```
## Tramisu Optimization Report

### Critical Issues (Fix Now)
- [ ] Issue 1
- [ ] Issue 2

### Important Issues (Fix Soon)
- [ ] Issue 3

### Nice to Have
- [ ] Issue 4

### Estimated Impact
- Bundle size reduction: X%
- Page load improvement: X seconds
- Database query reduction: X%
```

## Common Patterns to Check

### ❌ Bad (Overfetching)
```ts
const project = await prisma.project.findUnique({
  where: { userId },
  include: { 
    checklists: true,
    actions: true,
    metrics: true // All metrics!
  }
})
```

### ✅ Good (Select only needed)
```ts
const project = await prisma.project.findUnique({
  where: { userId },
  select: { 
    id: true,
    name: true,
    _count: { select: { checklists: true } }
  }
})
```

### ❌ Bad (Client component unnecessarily)
```tsx
"use client"
export default function StaticCard() {
  return <div>Static content</div>
}
```

### ✅ Good (Server component)
```tsx
export default function StaticCard() {
  return <div>Static content</div>
}
```

### ❌ Bad (Heavy chart loaded eagerly)
```tsx
import { LineChart } from 'recharts'
```

### ✅ Good (Lazy loaded)
```tsx
import dynamic from 'next/dynamic'
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
})
```

## Expected Output

For each file analyzed:
```
📄 app/dashboard/page.tsx
  ⚠️  Overfetching all metrics (should use take: 1)
  ✅ Properly uses Server Component
  
📄 components/MetricsOverview.tsx
  ⚠️  Recharts bundle: 620KB (consider lazy load)
  ✅ Uses React.memo correctly
```

Final summary with actionable fixes.
