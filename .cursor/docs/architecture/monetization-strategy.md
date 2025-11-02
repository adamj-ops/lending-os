# Monetization Strategy & Revenue Model

> **Status**: Planning  
> **Sprint**: Sprint 6+ (Future)  
> **Last Updated**: January 2025

---

## Overview

LendingOS is designed as a **platform business** that generates revenue through multiple streams aligned with real estate investment platform best practices. This document outlines the current state, gaps, and implementation roadmap for monetization features.

---

## Current State Analysis

### ✅ What We Have

#### 1. Operational Fee Infrastructure
- **Loan Fees**: Schema supports `originationFeeBps`, `lateFeeBps`, `defaultInterestBps` (in basis points)
- **Fund Fees**: Schema supports `managementFeeBps`, `performanceFeeBps` (in basis points)
- **Payment Tracking**: `feeAmount` field in payments table, supports fee payment types
- **Fee Calculation**: Payment service can track fee amounts separately

**Gap**: Fees are configured but **not automatically calculated or collected**. No platform revenue tracking.

#### 2. Multi-Tenant Foundation
- Organizations table with `logoUrl` for branding
- Theme system supports customization
- Multi-organization access model (users can belong to multiple orgs)

**Gap**: No white-label licensing enforcement or plan tiers.

#### 3. Fund Distribution Framework
- Fund distributions table and service
- Pro-rata share calculations (`calculateProRataShare()`)
- Distribution events (`DistributionMade`)

**Gap**: No waterfall/carry calculations, no performance fee accrual logic.

---

## Revenue Streams (7 Models)

### 1. Transaction Fees ⚠️ **NOT IMPLEMENTED**

**Current State**: Loan fees exist but no platform transaction fee collection.

**What's Missing**:
- Payment processor integration (Stripe/Adyen)
- Platform fee policies (percentage or flat fee per transaction)
- Checkout flow for investor transactions
- Revenue ledger for tracking platform earnings
- Webhook handlers for payment processing

**Implementation Requirements**:
```typescript
// New schema needed
platform_fees {
  id, organizationId, feeType: 'transaction' | 'listing' | 'subscription',
  feeStructure: 'percentage' | 'flat',
  amount: number, // percentage or flat amount
  appliesTo: 'investment' | 'loan_origination' | 'service',
  minAmount?: number, maxAmount?: number
}

revenue_ledger {
  id, organizationId, feeType, amount, transactionId,
  source: 'transaction' | 'subscription' | 'listing' | 'performance',
  status: 'pending' | 'collected' | 'refunded',
  collectedAt, invoiceId
}
```

**Integration Points**:
- Stripe Checkout for investment transactions
- Event handlers: `Payment.Processed` → Calculate platform fee
- Fund distribution → Apply transaction fee before pro-rata split

---

### 2. Listing Fees for Developers ⚠️ **NOT IMPLEMENTED**

**Current State**: Properties can be created via API, no listing approval or pricing.

**What's Missing**:
- Developer/partner onboarding flow
- Listing approval workflow
- Listing pricing tiers (free, featured, premium)
- Listing credits/payment system
- Moderation and promotion inventory

**Implementation Requirements**:
```typescript
// New schema needed
developer_accounts {
  id, organizationId, name, email, status: 'pending' | 'active' | 'suspended',
  listingCredits: number, subscriptionPlan: 'free' | 'basic' | 'premium'
}

listings {
  id, developerId, propertyId, status: 'draft' | 'pending' | 'approved' | 'rejected',
  listingTier: 'standard' | 'featured' | 'premium',
  listingFee: number, paidAt, expiresAt
}

listing_plans {
  id, name, price, listingCredits, featuredCount, validityDays
}
```

**Integration Points**:
- Gate `POST /api/v1/properties` behind listing credits
- Approval workflow with email notifications
- Stripe integration for listing purchases

---

### 3. Subscription Plans for Investors ⚠️ **NOT IMPLEMENTED**

**Current State**: "Billing" menu item exists but is UI-only. No subscription system.

**What's Missing**:
- Subscription plans (Basic, Premium, Pro)
- Stripe Billing integration
- Feature gating based on plan
- Usage metering
- Plan upgrade/downgrade flows

**Implementation Requirements**:
```typescript
// New schema needed
plans {
  id, name: 'basic' | 'premium' | 'pro',
  price: number, billingCycle: 'monthly' | 'annual',
  features: jsonb, // feature flags
  limits: jsonb // { maxLoans, maxInvestors, maxDeals }
}

subscriptions {
  id, organizationId, planId, stripeSubscriptionId,
  status: 'active' | 'canceled' | 'past_due',
  currentPeriodStart, currentPeriodEnd,
  cancelAtPeriodEnd: boolean
}

entitlements {
  id, organizationId, feature: string,
  enabled: boolean, expiresAt?
}
```

**Integration Points**:
- Stripe Billing Portal for subscription management
- Middleware to check entitlements
- Feature flags based on plan
- Usage tracking for metered features

**Pages Needed**:
- `/dashboard/billing` - Subscription management
- `/pricing` - Public pricing page
- Plan upgrade/downgrade modals

---

### 4. Portfolio Management & Advisory Fees ⚠️ **NOT IMPLEMENTED**

**Current State**: No advisory services infrastructure.

**What's Missing**:
- Service catalog (advisory, tax planning, legal help)
- Service agreements/engagements
- Time tracking and invoicing
- AUM-based fee calculations
- Service delivery workflows

**Implementation Requirements**:
```typescript
// New schema needed
advisory_services {
  id, organizationId, name, serviceType: 'advisory' | 'tax' | 'legal' | 'portfolio_management',
  pricingModel: 'hourly' | 'fixed' | 'percentage_aum',
  rate: number
}

engagements {
  id, organizationId, clientId, serviceId,
  status: 'active' | 'completed' | 'cancelled',
  startDate, endDate, totalFee, feePaid
}

service_items {
  id, engagementId, description, hours?, rate,
  amount, status: 'pending' | 'billed' | 'paid'
}

invoices {
  id, engagementId, organizationId, amount,
  status: 'draft' | 'sent' | 'paid',
  dueDate, paidAt
}
```

**Integration Points**:
- Link to borrower/investor management
- Document generation for service agreements
- KYC/AML checks for advisory clients

---

### 5. Affiliate & Referral Partnerships ⚠️ **NOT IMPLEMENTED**

**Current State**: "Referral" appears as CRM lead source label only. No tracking or payouts.

**What's Missing**:
- Partner/affiliate registry
- Referral code generation and tracking
- Attribution system (UTM/code capture at signup)
- Commission calculation and payout ledger
- Partner dashboard and statements

**Implementation Requirements**:
```typescript
// New schema needed
partners {
  id, organizationId, name, email, partnerType: 'referral' | 'affiliate' | 'integration',
  commissionRate: number, // percentage
  status: 'active' | 'inactive'
}

partner_links {
  id, partnerId, code: string, // unique referral code
  url: string, // tracking URL
  clicks: number, conversions: number
}

attributions {
  id, partnerId, organizationId, // attributed org
  source: 'signup' | 'investment' | 'loan',
  sourceId: uuid, // loan/investment ID
  commissionAmount: number, status: 'pending' | 'paid'
}

payouts {
  id, partnerId, totalAmount, periodStart, periodEnd,
  status: 'pending' | 'processing' | 'paid',
  paidAt, invoiceId
}
```

**Integration Points**:
- Capture UTM parameters at user signup
- Track conversion events (loan created, investment made)
- Monthly partner statement generation
- CSV export for partner payouts

---

### 6. Exit/Performance-Based Success Fees ⚠️ **PARTIALLY IMPLEMENTED**

**Current State**: Fund schema has `performanceFeeBps` and `managementFeeBps`, but no waterfall calculation engine.

**What's Missing**:
- Waterfall calculation engine (return of capital → preferred return → catch-up → carry)
- Performance fee accrual on distribution dates
- Management fee accrual (quarterly/annual)
- Investor statements showing fee deductions
- Tax document generation (K-1 with fee breakdowns)

**Implementation Requirements**:
```typescript
// Extend existing fund schema
fund_distributions {
  // ... existing fields ...
  waterfallBreakdown: jsonb, // { returnOfCapital, preferredReturn, catchUp, carry }
  managementFeeDeduction: number,
  performanceFeeDeduction: number,
  netDistribution: number
}

// New schema needed
fee_accruals {
  id, fundId, feeType: 'management' | 'performance',
  accrualDate, amount, status: 'accrued' | 'collected',
  distributionId? // links to distribution that collected it
}
```

**Integration Points**:
- Update `handleDistributionMade()` to calculate waterfall
- Link to payment processing for fee collection
- Generate investor statements with fee breakdowns
- Event: `DistributionMade` → Calculate fees → Record accruals

**Code Changes Needed**:
```typescript
// src/lib/events/handlers/FundHandlers.ts
export async function handleDistributionMade(...) {
  // Existing pro-rata calculation...
  
  // NEW: Calculate waterfall
  const waterfall = calculateWaterfall({
    totalDistribution: parseFloat(totalAmount),
    commitments,
    preferredReturnRate: fund.preferredReturnRate,
    catchUpRate: fund.catchUpRate,
    carryRate: fund.performanceFeeBps / 10000
  });
  
  // NEW: Apply management fee
  const managementFee = calculateManagementFee(fund, commitments);
  
  // NEW: Apply performance fee (carry)
  const performanceFee = waterfall.carry;
  
  // Record fee accruals
  await recordFeeAccruals(fundId, managementFee, performanceFee);
}
```

---

### 7. White-Label Licensing ⚠️ **PARTIALLY IMPLEMENTED**

**Current State**: Multi-tenant + branding exists (logo, themes), but no licensing enforcement.

**What's Missing**:
- License key management
- Plan/edition enforcement (Starter, Professional, Enterprise)
- Custom domain mapping
- Branding automation (custom themes, logos per tenant)
- Seat/usage limits per license
- SSO configuration per tenant

**Implementation Requirements**:
```typescript
// Extend organizations schema
organizations {
  // ... existing fields ...
  licenseKey: string, // unique license identifier
  licenseEdition: 'starter' | 'professional' | 'enterprise',
  licenseSeats: number, // max users
  customDomain?: string, // e.g., 'lending.acme.com'
  branding: jsonb, // { logoUrl, primaryColor, themePreset }
  ssoEnabled: boolean,
  ssoConfig?: jsonb
}

licenses {
  id, organizationId, edition, seats, startDate, endDate,
  status: 'active' | 'expired' | 'suspended',
  features: jsonb // enabled features
}
```

**Integration Points**:
- Middleware to check license limits (seat count, feature access)
- Custom domain routing (Vercel edge middleware)
- Theme injection based on org branding
- SSO integration (SAML/OAuth per tenant)

---

## Implementation Roadmap

### Phase 1: Foundation (Sprint 6) - **HIGH PRIORITY**

**Goal**: Enable basic revenue collection and subscription management.

**Deliverables**:
1. **Stripe Integration**
   - Install Stripe SDK
   - Create Stripe webhook handler
   - Set up Stripe Billing for subscriptions

2. **Subscription System**
   - Plans table and service
   - Subscription management API
   - Feature gating middleware
   - `/dashboard/billing` page

3. **Revenue Ledger**
   - Track all platform revenue
   - Basic reporting dashboard

**Timeline**: 2 weeks  
**Dependencies**: Stripe account setup

---

### Phase 2: Transaction & Listing Fees (Sprint 7)

**Goal**: Enable transaction fees and developer listing monetization.

**Deliverables**:
1. **Transaction Fee Engine**
   - Platform fee policies table
   - Fee calculation on investment transactions
   - Stripe Checkout integration

2. **Listing System**
   - Developer onboarding flow
   - Listing approval workflow
   - Listing payment processing

**Timeline**: 2 weeks  
**Dependencies**: Phase 1 complete

---

### Phase 3: Fund Fee Waterfall (Sprint 8)

**Goal**: Implement proper fund fee calculations and investor statements.

**Deliverables**:
1. **Waterfall Engine**
   - Calculate return of capital, preferred return, catch-up, carry
   - Performance fee accrual logic
   - Management fee accrual (quarterly)

2. **Investor Statements**
   - Fee breakdown display
   - Distribution statements
   - Tax document preparation

**Timeline**: 2 weeks  
**Dependencies**: Fund domain complete (Sprint 5)

---

### Phase 4: Affiliate & Advisory (Sprint 9)

**Goal**: Enable partner revenue and advisory services.

**Deliverables**:
1. **Affiliate System**
   - Partner registry
   - Referral tracking
   - Commission calculations
   - Partner dashboard

2. **Advisory Services**
   - Service catalog
   - Engagement management
   - Invoicing system

**Timeline**: 2 weeks  
**Dependencies**: Phase 1 complete

---

### Phase 5: White-Label Licensing (Sprint 10)

**Goal**: Enable white-label platform licensing.

**Deliverables**:
1. **License Management**
   - License key generation
   - Edition enforcement
   - Seat limits

2. **Custom Branding**
   - Custom domain routing
   - Theme injection
   - SSO configuration

**Timeline**: 2 weeks  
**Dependencies**: Multi-tenant infrastructure stable

---

## Technical Architecture

### Payment Processing

```
┌─────────────┐
│   Stripe    │◄───── Webhooks
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Payment Gateway │
│  (Stripe Checkout)│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐      ┌──────────────┐
│ Revenue Service  │─────►│Revenue Ledger│
└──────────────────┘      └──────────────┘
       │
       ▼
┌──────────────────┐
│  Fee Calculator  │
└──────────────────┘
```

### Subscription Flow

```
User Signup → Select Plan → Stripe Checkout → Webhook → 
Create Subscription → Set Entitlements → Enable Features
```

### Fund Fee Waterfall

```
Distribution Amount
  ├─ Return of Capital (100%)
  ├─ Preferred Return (8% annually)
  ├─ Catch-Up (until GP catch-up achieved)
  └─ Carry (20% of remaining profits)
      └─ Performance Fee Accrual
```

---

## Database Schema Additions

See implementation requirements above for each revenue stream. Key tables:

- `platform_fees` - Fee policies
- `revenue_ledger` - All platform revenue
- `plans` - Subscription plans
- `subscriptions` - Active subscriptions
- `entitlements` - Feature access per org
- `developer_accounts` - Developer partners
- `listings` - Property listings with fees
- `partners` - Affiliate/partner registry
- `attributions` - Referral tracking
- `payouts` - Partner commission payouts
- `fee_accruals` - Fund fee tracking
- `advisory_services` - Service catalog
- `engagements` - Service agreements
- `invoices` - Service invoicing

---

## Integration Points

### External Services Required

1. **Stripe** (Payment Processing & Billing)
   - Checkout for one-time payments
   - Billing for subscriptions
   - Webhooks for event handling

2. **KYC/AML Provider** (For Advisory Services)
   - Alloy, Persona, or similar
   - Investor accreditation checks

3. **Document Generation** (For Service Agreements)
   - DocuSign or similar
   - Service agreement templates

---

## Monetization Validation Pilot

### Micro-Pilot Testing (90-Day Roadmap Weeks 9-12)

**Goal**: Validate monetization model with real users before full rollout.

**Pilot Structure**:
- **Participants**: 5 flippers + 20 lenders/investors
- **Capital Deployed**: $500K target
- **Duration**: 4 weeks (Weeks 9-12)
- **Success Metric**: 80% of test lenders re-invest within 60 days

**Revenue Streams to Test**:

| Revenue Stream | Test Approach | Success Criteria |
|----------------|---------------|------------------|
| **1-2% Origination Fee** | Charge on next 3 test loans | Track close rate impact |
| **0.5% AUM on Funds** | Mock $100K fund in `funds.ts` | Simulate waterfall calculations |
| **White-Label API** | Pitch to local REIA group | Interest from 2+ organizations |

**Validation Metrics**:
- **Retention**: 80% of test lenders re-invest within 60 days
- **Satisfaction**: Investor satisfaction > 4.5/5
- **Velocity**: Average deal closing time < 5 days
- **Efficiency**: Draw processing time < 24 hours

**Pilot Deliverables**:
- Usage data and feedback
- Case studies for pitch deck
- Revenue validation
- Product-market fit confirmation

**Reference**: [90-Day Roadmap](../product-strategy/90-day-roadmap.md) - Weeks 9-12

---

## Success Metrics

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Transaction fee revenue
- Listing fee revenue
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)

### Engagement Metrics
- Subscription conversion rate
- Listing creation rate
- Partner referral conversion
- Feature usage by plan tier

### Pilot Validation Metrics
- Lender retention rate (target: 80% re-invest within 60 days)
- Investor satisfaction (target: >4.5/5)
- Deal velocity (target: <5 days average closing)
- Draw processing efficiency (target: <24 hours)

---

## Related Documentation

- [Fund Domain](../domains/fund-domain.md)
- [Payment Domain](../domains/payment-domain.md)
- [Domain Architecture v2.0](./domain-architecture-v2.md)
- [Integration Adapters](./integration-adapters.md)
- [90-Day Roadmap](../product-strategy/90-day-roadmap.md) - Monetization validation pilot
- [Product Strategy](../product-strategy/) - Market research and competitive analysis

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: After Sprint 6 completion

