# Sprint 1 Completion - Developer Görevleri

**Tarih:** 2026-03-20  
**Durum:** Wizard ✅ | Product Context ❌ | Design Alignment ⚠️

---

## 📁 ÖNCE BU DOSYALARI OKU

1. `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/IMPLEMENTATION_GUIDE.md`
2. `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/.gsd/CURRENT_STATUS.md`
3. `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/.gsd/FIGMA_ANALYSIS.md`

**Figma URL:** https://www.figma.com/design/KZsrlwxIe2ecth1GLSwAmB/Tiramiso

---

## 🔥 PHASE 1: CRITICAL TASKS (Bugün Bitirilmeli)

### Task 1: Product List Page Verification

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/products/page.tsx`

**İşlem:**
- Mevcut dosyayı kontrol et
- Yoksa veya eksikse Figma'ya göre yeniden yaz
- Product list grid (card layout)
- Her card: logo, name, status badge (PRE_LAUNCH/LAUNCHED/GROWING)
- "+ Yeni Ürün Oluştur" button → `/products/new`

**Referans:**
- Wizard zaten çalışıyor: `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/products/new/page.tsx`
- Bu dosyadaki design pattern'leri kullan

---

### Task 2: Product Selector Component (NAV DROPDOWN)

**Yeni Dosya Oluştur:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/components/ProductSelector.tsx`

**İçerik:**
```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductSelector() {
  const [products, setProducts] = useState([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user's products
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        // Read active from cookie or use first
        const active = document.cookie
          .split("; ")
          .find(row => row.startsWith("activeProductId="))
          ?.split("=")[1];
        setActiveProductId(active || data.products[0]?.id);
      });
  }, []);

  const switchProduct = (productId: string) => {
    document.cookie = `activeProductId=${productId}; path=/`;
    setActiveProductId(productId);
    setOpen(false);
    router.refresh(); // Reload server components
  };

  const activeProduct = products.find(p => p.id === activeProductId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <span className="text-sm font-medium text-gray-700">
          {activeProduct?.name || "Ürün Seç"}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => switchProduct(product.id)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#95dbda]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[#95dbda]">
                  {product.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                <div className="text-xs text-gray-500">{product.status}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Sonra Bu Dosyaya Ekle:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/components/AppShell.tsx` veya `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/components/DashboardNav.tsx`

**Ekleme:**
```typescript
import ProductSelector from "./ProductSelector";

// Navigation içinde uygun yere ekle:
<ProductSelector />
```

---

### Task 3: Active Product Context Hook

**Yeni Dosya Oluştur:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/lib/hooks/useActiveProduct.ts`

**İçerik:**
```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useActiveProduct() {
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Priority: URL param > cookie > localStorage
    const urlProductId = searchParams.get("productId");
    const cookieProductId = document.cookie
      .split("; ")
      .find(row => row.startsWith("activeProductId="))
      ?.split("=")[1];

    const productId = urlProductId || cookieProductId || null;
    setActiveProductId(productId);

    // Sync to cookie if from URL
    if (urlProductId) {
      document.cookie = `activeProductId=${urlProductId}; path=/`;
    }
  }, [searchParams]);

  const setActiveProduct = (productId: string) => {
    document.cookie = `activeProductId=${productId}; path=/`;
    setActiveProductId(productId);
  };

  return { activeProductId, setActiveProduct };
}
```

---

### Task 4: Product-Scoped Queries (Update Existing Pages)

#### 4a. Dashboard

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/dashboard/page.tsx`

**Değişiklik:**
```typescript
// Önce active productId'yi al (cookie'den)
const cookieStore = cookies();
const activeProductId = cookieStore.get("activeProductId")?.value;

// Sonra tüm queries'e ekle:
const metrics = await prisma.metric.findMany({
  where: { productId: activeProductId },
  orderBy: { date: "desc" },
  take: 30,
});

const goals = await prisma.goal.findMany({
  where: { productId: activeProductId, completed: false },
});

const tasks = await prisma.task.findMany({
  where: { productId: activeProductId, status: "TODO" },
  take: 5,
});
```

#### 4b. Metrics Page

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/metrics/page.tsx`

**Değişiklik:**
```typescript
const cookieStore = cookies();
const activeProductId = cookieStore.get("activeProductId")?.value;

const metrics = await prisma.metric.findMany({
  where: { productId: activeProductId },
  // ... rest of query
});
```

#### 4c. Growth Page

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/growth/page.tsx`

**Değişiklik:**
```typescript
const cookieStore = cookies();
const activeProductId = cookieStore.get("activeProductId")?.value;

const goals = await prisma.goal.findMany({
  where: { productId: activeProductId },
  // ... rest
});

const routines = await prisma.routine.findMany({
  where: { productId: activeProductId },
  // ... rest
});
```

#### 4d. Pre-Launch Page

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/pre-launch/page.tsx`

**Değişiklik:**
```typescript
const cookieStore = cookies();
const activeProductId = cookieStore.get("activeProductId")?.value;

const checklist = await prisma.checklistItem.findMany({
  where: { productId: activeProductId },
  // ... rest
});
```

---

### Task 5: API Endpoint for Product List

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/api/products/route.ts`

**GET endpoint ekle (eğer yoksa):**
```typescript
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ products: user?.products || [] });
}
```

---

## ✅ VERIFICATION (Phase 1 Complete)

**Test Senaryosu:**
1. Signup yap veya login ol
2. Dashboard'a git
3. Nav'da product selector dropdown görünmeli
4. "Yeni Ürün Oluştur" tıkla → wizard aç
5. 2. bir ürün oluştur (farklı isim)
6. Products page'de 2 ürün görünmeli
7. Nav dropdown'dan diğer ürüne geç
8. Dashboard içeriği değişmeli (farklı ürünün metrikleri)

**Checklist:**
- [ ] `/products` sayfası 2 ürünü gösteriyor
- [ ] Nav'da dropdown var ve çalışıyor
- [ ] Dropdown'dan ürün değişince dashboard refresh oluyor
- [ ] Dashboard doğru ürünün metriklerini gösteriyor
- [ ] Console'da hata yok
- [ ] Cookie'de activeProductId set ediliyor

---

## 📊 PHASE 2: DESIGN ALIGNMENT (Phase 1 Bittikten Sonra)

### Task 6: Dashboard Redesign

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/dashboard/page.tsx`

**Referans:** Figma Light Version → Dashboard frames

**İşlemler:**
1. Figma'daki dashboard layout'unu incele
2. Hero section ekle (Hoş geldiniz, [User])
3. Product status card (readiness %)
4. Quick actions grid (3-4 cards)
5. Metrics summary row
6. Goals widget
7. Recent tasks preview

**Design Tokens Kullan:**
- Primary: `#95dbda` (turquoise)
- Pink: `#ffd7ef` (CTA buttons)
- Background: `#f6f6f6`
- Cards: `rounded-[20px]`, `shadow-card`

---

### Task 7: Tailwind Config Completion

**Dosya:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/tailwind.config.ts`

**Figma'dan Extract Et:**
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E0F7F5",
          100: "#B3EDE8",
          200: "#80E3DB",
          300: "#4DD8CE",
          400: "#26D0C4",
          500: "#95dbda", // main turquoise
          600: "#00C7B7",
          700: "#00AC9D",
        },
        pink: {
          50: "#FFF0F9",
          500: "#ffd7ef", // CTA pink
          600: "#f5c8e4",
        },
        // ... tam palette Figma'dan
      },
      borderRadius: {
        card: "20px",
        input: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05)",
      },
    },
  },
};
```

---

### Task 8: Other Pages Styling

**Dosyalar:**
- `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/pre-launch/page.tsx`
- `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/metrics/page.tsx`
- `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/growth/page.tsx`
- `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/settings/page.tsx`

**Her Birine Uygula:**
1. Figma color palette (#95dbda primary, #ffd7ef CTA)
2. Rounded corners (cards: 20px, inputs: 12px)
3. Typography (font sizes, weights Figma'dan)
4. Spacing consistent

---

## 🎯 EXECUTION ORDER

```
1. ✅ Read all 3 documentation files (paths above)
2. 🔥 Task 1: Verify/fix product list page
3. 🔥 Task 2: Create ProductSelector component
4. 🔥 Task 3: Create useActiveProduct hook
5. 🔥 Task 4: Update all pages (dashboard, metrics, growth, pre-launch) with product-scoped queries
6. 🔥 Task 5: Add GET endpoint to /api/products
7. ✅ TEST: Create 2 products, switch, verify dashboard changes
8. 📐 Task 6: Dashboard redesign (Figma)
9. 📐 Task 7: Complete tailwind.config.ts
10. 📐 Task 8: Align other pages to Figma
11. ✅ FINAL TEST: Visual regression < 10%
```

---

## 📞 HELP

**Figma Link:** https://www.figma.com/design/KZsrlwxIe2ecth1GLSwAmB/Tiramiso

**Key Reference Files:**
- Working wizard example: `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/app/products/new/page.tsx`
- Schema: `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/prisma/schema.prisma`
- Seed logic: `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/lib/seed.ts`

**Sprint Plan:** `/Users/ozer/Desktop/Özer KOD YAZDIRIYOR/Tiramisup/SPRINT_PLAN.md`

---

## ✅ DONE WHEN

- [ ] 2 ürün oluşturulabiliyor
- [ ] Nav dropdown ile switch yapılabiliyor  
- [ ] Dashboard product-specific data gösteriyor
- [ ] Tüm sayfalar Figma renkleri kullanıyor
- [ ] Build passes (`npm run build`)
- [ ] Console temiz (no errors)

**Current Status:** 2/6 ✅ (Wizard + API done)  
**Target:** 6/6 ✅ (Full Sprint 1 complete)

---

**START HERE:**
Read the 3 docs above, then execute tasks 1-5 in order. Test after task 5. Then do tasks 6-8.

🚀 Let's ship this!
