# UI/UX Designer Skill

**When to use:** UI design, UX research, user flows, wireframes, design systems, accessibility, user testing

---

## Overview

Comprehensive UI/UX design patterns for creating intuitive, beautiful, accessible interfaces. Covers design thinking, user research, interaction design, visual design, and design systems.

---

## Design Thinking Process

### 1. Empathize → 2. Define → 3. Ideate → 4. Prototype → 5. Test

```markdown
## Design Thinking for [Feature Name]

### 1. EMPATHIZE (User Research)
**User Interviews:** 5 indie makers, 3 SaaS founders
**Key Insights:**
- "I never know if I'm actually ready to launch"
- "My checklist is in 3 different tools"
- "I forget critical steps every time"

### 2. DEFINE (Problem Statement)
**User:** Indie makers preparing to launch
**Need:** Clear view of launch readiness
**Insight:** They feel overwhelmed by scattered tasks
**Problem:** How might we help users feel confident they're ready to ship?

### 3. IDEATE (Solutions)
**Ideas:**
- Visual scorecard (0-100% ready)
- Category-based checklist
- Blocker extraction
- Progress tracking over time

### 4. PROTOTYPE (Low-fi → High-fi)
- Sketches (paper)
- Wireframes (Figma)
- Interactive prototype
- Visual design

### 5. TEST (User Testing)
- 5 users test prototype
- Task success rate: 4/5
- Key feedback: "Love the scorecard, but need to see WHY score is low"
- Iterate: Add blocker summary
```

---

## User Flows

### Creating User Flows

**Format:**
```
[Entry Point] → [Action] → [Decision] → [Outcome]
```

**Example: Create Task from Checklist**

```
┌─────────────────┐
│ Pre-Launch Page │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ View incomplete      │
│ checklist item       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Click "Create Task"  │
└────────┬─────────────┘
         │
         ▼
      ╱     ╲
     ╱ Task  ╲ Yes ─────► ┌──────────────┐
    │ created?│            │ Show success │
     ╲   ?   ╱             │ + link       │
      ╲     ╱              └──────────────┘
         │ No
         ▼
┌──────────────────────┐
│ Show error message   │
│ Keep button visible  │
└──────────────────────┘
```

---

## Wireframing

### Low-Fidelity Wireframes (Sketch/Balsamiq)

**Purpose:** Explore layout, structure, content hierarchy

```
┌─────────────────────────────────────┐
│ ☰  TIRAMISUP     [Product ▼]  [@]  │
├─────────────────────────────────────┤
│                                     │
│  Launch Readiness                   │
│  ┌───────────────────────────────┐  │
│  │    [=========    ]  75%       │  │
│  │    Ready to Launch: NO        │  │
│  │    3 blockers remaining       │  │
│  └───────────────────────────────┘  │
│                                     │
│  Blockers                           │
│  ┌───────────────────────────────┐  │
│  │ ⚠️  Privacy policy missing    │  │
│  │     [Create Task]             │  │
│  ├───────────────────────────────┤  │
│  │ ⚠️  Analytics not set up      │  │
│  │     [Create Task]             │  │
│  └───────────────────────────────┘  │
│                                     │
│  Categories                         │
│  [Product] [Marketing] [Technical]  │
│                                     │
└─────────────────────────────────────┘
```

### High-Fidelity Mockups (Figma)

**Checklist:**
- [ ] Real content (not lorem ipsum)
- [ ] Actual colors from design system
- [ ] Real typography (font sizes, weights)
- [ ] Proper spacing (8px grid)
- [ ] Interactive states (hover, active, disabled)
- [ ] Mobile responsive layouts

---

## Design Systems

### Tiramisup Design System

**Colors:**
```css
/* Primary */
--primary: #95dbda;        /* Turquoise - main brand */
--primary-hover: #75bcbb;  /* Darker turquoise */

/* Secondary */
--secondary: #ffd7ef;      /* Pink - CTA */
--accent: #fee74e;         /* Yellow - highlights */
--success: #75fc96;        /* Green - success states */

/* Semantic */
--critical: #ff4d4f;       /* Red - errors, critical */
--warning: #ffa940;        /* Orange - warnings */
--info: #40a9ff;           /* Blue - info */

/* Neutrals */
--text-primary: #0d0d12;   /* Almost black */
--text-secondary: #666d80; /* Gray */
--border: #e8e8e8;         /* Light gray */
--background: #f6f6f6;     /* Off-white */
```

**Typography:**
```css
/* Font Family */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Font Sizes */
--text-xs: 11px;   /* Labels, metadata */
--text-sm: 13px;   /* Body text, small UI */
--text-base: 15px; /* Default body */
--text-lg: 18px;   /* Subheadings */
--text-xl: 24px;   /* Headings */
--text-2xl: 32px;  /* Page titles */
--text-3xl: 48px;  /* Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Spacing (8px grid):**
```css
--space-1: 4px;   /* Tiny gaps */
--space-2: 8px;   /* Small */
--space-3: 12px;  /* Medium-small */
--space-4: 16px;  /* Default */
--space-5: 20px;  /* Medium */
--space-6: 24px;  /* Large */
--space-8: 32px;  /* Extra large */
--space-10: 40px; /* Huge */
```

**Border Radius:**
```css
--radius-sm: 8px;   /* Buttons, inputs */
--radius-md: 12px;  /* Small cards */
--radius-lg: 15px;  /* Standard cards */
--radius-xl: 20px;  /* Large cards */
--radius-full: 9999px; /* Pills, avatars */
```

**Shadows:**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

---

## Component Patterns

### Button Hierarchy

```tsx
// Primary (main CTA)
<button className="bg-[#95dbda] text-white px-4 py-2 rounded-[8px] font-medium hover:bg-[#75bcbb]">
  Create Product
</button>

// Secondary (supporting action)
<button className="bg-white border border-[#e8e8e8] text-[#0d0d12] px-4 py-2 rounded-[8px] hover:bg-[#f6f6f6]">
  Cancel
</button>

// Tertiary (subtle action)
<button className="text-[#95dbda] font-medium hover:text-[#75bcbb]">
  Learn More →
</button>

// Danger (destructive action)
<button className="bg-[#ff4d4f] text-white px-4 py-2 rounded-[8px] hover:bg-[#d43f3f]">
  Delete Product
</button>
```

### Form Inputs

```tsx
// Text input
<input
  type="text"
  className="w-full px-4 py-2 border border-[#e8e8e8] rounded-[8px] focus:border-[#95dbda] focus:ring-2 focus:ring-[#95dbda]/20 outline-none"
  placeholder="Product name"
/>

// With label
<div className="space-y-2">
  <label className="text-[13px] font-medium text-[#0d0d12]">
    Product Name *
  </label>
  <input type="text" {...} />
  <p className="text-[11px] text-[#666d80]">
    This will be visible to your team
  </p>
</div>

// Error state
<input
  className="... border-[#ff4d4f] focus:border-[#ff4d4f] focus:ring-[#ff4d4f]/20"
/>
<p className="text-[11px] text-[#ff4d4f] mt-1">
  Product name is required
</p>
```

### Cards

```tsx
// Standard card
<div className="bg-white rounded-[20px] border border-[#e8e8e8] p-6">
  <h3 className="text-[18px] font-bold text-[#0d0d12] mb-2">
    Card Title
  </h3>
  <p className="text-[13px] text-[#666d80]">
    Card content goes here
  </p>
</div>

// Interactive card (hover)
<div className="bg-white rounded-[20px] border border-[#e8e8e8] p-6 cursor-pointer hover:shadow-md transition-shadow">
  ...
</div>

// Card with badge
<div className="relative ...">
  <span className="absolute top-4 right-4 bg-[#fee74e] text-[#0d0d12] text-[11px] font-semibold px-2 py-1 rounded-full">
    NEW
  </span>
  ...
</div>
```

---

## Accessibility (A11y)

### WCAG 2.1 AA Compliance

**Color Contrast:**
```
Text on Background:
- Normal text (15px): 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

Examples:
✅ #0d0d12 on #ffffff (18.9:1) - Excellent
✅ #666d80 on #ffffff (5.2:1) - Good
✅ #95dbda on #0d0d12 (6.8:1) - Good
❌ #fee74e on #ffffff (1.2:1) - Fail
```

**Keyboard Navigation:**
```tsx
// Focus states (visible outline)
<button className="... focus:ring-2 focus:ring-[#95dbda] focus:ring-offset-2">

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Tab index for custom interactive elements
<div role="button" tabIndex={0} onClick={...} onKeyPress={(e) => {
  if (e.key === 'Enter' || e.key === ' ') handleClick();
}}>
```

**ARIA Labels:**
```tsx
// Icon buttons (no text)
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>

// Descriptive labels
<input
  type="text"
  aria-label="Product name"
  aria-describedby="product-name-help"
/>
<p id="product-name-help" className="text-xs text-gray-500">
  Choose a unique name for your product
</p>

// Live regions (dynamic content)
<div role="status" aria-live="polite" aria-atomic="true">
  Task created successfully
</div>
```

**Screen Reader Support:**
```tsx
// Hide decorative icons
<Star className="w-4 h-4" aria-hidden="true" />

// Announce changes
<div role="alert" aria-live="assertive">
  Error: Please fill in all required fields
</div>

// Semantic HTML
<nav aria-label="Main navigation">...</nav>
<main id="main-content">...</main>
<aside aria-label="Sidebar">...</aside>
```

---

## Responsive Design

### Mobile-First Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

**Mobile-First Approach:**
```tsx
// Base = mobile (375px)
<div className="p-4 text-sm">
  
  {/* Tablet and up */}
  <div className="md:p-6 md:text-base">
    
    {/* Desktop and up */}
    <div className="lg:p-8 lg:text-lg">
      ...
    </div>
  </div>
</div>
```

**Touch Targets (Mobile):**
```
Minimum touch target: 44x44px (Apple HIG)
Recommended: 48x48px (Material Design)

✅ Large enough buttons
<button className="min-h-[44px] px-4">

✅ Spacing between touch targets
<div className="space-y-3"> {/* 12px gap */}
  <button>...</button>
  <button>...</button>
</div>
```

---

## Interaction Design

### Micro-interactions

**Button Hover:**
```tsx
<button className="... hover:scale-105 hover:shadow-lg transition-all duration-200">
  Click Me
</button>
```

**Loading States:**
```tsx
// Button loading
<button disabled className="... opacity-50 cursor-not-allowed">
  <Loader className="w-4 h-4 animate-spin mr-2" />
  Creating...
</button>

// Skeleton loader
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

**Toast Notifications:**
```tsx
// Success
<div className="fixed top-4 right-4 bg-[#75fc96] text-[#0d0d12] px-4 py-3 rounded-[12px] shadow-lg animate-slide-in">
  ✓ Product created successfully
</div>

// Error
<div className="... bg-[#ff4d4f] text-white">
  ✗ Failed to create product. Please try again.
</div>
```

**Empty States:**
```tsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-[#f6f6f6] rounded-full mx-auto mb-4 flex items-center justify-center">
    <Inbox className="w-8 h-8 text-[#666d80]" />
  </div>
  <h3 className="text-[18px] font-semibold text-[#0d0d12] mb-2">
    No products yet
  </h3>
  <p className="text-[13px] text-[#666d80] mb-4">
    Create your first product to get started
  </p>
  <button className="...">
    Create Product
  </button>
</div>
```

---

## User Testing

### Usability Test Script

**Introduction:**
```
Thanks for joining! Today we'll test our new launch readiness feature.
I'll ask you to complete some tasks while thinking aloud.
There are no right or wrong answers - we're testing the design, not you.
Feel free to be honest. Your feedback helps us improve.
```

**Tasks:**
```markdown
## Task 1: View Launch Readiness
"You're preparing to launch your product. Find out if you're ready to ship."

Success: User finds pre-launch page and understands score
Metrics: Time to complete, click path, confusion points

## Task 2: Identify Blockers
"Your launch score is 75%. Figure out what's blocking you from 100%."

Success: User finds blocker summary and understands issues
Metrics: Time to complete, comprehension (ask what blockers are)

## Task 3: Create Task from Blocker
"You see 'Privacy policy missing' is a blocker. Turn it into a task."

Success: User clicks "Create Task" and verifies task created
Metrics: Time to complete, errors, task located

## Post-Test Questions:
1. On a scale 1-5, how easy was it to understand your launch readiness?
2. What was confusing or unclear?
3. What did you like most?
4. Would you use this feature? Why/why not?
```

---

## Best Practices

### ✅ DO:
- Use 8px spacing grid consistently
- Design mobile-first
- Include hover/focus/disabled states for all interactive elements
- Use semantic HTML (nav, main, aside, button, etc.)
- Provide ARIA labels for icon buttons
- Test keyboard navigation
- Show loading states (don't freeze UI)
- Provide feedback for all user actions
- Use empty states (don't show blank screens)
- Test with real content (not lorem ipsum)

### ❌ DON'T:
- Use color as only indicator (accessibility)
- Make touch targets smaller than 44px
- Skip loading/error states
- Use low-contrast text (fails WCAG)
- Disable button without explaining why
- Hide critical info on mobile
- Use tiny fonts (<11px for body text)
- Auto-play video/audio
- Open links in new tabs without warning
- Use ambiguous icons without labels

---

## Tools

**Design:** Figma, Sketch, Adobe XD  
**Prototyping:** Figma, Framer, ProtoPie  
**User Testing:** Maze, UserTesting, Loom  
**Accessibility:** aXe, WAVE, Contrast Checker  
**Analytics:** Hotjar, FullStory, Google Analytics  

---

## Resources

- Figma: https://www.figma.com
- Material Design: https://material.io/design
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Laws of UX: https://lawsofux.com/

---

**Last Updated:** 2026-03-20  
**For:** Tiramisup UI/UX design + general design work
