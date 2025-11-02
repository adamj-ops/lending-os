# Compliance Domain

> **Domain Owner**: Legal & Compliance Team
> **Status**: Planned (Sprint 5+)

---

## Overview

The **Compliance Domain** ensures LendingOS meets all regulatory requirements, manages required documentation, and automates compliance workflows.

---

## Responsibilities

- Regulatory filing management
- Document generation and retention
- Licensing and permit tracking
- Disclosure management (TILA, RESPA, state disclosures)
- Audit trail and record keeping
- Compliance reporting
- PPM and subscription document management

---

## Data Models

### Planned Tables

- `compliance_filings` - Regulatory filing records
- `disclosures` - Required disclosure documents
- `licenses` - Lender licenses and permits
- `audit_logs` - Comprehensive audit trail
- `document_retention` - Document retention policies
- `compliance_rules` - Configurable compliance rules

---

## Events Emitted

- `Filing.Due`
- `Filing.Submitted`
- `License.Expiring`
- `Document.Generated`
- `Document.Signed`
- `Document.Expired`
- `Audit.Created`
- `Compliance.ViolationDetected`

---

## API Endpoints (Planned)

- `GET /api/v1/compliance/filings` - List upcoming filings
- `POST /api/v1/compliance/filings` - Create filing
- `GET /api/v1/compliance/licenses` - License status
- `GET /api/v1/compliance/audit-log` - Audit trail
- `POST /api/v1/compliance/documents/generate` - Generate compliance doc

---

## UI Components (Planned)

Located in: `src/app/(main)/dashboard/compliance/`

- `ComplianceDashboard` - Overview of compliance status
- `FilingCalendar` - Upcoming filing deadlines
- `LicenseTracker` - Track license expiration
- `AuditLogViewer` - Search and view audit logs
- `DocumentGenerator` - Generate required documents
- `ComplianceReports` - Compliance reporting

---

## Business Rules

### Document Retention

- Loan documents: 7 years after loan payoff
- Payment records: 7 years
- KYC documents: Duration of relationship + 5 years
- Investor documents: Life of fund + 7 years

### Required Disclosures

- **TILA** (Truth in Lending): Required for consumer loans
- **RESPA** (Real Estate Settlement): Required for residential
- **State disclosures**: Varies by state and loan type
- **PPM** (Private Placement Memorandum): Required for fund investors

### Licensing Requirements

- State lending licenses (varies by state)
- NMLS registration (if applicable)
- Business licenses
- Annual renewal tracking

---

## Integration Points

### External Services

- **DocuSign/Dropbox Sign**: Document execution
- **E-filing Services**: Regulatory filing submission
- **Document Storage**: Long-term retention (AWS S3, Box)
- **Compliance Monitoring**: Third-party compliance tools

### Internal Events

**Subscribes To**:
- `Loan.Created` - Generate required disclosures
- `Loan.Funded` - Create audit records
- `Investor.Onboarded` - Generate PPM, subscription docs
- `Payment.Received` - Audit payment application

**Publishes**:
- All compliance events listed above

---

## Automation Opportunities

- **Document Generation**: Auto-generate disclosures based on loan parameters
- **Filing Reminders**: Automated reminders for upcoming deadlines
- **License Monitoring**: Alert before license expiration
- **Audit Trail**: Automatic comprehensive logging
- **Compliance Checks**: Real-time validation of regulatory requirements

---

## E-Signature Integration (Implementation Plan)

**Current State**: Planned, no e-signature capability for loan agreements, PPMs, subscription docs

**Market Validation**: 
- Industry standard for investor platforms
- Required for SEC Reg D 506(c) compliance
- Critical for same-day deal closing

**Implementation**:
- Integrate DocuSign/SignNow into borrower and fund onboarding flows
- Support document templates:
  - Loan agreements
  - PPM documents
  - Subscription agreements
  - Compliance disclosures

**Technical Requirements**:
- Create `SignatureService` integration layer (`src/services/signature.service.ts`)
- Add `document_signatures` table
- Webhook handlers for signature completion
- Template management system
- Integration with event bus for automated workflows

**Success Metrics**:
- Document signature completion: <2 hours (vs. 2-3 days baseline)
- 80% of documents signed electronically
- Zero manual signature processes

**Sprint Assignment**: Sprint 6 (Compliance Domain) - Phase 1 (Weeks 1-2)

**Reference**: [Gaps & Opportunities](../product-strategy/gaps-and-opportunities.md), [90-Day Roadmap](../product-strategy/90-day-roadmap.md)

---

## Future Features

- [ ] Automated disclosure generation
- [ ] Compliance workflow automation
- [ ] License renewal tracking with alerts
- [ ] Regulatory change monitoring
- [ ] Compliance scoring and risk assessment
- [ ] Automated audit report generation
- [x] Document e-signature workflow - *Planned Sprint 6, Weeks 1-2*
- [ ] Multi-state compliance management

---

## Related Documentation

- [Loan Domain](./loan-domain.md)
- [Fund Domain](./fund-domain.md)
- [Event Catalog](../architecture/event-catalog.md)
- [Gaps & Opportunities](../product-strategy/gaps-and-opportunities.md) - E-signature integration priority
- [90-Day Roadmap](../product-strategy/90-day-roadmap.md) - Weeks 1-2 implementation plan

---

**Version**: 0.2 (Planned)
**Last Updated**: January 2025
**Status**: Design Phase - E-Signature integration planned Sprint 6
