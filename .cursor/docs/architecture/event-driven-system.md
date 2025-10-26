# Event-Driven System Architecture

> **Status**: Planned (Sprint 4+)
> **Owner**: Platform Architecture Team

---

## Overview

LendingOS implements an **event-driven architecture** to enable **loosely coupled domains**, **real-time automation**, and **comprehensive audit trails**. This document describes the event system design, implementation patterns, and best practices.

---

## Architecture Components

### 1. Event Bus

Central message broker that routes events between domains.

**Implementation Options**:
- **Phase 1** (Simple): PostgreSQL + LISTEN/NOTIFY
- **Phase 2** (Scalable): PostgreSQL with `pgmq` (message queue extension)
- **Phase 3** (Production): Supabase Realtime + Edge Functions

**Location**: `src/lib/eventBus.ts`

```typescript
// Event Bus Interface
interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handlerId: string): void;
}
```

### 2. Domain Events

Standardized event structure across all domains.

```typescript
interface DomainEvent<TPayload = any> {
  id: string;                    // Unique event ID
  type: string;                  // Event type (e.g., "Loan.Funded")
  domain: string;                // Source domain
  timestamp: Date;               // Event occurrence time
  payload: TPayload;             // Event-specific data
  metadata: {
    userId?: string;             // User who triggered event
    correlationId?: string;      // For tracing related events
    causationId?: string;        // Event that caused this event
  };
}
```

### 3. Event Store

Persistent storage for all events (event sourcing pattern).

**Table**: `domain_events`

```sql
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  aggregate_id UUID NOT NULL,        -- Entity ID (loan, payment, etc.)
  aggregate_type TEXT NOT NULL,      -- Entity type
  payload JSONB NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,

  INDEX idx_event_type ON domain_events(event_type),
  INDEX idx_aggregate ON domain_events(aggregate_type, aggregate_id),
  INDEX idx_occurred_at ON domain_events(occurred_at)
);
```

---

## Event Catalog

### Loan Domain Events

| Event Type | Description | Payload | Triggered By |
|------------|-------------|---------|--------------|
| `Loan.Created` | New loan application submitted | `{ loanId, borrowerId, amount }` | Loan creation API |
| `Loan.Approved` | Loan approved for funding | `{ loanId, approvedBy, approvedAt }` | Approval workflow |
| `Loan.Funded` | Loan funds disbursed | `{ loanId, fundedAmount, fundedAt }` | Funding process |
| `Loan.Modified` | Loan terms changed | `{ loanId, changes, modifiedBy }` | Loan modification |
| `Loan.PaidOff` | Loan fully paid | `{ loanId, finalPaymentId, paidOffAt }` | Payment application |
| `Loan.Defaulted` | Loan entered default | `{ loanId, reason, defaultedAt }` | Collections process |

### Payment Domain Events

| Event Type | Description | Payload | Triggered By |
|------------|-------------|---------|--------------|
| `Payment.Received` | Payment recorded | `{ paymentId, loanId, amount, method }` | Payment API |
| `Payment.Applied` | Payment allocated to principal/interest | `{ paymentId, allocation }` | Payment service |
| `Payment.Late` | Payment past due | `{ loanId, daysLate, amountDue }` | Daily batch job |
| `Payment.Reversed` | Payment reversed | `{ paymentId, reason }` | Manual reversal |
| `PaymentSchedule.Generated` | Amortization schedule created | `{ loanId, scheduleId, payments }` | Loan funding |

### Draw Domain Events

| Event Type | Description | Payload | Triggered By |
|------------|-------------|---------|--------------|
| `Draw.Requested` | Draw request submitted | `{ drawId, loanId, amount }` | Draw request API |
| `Draw.Approved` | Draw approved | `{ drawId, approvedAmount, approvedBy }` | Approval workflow |
| `Draw.Inspected` | Inspection completed | `{ drawId, inspectionId, result }` | Inspection completion |
| `Draw.Disbursed` | Draw funds released | `{ drawId, amount, disbursedAt }` | Disbursement process |
| `Draw.Rejected` | Draw request denied | `{ drawId, reason, rejectedBy }` | Approval workflow |

### Borrower Domain Events

| Event Type | Description | Payload | Triggered By |
|------------|-------------|---------|--------------|
| `Borrower.Created` | New borrower added | `{ borrowerId, type }` | Borrower creation API |
| `Borrower.KYCApproved` | KYC verification passed | `{ borrowerId, verifiedAt }` | KYC integration |
| `Borrower.KYCFailed` | KYC verification failed | `{ borrowerId, reason }` | KYC integration |
| `Borrower.Flagged` | Borrower flagged for review | `{ borrowerId, reason }` | Fraud detection |

### Fund Domain Events (Planned)

| Event Type | Description | Payload | Triggered By |
|------------|-------------|---------|--------------|
| `Fund.Created` | New fund established | `{ fundId, name, structure }` | Fund setup |
| `Commitment.Activated` | Investor commitment active | `{ commitmentId, investorId, amount }` | Investor onboarding |
| `CapitalCall.Issued` | Capital call sent to investors | `{ callId, fundId, amount }` | Capital management |
| `Distribution.Calculated` | Distribution amounts calculated | `{ distributionId, fundId, amounts }` | Distribution process |

### Compliance Domain Events (Planned)

| Event Type | Description | Payload | Triggered By |
|------------|-------------|---------|--------------|
| `Filing.Due` | Regulatory filing due soon | `{ filingId, dueDate, type }` | Scheduled reminder |
| `Document.Generated` | Compliance document created | `{ documentId, type, loanId }` | Document generation |
| `Document.Signed` | Document executed | `{ documentId, signedBy, signedAt }` | E-signature integration |
| `License.Expiring` | License expiration approaching | `{ licenseId, expiresAt }` | License monitoring |

---

## Event Flow Patterns

### Pattern 1: Chain Reaction

One event triggers multiple subsequent events.

```
Loan.Funded
  └─> PaymentSchedule.Generated
  └─> Compliance.DocGenerated
  └─> Fund.CapitalAllocated
  └─> Notification.Sent
```

### Pattern 2: Aggregation

Multiple events contribute to a single outcome.

```
Draw.Requested
  └─> Inspection.Scheduled
      └─> Inspection.Completed
          └─> Draw.Approved
              └─> Draw.Disbursed
```

### Pattern 3: Event Sourcing

Rebuild state from event history.

```
getAllEvents(loanId)
  └─> Loan.Created
  └─> Loan.Funded
  └─> Payment.Received (x12)
  └─> Loan.PaidOff
= Current Loan State
```

---

## Implementation Guide

### 1. Publishing Events

```typescript
// In any service (e.g., loan.service.ts)
import { eventBus } from '@/lib/eventBus';

async function fundLoan(loanId: string, amount: number) {
  // 1. Perform business logic
  const loan = await db.update(loans)
    .set({ status: 'active', fundedAt: new Date() })
    .where(eq(loans.id, loanId))
    .returning();

  // 2. Publish event
  await eventBus.publish({
    type: 'Loan.Funded',
    domain: 'loan',
    payload: {
      loanId: loan.id,
      fundedAmount: amount,
      fundedAt: loan.fundedAt
    },
    metadata: {
      userId: getCurrentUser(),
      correlationId: generateId()
    }
  });

  return loan;
}
```

### 2. Subscribing to Events

```typescript
// In event handlers (e.g., lib/eventHandlers/paymentHandlers.ts)
import { eventBus } from '@/lib/eventBus';
import { PaymentService } from '@/services/payment.service';

eventBus.subscribe('Loan.Funded', async (event) => {
  // Generate payment schedule when loan is funded
  await PaymentService.generatePaymentSchedule(event.payload.loanId);
});

eventBus.subscribe('Loan.Modified', async (event) => {
  // Regenerate schedule if loan terms change
  await PaymentService.updatePaymentSchedule(event.payload.loanId);
});
```

### 3. Event Handler Organization

```
src/lib/eventHandlers/
├── loanHandlers.ts          # Handlers for loan events
├── paymentHandlers.ts       # Handlers for payment events
├── drawHandlers.ts          # Handlers for draw events
├── complianceHandlers.ts    # Handlers for compliance events
└── index.ts                 # Register all handlers
```

---

## Best Practices

### Event Naming

- **Format**: `Domain.Action` (PascalCase)
- **Examples**: `Loan.Created`, `Payment.Received`, `Document.Signed`
- **Avoid**: `LoanCreated`, `loan-created`, `LOAN_CREATED`

### Event Payload Design

✅ **Do**:
- Include minimum necessary data
- Use consistent field names
- Include timestamps
- Include relevant IDs

❌ **Don't**:
- Include sensitive data (SSN, passwords)
- Include entire entity (just send ID)
- Include computed/derived data
- Change payload structure (versioning instead)

### Event Handler Rules

1. **Idempotent**: Handlers should be safe to run multiple times
2. **Error Handling**: Handle failures gracefully, retry if needed
3. **Logging**: Log all event processing for debugging
4. **Performance**: Keep handlers fast, defer heavy work to background jobs

---

## Error Handling

### Dead Letter Queue

Failed events are moved to a DLQ for manual review.

```sql
CREATE TABLE event_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES domain_events(id),
  handler_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Retry Strategy

- **Immediate retry**: Up to 3 attempts with exponential backoff
- **Delayed retry**: Move to delayed queue after immediate retries
- **Manual intervention**: After 5 total failures, alert ops team

---

## Monitoring & Observability

### Metrics to Track

- Events published per minute
- Event processing latency
- Failed event rate
- Handler execution time
- Event queue depth

### Logging

```typescript
logger.info('Event published', {
  eventType: event.type,
  eventId: event.id,
  domain: event.domain,
  correlationId: event.metadata.correlationId
});
```

---

## Testing Events

### Unit Tests

```typescript
describe('LoanService.fundLoan', () => {
  it('should publish Loan.Funded event', async () => {
    const mockPublish = jest.spyOn(eventBus, 'publish');

    await LoanService.fundLoan(loanId, amount);

    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Loan.Funded',
        payload: expect.objectContaining({ loanId })
      })
    );
  });
});
```

### Integration Tests

```typescript
describe('Event Flow: Loan Funding', () => {
  it('should trigger payment schedule generation', async () => {
    // Fund loan (publishes event)
    await LoanService.fundLoan(loanId, amount);

    // Wait for event processing
    await waitForEvent('PaymentSchedule.Generated');

    // Verify schedule was created
    const schedule = await PaymentService.getSchedule(loanId);
    expect(schedule).toBeDefined();
  });
});
```

---

## Migration Strategy

### Phase 1: Event Logging Only
- Publish events but don't act on them
- Build event catalog and validate payloads
- Monitor event volume and patterns

### Phase 2: Selected Automations
- Enable event handlers for non-critical workflows
- Analytics and reporting via events
- Notification system

### Phase 3: Full Event-Driven
- All cross-domain communication via events
- Event sourcing for key aggregates
- Real-time dashboards and analytics

---

## Future Enhancements

- [ ] Event versioning strategy
- [ ] Event replay capability
- [ ] Real-time event streaming to dashboards
- [ ] External webhooks for events
- [ ] Event-driven analytics pipeline
- [ ] GraphQL subscriptions for real-time UI updates

---

## Related Documentation

- [Domain Architecture v2](./domain-architecture-v2.md)
- [Event Catalog](./event-catalog.md)
- [Integration Adapters](./integration-adapters.md)
- [Migration Guide](./migration-v1-to-v2.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
**Status**: Design Phase
