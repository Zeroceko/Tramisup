# Tiramisup - Figma Design Implementation Guide

## PRODUCT VISION

Tiramisup, küçük startup ekipleri ve founder'lar için **launch-to-growth operating workspace**.

**Core Value Proposition:**
"Ürünüm şu an nerede, risk nerede ve sıradaki doğru adım ne?" sorusunu tek workspace'te cevaplamak.

**What It Does:**
- Product launch readiness tracking
- Growth metrics & health monitoring  
- Task execution layer (kanban)
- Goals & routine management
- AI-powered launch/growth assistance (SEO, CRO, competitor intel)
- Multi-product portfolio support

**User Journey:**
1. Signup → Onboarding wizard (7-step ürün tanıma)
2. Launch hazırlık → Checklist + blocker tracking
3. Metrics giriş → Health visibility
4. Growth execution → Goals, routines, tasks
5. Weekly review → AI summaries + next actions

---

## CURRENT STATE

- ✅ Auth working (signup/login)
- ✅ Basic dashboard, pre-launch, metrics, growth pages
- ✅ Multi-product schema ready
- ✅ Seed data works
- ❌ No onboarding wizard
- ❌ No product creation flow
- ❌ Design doesn't match Figma
- ❌ No active product switching

---

## FIGMA DESIGN

**URL:** https://www.figma.com/design/KZsrlwxIe2ecth1GLSwAmB/Tiramiso

**Key Pages:**
- Style Guide (design tokens)
- Light Version (all screens)
- Onboarding wizard (7 steps)
- Dashboard variants
- Task List/Board

**Design Language:**
- Primary: Turquoise/Cyan (#40E0D0 range)
- Pill-style tab navigation
- Clean, minimal UI
- Modal-based wizards
- Card-based layouts

---

## IMPLEMENTATION TASKS

### Phase 1: Design System Foundation

**File:** `tailwind.config.ts`

Extract from Figma Style Guide:
- Primary colors (turquoise, grays, backgrounds)
- Typography scale (heading, body, small)
- Spacing system
- Border radius values
- Shadow tokens

Update Tailwind with Figma tokens:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#E0F7F5',  // light turquoise
        100: '#B3EDE8',
        200: '#80E3DB',
        300: '#4DD8CE',
        400: '#26D0C4',
        500: '#40E0D0',  // main turquoise
        600: '#00C7B7',
        700: '#00AC9D',
        800: '#009183',
        900: '#006B5D',
      },
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
      // ... extract all from Figma
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    spacing: {
      // Extract from Figma
    },
    borderRadius: {
      'sm': '0.375rem',
      'md': '0.5rem',
      'lg': '0.75rem',
      'xl': '1rem',
      '2xl': '1.5rem',
      'full': '9999px',
    },
  }
}
```

---

### Phase 2: Onboarding Wizard (7-Step)

**Priority: HIGHEST - This is Sprint 1 core**

#### Files to Create:

```
app/
  products/
    new/
      page.tsx              # Wizard container
  api/
    products/
      route.ts              # POST /api/products

components/
  onboarding/
    WizardModal.tsx         # Modal wrapper
    TabNavigation.tsx       # Pill-style tabs (7 steps)
    StepContainer.tsx       # Each step wrapper
    steps/
      Step1ProductIntro.tsx    # "Ürünü Anlat"
      Step2TypeChannels.tsx    # "Tipi & Kanallar"
      Step3ProductProfile.tsx  # "Ürün Profilleri"
      Step4DataPermissions.tsx # "Veri & İzinler"
      Step5LaunchPrep.tsx      # "Launch Hazırlık"
      Step6GrowthSetup.tsx     # "Growth Setup"
      Step7Others.tsx          # "Diğerleri"
```

#### Wizard Flow:

1. User lands on `/{locale}/onboarding`
2. Modal opens with 7-tab navigation
3. Each step = one screen
4. "Devam Et" button moves to next step
5. Final step → POST /api/products → redirect to dashboard with new product

#### Step Details (from Figma):

**Step 1 - Ürünü Anlat:**
- Ürününüzün adı (text input) → `Product.name`
- Ürünü kısaca anlatın (textarea) → `Product.description`
- Actions: Dosya Yükle (file upload for logo), URL Tanımla
- Validation: name required, description optional

**Step 2 - Tipi & Kanallar:**
- Kategori selection → `Product.category`
  - Options: SaaS, E-commerce, Marketplace, Mobile App, Content/Media, Other
- Distribution channels (multi-select, store as JSON)
- Validation: category required

**Step 3 - Ürün Profilleri:**
- Target audience → `Product.targetAudience`
  - Options: Developers, Small Business, Consumers, Enterprise, Other
- Validation: targetAudience required

**Step 4 - Veri & İzinler:**
- Business model → `Product.businessModel`
  - Options: Subscription, Freemium, One-time, Ads, Marketplace Fee, Other
- Validation: businessModel required

**Step 5 - Launch Hazırlık:**
- Launch date picker → `Product.launchDate`
- Launch goals (multi-select) → `Product.launchGoals` (JSON array)
  - İlk 100 kullanıcıya ulaş
  - $1000 MRR'a ulaş
  - Product-market fit kanıtla
  - İlk paying customer
  - Beta launch
  - Sustained growth
- Validation: launchDate optional, goals optional

**Step 6 - Growth Setup:**
- Website URL → `Product.website`
- Initial metrics baseline (optional)
- Validation: website optional (URL format if provided)

**Step 7 - Diğerleri:**
- Additional notes
- Team invite (defer to Sprint 10 - just show placeholder)
- Final review + confirmation
- "Oluştur" button (primary action)

#### Technical Specs:

```typescript
// Wizard state management
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<ProductFormData>({
  name: '',
  description: '',
  category: '',
  targetAudience: '',
  businessModel: '',
  website: '',
  launchDate: null,
  launchGoals: [],
  logoUrl: null,
});

// Validation per step (Zod schema)
const step1Schema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  description: z.string().optional(),
});

// API endpoint
POST /api/products
Body: ProductFormData
Response: { productId: string }
Then: seedProductData(productId)
Redirect: /dashboard?productId=NEW_ID
```

- Client component (useState for step tracking)
- Form validation (Zod schema per step)
- Progress indicator (1/7, 2/7... turquoise fill)
- Tab navigation (pill-style, active = turquoise, inactive = gray)
- Modal with close button (X top-right)
- Responsive (mobile stacks tabs vertically?)

---

### Phase 3: Product List & Selector

#### Files:

```
app/products/page.tsx           # Product grid
components/ProductSelector.tsx  # Nav dropdown
lib/hooks/useActiveProduct.ts   # Active product context
```

**Product List Page:**
- Card grid showing user's products
- Each card: 
  - Logo (if uploaded) or placeholder
  - Product name
  - Status badge (PRE_LAUNCH/LAUNCHED/GROWING)
  - Last updated date
  - Click → navigate to /dashboard?productId=ID
- "+ Yeni Ürün Oluştur" CTA → opens `/{locale}/onboarding`
- Empty state if no products

**Product Selector (Nav):**
- Dropdown in AppShell/DashboardNav
- Shows current active product name + logo
- Click → dropdown list of user products
- Select → switch active product → store in cookie/session
- Reload dashboard context with new productId

**useActiveProduct Hook:**

```typescript
export function useActiveProduct() {
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  
  useEffect(() => {
    // Read from URL params, cookie, or first product
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('productId') || 
                      Cookies.get('activeProductId');
    setActiveProductId(productId);
  }, []);
  
  return { activeProductId, setActiveProductId };
}
```

---

### Phase 4: Dashboard Alignment

**File:** `app/dashboard/page.tsx`

Match Figma Dashboard design:

**Layout Structure:**
```
- Hero section: "Hoş geldiniz, [User Name]"
- Product status card (PRE_LAUNCH badge, readiness %)
- Quick actions grid (3-4 cards)
  - "Launch checklist'i gözden geçir"
  - "Bugünün metriklerini gir"
  - "Entegrasyonları bağla"
- Metrics summary row (DAU, MRR, readiness)
- Goals pulse widget (active goals count)
- Recent tasks preview (first 3 tasks)
```

**Use Figma screenshots to match:**
- Card layouts (rounded corners, shadows)
- Typography hierarchy (bold headings, regular body)
- Turquoise accent colors (badges, buttons)
- Spacing/padding (consistent gaps)
- Icons (use Heroicons or Lucide)

**Product-Scoped Queries:**
```typescript
// All queries filter by activeProductId
const metrics = await prisma.metric.findMany({
  where: { productId: activeProductId },
  orderBy: { date: 'desc' },
  take: 30,
});

const goals = await prisma.goal.findMany({
  where: { productId: activeProductId, completed: false },
});

const tasks = await prisma.task.findMany({
  where: { productId: activeProductId, status: 'TODO' },
  take: 3,
});
```

---

### Phase 5: Other Pages Styling

Apply Figma design to existing pages:

**1. Pre-Launch Page** (`app/pre-launch/page.tsx`)
- Launch checklist redesign
- Category-based scorecards (PRODUCT, MARKETING, LEGAL, TECH)
- Progress bars (turquoise fill)
- Blocker summary section
- Task quick-add from checklist items

**2. Metrics Page** (`app/metrics/page.tsx`)
- Metrics dashboard cards
- Chart styling (match Figma colors)
- Form input design
- Date picker styling

**3. Growth Page** (`app/growth/page.tsx`)
- Goals cards redesign
- Routines list styling
- Progress update form
- Timeline visual

**4. Integrations Page** (`app/integrations/page.tsx`)
- Integration provider cards
- Connection status badges
- Test connection button
- Sync history table

**5. Settings Page** (`app/settings/page.tsx`)
- Form field styling
- Section dividers
- Save/cancel button placement

---

### Common Components to Extract

**Component Library:**

```
components/
  ui/
    PageHeader.tsx        # Title + description + actions
    StatCard.tsx          # Metric display card
    ProgressBar.tsx       # Readiness % bar
    Badge.tsx             # Status indicators (PRE_LAUNCH, etc)
    Button.tsx            # Primary/secondary/ghost variants
    Card.tsx              # Base card wrapper
    Input.tsx             # Text input with label
    Textarea.tsx          # Textarea with label
    Select.tsx            # Dropdown select
    DatePicker.tsx        # Date input
    Modal.tsx             # Modal wrapper
```

**Design Patterns:**
- Consistent card shadows
- Rounded corners (2xl for cards, xl for inputs)
- Turquoise primary color for CTAs
- Gray scale for secondary elements
- Hover states (slight scale + shadow)
- Focus states (turquoise ring)

---

## VERIFICATION CHECKLIST

### Sprint 1 Complete When:

- [ ] tailwind.config.ts has Figma design tokens
- [ ] 7-step onboarding wizard works end-to-end
- [ ] User can create second product via wizard
- [ ] Product selector in nav shows/switches products
- [ ] Dashboard is product-scoped (filters by active product)
- [ ] Visual match: Figma vs rendered (>90% fidelity)
- [ ] All forms validate properly (Zod schemas)
- [ ] Error states handled (validation errors shown)
- [ ] Success states handled (product created → redirect)
- [ ] Mobile responsive (test on 375px, 768px, 1024px)
- [ ] No console errors
- [ ] Build passes (`npm run build`)
- [ ] TypeScript strict mode passes

### Definition of Done:

- Code matches Figma design (screenshot comparison)
- All 7 wizard steps complete successfully
- Product creation → seed → dashboard flow works
- Multi-product switching works
- First-time user experience is smooth (<5 min to first value)
- Loading states present (skeleton screens)
- Empty states present (no products, no data)
- Error boundaries catch failures

---

## START HERE - Step-by-Step Execution Order

### Day 1: Design System
1. ✅ Read Figma file (extract design tokens)
2. ✅ Update `tailwind.config.ts` with colors, typography, spacing
3. ✅ Create base component library (Button, Input, Card, Badge)
4. ✅ Test components in Storybook or dedicated page

### Day 2: Wizard Foundation
5. ✅ Create `WizardModal` component
6. ✅ Create `TabNavigation` component (pill-style)
7. ✅ Create `StepContainer` wrapper
8. ✅ Build Step 1 (Product Intro) with validation
9. ✅ Test step navigation (Next/Back)

### Day 3: Wizard Steps 2-7
10. ✅ Implement Step 2 (Type & Channels)
11. ✅ Implement Step 3 (Product Profile)
12. ✅ Implement Step 4 (Data & Permissions)
13. ✅ Implement Step 5 (Launch Prep)
14. ✅ Implement Step 6 (Growth Setup)
15. ✅ Implement Step 7 (Others)

### Day 4: API & Integration
16. ✅ Create API endpoint `POST /api/products`
17. ✅ Wire up wizard submission
18. ✅ Test product creation flow
19. ✅ Implement seed data call after creation
20. ✅ Test redirect to dashboard with new product

### Day 5: Product List & Selector
21. ✅ Build product list page (`app/products/page.tsx`)
22. ✅ Build ProductSelector dropdown component
23. ✅ Integrate selector into navigation
24. ✅ Implement active product switching
25. ✅ Test multi-product flow

### Day 6: Dashboard Redesign
26. ✅ Redesign dashboard to match Figma
27. ✅ Add product-scoped queries
28. ✅ Implement all dashboard cards
29. ✅ Test product context switching on dashboard

### Day 7: Other Pages + Polish
30. ✅ Align pre-launch page design
31. ✅ Align metrics page design
32. ✅ Align growth page design
33. ✅ Align integrations page design
34. ✅ Align settings page design
35. ✅ Final visual QA (Figma vs rendered)
36. ✅ Mobile responsive testing
37. ✅ Build + deployment test

---

## FIGMA REFERENCE WORKFLOW

For each component:

1. **Screenshot Figma screen** (export as PNG)
2. **Build component** (matching colors, spacing, typography)
3. **Screenshot rendered component**
4. **Visual diff** (overlay images, compare)
5. **Iterate** until 1:1 match
6. **Move to next component**

**Tools:**
- Browser DevTools (measure spacing)
- Figma Inspect panel (copy CSS)
- Screenshot comparison (side-by-side)

---

## TECHNICAL CONSTRAINTS

- **Next.js 15 App Router** (no pages/ directory)
- **Server Components** by default
- **Client Components** for interactive (wizard, forms)
- **Prisma** for all DB operations
- **NextAuth** session management
- **Tailwind CSS** only (no CSS modules, no styled-components)
- **TypeScript** strict mode enabled
- **Zod** for form validation
- **React Hook Form** optional (or plain React state)

---

## SCHEMA REFERENCE

All onboarding fields already exist in schema:

```prisma
model Product {
  id             String        @id @default(cuid())
  userId         String
  name           String
  status         ProductStatus @default(PRE_LAUNCH)
  launchDate     DateTime?

  // Onboarding wizard fields (7-step)
  description    String?
  category       String?   // SaaS, E-commerce, etc.
  targetAudience String?
  businessModel  String?   // Subscription, Freemium, etc.
  website        String?
  logoUrl        String?
  launchGoals    String?   // JSON array of selected goals

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

**No migration needed** - schema is ready.

---

## NOTES

**Out of Scope for Sprint 1:**
- ❌ AI skills integration (Sprint 3-5)
- ❌ Kanban board (Sprint 6)
- ❌ Real integrations (Sprint 8)
- ❌ Weekly review AI (Sprint 9)
- ❌ Collaboration/team (Sprint 10)

**In Scope for Sprint 1:**
- ✅ Onboarding wizard (7 steps)
- ✅ Product creation + seed
- ✅ Product list + selector
- ✅ Design system alignment
- ✅ Dashboard product-scoping
- ✅ Visual polish to match Figma

---

## SUCCESS METRICS

**Sprint 1 is successful when:**
1. New user can complete onboarding in <5 minutes
2. Dashboard shows product-specific data
3. User can create + switch between multiple products
4. Design matches Figma (>90% visual fidelity)
5. No critical bugs (auth works, forms validate, data persists)
6. Build is production-ready (`npm run build` succeeds)

**User Feedback Goals:**
- "Bu çok hızlı kuruldu!" (Setup was fast)
- "Ürünümü tanımladım, şimdi ne yapmalıyım belli" (Clear next steps)
- "Tasarım çok temiz" (Design is clean)

---

## IMPLEMENTATION COMPLETE - HANDOFF

When Sprint 1 is done:
1. ✅ Update `SPRINT_PLAN.md` (mark Sprint 1 tasks complete)
2. ✅ Update `.gsd/STATE.md` (current milestone progress)
3. ✅ Create `.gsd/milestones/M001/slices/S01/S01-SUMMARY.md`
4. ✅ Commit changes with message: "feat: Sprint 1 - Product onboarding wizard + design system"
5. ✅ Deploy to staging/preview environment
6. ✅ User acceptance testing
7. ✅ Move to Sprint 2 (Launch Operating System)

---

**Questions? Check:**
- Figma file: https://www.figma.com/design/KZsrlwxIe2ecth1GLSwAmB/Tiramiso
- Sprint plan: `SPRINT_PLAN.md`
- Current state: `.gsd/STATE.md`
- Schema: `prisma/schema.prisma`
- Existing components: `components/`

**Start with Phase 1 (Design System), then Phase 2 (Wizard).**

Let's ship this! 🚀
