# Migration Guide: v1 (Route-Centric) → v2 (Domain-Centric)

> **Status**: Planning Phase
> **Target Completion**: Sprint 4-5

---

## Overview

This guide outlines the migration path from the current **route-centric colocation** architecture (v1) to the evolved **domain-centric colocation** architecture (v2).

The migration is designed to be **incremental and non-breaking**, allowing continued development while gradually adopting new patterns.

---

## Current State (v1)

### Characteristics

- ✅ Route-based organization (applications, approvals, payments)
- ✅ UI components colocated with routes
- ✅ Centralized services in `src/services/`
- ✅ API endpoints grouped by resource type
- ❌ Cross-domain logic scattered
- ❌ No event-driven automation
- ❌ Limited domain boundaries

### File Structure (v1)

```
src/app/
├── api/v1/
│   ├── loans/          # All loan endpoints
│   ├── payments/       # Payment endpoints
│   ├── borrowers/      # Borrower endpoints
│   └── lenders/        # Lender endpoints
└── (main)/dashboard/
    ├── loans/          # Loan UI routes
    ├── borrowers/      # Borrower UI routes
    └── lenders/        # Lender UI routes
```

---

## Target State (v2)

### Characteristics

- ✅ Domain-based organization (Loan, Borrower, Fund, Payment, Compliance)
- ✅ Vertical slices: UI + API + data + logic per domain
- ✅ Event bus for cross-domain communication
- ✅ Clear domain boundaries
- ✅ Automation via events
- ✅ Independent domain deployment capability

### File Structure (v2)

```
src/app/
├── (main)/
│   ├── loans/
│   │   ├── applications/
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts
│   │   │   ├── schema.ts
│   │   │   ├── db.ts
│   │   │   └── _components/
│   │   ├── payments/       # Nested under loans
│   │   └── draws/          # Nested under loans
│   ├── borrowers/
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   └── db.ts
│   └── funds/              # New domain
├── api/v2/                 # New versioned API
│   ├── loans/
│   ├── borrowers/
│   └── funds/
└── lib/
    └── eventBus.ts         # New
```

---

## Migration Phases

### Phase 1: Foundation (Sprint 4) - PLANNING

**Goal**: Set up event infrastructure and domain rules without breaking changes.

#### Tasks

1. **Create Event Bus**
   - Implement `src/lib/eventBus.ts`
   - Set up `domain_events` table
   - Add event publishing to existing services (logging only)

2. **Establish Domain Rules**
   - Document domain boundaries
   - Create `.cursor/rules/domain-rules.md`
   - Define cross-domain communication patterns

3. **Set Up API v2 Structure**
   - Create `src/app/api/v2/` directory
   - Keep v1 endpoints unchanged
   - Plan API versioning strategy

**Deliverables**:
- ✅ Event bus implementation
- ✅ Domain rules documentation
- ✅ API v2 structure
- ✅ No breaking changes to v1

---

### Phase 2: Domain Colocation (Sprint 5) - GRADUAL MIGRATION

**Goal**: Introduce domain colocation patterns alongside existing structure.

#### Tasks

1. **Migrate Loan Domain**
   - Move loan-specific logic to `loans/` domain folder
   - Add `actions.ts`, `schema.ts`, `db.ts` to loan routes
   - Create domain-specific API endpoints in `/api/v2/loans/`
   - Keep v1 endpoints as wrappers to new services

2. **Migrate Payment Domain**
   - Nest payments under `loans/payments/`
   - Colocate payment UI, logic, and data
   - Publish payment events to event bus

3. **Migrate Borrower Domain**
   - Consolidate borrower management
   - Add borrower-specific schemas and actions
   - Implement borrower events

**Deliverables**:
- ✅ 3 domains migrated to new structure
- ✅ v1 API still functional
- ✅ Events being published
- ⚠️ No breaking changes (dual maintenance)

---

### Phase 3: Event-Driven Automation (Sprint 6)

**Goal**: Enable event handlers and automation workflows.

#### Tasks

1. **Implement Event Handlers**
   - Create `src/lib/eventHandlers/`
   - Subscribe to key events (Loan.Funded, Payment.Received)
   - Automate payment schedule generation

2. **Analytics Pipeline**
   - Event-driven analytics aggregation
   - Real-time dashboard updates

3. **Notification System**
   - Email/SMS triggered by events
   - Borrower and lender notifications

**Deliverables**:
- ✅ Event handlers functional
- ✅ Automated workflows active
- ✅ Notification system live

---

### Phase 4: Integration & New Domains (Sprint 7-8)

**Goal**: Add Fund and Compliance domains, complete migration.

#### Tasks

1. **Add Fund Domain**
   - Implement investor management
   - Capital call and distribution logic
   - Fund-level reporting

2. **Add Compliance Domain**
   - Document generation automation
   - Filing deadline tracking
   - Audit trail implementation

3. **Integration Adapters**
   - Banking integration (`/integrations/banking/`)
   - DocuSign adapter
   - KYC/AML integration

**Deliverables**:
- ✅ All 5 domains operational
- ✅ Integration adapters functional
- ✅ Event-driven system complete

---

### Phase 5: Deprecation & Cleanup (Sprint 9)

**Goal**: Deprecate v1 API, remove duplicate code.

#### Tasks

1. **Deprecate v1 API**
   - Add deprecation warnings to v1 endpoints
   - Migrate all internal calls to v2
   - Set sunset date for v1 (3-6 months)

2. **Code Cleanup**
   - Remove duplicate service code
   - Consolidate shared utilities
   - Update all documentation

3. **Performance Optimization**
   - Optimize event processing
   - Database query optimization
   - Caching strategy

**Deliverables**:
- ✅ v1 API deprecated (not removed)
- ✅ All code consolidated
- ✅ Performance benchmarks met

---

## Breaking Changes Log

### None (v1 → v2 Migration)

The migration is designed to be **non-breaking**. All v1 endpoints will remain functional during the transition.

### API v1 Deprecation Timeline

| Date | Milestone |
|------|-----------|
| Sprint 4 | v2 API introduced alongside v1 |
| Sprint 6 | Internal systems migrated to v2 |
| Sprint 9 | v1 API deprecated, sunset date announced |
| 6 months post-Sprint 9 | v1 API removed |

---

## Migration Checklist

### For Each Domain

- [ ] Create domain folder structure
- [ ] Move UI components to `_components/`
- [ ] Create `actions.ts` for server actions
- [ ] Create `schema.ts` for Zod validation
- [ ] Create `db.ts` for data access
- [ ] Create v2 API endpoints
- [ ] Update service layer to publish events
- [ ] Create event handlers
- [ ] Update documentation
- [ ] Write migration tests

---

## Testing Strategy

### Regression Testing

Ensure all v1 functionality still works during migration.

```typescript
describe('v1 API Backward Compatibility', () => {
  it('should maintain v1 loan endpoints', async () => {
    const response = await fetch('/api/v1/loans');
    expect(response.status).toBe(200);
  });

  it('should return same data structure as before', async () => {
    const v1Data = await fetch('/api/v1/loans/123');
    // Verify v1 contract maintained
  });
});
```

### Integration Testing

Verify event flow and domain interactions.

```typescript
describe('Domain Event Integration', () => {
  it('should trigger payment schedule on loan funding', async () => {
    await LoanService.fundLoan(loanId);
    await waitForEvent('PaymentSchedule.Generated');
    const schedule = await PaymentService.getSchedule(loanId);
    expect(schedule).toBeDefined();
  });
});
```

---

## Rollback Plan

### If Migration Issues Arise

1. **Event Bus Failure**
   - Disable event handlers
   - Fall back to direct service calls
   - Event publishing continues (for audit)

2. **Performance Degradation**
   - Add caching layer
   - Optimize slow queries
   - Scale database if needed

3. **Data Inconsistency**
   - Pause event processing
   - Run data reconciliation scripts
   - Resume after validation

### Emergency Rollback

If critical issues occur:

1. Disable v2 API endpoints
2. Route all traffic to v1
3. Disable event handlers
4. Investigate and fix issues
5. Gradual re-enable after fixes

---

## Communication Plan

### Internal Team

- Weekly migration standup
- Sprint demos of migrated domains
- Documentation updates in Notion/Confluence
- Slack channel: `#lending-os-migration`

### External (If Applicable)

- API changelog published
- Deprecation notices sent
- Migration guides for API consumers
- Support during transition

---

## Success Metrics

### Technical Metrics

- [ ] All domains migrated to new structure
- [ ] Event system handling >1000 events/day
- [ ] API response time < 200ms (same as v1)
- [ ] Zero data loss during migration
- [ ] Test coverage >80% for new code

### Business Metrics

- [ ] No user-facing disruptions
- [ ] Developer velocity maintained or improved
- [ ] Reduced cross-domain coupling
- [ ] Faster feature delivery post-migration

---

## Related Documentation

- [Domain Architecture v2](./domain-architecture-v2.md)
- [Event-Driven System](./event-driven-system.md)
- [Domain Rules](../../rules/domain-rules.md)
- [API Versioning](../technical/api-versioning.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
**Status**: Planning Phase
