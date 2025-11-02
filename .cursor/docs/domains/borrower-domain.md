# Borrower Domain

> **Domain Owner**: CRM & Relationship Management Team
> **Status**: Active (Sprint 2 Complete)

---

## Overview

The **Borrower Domain** manages all borrower-related data, relationships, verification, and communication throughout the lending lifecycle.

---

## Responsibilities

- Borrower profile management (individuals and entities)
- **KYC/AML verification and compliance** - *Automated via vendor integration (planned)*
- Credit profile tracking
- Borrower-lender relationship management
- Communication history and preferences
- Guarantor and co-borrower management

### KYC/AML Automation (Implementation Plan)

**Current State**: Manual KYC process = 3-5 day delay, investor churn

**Market Validation**: 
- Required for parity with Fundrise/RealtyMogul
- 68% of lenders cite communication delays as #1 friction (LendingOne 2025)

**Implementation**:
- Wire real KYC/AML providers into borrower onboarding flows
- Recommended vendors:
  - **Persona**: Webhooks + ID verification ($0.50-$2/check) - Recommended
  - **Onfido**: AI + liveness ($1.20/check)
  - **Sumsub**: Crypto-friendly, lower cost ($0.80/check)

**Technical Requirements**:
- Create `KYCService` integration layer (`src/services/kyc.service.ts`)
- Add `kycStatus` enum to `users` table
- Wire webhook to `EventBus.ts` → auto-approve loan listing
- Update borrower onboarding flow

**Success Metrics**:
- KYC approval time: <24 hours (vs. 3-5 days baseline)
- 95% automated approval rate
- Zero manual KYC reviews required

**Sprint Assignment**: Sprint 6 (Compliance Domain) - Phase 2 (Weeks 3-4)

**Reference**: [Gaps & Opportunities](../product-strategy/gaps-and-opportunities.md), [90-Day Roadmap](../product-strategy/90-day-roadmap.md)

---

## Data Models

### Core Tables

- `borrowers` - Primary borrower records
- `borrower_relationships` - Hybrid borrower-lender relationships
- `kyc_records` - Verification documents and status
- `credit_profiles` - Credit scores and history

---

## Events Emitted

- `Borrower.Created`
- `Borrower.KYCApproved`
- `Borrower.KYCFailed`
- `Borrower.Flagged`
- `Borrower.CreditUpdated`
- `Borrower.RelationshipCreated`

---

## API Endpoints

- `POST /api/v1/borrowers` - Create borrower
- `GET /api/v1/borrowers` - List borrowers
- `GET /api/v1/borrowers/:id` - Get borrower details
- `PATCH /api/v1/borrowers/:id` - Update borrower
- `GET /api/v1/borrowers/:id/loans` - Get borrower's loans

---

## UI Components

Located in: `src/app/(main)/dashboard/borrowers/`

- `BorrowerTable` - List all borrowers
- `BorrowerDetailDrawer` - Borrower profile
- `BorrowerForm` - Create/edit borrower
- `KYCStatusBadge` - Verification status
- `BorrowerLoans` - Loan history tab

---

## Service Layer

Located in: `src/services/borrower.service.ts`

Key methods:
- `createBorrower()`
- `updateBorrower()`
- `getBorrowerLoans()`
- `verifyKYC()`

---

## Related Documentation

- [Loan Domain](./loan-domain.md)
- [Compliance Domain](./compliance-domain.md)
- [Gaps & Opportunities](../product-strategy/gaps-and-opportunities.md) - KYC automation priority
- [90-Day Roadmap](../product-strategy/90-day-roadmap.md) - Weeks 3-4 implementation plan

---

**Version**: 1.1
**Last Updated**: January 2025
