# Product Backlog - Prioritized Features

> **Status**: Active Backlog  
> **Last Updated**: January 2025  
> **Prioritization**: By market validation, effort, and strategic impact

---

## Overview

This backlog prioritizes features based on market research, competitive analysis, and strategic gaps. Features are organized by priority, effort, and sprint assignment.

---

## Quick Wins (2-4 Weeks)

### 1. In-App Chat Integration

**User Story**: As a lender, I want to communicate with borrowers in-app so that I can resolve issues faster without switching tools.

**Market Validation**: 68% of lenders cite communication delays as #1 friction (LendingOne 2025)

**Effort**: 2 weeks (8 story points)

**Sprint**: Sprint 7 (Mobile) - Chat integration opportunity

**Dependencies**: 
- Chat SDK (Tawk.to or Liveblocks)
- EventBus webhook handlers

**Acceptance Criteria**:
- Chat widget available on loan detail pages
- Real-time messaging between lenders and borrowers
- Message history persisted
- Notification system for new messages

**Status**: Planned (Weeks 1-2)

---

### 2. Investor Leaderboard

**User Story**: As an investor, I want to see top performers so that I can learn from successful strategies.

**Market Validation**: Groundfloor uses leaderboard for social proof, drives engagement

**Effort**: 1 week (5 story points)

**Sprint**: Sprint 8 (Analytics & Investor Reporting)

**Dependencies**:
- Analytics data aggregation
- Leaderboard data pipeline

**Acceptance Criteria**:
- Leaderboard displays top investors by:
  - Total invested
  - Return on investment
  - Number of deals
- Real-time updates via EventBus
- Privacy controls (opt-in/opt-out)

**Status**: Planned (Week 7-8)

**Code Reference**: Map to `analytics-kpis-with-export.tsx`

---

### 3. Deal Score Badge

**User Story**: As an investor, I want to see a deal score so that I can quickly assess investment quality.

**Market Validation**: Fund That Flip uses deal scoring (0-100), drives investor confidence

**Effort**: 2 weeks (8 story points)

**Sprint**: Sprint 8 (Analytics & Investor Reporting)

**Dependencies**:
- Risk scoring model
- Loan data aggregation

**Acceptance Criteria**:
- Deal score (0-100) displayed on loan cards
- Score factors:
  - Borrower credit history
  - Property ARV accuracy
  - LTV ratio
  - Market conditions
- Score updates in real-time
- Tooltip explains scoring factors

**Status**: Planned (Weeks 7-8)

**Code Reference**: Update `StepAsset.tsx` with score badge

---

## Strategic Initiatives (1-2 Sprints)

### 4. E-Signature Integration

**User Story**: As a borrower/lender, I want to sign documents electronically so that I can close deals faster.

**Market Validation**: Industry standard, required for SEC Reg D 506(c) compliance

**Effort**: 2 weeks (13 story points)

**Sprint**: Sprint 6 (Compliance Domain) - Phase 1

**Dependencies**:
- DocuSign/SignNow API account
- Document templates
- EventBus webhook handlers

**Acceptance Criteria**:
- DocuSign/SignNow integration
- Document signature workflow
- Signature status tracking
- Automated completion notifications
- Document storage and retrieval

**Status**: Planned (Weeks 1-2)

**Code Reference**: Create `SignatureService` (`src/services/signature.service.ts`)

---

### 5. Auto-KYC Vendor Integration

**User Story**: As an investor, I want automated KYC verification so that I can start investing within 24 hours.

**Market Validation**: Required for parity with Fundrise/RealtyMogul, reduces 3-5 day delay

**Effort**: 2 weeks (13 story points)

**Sprint**: Sprint 6 (Compliance Domain) - Phase 2

**Dependencies**:
- KYC vendor account (Persona/Onfido/Sumsub)
- Webhook infrastructure
- EventBus handlers

**Acceptance Criteria**:
- KYC vendor integration (Persona recommended)
- Automated verification workflow
- KYC status tracking
- Webhook handlers for approval/rejection
- Manual review fallback for edge cases

**Status**: Planned (Weeks 3-4)

**Code Reference**: 
- Create `KYCService` (`src/services/kyc.service.ts`)
- Update `borrower-domain.md` and `compliance-domain.md`

---

### 6. Investor Portal

**User Story**: As an investor, I want a self-service portal so that I can manage my investments, view statements, and track performance.

**Market Validation**: Required for parity with Fundrise, Yieldstreet, RealtyMogul, unlocks monetization

**Effort**: 3 weeks (21 story points)

**Sprint**: Sprint 8 (Analytics & Investor Reporting) - Phase 1

**Dependencies**:
- Fund domain completion
- Distribution calculations
- Statement generation

**Acceptance Criteria**:
- Investor login and authentication
- Capital call interface
- Distribution statements
- Performance dashboards
- Investment history
- Tax documents (K-1, 1099)

**Status**: Planned (Weeks 5-6)

**Code Reference**: 
- Fund schemas exist (`src/db/schema/funds.ts`)
- Planned in `fund-domain.md` (line 60)

---

### 7. Tax Pack Automation (K-1 / 1099)

**User Story**: As an investor, I want automated tax documents so that I can file taxes without manual paperwork.

**Market Validation**: Top 3 investor complaints (Yieldstreet surveys)

**Effort**: 2 weeks (13 story points)

**Sprint**: Sprint 9 (Monetization) - Tax pack automation

**Dependencies**:
- TaxBit API (or Yearli)
- Fund distribution data
- Investor information

**Acceptance Criteria**:
- K-1 generation for fund investors
- 1099-INT generation for interest income
- Automated document delivery
- Investor tax portal
- Document storage and retrieval

**Status**: Planned (Weeks 5-6)

**Code Reference**: Create `TaxService` (`src/services/tax.service.ts`)

---

### 8. AI Insights (Static → Real-Time)

**User Story**: As a lender, I want predictive risk scoring so that I can make better investment decisions.

**Market Validation**: Addresses 94% defaults tied to poor ARV modeling (Kiavi 2025)

**Effort**: 3 weeks (21 story points)

**Sprint**: Sprint 8 (Analytics & Investor Reporting) - Phase 2

**Dependencies**:
- Event stream data
- ML models for risk scoring
- Analytics infrastructure

**Acceptance Criteria**:
- Replace static insight cards with real-time calculations
- Predictive risk scoring:
  - Borrower default probability
  - Property ARV accuracy
  - Draw completion risk
  - Portfolio health indicators
- Event-driven updates
- Accuracy >85%

**Status**: Planned (Weeks 7-8)

**Code Reference**:
- `src/app/(main)/(ops)/analytics/page.tsx` (line 63)
- `src/hooks/useAnalyticsEventListener.ts` (line 72)

---

## Long-Term (3+ Sprints)

### 9. Weekly Cash Flow Distributions

**User Story**: As an investor, I want weekly distributions so that I can receive regular cash flow.

**Market Validation**: Concreit differentiator, improves investor experience

**Effort**: 1 week (5 story points)

**Sprint**: Sprint 10 (Fund Waterfall)

**Dependencies**:
- Fund distribution system
- Waterfall calculations

**Acceptance Criteria**:
- Add `distributionFrequency: 'weekly'` to funds schema
- Weekly distribution calculation
- Automated distribution processing
- Investor notifications

**Status**: Planned (Sprint 10)

**Code Reference**: Update `funds.ts` schema

---

### 10. Advanced Compliance Workflows

**User Story**: As a compliance officer, I want automated compliance workflows so that I can ensure regulatory requirements are met.

**Market Validation**: Required for scale, reduces manual compliance burden

**Effort**: 3 weeks (21 story points)

**Sprint**: Sprint 6 (Compliance Domain) - Phase 3

**Dependencies**:
- Compliance domain foundation
- Document generation
- Regulatory rule engine

**Acceptance Criteria**:
- Automated disclosure generation
- Filing deadline tracking
- License renewal alerts
- Compliance scoring
- Audit report generation

**Status**: Planned (Future)

---

## Feature Prioritization Matrix

| Feature | Priority | Market Validation | Effort | Sprint | Status |
|---------|----------|-------------------|--------|--------|--------|
| E-Signature Integration | HIGH | Industry Standard | Medium | Sprint 6 | Planned |
| Auto-KYC Integration | HIGH | Parity Requirement | Medium | Sprint 6 | Planned |
| Investor Portal | HIGH | Monetization | High | Sprint 8 | Planned |
| AI Insights (Real-Time) | MEDIUM-HIGH | Differentiation | High | Sprint 8 | Planned |
| Tax Pack Automation | MEDIUM | Retention | Medium | Sprint 9 | Planned |
| In-App Chat | MEDIUM | UX Friction | Low | Sprint 7 | Planned |
| Deal Score | MEDIUM | Differentiation | Medium | Sprint 8 | Planned |
| Investor Leaderboard | MEDIUM | Engagement | Low | Sprint 8 | Planned |
| Weekly Distributions | LOW | Nice-to-Have | Low | Sprint 10 | Planned |
| Compliance Workflows | LOW | Scale | High | Sprint 6 | Planned |

---

## Sprint Assignments

### Sprint 6 (Compliance Domain)
- E-Signature Integration (Weeks 1-2)
- Auto-KYC Integration (Weeks 3-4)
- Compliance Workflows (Future)

### Sprint 7 (Mobile Inspector App)
- In-App Chat Integration (Weeks 1-2)

### Sprint 8 (Analytics & Investor Reporting)
- Investor Portal (Weeks 5-6)
- Deal Score + Leaderboard (Weeks 7-8)
- AI Insights Real-Time (Weeks 7-8)

### Sprint 9 (Monetization Foundation)
- Tax Pack Automation (Weeks 5-6)

### Sprint 10 (Fund Waterfall)
- Weekly Distributions (Future)

---

## Dependencies Tracking

### External APIs Required
- **DocuSign/SignNow**: E-Signature (Weeks 1-2)
- **Persona/Onfido/Sumsub**: KYC (Weeks 3-4)
- **TaxBit/Yearli**: Tax Documents (Weeks 5-6)
- **Tawk.to/Liveblocks**: Chat (Weeks 1-2)

### Internal Dependencies
- **EventBus**: Required for all real-time features
- **Fund Domain**: Required for investor portal, tax docs
- **Analytics Infrastructure**: Required for AI insights, leaderboard

---

## Success Metrics

### Feature Adoption Targets
- **E-Signature**: 80% of documents signed electronically
- **Auto-KYC**: 95% automated approval rate
- **Investor Portal**: 80% of investors use self-service
- **AI Insights**: >85% accuracy in risk scoring
- **Deal Score**: Higher conversion on scored deals

### Timeline Adherence
- **Target**: 80% of features delivered on-time
- **Current**: Planning phase

---

## Related Documentation

- [90-Day Roadmap](./90-day-roadmap.md)
- [Gaps & Opportunities](./gaps-and-opportunities.md)
- [Competitive Analysis](./competitive-analysis.md)
- [Market Intelligence](./market-intelligence.md)

---

**Version**: 1.0  
**Last Updated**: January 2025

