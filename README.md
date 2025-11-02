# LendingOS – Modern Hard Money & Private Lending Platform

**LendingOS** is the core operating system powering **Everyday Lending** — a domain-driven, event-aware platform for hard money and private lending operations.

Built with Next.js 16, TypeScript, and a modern tech stack, LendingOS provides a complete solution for loan origination, servicing, investor management, and compliance automation.

---

## 🏗️ Architecture

LendingOS uses a **domain-driven colocation architecture**, organizing code around five core business domains:

- **Loan Domain**: Loan origination, underwriting, servicing, and collateral management
- **Payment Domain**: Payment processing, schedules, balance calculations, and reconciliation
- **Borrower Domain**: Customer relationships, KYC/AML verification, and communication
- **Fund Domain** *(planned)*: Investor management, capital deployment, and distributions
- **Compliance Domain** *(planned)*: Regulatory filings, document automation, and audit trails

### Domain Colocation Pattern

Each domain contains its own:
- **UI Components** (`page.tsx`, `_components/`)
- **Business Logic** (`actions.ts`, `db.ts`)
- **Validation** (`schema.ts`)
- **API Endpoints** (`route.ts`)

This vertical integration enables:
- Independent domain development and deployment
- Clear boundaries and reduced coupling
- Easier testing and maintainability
- Event-driven automation across domains

📖 **Read More**: [Domain Architecture v2.0](.cursor/docs/architecture/domain-architecture-v2.md)

---

## ✨ Features

### Current (Sprint 1-3 Complete)

- ✅ **Loan Management**: Full loan lifecycle from application to payoff
- ✅ **Borrower & Lender Management**: Hybrid relationship model
- ✅ **Payment Processing**: Payment tracking, schedules, and balance calculations
- ✅ **Draw Management**: Construction draw requests, approvals, and inspections
- ✅ **Document Management**: S3-based storage with presigned URL uploads
- ✅ **Authentication & Authorization**: Iron-session based auth system
- ✅ **Responsive UI**: Modern, accessible interface with Shadcn UI

### Planned (Sprint 4+)

- 🔄 **Event-Driven System**: Real-time automation and cross-domain workflows
- 🔄 **Fund Management**: Investor portals, capital calls, distributions
- 🔄 **Compliance Automation**: Document generation, regulatory filings, audit logs
- 🔄 **Mobile Inspector App**: PWA for offline construction inspections
- 🔄 **Advanced Analytics**: Portfolio metrics, risk dashboards, investor reporting

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Neon Postgres + Drizzle ORM
- **UI**: Shadcn UI + Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand + TanStack Query
- **Storage**: AWS S3 (documents, photos)
- **Auth**: Iron-session (custom implementation)
- **Tooling**: ESLint, Prettier, Husky

📖 **Read More**: [Tech Stack Summary](.cursor/docs/technical/tech-stack-summary.md)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/dashboard/      # Main application routes
│   │   ├── loans/             # Loan domain
│   │   ├── borrowers/         # Borrower domain
│   │   ├── lenders/           # Lender domain (Fund domain precursor)
│   │   └── properties/        # Property management
│   └── api/v1/                # REST API endpoints
├── components/                # Shared UI components
├── lib/                       # Utilities and helpers
├── services/                  # Business logic services
├── types/                     # TypeScript type definitions
└── hooks/                     # Reusable React hooks
```

📖 **Read More**: [File Structure Strategy](.cursor/docs/architecture/domain-architecture-v2.md#file-structure-strategy)

---

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ (recommend 20 LTS)
- npm or pnpm
- Neon Postgres database
- AWS S3 bucket (for document storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lending-os.git
   cd lending-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

Your app will be running at [http://localhost:3000](http://localhost:3000)

📖 **Read More**: [Environment Setup](.cursor/docs/technical/environment-setup.md)

---

## 📚 Documentation

### Architecture

- [Domain Architecture v2.0](.cursor/docs/architecture/domain-architecture-v2.md)
- [Event-Driven System](.cursor/docs/architecture/event-driven-system.md)
- [Migration Guide v1 → v2](.cursor/docs/architecture/migration-v1-to-v2.md)
- [Integration Adapters](.cursor/docs/architecture/integration-adapters.md)
- [Monetization Strategy](.cursor/docs/architecture/monetization-strategy.md)

### Domain Documentation

- [Loan Domain](.cursor/docs/domains/loan-domain.md)
- [Payment Domain](.cursor/docs/domains/payment-domain.md)
- [Borrower Domain](.cursor/docs/domains/borrower-domain.md)
- [Fund Domain](.cursor/docs/domains/fund-domain.md) *(planned)*
- [Compliance Domain](.cursor/docs/domains/compliance-domain.md) *(planned)*

### Technical Docs

- [Database Schema](.cursor/docs/technical/database-schema.md)
- [API Endpoints](.cursor/docs/technical/api-endpoints.md)
- [API Versioning](.cursor/docs/technical/api-versioning.md)
- [AWS S3 Setup](.cursor/docs/technical/aws-s3-setup.md)

### Product Strategy

- [Product Strategy Overview](.cursor/docs/product-strategy/) - Market research, competitive analysis, 90-day roadmap
- [Gaps & Opportunities](.cursor/docs/product-strategy/gaps-and-opportunities.md) - Critical gaps and priorities
- [90-Day Roadmap](.cursor/docs/product-strategy/90-day-roadmap.md) - Tactical implementation plan
- [Competitive Analysis](.cursor/docs/product-strategy/competitive-analysis.md) - Competitor teardowns
- [Market Intelligence](.cursor/docs/product-strategy/market-intelligence.md) - 2025 market research
- [Product Backlog](.cursor/docs/product-strategy/product-backlog.md) - Prioritized feature backlog
- [Pitch Materials](.cursor/docs/product-strategy/pitch-materials.md) - Pitch deck asset mapping

### Development Rules

- [Tech Stack Lock](.cursor/rules/tech-stack-lock.md) ⭐ **Read First**
- [Domain Rules](.cursor/rules/domain-rules.md)
- [Shadcn Usage](.cursor/rules/shadcn-usage.md)
- [Agent Rules](.cursor/rules/agent-rules.md)

---

## 🧭 Investor Portal Implementation Notes

- **Investor dashboard shell**: Create `/dashboard/investor` by adapting the analytics overview layout (`src/app/(main)/(ops)/analytics/page.tsx`) and sourcing lender-specific KPIs from `AnalyticsService` and fund snapshots.
- **Yield Forecaster (Sprint 8 Week 1)**: Extend fund snapshot computation (`src/services/analytics.service.ts`) with projection fields and back a slider-driven capital deployment simulator that writes through the existing `capital_events` schema.
- **Risk Radar (Sprint 8 Week 2)**: Consume inspection and draw events via the event bus (`src/lib/events/EventBus.ts`) to maintain a geo-tagged read model rendered as an interactive map with deep links to loan detail drawers.
- **Capital Call Autopilot (Sprint 8.5)**: Persist investor deployment rules, subscribe to AI deal-score events, and auto-trigger capital calls when criteria are met while logging actions through `capital_events`.
- **Compliance dependencies (Sprint 6)**: Surface DocuSign status and auto-KYC requirements inline so capital call approvals and statement access remain compliant once the integrations land.
- **Monetization readiness**: Instrument feature flags and telemetry now so Autopilot tiers, tax reporting, and deployment fees can be gated when Stripe billing (Sprint 9) is enabled.

---

## 🎯 Development Workflow

### Adding a New Feature

1. Determine which domain it belongs to
2. Create colocated files (`page.tsx`, `actions.ts`, `schema.ts`)
3. Add UI components to `_components/`
4. Update service layer if needed
5. Publish events for cross-domain communication
6. Write tests
7. Update documentation

📖 **Read More**: [Domain Rules](.cursor/rules/domain-rules.md)

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Database Management

```bash
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Drizzle Studio (GUI)
```

---

## 🚢 Deployment

LendingOS is optimized for deployment on Vercel with Neon Postgres.

### Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Flending-os)

### Manual Deployment

1. Build the project
   ```bash
   npm run build
   ```

2. Set environment variables in your hosting platform

3. Deploy the `.next` folder

📖 **Read More**: [Vercel Deployment Guide](./docs/vercel-deployment-guide.md)

---

## 📊 Project Status

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Core loan management, authentication | ✅ Complete |
| Sprint 2A | Borrower & lender management | ✅ Complete |
| Sprint 2B | Loan wizard v2, relationships | ✅ Complete |
| Sprint 3 | Payments & draws infrastructure | ✅ Complete |
| Sprint 4 | Event system, Fund domain | 🔄 Planning |
| Sprint 5 | Compliance automation | 📅 Planned |

📖 **Read More**: [Sprint Summaries](.cursor/docs/sprints/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Read the [Tech Stack Lock](.cursor/rules/tech-stack-lock.md) before adding dependencies
2. Follow [Domain Rules](.cursor/rules/domain-rules.md) for code organization
3. Write tests for new features
4. Update documentation
5. Open a PR with clear description

---

## 📝 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- Built on [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Design inspiration from various modern dashboards

---

## 📞 Support

For questions or issues:
- Check the [documentation](.cursor/docs/)
- Review [existing issues](https://github.com/yourusername/lending-os/issues)
- Open a new issue with details

---

**LendingOS** – Powering modern private lending operations.
