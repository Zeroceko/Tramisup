# Claude Code Prompt - Sprint 3 Implementation

Şu anda **Sprint 3 - SEO & Content Skills Integration** fazındayız. Tiramisup kullanıcılarına launch hazırlığı sırasında SEO audit, content generation, ve copywriting desteği sağlayacağız.

---

## Context

**Proje:** Tiramisup - Launch-to-growth operating workspace for founders  
**Tech Stack:** Next.js 14, TypeScript, Prisma, NextAuth, Tailwind  
**Mevcut durum:** Sprint 0-2 tamamlandı. Kullanıcı ürün oluşturabiliyor, dashboard görüyor, pre-launch checklist var.

**Yeni özellik:** External skill'leri (AITMPL skill library) backend'e entegre edip kullanıcılara self-serve SEO, content, copywriting toolları sunmak.

---

## Sprint 3 Goals

1. **SEO Audit Integration**
   - Kullanıcı website URL'i giriyor
   - Backend `seo-audit` skill'ini çalıştırıyor
   - SEO readiness score (0-100) + issue list dönüyor
   - Her issue'dan task oluşturulabiliyor

2. **Content Generator Integration**
   - Kullanıcı topic/keywords/audience/tone seçiyor
   - Backend `content-research-writer` skill'ini çalıştırıyor
   - Research + outline + full blog post dönüyor
   - Generated content edit edilip save edilebiliyor

3. **Copywriting Assistant Integration**
   - Kullanıcı landing page URL'i giriyor
   - Backend `copywriting` skill'ini çalıştırıyor
   - Value prop, CTA, messaging clarity analizi dönüyor
   - Improvement suggestions task'e dönüştürülebiliyor

---

## Implementation Tasks (Priority Order)

### Phase 1: Foundation (Week 1)

#### Task 1.1: Skill Execution Infrastructure
**File:** `lib/skills/runner.ts`

```typescript
/**
 * Generic skill execution engine
 * Takes skill name, inputs, userId
 * Returns skill result
 */
export async function runSkill(
  skillName: string, 
  inputs: any, 
  userId: string
): Promise<SkillResult> {
  // TODO:
  // 1. Validate skill exists
  // 2. Create SkillRun record (status: pending)
  // 3. Execute skill (async job)
  // 4. Update SkillRun record (status: completed/failed)
  // 5. Return result
}

interface SkillResult {
  success: boolean
  data?: any
  error?: string
  runId: string
}
```

**Requirements:**
- Skill execution should be async (long-running)
- Store skill runs in database for history
- Handle errors gracefully
- Support progress updates (optional for v1)

---

#### Task 1.2: Database Schema
**File:** `prisma/schema.prisma`

```prisma
model SkillRun {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  productId   String?
  product     Product? @relation(fields: [productId], references: [id])
  
  skillName   String   // e.g., "seo-audit"
  inputs      Json     // { url: "https://example.com" }
  result      Json?    // skill output
  
  status      String   // pending/running/completed/failed
  error       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([productId])
  @@index([skillName])
}
```

**Requirements:**
- Run `npx prisma migrate dev --name add-skill-runs`
- Update User and Product models to include relation
- Verify migration works

---

#### Task 1.3: API Endpoints
**Files:** 
- `app/api/skills/run/route.ts`
- `app/api/skills/runs/route.ts`

**Endpoint 1:** `POST /api/skills/run`
```typescript
// Body: { skillName, inputs, productId? }
// Returns: { runId, status }
```

**Endpoint 2:** `GET /api/skills/runs`
```typescript
// Query: ?productId=xxx
// Returns: SkillRun[]
```

**Requirements:**
- Authenticated only
- Validate inputs
- Return run ID immediately
- Skill execution happens async

---

### Phase 2: SEO Audit Feature (Week 1-2)

#### Task 2.1: SEO Audit Skill Implementation
**File:** `lib/skills/implementations/seo-audit.ts`

```typescript
/**
 * SEO Audit Skill
 * Input: { url: string }
 * Output: { score: number, issues: Issue[] }
 */

interface SEOAuditInput {
  url: string
}

interface SEOAuditResult {
  score: number // 0-100
  issues: {
    severity: 'critical' | 'warning' | 'passed'
    category: 'meta' | 'performance' | 'mobile' | 'sitemap' | 'schema'
    title: string
    description: string
    fixGuide?: string
  }[]
  metrics: {
    titleLength?: number
    descriptionLength?: number
    hasOpenGraph: boolean
    hasSitemap: boolean
    hasRobots: boolean
    loadTime?: number
  }
}

export async function runSEOAudit(input: SEOAuditInput): Promise<SEOAuditResult> {
  // TODO:
  // 1. Fetch URL
  // 2. Parse HTML
  // 3. Check meta tags (title, description, og:tags)
  // 4. Check technical SEO (sitemap.xml, robots.txt)
  // 5. Run Lighthouse audit (optional, heavy)
  // 6. Calculate score
  // 7. Generate issues list
}
```

**Requirements:**
- Use cheerio for HTML parsing
- Check: title, meta description, Open Graph tags, canonical URL
- Check: sitemap.xml, robots.txt existence
- Calculate score based on passed checks
- Return actionable fix guides

**Example Result:**
```json
{
  "score": 72,
  "issues": [
    {
      "severity": "critical",
      "category": "meta",
      "title": "Meta description too short",
      "description": "Meta description is 45 characters. Recommended: 120-160.",
      "fixGuide": "Add a compelling 120-160 character meta description that includes your primary keyword."
    }
  ]
}
```

---

#### Task 2.2: SEO Audit UI Component
**File:** `components/skills/SEOAuditWidget.tsx`

```tsx
'use client'

export function SEOAuditWidget({ productId }: { productId: string }) {
  // State: url input, loading, result
  // Actions: runAudit(), createTasksFromIssues()
  
  return (
    <div className="border rounded-lg p-6">
      <h3>SEO Audit</h3>
      <input placeholder="https://yourwebsite.com" />
      <button onClick={runAudit}>Run Audit</button>
      
      {/* Loading state */}
      {/* Score card */}
      {/* Issues list */}
      {/* Create tasks button */}
    </div>
  )
}
```

**Requirements:**
- Input validation (valid URL)
- Loading spinner during execution
- Score visualization (circular progress or bar)
- Issues grouped by severity
- "Create tasks from issues" button

---

#### Task 2.3: Pre-Launch Page Integration
**File:** `app/pre-launch/page.tsx`

```tsx
import { SEOAuditWidget } from '@/components/skills/SEOAuditWidget'

export default function PreLaunchPage() {
  // ... existing code ...
  
  return (
    <div>
      {/* Existing checklist */}
      
      {/* New section */}
      <section>
        <h2>Launch Readiness Tools</h2>
        <SEOAuditWidget productId={product.id} />
      </section>
    </div>
  )
}
```

---

### Phase 3: Content Generator Feature (Week 2)

#### Task 3.1: Content Generator Skill
**File:** `lib/skills/implementations/content-generator.ts`

```typescript
interface ContentGeneratorInput {
  topic: string
  keywords?: string[]
  targetAudience?: string
  tone?: 'professional' | 'casual' | 'technical'
  wordCount?: number
}

interface ContentGeneratorResult {
  title: string
  outline: string[]
  content: string // markdown
  seoKeywords: string[]
  readingTime: number
}

export async function runContentGenerator(input: ContentGeneratorInput): Promise<ContentGeneratorResult> {
  // TODO:
  // 1. Research topic (web search or knowledge base)
  // 2. Generate outline
  // 3. Write full content
  // 4. Optimize for SEO
  // 5. Calculate reading time
}
```

**Requirements:**
- Use OpenAI API or Anthropic API for generation
- Include research phase (citations optional)
- Generate SEO-optimized content
- Return markdown format

---

#### Task 3.2: Content Generator UI
**File:** `components/skills/ContentGeneratorWidget.tsx`

```tsx
export function ContentGeneratorWidget({ productId }: { productId: string }) {
  // State: form inputs, loading, generated content
  // Actions: generate(), save(), discard()
  
  return (
    <div>
      <h3>Content Generator</h3>
      <input placeholder="Topic" />
      <input placeholder="Keywords (comma-separated)" />
      <select>{/* tone */}</select>
      <button onClick={generate}>Generate Content</button>
      
      {/* Loading state */}
      {/* Generated content preview */}
      {/* Edit/Save/Discard actions */}
    </div>
  )
}
```

---

#### Task 3.3: Growth Page Integration
**File:** `app/growth/page.tsx`

```tsx
import { ContentGeneratorWidget } from '@/components/skills/ContentGeneratorWidget'

export default function GrowthPage() {
  return (
    <div>
      {/* Existing content */}
      
      {/* New section */}
      <section>
        <h2>Content Tools</h2>
        <ContentGeneratorWidget productId={product.id} />
      </section>
    </div>
  )
}
```

---

### Phase 4: Copywriting Assistant (Week 3)

Similar pattern:
- `lib/skills/implementations/copywriting.ts`
- `components/skills/CopywritingWidget.tsx`
- Integration in pre-launch page

---

## Technical Requirements

### Dependencies to Install
```bash
npm install cheerio axios jsdom
npm install openai  # or @anthropic-ai/sdk
```

### Environment Variables
```env
OPENAI_API_KEY=xxx  # for content generation
```

### Error Handling
- Skill execution timeout: 60 seconds
- Network errors: retry 3 times
- Invalid inputs: return validation errors
- Rate limiting: queue requests if needed

### Testing
- Unit tests for each skill implementation
- API endpoint tests
- UI component tests (optional)

---

## Verification Criteria

Sprint 3 is complete when:

- [ ] Kullanıcı pre-launch page'de website URL girip SEO audit alabiliyor
- [ ] SEO score (0-100) gösteriliyor
- [ ] SEO issues Critical/Warning/Passed kategorilerinde listeleniyor
- [ ] Her issue'dan "Create Task" ile task oluşturulabiliyor
- [ ] Kullanıcı growth page'de topic girip blog post generate edebiliyor
- [ ] Generated content preview gösteriliyor, edit edilip save edilebiliyor
- [ ] Skill run history görülebiliyor (`/api/skills/runs`)

---

## Example User Flow

### SEO Audit Flow
1. User navigates to `/pre-launch`
2. Scrolls to "Launch Readiness Tools" section
3. Sees "SEO Audit" widget
4. Enters website URL: `https://myapp.com`
5. Clicks "Run Audit"
6. Loading spinner shows (~15-30 seconds)
7. Results appear:
   - Score: 68/100
   - 3 Critical issues
   - 5 Warnings
   - 12 Passed
8. Clicks "Create tasks from issues"
9. 8 new tasks created (3 critical + 5 warnings)
10. Tasks appear in task board

---

## Files to Create/Modify

### New Files
```
lib/skills/
  runner.ts
  implementations/
    seo-audit.ts
    content-generator.ts
    copywriting.ts

components/skills/
  SEOAuditWidget.tsx
  ContentGeneratorWidget.tsx
  CopywritingWidget.tsx

app/api/skills/
  run/route.ts
  runs/route.ts
```

### Modified Files
```
prisma/schema.prisma
app/pre-launch/page.tsx
app/growth/page.tsx
```

---

## Next Steps After Sprint 3

Sprint 4 will add:
- CRO audit skill (`page-cro`, `signup-flow-cro`)
- Launch strategy generator (`launch-strategy`)
- Metrics health layer

---

## Questions for Implementation

1. **Skill library source:** Should we clone AITMPL repo as git submodule or reimplement skills?
   - **Recommendation:** Reimplement core 5 skills for full control, reference AITMPL for patterns

2. **Async execution:** Use Next.js API routes with long timeout or separate worker?
   - **Recommendation:** Start with API routes + 60s timeout, migrate to queue later

3. **Content storage:** Where to save generated content?
   - **Recommendation:** New `Content` model or JSON in SkillRun result for v1

4. **Task creation from issues:** Auto-create or manual?
   - **Recommendation:** Manual with "Create tasks" button for v1

---

## Development Approach

### Recommended Order
1. Foundation first (runner + schema + API)
2. SEO audit (simplest skill)
3. Verify end-to-end flow
4. Content generator (more complex)
5. Copywriting assistant (similar to SEO)

### Development Tips
- Start with mock data for skill results (fast iteration)
- Test each skill independently before UI integration
- Use TypeScript strictly for skill interfaces
- Add console.log for debugging, remove before PR
- Write clear error messages for users

---

## Ready to Start?

Bu prompt Claude Code'a verdiğinde:
1. Önce foundation layer'ı implement edecek (runner, schema, API)
2. Sonra SEO audit skill + UI
3. Ardından content generator
4. Son olarak copywriting assistant

Her task için:
- Clear requirements var
- File paths belirtilmiş
- Code skeleton'lar hazır
- Verification criteria tanımlı

Başlamak için bu prompt'u Claude Code'a yapıştır ve şunu ekle:

> "Sprint 3 implementation'a başlayalım. Önce Task 1.1, 1.2, 1.3'ü (foundation layer) tamamla. Her task sonrası bana özet göster ve verification yap."
