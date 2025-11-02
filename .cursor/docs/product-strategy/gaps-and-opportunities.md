# Gaps & Opportunities Analysis

> **Status**: Critical Priority  
> **Last Updated**: January 2025  
> **Source**: Codex Analysis + Market Research

---

## Overview

This document captures critical gaps identified through code analysis and market research that must be addressed to achieve parity with leading platforms (Fundrise, RealtyMogul) and unlock monetization opportunities.

---

## Critical Gaps (HIGH PRIORITY)

### 1. KYC/AML Automation

**Current State**:
- Planned in `.cursor/docs/domains/borrower-domain.md` (line 16)
- Planned in `.cursor/docs/domains/compliance-domain.md` (line 132)
- Manual KYC process = 3-5 day delay
- Investor churn due to onboarding friction

**Market Validation**:
- 68% of lenders cite communication delays as #1 friction (LendingOne 2025)
- Manual KYC = major barrier to scale
- Required for parity with Fundrise/RealtyMogul

**Impact**: 
- **HIGH** - Blocks investor onboarding at scale
- **Revenue Impact**: 3-5 day delay = lost deals, investor churn

**Solution**:
- Wire real KYC/AML providers into borrower and fund onboarding flows
- Recommended vendors:
  - **Persona**: Webhooks + ID verification ($0.50-$2/check)
  - **Onfido**: AI + liveness ($1.20/check)
  - **Sumsub**: Crypto-friendly, lower cost ($0.80/check)

**Implementation Plan**:
- Add `kycStatus` enum to `users` table
- Create `KYCService` integration layer
- Wire webhook to `EventBus.ts` → auto-approve loan listing
- Update borrower and fund onboarding flows

**Sprint Assignment**: Sprint 6 (Compliance Domain) - Phase 2

**References**:
- [Borrower Domain](../domains/borrower-domain.md)
- [Compliance Domain](../domains/compliance-domain.md)
- [90-Day Roadmap](./90-day-roadmap.md) - Weeks 3-4

---

### 2. E-Signature Integration

**Current State**:
- Planned in `.cursor/docs/domains/fund-domain.md` (line 86)
- No e-signature capability for:
  - Loan agreements
  - PPMs (Private Placement Memorandums)
  - Subscription agreements
  - Compliance documents

**Market Validation**:
- Industry standard for investor platforms
- Required for SEC Reg D 506(c) compliance
- Critical for same-day deal closing

**Impact**:
- **HIGH** - Required for compliance and investor experience
- **Revenue Impact**: Enables faster deal velocity

**Solution**:
- Integrate DocuSign/SignNow into borrower and fund onboarding flows
- Support document templates:
  - Loan agreements
  - PPM documents
  - Subscription agreements
  - Compliance disclosures

**Implementation Plan**:
- Create `SignatureService` integration layer
- Add `document_signatures` table
- Webhook handlers for signature completion
- Template management system
- Integration with event bus for automated workflows

**Sprint Assignment**: Sprint 6 (Compliance Domain) - Phase 1

**References**:
- [Fund Domain](../domains/fund-domain.md)
- [Compliance Domain](../domains/compliance-domain.md)
- [90-Day Roadmap](./90-day-roadmap.md) - Weeks 1-2

---

### 3. AI Insights (Static → Real-Time)

**Current State**:
- Static cards in `src/app/(main)/(ops)/analytics/page.tsx` (line 63)
- Placeholder implementation in `src/hooks/useAnalyticsEventListener.ts` (line 72)
- No predictive risk scoring
- Static insights don't leverage event stream

**Market Validation**:
- Differentiation opportunity vs. competitors
- Real-time insights = competitive advantage
- Predictive risk scoring addresses 94% of defaults tied to poor ARV modeling (Kiavi 2025)

**Impact**:
- **MEDIUM-HIGH** - Differentiation opportunity
- **Revenue Impact**: Better risk assessment = better deal selection = higher returns

**Solution**:
- Replace static cards with analytics models fed by event stream
- Implement predictive risk scoring:
  - Borrower default probability
  - Property ARV accuracy
  - Draw risk assessment
  - Portfolio health indicators

**Implementation Plan**:
- Create `RiskScoringService` using event stream data
- Build ML models for:
  - Default prediction
  - ARV accuracy scoring
  - Draw completion risk
- Replace static insights with real-time calculations
- Add event-driven updates to analytics dashboard

**Sprint Assignment**: Sprint 8 (Analytics & Investor Reporting) - Phase 2

**References**:
- [Analytics Page](../../../src/app/(main)/(ops)/analytics/page.tsx)
- [Analytics Event Hook](../../../src/hooks/useAnalyticsEventListener.ts)
- [90-Day Roadmap](./90-day-roadmap.md) - Weeks 7-8

---

### 4. Investor Portal

**Current State**:
- Fund schemas exist (`src/db/schema/funds.ts` line 1)
- Planned in `.cursor/docs/domains/fund-domain.md` (line 60)
- No investor-facing portal for:
  - Capital calls
  - Distributions
  - Statements
  - Performance tracking

**Market Validation**:
- Required for parity with Fundrise, Yieldstreet, RealtyMogul
- Investor self-service = reduced support burden
- Unlocks monetization levers (AUM fees, performance fees)

**Impact**:
- **HIGH** - Unlocks monetization levers
- **Revenue Impact**: Enables fund management fees, performance fees

**Solution**:
- Deliver investor portal on top of existing fund schemas
- Features:
  - Capital call notifications and payments
  - Distribution statements
  - Performance dashboards
  - Tax documents (K-1, 1099)
  - Investment history

**Implementation Plan**:
- Create investor portal route: `src/app/(main)/(investor)/dashboard/`
- Build investor-facing components:
  - Capital call interface
  - Distribution viewer
  - Performance dashboard
  - Statement generator
- Integrate with fund domain services
- Add investor authentication/authorization

**Sprint Assignment**: Sprint 8 (Analytics & Investor Reporting) - Phase 1

**References**:
- [Fund Domain](../domains/fund-domain.md)
- [Fund Schema](../../../src/db/schema/funds.ts)
- [Monetization Strategy](../architecture/monetization-strategy.md)

---

## Quick Wins (MEDIUM PRIORITY)

### 5. In-App Chat

**Market Validation**: 68% of lenders cite communication delays as #1 friction

**Implementation**: Tawk.to SDK or Liveblocks
**Timeline**: 2 weeks (Weeks 1-2)
**Sprint**: Sprint 7 (Mobile) - Chat integration opportunity

### 6. Deal Score (0-100)

**Market Validation**: Fund That Flip uses deal scoring, drives investor confidence

**Implementation**: Build on `loan.service.ts` risk fields → AI scoring
**Timeline**: 2 weeks (Weeks 7-8)
**Sprint**: Sprint 8 (Analytics)

### 7. Investor Leaderboard

**Market Validation**: Groundfloor uses leaderboard for social proof

**Implementation**: Clone using `analytics-kpis` data
**Timeline**: 1 week
**Sprint**: Sprint 8 (Analytics)

---

## Long-Term Opportunities

### 8. Tax Pack Automation (K-1 / 1099)

**Market Validation**: Top 3 investor complaints in Yieldstreet surveys

**Implementation**: TaxBit API or Yearli integration
**Timeline**: 2 weeks (Weeks 5-6)
**Sprint**: Sprint 9 (Monetization) - Tax pack automation

### 9. Weekly Cash Flow Distributions

**Market Validation**: Concreit differentiator, improves investor experience

**Implementation**: Add `distributionFrequency: 'weekly'` to funds
**Timeline**: 1 week
**Sprint**: Sprint 10 (Fund Waterfall)

---

## Prioritization Matrix

| Gap | Priority | Impact | Effort | Sprint | Timeline |
|-----|----------|--------|--------|--------|----------|
| E-Signature Integration | HIGH | Revenue | Medium | Sprint 6 | Weeks 1-2 |
| KYC/AML Automation | HIGH | Scale | Medium | Sprint 6 | Weeks 3-4 |
| Investor Portal | HIGH | Revenue | High | Sprint 8 | Weeks 5-6 |
| AI Insights (Real-Time) | MEDIUM-HIGH | Differentiation | High | Sprint 8 | Weeks 7-8 |
| Tax Pack Automation | MEDIUM | Retention | Medium | Sprint 9 | Weeks 5-6 |
| In-App Chat | MEDIUM | UX | Low | Sprint 7 | Weeks 1-2 |
| Deal Score | MEDIUM | Differentiation | Medium | Sprint 8 | Weeks 7-8 |

---

## Success Metrics

### KYC Automation
- **Target**: Reduce onboarding time from 3-5 days → <24 hours
- **Metric**: Time from signup to KYC approval
- **Baseline**: 3-5 days manual
- **Goal**: <24 hours automated

### E-Signature
- **Target**: Enable same-day deal closing
- **Metric**: Time from document generation to signature completion
- **Baseline**: 2-3 days manual
- **Goal**: <2 hours automated

### Investor Portal
- **Target**: 80% of investors use self-service portal
- **Metric**: Portal engagement rate
- **Baseline**: 0% (doesn't exist)
- **Goal**: 80% engagement

### AI Insights
- **Target**: Predictive risk scoring accuracy >85%
- **Metric**: Default prediction accuracy
- **Baseline**: No predictive scoring
- **Goal**: >85% accuracy

---

## Related Documentation

- [90-Day Roadmap](./90-day-roadmap.md)
- [Product Backlog](./product-backlog.md)
- [Competitive Analysis](./competitive-analysis.md)
- [Borrower Domain](../domains/borrower-domain.md)
- [Compliance Domain](../domains/compliance-domain.md)
- [Fund Domain](../domains/fund-domain.md)

---

**Version**: 1.0  
**Last Updated**: January 2025

