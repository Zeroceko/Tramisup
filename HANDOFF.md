# Tiramisup — Handoff Document

**Son güncelleme:** Mart 2026  
**Durum:** Dokümantasyon ve strateji fazı tamamlandı — implementation'a hazır

---

## Özet

Tiramisup, founder ve küçük startup ekipleri için **launch-to-growth operating workspace**. Tek bir ürün veya ileride birden fazla ürün için launch hazırlığı, growth readiness, görev takibi, metrik takibi, hedefler, rutinler ve entegrasyon durumunu tek sistemde toplanmayı hedefler.

**Bugünkü durum:**
- Çalışan auth (signup/login/session)
- Varsayılan product oluşturma ve seed
- Dashboard, pre-launch, metrics, growth, integrations, settings sayfaları mevcut
- Multi-product schema hazır, ama UX henüz yok
- Growth checklist ve kanban modelleri schema'da var, UX eksik
- Integrations kabuk olarak var, gerçek sync yok

**Sıradaki iş:**
Bu dokümantasyon pasiyle ürün nereye gideceğini ve nasıl inşa edileceğini tanımladık. Şimdi implementation başlayabilir.

---

## Çalışma Kılavuzları

### Ürün vizyon ve strateji
- **`ROADMAP.md`** — büyük resim, product thesis, 11-fazlı roadmap, AI/MCP architecture
- **`PRODUCT_OPERATING_MODEL.md`** — launch phase, growth phase, passive intelligence, AI rolü
- **`EXECUTIVE_OVERVIEW.md`** — sunum formatında özet, teknik olmayan inceleme için

### Kullanıcı soruları ve entegrasyonlar
- **`DISCOVERY_QUESTIONS_AND_INTEGRATIONS.md`**
  - kullanıcıdan hangi bilgileri hangi aşamada soracağız
  - sormadan hangi verileri nasıl alabiliriz
  - entegrasyon tiers (Stripe, GA4, PostHog, Mixpanel, HubSpot, vb.)
  - AI ve MCP gelecekteki rolleri

### Geliştirici kılavuzu
- **`SPRINT_PLAN.md`** — roadmap'i 10 sprint paketine böldük
  - Sprint 0: Foundation reset
  - Sprint 1: Product creation & understanding
  - Sprint 2: Launch operating system
  - Sprint 3: Metrics health layer
  - Sprint 4: Growth operating system
  - Sprint 5: Kanban board
  - Sprint 6: Dashboard 2.0 & cohesion
  - Sprint 7: Real integrations (Stripe + analytics)
  - Sprint 8: Weekly review & AI summary
  - Sprint 9+: Collaboration, reporting, platformization

### Ekip execution belgesi
- **`.gsd/PROJECT.md`** — ürün bugün ne, capability contract, milestone sequence
- **`.gsd/REQUIREMENTS.md`** — active/validated/deferred/out-of-scope gereksinimler
- **`.gsd/DECISIONS.md`** — architectural kararlar (append-only)
- **`.gsd/KNOWLEDGE.md`** — ekip için çalışma kuralları, patterns, lessons learned
- **`.gsd/STATE.md`** — şu anki focus ve next build targets

### Akış envanteri
- **`findings.md`** — mevcut ürün akışlarının detaylı envanteri
  - working flows
  - partial flows
  - missing flows
  - schema'de var ama UX yok

### Çalışma izleri
- **`task_plan.md`** — bu dokümantasyon turunda yapılan işler
- **`progress.md`** — session log ve verification summary

---

## Teknik Bilgiler

### Stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS 3
- Prisma 6
- NextAuth 4
- PostgreSQL (local: `postgresql://tramisu:tramisu_dev_password@localhost:5432/tramisu`)
- Recharts

### Çalıştırma
```bash
npm install
npm run dev
```
Dev server: `http://localhost:3001` (port 3000 zaten kullanımda)

### Environment
`.env` dosyasında:
- `DATABASE_URL`
- `NEXTAUTH_URL=http://localhost:3001`
- `NEXTAUTH_SECRET` (gerçek değer var, placeholder değil)

### Build
```bash
npm run build
```
Build şu an temiz geçiyor.

### Known Issues
- Dev sunucusu zaman zaman `.next` cache sorunları yaratabilir → çözüm: kill + `rm -rf .next` + restart
- `NEXTAUTH_SECRET` değişirse cookie/JWT invalid kalır → çözüm: browser cookies'i temizle

---

## Mimari

### Sayfa yapısı
- Public: landing, signup, login
- Authenticated: dashboard, pre-launch, metrics, growth, integrations, settings, (ileride: products, board, growth-readiness)

### Ana domain modeli
- `User` → `Product[]` (multi-product ready, ama UX henüz yok)
- `Product` → tüm feature'lar product-scoped
- Checklist, Task, Goal, Routine, Metric, Integration, SyncJob modelleri mevcut

### Seed mantığı
`lib/seed.ts` kullanıcı signup olunca varsayılan product ve demo data oluşturur.

### Design system
- `AppShell` — authenticated layout wrapper
- `PageHeader` — page başlıkları
- `StatCard` — summary kartlar
- `DashboardNav` — navigation
- Glassmorphism + blue gradient + rounded-[24-32px]

---

## Sıradaki Implementation Adımları

### Hemen başlanabilecek işler (Sprint 0–1)
1. **Runtime stabilization**
   - `.next` cache playbook
   - Tailwind warning'leri düzelt
   - auth flow smoke test

2. **Product creation wizard**
   - `app/products/page.tsx`
   - `app/products/new/page.tsx`
   - API: `POST /api/products`
   - nav'a active product selector ekle

### Orta vadede kritik (Sprint 2–6)
3. **Launch operating system** redesign
4. **Metrics health layer** refinement
5. **Growth readiness** page
6. **Kanban board** experience
7. **Dashboard 2.0** cohesion

### Uzun vadede değer üreten (Sprint 7+)
8. **Real integrations** (Stripe + analytics provider)
9. **Weekly review** & AI summary layer
10. **Collaboration** layer

---

## Deployment Hazırlığı (henüz yapılmadı)

### Gereken işler
- Hosted DB seç (Neon / Supabase / Railway)
- GitHub repo push (onay gerekir)
- Vercel deploy setup (onay gerekir)
- Production env vars:
  - `DATABASE_URL` (hosted)
  - `NEXTAUTH_URL` (production URL)
  - `NEXTAUTH_SECRET` (yeni generate et)

---

## Ekip İçin Notlar

1. **Docs doğruluğu:** Bu dökümanlar artık gerçek kod durumunu yansıtıyor, ileride yine senkronize kalmak önemli.
2. **Schema vs UX gap:** Multi-product ve growth-readiness model var ama UX yok — önce mevcut loop'ları derinleştir, sonra genişlet.
3. **Öncelik sırası:** Landing page polish değil, core operator loop.
4. **AI katmanı:** Şimdi değil, ama product understanding + passive data collection + recommendation engine için hazırlık şart.

---

## İletişim ve Karar

- Outward-facing GitHub/Vercel/deploy işlemleri için onay gerekir
- Dokümantasyon, kod, local verification serbest
- Risk/trade-off'lar net şekilde dokümante edilmeli

---

## Özet Teslimat Paketi

Bu handoff sonunda elimizde:
- ✅ Product vision & roadmap
- ✅ Operating model
- ✅ Discovery questions & integrations matrix
- ✅ Sprint-ready backlog
- ✅ GSD execution docs
- ✅ Flow inventory
- ✅ Current state summary

**Sonuç:** Ekip artık sadece roadmap değil, aynı zamanda sprintler, sorular, entegrasyonlar ve execution docs ile ilerleyebilir.
