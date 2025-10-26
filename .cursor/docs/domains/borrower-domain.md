# Borrower Domain

> **Domain Owner**: CRM & Relationship Management Team
> **Status**: Active (Sprint 2 Complete)

---

## Overview

The **Borrower Domain** manages all borrower-related data, relationships, verification, and communication throughout the lending lifecycle.

---

## Responsibilities

- Borrower profile management (individuals and entities)
- KYC/AML verification and compliance
- Credit profile tracking
- Borrower-lender relationship management
- Communication history and preferences
- Guarantor and co-borrower management

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

---

**Version**: 1.0
**Last Updated**: October 26, 2025
