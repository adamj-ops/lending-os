# Fund Domain

> **Domain Owner**: Capital Markets & Investor Relations Team
> **Status**: Planned (Sprint 4+)

---

## Overview

The **Fund Domain** manages investor capital, fund structures, commitments, and distributions for private lending funds.

---

## Responsibilities

- Fund structure and setup (SPV, LLC, LP structures)
- Investor (lender) management and onboarding
- Capital commitments and calls
- Fund deployment and allocation
- Distribution calculations and payments
- Investor reporting and compliance (PPMs, K-1s)

---

## Data Models

### Planned Tables

- `funds` - Fund entities
- `investors` - Individual investors (lenders)
- `commitments` - Capital commitments by investor
- `capital_calls` - Capital call events
- `distributions` - Distribution payments
- `capital_events` - All capital movements

---

## Events Emitted

- `Fund.Created`
- `Fund.Closed`
- `Commitment.Activated`
- `CapitalCall.Issued`
- `Distribution.Calculated`
- `Distribution.Paid`
- `Investor.Onboarded`

---

## API Endpoints (Planned)

- `POST /api/v1/funds` - Create fund
- `GET /api/v1/funds/:id/investors` - List fund investors
- `POST /api/v1/funds/:id/capital-calls` - Issue capital call
- `POST /api/v1/funds/:id/distributions` - Calculate distributions
- `GET /api/v1/investors/:id/returns` - Get investor returns

---

## UI Components (Planned)

Located in: `src/app/(main)/dashboard/funds/`

- `FundDashboard` - Fund performance overview
- `InvestorList` - Manage investors
- `CommitmentTracker` - Track commitments vs deployment
- `DistributionCalculator` - Calculate and preview distributions
- `InvestorReports` - Generate investor statements

## Investor Portal (Implementation Plan)

**Current State**: Fund schemas exist (`src/db/schema/funds.ts`), planned but not delivered

**Market Validation**: 
- Required for parity with Fundrise, Yieldstreet, RealtyMogul
- Investor self-service = reduced support burden
- Unlocks monetization levers (AUM fees, performance fees)

**Implementation**:
- Deliver investor portal on top of existing fund schemas
- Create investor-facing route: `src/app/(main)/(investor)/dashboard/`
- Features:
  - Capital call notifications and payments
  - Distribution statements
  - Performance dashboards
  - Tax documents (K-1, 1099)
  - Investment history

**Technical Requirements**:
- Investor authentication/authorization
- Integration with fund domain services
- Real-time updates via EventBus
- Statement generation system

**Success Metrics**:
- 80% of investors use self-service portal
- Portal engagement rate >50%
- Reduced support ticket volume

**Sprint Assignment**: Sprint 8 (Analytics & Investor Reporting) - Phase 1 (Weeks 5-6)

**Reference**: [Gaps & Opportunities](../product-strategy/gaps-and-opportunities.md), [90-Day Roadmap](../product-strategy/90-day-roadmap.md)

---

## Business Rules

1. Investors must complete accredited investor verification
2. Capital calls must respect commitment amounts
3. Distributions follow waterfall provisions (preferred return, catch-up, carry)
4. Investor reporting quarterly minimum
5. PPM and subscription docs required before investment

---

## Integration Points

### External Services

- **Banking**: Wire transfers for capital calls and distributions
- **QuickBooks**: Fund accounting synchronization
- **DocuSign**: PPM and subscription agreement execution
- **KYC/AML**: Investor verification (Alloy, Persona)

---

## Future Features

- [ ] Multi-fund support
- [ ] Automated waterfall calculations (see [Monetization Strategy](../architecture/monetization-strategy.md))
- [ ] Management fee accrual (quarterly/annual)
- [ ] Performance fee accrual on distributions
- [ ] Investor portal (self-service)
- [ ] Tax document generation (K-1, 1099)
- [ ] Performance attribution analysis
- [ ] LP vs GP tracking

---

## Related Documentation

- [Loan Domain](./loan-domain.md)
- [Compliance Domain](./compliance-domain.md)
- [Integration Adapters](../architecture/integration-adapters.md)
- [Monetization Strategy](../architecture/monetization-strategy.md) - Fund fee waterfall implementation
- [Gaps & Opportunities](../product-strategy/gaps-and-opportunities.md) - Investor portal priority
- [90-Day Roadmap](../product-strategy/90-day-roadmap.md) - Weeks 5-6 implementation plan

---

**Version**: 0.2 (Planned)
**Last Updated**: January 2025
