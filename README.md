# Tramisu 🎯

A single-panel command center for startup/app owners to manage the full growth journey from pre-launch to scale.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

---

## ✨ Features

### 📋 Pre-Launch Management
- **Launch Readiness Checklist** - Track preparation across Product, Marketing, Legal, and Tech
- **Action Items** - Manage to-do items with priorities and due dates
- **Readiness Score** - Visual progress tracking with completion percentage

### 📊 Metrics Dashboard
- **Real-time KPIs** - DAU, MAU, MRR, Activation Rate
- **Growth Trends** - Interactive charts powered by Recharts
- **Retention Cohorts** - Cohort analysis with color-coded heatmap
- **Activation Funnel** - Visualize user journey from signup to activation
- **Manual Entry** - Quick metric input form (integration-ready architecture)

### 🚀 Growth Management
- **Goals & OKRs** - Set targets with progress tracking
- **Growth Routines** - Weekly/monthly playbooks
- **Timeline Feed** - Activity log and milestone tracking

### 🔌 Integrations (Extensible Foundation)
- **Connector Architecture** - Ready for Stripe, GA4, Mixpanel, Segment, Amplitude, PostHog
- **Connection Management** - Test connections, view sync status
- **Encrypted Config Storage** - Secure token/API key storage (stub in v1)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js (Credentials provider)
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Deployment:** Docker + Vercel ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Tramisu
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://tramisu:tramisu_dev_password@localhost:5432/tramisu"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Start Database

```bash
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432`.

### 4. Run Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📦 Seed Demo Data

Once you've created an account:

**Option 1: Via API** (recommended)
```bash
# After logging in, visit:
http://localhost:3000/api/seed

# Or use curl:
curl -X POST http://localhost:3000/api/seed \
  -H "Cookie: your-session-cookie"
```

**Option 2: Via UI** (future feature)
Settings → Data Management → "Load Demo Data"

This will populate:
- ✅ 15 checklist items (randomly completed)
- ✅ 4 action items with due dates
- ✅ 30 days of metrics (DAU, MAU, MRR)
- ✅ 6 retention cohorts
- ✅ Activation funnel data
- ✅ 2 goals with progress
- ✅ 3 growth routines
- ✅ Timeline events

---

## 🐳 Docker Deployment

### Build & Run

```bash
# Build image
docker build -t tramisu .

# Run with docker-compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Production Environment Variables

```env
DATABASE_URL="postgresql://user:password@db:5432/tramisu"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

---

## ☁️ Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL` (from your hosted PostgreSQL provider)
   - `NEXTAUTH_SECRET` (generate a secure random string)
   - `NEXTAUTH_URL` (your Vercel domain)

### 3. Deploy

Vercel will automatically:
- Install dependencies
- Run `prisma generate`
- Build Next.js app
- Deploy to production

### Database Options for Production

- **Vercel Postgres** (recommended for Vercel deployments)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Railway** (simple PostgreSQL hosting)
- **Neon** (serverless PostgreSQL)

After setting up hosted DB, run migrations:
```bash
DATABASE_URL="your-prod-db-url" npx prisma migrate deploy
```

---

## 📁 Project Structure

```
Tramisu/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Auth pages
│   │   └── signup/
│   ├── dashboard/                # Main dashboard
│   ├── pre-launch/               # Checklist & actions
│   ├── metrics/                  # Metrics & charts
│   ├── growth/                   # Goals & routines
│   ├── integrations/             # Integration hub
│   ├── settings/                 # User settings
│   └── api/
│       ├── auth/                 # NextAuth routes
│       ├── checklist/            # Checklist CRUD
│       ├── actions/              # Actions CRUD
│       ├── metrics/              # Metrics API
│       ├── goals/                # Goals API
│       ├── routines/             # Routines API
│       ├── integrations/         # Integration management
│       ├── settings/             # Settings update
│       └── seed/                 # Demo data seeder
├── components/
│   ├── DashboardNav.tsx          # Top navigation
│   ├── ChecklistSection.tsx     # Pre-launch checklist
│   ├── ActionsSection.tsx       # Action items
│   ├── MetricsOverview.tsx      # Charts component
│   ├── MetricEntryForm.tsx      # Manual entry form
│   ├── RetentionCohortTable.tsx # Cohort heatmap
│   ├── ActivationFunnelChart.tsx # Funnel visualization
│   ├── GrowthRoutines.tsx       # Routines list
│   ├── GoalsSection.tsx         # Goals with progress
│   ├── TimelineFeed.tsx         # Activity timeline
│   ├── IntegrationCard.tsx      # Integration cards
│   └── SettingsForm.tsx         # Settings form
├── lib/
│   ├── prisma.ts                # Prisma client
│   └── auth.ts                  # NextAuth config
├── prisma/
│   └── schema.prisma            # Database schema
├── types/
│   └── next-auth.d.ts           # TypeScript definitions
├── docker-compose.yml           # Local PostgreSQL
├── Dockerfile                   # Production build
├── .env.example                 # Environment template
└── README.md                    # This file
```

---

## 🗄️ Database Schema

### Core Tables
- `User` - User accounts (NextAuth)
- `Project` - User projects (1:1 in v1, can be 1:N later)
- `PreLaunchChecklist` - Grouped checklist items
- `PreLaunchAction` - Action items with priorities
- `Metric` - Daily metrics (DAU, MAU, MRR, etc.)
- `RetentionCohort` - Cohort retention data
- `ActivationFunnel` - Funnel step data
- `Goal` - Growth goals with progress
- `GrowthRoutine` - Weekly/monthly routines
- `TimelineEvent` - Activity feed
- `Integration` - Connected services
- `SyncJob` - Sync job history

See `prisma/schema.prisma` for full schema.

---

## 🔐 Security Notes

### Current Implementation (v1 - Development)
- ✅ Password hashing (bcrypt)
- ✅ Session management (JWT)
- ✅ SQL injection protection (Prisma)
- ⚠️ Integration tokens stored as plain JSON (stub for v1)

### Production Recommendations
- [ ] Implement token encryption at rest (use `crypto` module or AWS KMS)
- [ ] Add CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod
- [ ] Security headers (Helmet.js)
- [ ] Database backups
- [ ] Audit logging

---

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# (Future) Unit tests
npm test

# (Future) E2E tests
npm run test:e2e
```

---

## 🛣️ Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Authentication (NextAuth)
- [x] Pre-launch checklist
- [x] Metrics dashboard with charts
- [x] Goals & routines
- [x] Integration architecture
- [x] Manual data entry
- [x] Docker deployment
- [x] Vercel deployment guide

### Phase 2: Real Integrations
- [ ] Stripe integration (revenue, subscriptions)
- [ ] Google Analytics 4 (traffic, behavior)
- [ ] Mixpanel/Amplitude (events)
- [ ] Scheduled sync jobs (cron or queue)

### Phase 3: Advanced Features
- [ ] Team collaboration (multi-user workspaces)
- [ ] Custom dashboards
- [ ] Export reports (PDF)
- [ ] Slack/Discord notifications
- [ ] API webhooks

### Phase 4: AI & Automation
- [ ] AI insights & recommendations
- [ ] Anomaly detection
- [ ] Automated reports
- [ ] Predictive analytics

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Support

- 📧 Email: support@tramisu.app
- 🐦 Twitter: [@tramisu](https://twitter.com/tramisu)
- 💬 Discord: [Join our community](https://discord.gg/tramisu)

---

## 🙏 Acknowledgments

- Next.js team for the incredible framework
- Prisma team for the best ORM experience
- Recharts for beautiful, responsive charts
- The open-source community

---

**Built with ❤️ for startup founders**
