# 90-Day Tactical Roadmap

> **Status**: Active Planning  
> **Timeline**: January - April 2025  
> **Last Updated**: January 2025

---

## Overview

This roadmap translates strategic priorities into week-by-week tactical execution, linking features to existing sprint structure and delivering measurable outcomes.

---

## Roadmap Structure

### Quick Wins (Weeks 1-4)
High-impact features that can be delivered quickly to demonstrate traction.

### Strategic Initiatives (Weeks 5-8)
Core features required for parity with competitors and monetization.

### Pilot & Validation (Weeks 9-12)
Market validation through pilot program with real users.

---

## Week-by-Week Breakdown

### Weeks 1-2: Chat + E-Signature MVP

**Goal**: Close communication gap and enable document execution

**Deliverables**:
- In-app chat integration (Tawk.to or Liveblocks)
- DocuSign/SignNow integration
- Document signature workflow
- Signature status tracking

**Sprint Alignment**: Sprint 6 (Compliance Domain) - Phase 1

**Success Metrics**:
- Chat response time < 5 minutes
- Document signature completion < 2 hours
- 80% of documents signed electronically

**Dependencies**:
- DocuSign API account setup
- Chat SDK integration
- EventBus webhook handlers

**Code Changes**:
- Create `SignatureService` (`src/services/signature.service.ts`)
- Add `document_signatures` table
- Create chat component (`src/components/chat/`)
- Update compliance domain docs

**Market Validation**: Addresses 68% friction point (communication delays)

---

### Weeks 3-4: Auto-KYC Integration

**Goal**: Reduce onboarding time from 3-5 days → <24 hours

**Deliverables**:
- Persona/Onfido/Sumsub integration
- Automated KYC workflow
- KYC status tracking
- Webhook integration with EventBus

**Sprint Alignment**: Sprint 6 (Compliance Domain) - Phase 2

**Success Metrics**:
- KYC approval time < 24 hours (vs. 3-5 days baseline)
- 95% automated approval rate
- Zero manual KYC reviews required

**Dependencies**:
- KYC vendor account (Persona recommended)
- Webhook infrastructure
- EventBus handler for KYC events

**Code Changes**:
- Create `KYCService` (`src/services/kyc.service.ts`)
- Add `kycStatus` enum to `users` table
- Update borrower/fund onboarding flows
- Create KYC webhook handlers

**Market Validation**: Required for parity with Fundrise/RealtyMogul

---

### Weeks 5-6: Tax Pack MVP

**Goal**: Automate investor tax document generation

**Deliverables**:
- TaxBit API integration (or Yearli)
- K-1 generation for fund investors
- 1099-INT generation for interest income
- Investor tax document portal

**Sprint Alignment**: Sprint 9 (Monetization) - Tax pack automation

**Success Metrics**:
- 100% of K-1s generated automatically
- Tax document delivery < 7 days after year-end
- Zero manual tax document creation

**Dependencies**:
- TaxBit API account (or Yearli)
- Fund distribution data
- Investor information

**Code Changes**:
- Create `TaxService` (`src/services/tax.service.ts`)
- Add tax document generation endpoints
- Create investor tax portal
- Integrate with fund domain

**Market Validation**: Top 3 investor complaints (Yieldstreet surveys)

---

### Weeks 7-8: Deal Score + Leaderboard

**Goal**: Drive investor confidence and engagement

**Deliverables**:
- Deal scoring algorithm (0-100)
- Deal score badge on loan cards
- Investor leaderboard
- Social proof elements

**Sprint Alignment**: Sprint 8 (Analytics & Investor Reporting) - Phase 2

**Success Metrics**:
- Deal score accuracy >85%
- Leaderboard engagement >50% of investors
- Higher conversion on scored deals

**Dependencies**:
- Risk scoring model
- Analytics data aggregation
- Leaderboard data pipeline

**Code Changes**:
- Create `DealScoringService` (`src/services/deal-scoring.service.ts`)
- Update `StepAsset.tsx` with score badge
- Create leaderboard component
- Build scoring algorithm using loan data

**Market Validation**: Fund That Flip uses deal scoring, Groundfloor uses leaderboard

---

### Weeks 9-12: Pilot with 5 Flippers + 20 Lenders

**Goal**: Validate product-market fit and collect traction data

**Deliverables**:
- Onboard 5 active flippers
- Onboard 20 lenders/investors
- Deploy $500K in capital
- Collect usage data and feedback
- Generate case studies

**Sprint Alignment**: Continuous validation across all sprints

**Success Metrics**:
- 80% of test lenders re-invest within 60 days
- Average deal closing time < 5 days
- Draw processing time < 24 hours
- Investor satisfaction > 4.5/5

**Activities**:
- Week 9: Onboard first 2 flippers + 5 lenders
- Week 10: Onboard remaining 3 flippers + 10 lenders
- Week 11: Deploy capital, collect data
- Week 12: Analyze results, generate case studies

**Market Validation**: 
- Validates monetization model
- Provides traction data for pitch deck
- Proves product-market fit

---

## Sprint Alignment

### Sprint 6 (Compliance Domain)
- **Weeks 1-2**: E-Signature integration
- **Weeks 3-4**: Auto-KYC integration

### Sprint 7 (Mobile Inspector App)
- **Weeks 1-2**: Chat integration opportunity

### Sprint 8 (Analytics & Investor Reporting)
- **Weeks 5-6**: Investor portal (if not completed)
- **Weeks 7-8**: Deal Score + Leaderboard

### Sprint 9 (Monetization Foundation)
- **Weeks 5-6**: Tax pack automation
- **Weeks 9-12**: Monetization validation pilot

---

## Dependencies & Blockers

### External Dependencies

1. **DocuSign API Account** (Weeks 1-2)
   - Setup required before implementation
   - API keys needed for integration

2. **KYC Vendor Account** (Weeks 3-4)
   - Persona/Onfido/Sumsub account setup
   - Webhook configuration

3. **TaxBit API Account** (Weeks 5-6)
   - Account setup and API access
   - Tax document templates

4. **Pilot Participants** (Weeks 9-12)
   - Recruit 5 flippers
   - Recruit 20 lenders
   - Requires sales/marketing effort

### Technical Dependencies

1. **EventBus Infrastructure** (All weeks)
   - Must be stable before adding integrations
   - Webhook handlers needed

2. **Fund Domain Completion** (Weeks 5-6, 9-12)
   - Required for tax documents
   - Required for investor portal

3. **Analytics Infrastructure** (Weeks 7-8)
   - Required for deal scoring
   - Required for leaderboard

---

## Success Metrics

### Overall Roadmap Success

- **Feature Completion**: 100% of planned features delivered
- **Timeline Adherence**: On-time delivery for 80% of features
- **Quality**: Zero critical bugs in production
- **User Adoption**: 50%+ adoption rate for new features

### Week-by-Week Metrics

| Week | Feature | Metric | Target |
|------|---------|--------|--------|
| 2 | E-Signature | Signature completion time | < 2 hours |
| 4 | Auto-KYC | KYC approval time | < 24 hours |
| 6 | Tax Pack | Document generation | 100% automated |
| 8 | Deal Score | Score accuracy | >85% |
| 12 | Pilot | Lender retention | 80% re-invest |

---

## Risk Mitigation

### Risk 1: External API Delays

**Mitigation**: 
- Setup accounts early (Week 0)
- Have backup vendors ready
- Implement fallback workflows

### Risk 2: Pilot Recruitment Challenges

**Mitigation**:
- Start recruitment early (Week 6)
- Offer incentives for early adopters
- Leverage existing network

### Risk 3: Technical Complexity

**Mitigation**:
- Break features into smaller milestones
- Test integrations early
- Have rollback plans

---

## Related Documentation

- [Gaps & Opportunities](./gaps-and-opportunities.md)
- [Product Backlog](./product-backlog.md)
- [Market Intelligence](./market-intelligence.md)
- [Competitive Analysis](./competitive-analysis.md)

---

**Version**: 1.0  
**Last Updated**: January 2025

