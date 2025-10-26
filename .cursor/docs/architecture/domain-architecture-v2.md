# LendingOS – Domain Colocation & Event-Driven Architecture (v2.0)

## Overview

**LendingOS** is the core operating system powering **Everyday Lending** — a modern hard money and private lending platform that unifies investor management, borrower workflows, loan servicing, and compliance automation.

This architecture leverages **Next.js Colocation Patterns** and **Domain-Driven Design (DDD)** principles to create a modular, event-driven system where UI, logic, and data for each lending domain are colocated.

Built on the [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template.git), the platform is designed for **scalability**, **maintainability**, and **automation-first operations**.

---

## Architectural Evolution

LendingOS is evolving from a **route-centric monolith** to a **domain-colocated, event-driven platform**.

| Phase | Focus | Description |
|-------|-------|-------------|
| **1. Route Colocation (v1)** | Organized by workflows (applications, approvals, payments) | Isolated UI and frontend logic by feature |
| **2. Domain Colocation (v2)** | Organized by lending domains (Funds, Loans, Borrowers, Compliance) | UI, API, data, and business logic live together per domain |
| **3. Event-Driven Platform (v3)** | System emits and reacts to events (Loan.Funded, Payment.Received, Filing.Due) | Enables real-time automation, analytics, and compliance workflows |

This shift ensures **each feature can operate independently** while remaining connected through a shared **event layer** and consistent **data contracts**.

---

## Core Architecture Benefits

- **Domain Isolation**: Each domain (Fund, Loan, Borrower, Payment, Compliance) owns its logic, database access, and UI
- **Scalability**: New lending products or features can be added without impacting others
- **Automation**: An event bus powers notifications, analytics updates, filings, and document generation
- **Maintainability**: Related components, schemas, and actions live together
- **Team Parallelism**: Developers can work independently in different domains without merge conflicts

---

## File Structure Strategy

### High-Level Directory Map

```
src/
└── app/
    ├── (main)/
    │   ├── dashboard/
    │   ├── loans/
    │   │   ├── applications/
    │   │   │   ├── page.tsx
    │   │   │   ├── actions.ts        # server actions for this domain
    │   │   │   ├── schema.ts         # zod validation
    │   │   │   ├── db.ts             # data logic (Supabase/Prisma)
    │   │   │   └── _components/      # UI components
    │   │   ├── approvals/
    │   │   ├── active/
    │   │   ├── api/
    │   │   │   └── route.ts          # optional domain API endpoints
    │   ├── borrowers/
    │   │   ├── profile/
    │   │   ├── compliance/
    │   │   ├── schema.ts
    │   │   └── db.ts
    │   ├── funds/
    │   │   ├── investors/
    │   │   ├── capital/
    │   │   ├── compliance/
    │   │   └── reports/
    │   ├── payments/
    │   └── reports/
    ├── integrations/
    │   ├── banking/
    │   ├── docsign/
    │   ├── kyc/
    │   └── title/
    ├── lib/
    │   ├── db/
    │   ├── eventBus.ts               # event-driven automation
    │   ├── analytics.ts
    │   └── auth.ts
    ├── hooks/
    └── components/
```

Each domain folder (e.g., `loans/applications`) is a **vertical slice** of the system — containing everything needed for that workflow: pages, schemas, server actions, and database logic.

---

## Domain Model Overview

LendingOS is organized around **five core business domains**:

| Domain | Responsibilities | Key Artifacts | Emits Events |
|--------|-----------------|---------------|--------------|
| **Fund** | Manage capital, investors, commitments, distributions | Fund, Investor, Commitment, Capital Event | Fund.Created, Commitment.Activated |
| **Borrower** | Manage borrower identity, verification, and relationship data | Borrower, Application, KYC Record | Borrower.KYCApproved, Borrower.Flagged |
| **Loan** | Origination, underwriting, servicing, collateral, and docs | Loan, Term Sheet, Payment, Draw, Lien | Loan.Created, Loan.Funded, Loan.PaidOff |
| **Payments** | Handle collections, accruals, and reconciliations | Payment, Accrual, Transaction | Payment.Received, Payment.Late, Loan.Matured |
| **Compliance** | Licensing, document management, and regulatory filings | PPM, Subscription, Filing, Note | Filing.Due, Doc.Signed, Doc.Expired |

Each domain has its own **database schema**, **business logic**, and **React components**.

---

## Event-Driven Architecture

LendingOS includes a lightweight **event bus** (`/lib/eventBus.ts`) powered by Supabase functions or PostgreSQL message queues.

This event system connects domains **asynchronously** — allowing automations, dashboards, and compliance tasks to stay in sync.

### Example Event Flow

```
Loan.Funded → triggers →
    Payment.ScheduleCreated
    Compliance.DocGenerated
    Fund.CapitalAllocated
```

### Example Events

- `Application.Submitted`
- `Underwriting.DecisionMade`
- `Loan.Funded`
- `Draw.Requested`
- `Payment.Received`
- `Filing.Due`
- `Investor.DistributionPosted`

Events are **stored for auditability** and can trigger downstream automations (email, SMS, webhooks, analytics updates).

---

## Shared Component & Data Strategy

### 1. Global Components (`src/components/`)

- **UI Primitives**: Buttons, inputs, tables, charts, modals
- **Layouts**: Sidebars, headers, navigation
- **Business Elements**: Loan badges, payment indicators, borrower cards

### 2. Domain Components (`_components/`)

- Encapsulated within domain folders
- Access domain-specific schemas, hooks, and actions
- Example: `loans/applications/_components/ApplicationForm.tsx`

### 3. Data Colocation

- Each domain folder contains its own `db.ts` file for data logic
- Shared query builders or cross-domain relationships live under `lib/db/`

---

## Data Flow and State Management

### Colocated State

- **Route-level**: Form state, pagination, filters
- **Component-level**: UI interaction and modals
- **Server state**: React Query/SWR fetching per route

### Global State (Zustand)

- User session and permissions
- Theme and layout preferences
- Global notifications and navigation context

**Evolution**: We are moving toward **domain-local state patterns** where each domain handles its own caching, queries, and event subscriptions.

---

## Implementation Phases

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **Phase 1: Foundation** | Set up route groups, navigation, and authentication | Layout, routing, shared components |
| **Phase 2: Domain Workflows** | Build core lending flows | Loan applications, borrower management, basic reports |
| **Phase 3: Event Layer** | Implement event bus & automation | Loan events, payment reconciliation, document triggers |
| **Phase 4: Compliance & Intelligence** | Integrate filings, analytics, and investor dashboards | Compliance reports, investor summaries, exposure metrics |

---

## Integration Architecture

Each integration is abstracted via **adapters**, colocated in `/integrations/`:

| Integration | Purpose | Example Event Trigger |
|------------|---------|----------------------|
| **Banking** (Mercury, Relay) | ACH/wire deposits, payment reconciliation | Payment.Received |
| **DocuSign/Dropbox Sign** | Loan docs, promissory notes, investor agreements | Doc.Signed |
| **KYC/AML** (Alloy, Persona) | Borrower & investor verification | Borrower.KYCApproved |
| **Title/Recording APIs** | Record liens and discharges | Loan.Funded |
| **QuickBooks** | Fund-level accounting sync | CapitalEvent.Posted |

Adapters **publish or subscribe** to the LendingOS event bus.

---

## Testing & Validation

- **Unit Tests**: Each domain has colocated test files
- **Integration Tests**: Validate workflows between domains (Loan → Payment → Compliance)
- **Mock Data**: Stored per domain for isolated testing
- **E2E Tests**: Simulate borrower-to-loan-to-investor flows

---

## Analytics & Reporting

Each event feeds into an **analytics pipeline** that aggregates:

- **Fund performance** (capital deployed, returns)
- **Loan portfolio metrics** (avg LTV, delinquencies)
- **Borrower performance** (repayments, risk score)
- **Compliance tasks** (filings due, license status)
- **Investor reporting** (distributions, returns)

These metrics power the `/reports/` domain and investor dashboards.

---

## Summary: Why This Evolution Matters

### Before (v1):
LendingOS was a modular app with clean UI isolation and workflow separation.

### Now (v2):
It's becoming a **living system** — domain-based, data-aware, and event-driven.

- Each domain owns its lifecycle and data
- Events connect the entire ecosystem
- Compliance, automation, and investor reporting happen in real time

**LendingOS is evolving from a set of lending tools into a vertically integrated lending platform.**

---

## Related Documentation

- [Event-Driven System](./event-driven-system.md)
- [Migration Guide v1 → v2](../architecture/migration-v1-to-v2.md)
- [Domain Documentation](../domains/)
- [Integration Adapters](./integration-adapters.md)
- [Technical Stack](../technical/tech-stack-summary.md)

---

**Version**: 2.0
**Last Updated**: October 26, 2025
**Status**: Active Development
