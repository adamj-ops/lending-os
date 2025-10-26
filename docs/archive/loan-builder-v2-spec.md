# Lending OS — Loan Builder v2 (Unified Spec)

**Version**: 2.3  
**Status**: Authoritative spec for Sprint 2B → Phase 4–5 (excl. digital contracts)  
**Date**: October 25, 2025

## Stack Notes

- **DB**: Neon Postgres via Drizzle ORM
- **Auth**: Better Auth
- **UI**: shadcn/ui components, React Hook Form + Zod, Zustand for local/wizard state
- **Storage**: AWS S3 (signed URLs)
- **App**: Next.js (App Router), REST under /api/v1/*

---

## 1) Purpose

One adaptive "Loan Builder" that supports:

- **Asset-Backed Loans** (borrower + property collateral)
- **Yield Notes / Capital Placements** (investor return agreements; no property required)
- **Hybrid Loans** (capital pool now, collateral later)

Builder data drives servicing, payments, analytics, and AI forecasting.

---

## 2) Loan Types & Adaptive Flow

At Step 0 the user picks a Loan Category:

`loan_category ∈ ['asset_backed', 'yield_note', 'hybrid']`

This selection determines subsequent steps/validation.

---

## 3) Wizard Steps (Adaptive)

Implement as a 6-segment stepper; hide/skip steps by loan_category.

### Step 0 — Select Loan Type
- Field: `loan_category` (asset_backed | yield_note | hybrid)
- Preview upcoming steps

### Step 1 — Party Information (Shared, conditionally rendered)

**Asset-Backed / Hybrid (borrower)**:
- Borrower Type (individual | entity)
- Borrower Name / Entity Name
- Email, Phone, Address, EIN/SSN (masked/encrypted)
- Link to existing borrower (search)

**Yield Note / Hybrid (investor)**:
- Lender/Investor (select or create)
- Entity Type (Individual/Fund/IRA)
- Contact and Source info

### Step 2 — Asset or Capital Details

**Asset-Backed**:
- Property Address (autocomplete)
- Property Type, Est/Appraised Value, Purchase Price
- Rehab Budget (optional), Occupancy
- Property Photos (S3)

**Yield Note**:
- Investment Type (fixed_yield | revenue_share | profit_participation | custom)
- Committed Amount, Return Rate, Compounding (simple|compound)
- Term (months), Start/Maturity dates
- Payment Frequency (monthly|quarterly|maturity)

**Hybrid**:
- Capital Pool ID (optional)
- Collateral Assignment: "TBD"
- Target Yield Range

### Step 3 — Loan Terms & Economics (applies to all)
- Principal Amount, Interest Rate, Term (months)
- Payment Type (interest_only | amortized)
- Payment Frequency
- Origination Fee, Late Fee policy, Default Interest
- Escrow Setup (optional)
- Funding Source (bank/escrow/internal)
- Participation Split (for multiple investors)

### Step 4 — Documents & Compliance

**Asset-Backed**: Loan Agreement, Appraisal, Title Policy, Insurance Binder, Closing Statement
**Yield Note**: Subscription Agreement, Promissory Note, Wire Conf., Proof of Funds, W-9
**Hybrid**: Any of the above + Collateral Addendum later

Uploads → AWS S3 via signed URL. Persist in loan_documents.

### Step 5 — Collateral & Funding Structure
- Lien Position, Collateral Description (asset-backed/hybrid)
- Draw Schedule table (optional)
- Funding Account, Participation Splits, Escrow Balance

### Step 6 — AI Forecast & Risk (Phase 4)
- Projected ROI (rate×term×fees)
- Default Probability (borrower + LTV + type)
- Yield Efficiency Score (0–100)
- Recommended Funding Source (match investor notes ↔ loans)

### Review & Submit
- Summaries per section
- Actions: Save Draft, Submit for Approval, (Phase 5) Auto-Allocate Capital

---

## 4) Data Model (Drizzle — Neon Postgres)

See database schema files for full implementation.

---

## 5) Success Metrics

- Loan creation (end-to-end) < 6 minutes avg
- Draft resume > 95% data retention
- 0 P0 validation escapes (server) in first month
- Creation → portfolio visible in < 5s (optimistic UI OK)

---

## 6) Roadmap Hooks

- **Phase 4**: Risk & Forecast panel, status audit trail, state machine
- **Phase 5**: Investor match engine, capital allocation APIs, portfolio optimizations
- **(Deferred)** Digital contract generation & e-sign

---

**End of Spec** ✅

