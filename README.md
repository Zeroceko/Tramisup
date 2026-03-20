# Tiramisup MVP

**Launch-to-growth operating workspace for founders**

Tiramisup, founder ve küçük startup ekipleri için launch hazırlığı, growth takibi, hedef yönetimi, metrik takibi ve entegrasyonları tek bir workspace'te toplayan bir operating system.

> **Status:** MVP Phase — Sprint 3 (SEO & Content Skills Integration)

---

## Hızlı Başlangıç

```bash
# Kurulum
npm install

# Dev sunucusu
npm run dev
```

Dev sunucusu: **http://localhost:3001** (port 3000 zaten kullanımda)

---

## Özellikler

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Auth (signup/login/session) | ✅ Working | NextAuth credentials provider + JWT |
| Dashboard | ✅ Working | Launch, metrics, goals, actions summary |
| Pre-launch checklist | ✅ Working | Task-linked launch readiness tracking |
| Metrics tracking | ✅ Working | Manual metric entry, retention, funnel, trends |
| Goals & routines | ✅ Working | Goal progress, weekly routines, timeline |
| Integrations | 🟡 Shell | UI var, real sync yok |
| Settings | ✅ Working | User + product settings |
| Multi-product | 🔴 Schema only | Model hazır, UX yok |
| Growth readiness | 🔴 Schema only | Model hazır, sayfa yok |
| Kanban board | 🔴 Schema only | Task model hazır, board experience yok |

---

## Tech Stack

- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3
- **Database:** PostgreSQL + Prisma 6
- **Auth:** NextAuth 4
- **Charts:** Recharts

---

## Proje Yapısı

```
app/                     # Next.js App Router pages
  ├── page.tsx           # Landing page
  ├── login/             # Login page
  ├── signup/            # Signup page
  ├── dashboard/         # Dashboard (authenticated)
  ├── pre-launch/        # Launch checklist (authenticated)
  ├── metrics/           # Metrics tracking (authenticated)
  ├── growth/            # Goals & routines (authenticated)
  ├── integrations/      # Integrations status (authenticated)
  ├── settings/          # Settings (authenticated)
  └── api/               # API routes
components/              # React components
  ├── AppShell.tsx       # Authenticated layout wrapper
  ├── DashboardNav.tsx   # Navigation
  ├── PageHeader.tsx     # Page headers
  └── StatCard.tsx       # Summary cards
lib/                     # Utilities
  ├── auth.ts            # NextAuth config
  ├── prisma.ts          # Prisma client
  └── seed.ts            # Demo data seed
prisma/
  └── schema.prisma      # Database schema
.gsd/                    # Execution docs
  ├── PROJECT.md         # Product definition
  ├── REQUIREMENTS.md    # Capability contract
  ├── DECISIONS.md       # Architectural decisions
  ├── KNOWLEDGE.md       # Team rules & patterns
  └── STATE.md           # Current status
ROADMAP.md               # Product roadmap
PRODUCT_OPERATING_MODEL.md  # Launch/growth system design
DISCOVERY_QUESTIONS_AND_INTEGRATIONS.md  # Questions & integrations
SPRINT_PLAN.md           # Developer sprint backlog
```

---

## Komutlar

```bash
npm run dev          # Dev sunucusu (port 3001)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma migrate dev  # Migration oluştur
npx prisma db push   # Schema'yı DB'ye push et
```

---

## Environment Variables

### Development (`.env`)
```env
DATABASE_URL="postgresql://tramisu:tramisu_dev_password@localhost:5432/tramisu"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="<gerçek değer var>"
```

### Production (Vercel/host)
```env
DATABASE_URL="<hosted postgres URL>"
NEXTAUTH_URL="<production URL>"
NEXTAUTH_SECRET="<yeni generate edilmiş secret>"
```

---

## Deployment

### Hosted Database
Şu seçeneklerden birini kullan:
- **Neon** (serverless Postgres)
- **Supabase** (Postgres + tooling)
- **Railway** (Postgres + infra)

### Vercel Deploy
```bash
# GitHub'a push et
git push origin main

# Vercel'de yeni proje oluştur
# GitHub repo'yu bağla
# Environment variables ekle
# Deploy
```

### Environment Checklist
- [ ] `DATABASE_URL` (hosted)
- [ ] `NEXTAUTH_URL` (production)
- [ ] `NEXTAUTH_SECRET` (new)

---

## Dokümantasyon

### Strateji & Planlama
- **`ROADMAP.md`** — 11-fazlı product roadmap, AI/MCP architecture
- **`PRODUCT_OPERATING_MODEL.md`** — launch/growth phase sistem tasarımı
- **`EXECUTIVE_OVERVIEW.md`** — sunum formatında özet
- **`DISCOVERY_QUESTIONS_AND_INTEGRATIONS.md`** — kullanıcı soruları, entegrasyon tiers
- **`SPRINT_PLAN.md`** — sprint-ready developer backlog

### Execution & Team
- **`.gsd/PROJECT.md`** — ürün tanımı, milestone sequence
- **`.gsd/REQUIREMENTS.md`** — requirement contract, coverage
- **`.gsd/DECISIONS.md`** — architectural decisions (append-only)
- **`.gsd/KNOWLEDGE.md`** — team rules, patterns, lessons learned
- **`.gsd/STATE.md`** — current focus

### Developer Handoff
- **`HANDOFF.md`** — teknik handoff, architecture, next steps
- **`findings.md`** — flow inventory (working/partial/missing)

---

## Katkıda Bulunma

1. Sprint planına bak (`SPRINT_PLAN.md`)
2. `.gsd/REQUIREMENTS.md` ve `.gsd/KNOWLEDGE.md` oku
3. Yeni feature → roadmap/sprint'e uygunluğu kontrol et
4. Branch oluştur, implement et, test et
5. PR aç

---

## Bilinen Sorunlar

- `.next` cache zaman zaman stale manifest/chunk hatası verir → çözüm: `rm -rf .next` + restart
- `NEXTAUTH_SECRET` değişirse session invalid olur → çözüm: browser cookies temizle
- Multi-product UX henüz yok, model hazır
- Growth readiness sayfası yok, model hazır
- Integrations sync gerçek değil

---

## Lisans

MIT

---

## İletişim

Sorular ve geri bildirimler için proje sahibiyle iletişime geç.
