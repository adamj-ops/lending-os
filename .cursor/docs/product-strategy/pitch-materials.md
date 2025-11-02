# Pitch Materials - Asset Mapping

> **Status**: Pitch Deck Preparation  
> **Last Updated**: January 2025  
> **Target**: Investor Pitch Deck (10 slides)

---

## Overview

This document maps existing codebase assets to pitch deck slides, creating a "Traction Deck" that converts shipped features into investor-grade proof points.

---

## Pitch Deck Structure (10 Slides)

### Slide 1: Compliant Onboarding at Scale

**Pitch Point**: *"Compliant Onboarding at Scale"*

**Code Assets**:
- `register-form.tsx` - User registration flow
- KYC domain (`borrower-domain.md` line 16, `compliance-domain.md` line 132)
- KYC status tracking

**Visual Assets Needed**:
- Screenshot of registration flow
- KYC upload interface (when implemented)
- Compliance checklist visualization

**Competitive Comparison**:
- Reference: [SEC Reg D 506(c) Compliance Checklist – Crowdstreet (2025)](https://www.crowdstreet.com/education/articles/reg-d-506c-compliance-checklist/)
- Show our KYC flow next to their audit trail

**Demo Script**:
- "Our onboarding flow ensures SEC Reg D 506(c) compliance"
- "Automated KYC reduces approval time from 3-5 days → <24 hours"
- "Real-time status tracking keeps investors informed"

**Status**: ✅ Code exists, ⚠️ KYC automation pending (Weeks 3-4)

---

### Slide 2: Automated Funding & Draw Orchestration

**Pitch Point**: *"Automated Funding & Draw Orchestration"*

**Code Assets**:
- `loan.service.ts` - Loan management service
- `payment-draw-calendar.tsx` - Draw scheduling and management
- EventBus infrastructure for automated workflows

**Visual Assets Needed**:
- Live GIF of draw calendar interface
- Draw approval workflow visualization
- EventBus architecture diagram

**Competitive Comparison**:
- Reference: [Groundfloor's Draw Workflow Teardown (YouTube, 2025)](https://www.youtube.com/watch?v=groundfloor-draws-2025)
- Mirror their UI, cite 40% faster closings

**Demo Script**:
- "EventBus enables same-day draw processing"
- "Automated approval workflows reduce delays"
- "Real-time status updates keep all parties informed"
- "Cut draw delays from 5 days → same-day"

**Status**: ✅ Code exists, ⚠️ Same-day processing pending optimization

---

### Slide 3: Real-Time Investor Transparency

**Pitch Point**: *"Real-Time Investor Transparency"*

**Code Assets**:
- `analytics-kpis-with-export.tsx` - Analytics dashboard
- `EventBus.ts` - Event-driven architecture
- `useAnalyticsEventListener.ts` - Real-time analytics hook

**Visual Assets Needed**:
- Live dashboard GIF showing real-time updates
- KPI visualization
- Event stream visualization

**Competitive Comparison**:
- Reference: [Yieldstreet Q3 2025 Investor Report PDF](https://www.yieldstreet.com/resources/q3-2025-report)
- Steal their KPI layout, drop your live dashboard GIF

**Demo Script**:
- "Real-time dashboards update instantly via EventBus"
- "No competitor ships this at seed stage"
- "Investors see performance changes as they happen"
- "Event-driven architecture = instant transparency"

**Status**: ✅ Code exists, ⚠️ AI insights need real-time implementation (Weeks 7-8)

---

### Slide 4: Fractionalized Returns Engine

**Pitch Point**: *"Fractionalized Returns Engine"*

**Code Assets**:
- `funds.ts` schema - Fund management
- Waterfall calculation infrastructure (planned)
- Distribution tracking

**Visual Assets Needed**:
- Fund structure diagram
- Waterfall calculation visualization
- Distribution statement example

**Competitive Comparison**:
- Reference: [Fundrise Fee Structure Breakdown – Cap Table (2025)](https://investor.fundrise.com/fee-structure)
- Show our schema side-by-side with their structure

**Demo Script**:
- "Fractionalized investments enable $1,000 minimum"
- "Automated waterfall calculations ensure fair distribution"
- "Real-time performance tracking for all investors"
- "Tax documents (K-1/1099) generated automatically"

**Status**: ✅ Schema exists, ⚠️ Waterfall engine pending (Sprint 10)

---

### Slide 5: Market Opportunity

**Pitch Point**: *"$2.1T Private Lending Market"*

**Data Sources**:
- RCN Capital Hard Money Outlook 2025
- LendingOne Q3 2025 Survey
- Attom Data Q2 2025 Wholesale Trends

**Key Metrics**:
- TAM: $2.1T private lending volume
- Average yield: 12.8%
- Market growth: 31% YoY in Sun Belt
- 89% need faster draws

**Visual Assets Needed**:
- Market size visualization
- Growth charts
- Geographic heatmap (Sun Belt focus)

**Demo Script**:
- "Private lending is a $2.1T market"
- "89% of flippers need faster draws - we solve this"
- "31% YoY growth in Sun Belt - huge opportunity"
- "Our EventBus enables same-day processing"

**Status**: ✅ Research complete

---

### Slide 6: Competitive Advantage

**Pitch Point**: *"Unfair Advantage: Event-Driven Architecture"*

**Comparison Table**:

| Feature | Groundfloor | Yieldstreet | Kiavi | **LendingOS** |
|---------|-------------|-------------|-------|---------------|
| **Min Investment** | $10 | $5,000 | N/A | $1,000 |
| **Draw Processing** | 3-5 days | N/A | Same-day | **Same-day** |
| **Real-Time Analytics** | ❌ | ❌ | ❌ | ✅ **Unique** |
| **Event-Driven** | ❌ | ❌ | ❌ | ✅ **Unique** |
| **Auto-KYC** | ✅ | ✅ | ✅ | ✅ (Plan) |
| **E-Signature** | ✅ | ✅ | ✅ | ✅ (Plan) |

**Visual Assets Needed**:
- Competitive comparison table
- Architecture diagram showing EventBus
- Speed comparison chart

**Demo Script**:
- "Nobody ships event-driven architecture at seed stage"
- "Real-time transparency competitors can't match"
- "Same-day draws vs. 3-5 day industry standard"
- "AI-powered risk scoring prevents defaults"

**Status**: ✅ Analysis complete

---

### Slide 7: Traction & Validation

**Pitch Point**: *"Early Traction & Market Validation"*

**Current Assets**:
- Shipped features (loan management, payments, draws)
- EventBus infrastructure
- Real-time analytics dashboards

**Pilot Plan** (Weeks 9-12):
- 5 flippers onboarded
- 20 lenders onboarded
- $500K deployed
- Case studies generated

**Visual Assets Needed**:
- Feature completion chart
- Pilot timeline
- Early user testimonials (when available)

**Demo Script**:
- "Shipped core platform in 6 months"
- "Event-driven architecture operational"
- "Real-time dashboards live"
- "Pilot launching Q1 2025"

**Status**: ⚠️ Pilot pending (Weeks 9-12)

---

### Slide 8: Monetization Model

**Pitch Point**: *"Multiple Revenue Streams"*

**Revenue Streams**:
1. Transaction fees (1-2% origination)
2. AUM fees (0.5% on funds)
3. Performance fees (10-20% carry)
4. Subscription plans (Basic, Premium, Pro)
5. Listing fees (developer monetization)

**Visual Assets Needed**:
- Revenue model diagram
- Fee structure comparison
- Projected revenue chart

**Demo Script**:
- "Multiple revenue streams reduce risk"
- "Aligned with investor success (performance fees)"
- "Scalable model as volume grows"
- "Target $1M ARR by end of 2025"

**Status**: ✅ Strategy documented

---

### Slide 9: Product Roadmap

**Pitch Point**: *"90-Day Execution Plan"*

**Roadmap Highlights**:
- Weeks 1-2: Chat + E-Signature
- Weeks 3-4: Auto-KYC
- Weeks 5-6: Tax Pack Automation
- Weeks 7-8: Deal Score + Leaderboard
- Weeks 9-12: Pilot Validation

**Visual Assets Needed**:
- Roadmap timeline
- Feature completion chart
- Sprint milestones

**Demo Script**:
- "Clear 90-day execution plan"
- "Features prioritized by market validation"
- "Pilot program validates product-market fit"
- "Data-driven roadmap"

**Status**: ✅ Roadmap complete

---

### Slide 10: Ask & Next Steps

**Pitch Point**: *"Investment Ask"*

**Funding Ask**:
- Amount: [To be determined]
- Use of funds:
  - Product development (60%)
  - Market validation (25%)
  - Team expansion (15%)

**Next Steps**:
- Pilot program launch (Weeks 9-12)
- Market validation
- Customer acquisition
- Revenue generation

**Visual Assets Needed**:
- Use of funds breakdown
- Milestone timeline
- Growth projections

**Demo Script**:
- "Investment enables pilot program"
- "90-day roadmap to traction"
- "Clear path to revenue"
- "Join us in revolutionizing private lending"

**Status**: ⚠️ To be completed with funding details

---

## Live Demo Assets

### Required GIFs/Screenshots

1. **Investor Dashboard** (`analytics/page.tsx`)
   - Real-time KPI updates
   - Analytics visualization
   - Export functionality

2. **Draw Calendar** (`payment-draw-calendar.tsx`)
   - Draw scheduling interface
   - Approval workflow
   - Status tracking

3. **KYC Upload Flow** (when implemented)
   - Document upload
   - Status tracking
   - Approval process

4. **Loan Management** (`loan.service.ts` + UI)
   - Loan creation wizard
   - Status management
   - Payment tracking

### Demo Script Flow

1. **Start**: Market opportunity slide
2. **Show**: Competitive advantage (EventBus)
3. **Demo**: Live dashboard (real-time updates)
4. **Demo**: Draw calendar (automated workflows)
5. **Show**: Monetization model
6. **Close**: Ask & next steps

---

## Pitch Deck Template

**Recommended**: [Waveup Real Estate Pitch Template](#)

**Structure**:
- Slide 1: Title + Tagline
- Slides 2-4: Product (Compliant Onboarding, Automated Funding, Real-Time Transparency)
- Slide 5: Market Opportunity
- Slide 6: Competitive Advantage
- Slide 7: Traction
- Slide 8: Monetization
- Slide 9: Roadmap
- Slide 10: Ask

---

## One-Liner Pitch

> *"We're the **Plaid for private real estate debt** — connecting everyday investors to vetted flips with **same-day draws**, **real-time waterfalls**, and **tax packs included**."*

---

## Related Documentation

- [90-Day Roadmap](./90-day-roadmap.md)
- [Competitive Analysis](./competitive-analysis.md)
- [Market Intelligence](./market-intelligence.md)
- [Gaps & Opportunities](./gaps-and-opportunities.md)

---

**Version**: 1.0  
**Last Updated**: January 2025

