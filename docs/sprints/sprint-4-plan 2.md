# Sprint 4: Event Bus Foundation & Domain Migration

> **Timeline**: 2 weeks
> **Status**: 📋 Planning
> **Focus**: Event-driven architecture foundation & domain-centric migration

---

## 🎯 Sprint Objectives

1. **Implement Event Bus Infrastructure** - Core event system for domain communication
2. **Begin Domain Migration** - Migrate Loan and Payment domains to colocated structure
3. **Create Payment/Draw UI Components** - Properly integrated UI for Sprint 3 features
4. **Establish Domain Boundaries** - Clear separation and ownership

---

## 📦 Deliverables

### 1. Event Bus Implementation

**Goal**: Create a lightweight, PostgreSQL-based event system for domain communication.

#### Files to Create

```
src/lib/
├── events/
│   ├── eventBus.ts           # Core event bus implementation
│   ├── eventStore.ts          # Event persistence layer
│   ├── eventTypes.ts          # Event type definitions
│   └── eventHandlers/         # Event handler registry
│       ├── index.ts           # Handler registration
│       ├── loanHandlers.ts    # Loan event handlers
│       ├── paymentHandlers.ts # Payment event handlers
│       └── drawHandlers.ts    # Draw event handlers
```

#### Database Schema

```sql
-- Event Store Table
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,

  INDEX idx_event_type (event_type),
  INDEX idx_aggregate (aggregate_type, aggregate_id),
  INDEX idx_occurred_at (occurred_at),
  INDEX idx_unprocessed (processed_at) WHERE processed_at IS NULL
);

-- Event Subscriptions (for future use)
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  handler_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Event Bus API

```typescript
interface EventBus {
  // Publishing
  publish<T>(event: DomainEvent<T>): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;

  // Subscribing
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handlerId: string): void;

  // Event Store
  getEventHistory(aggregateId: string): Promise<DomainEvent[]>;
  replayEvents(aggregateId: string, fromDate?: Date): Promise<void>;
}
```

#### Implementation Strategy

**Phase 4.1: Core Event Bus (Days 1-2)**
- Create `eventBus.ts` with publish/subscribe pattern
- Implement `eventStore.ts` for PostgreSQL persistence
- Add event type definitions
- Write unit tests

**Phase 4.2: Event Handlers (Days 3-4)**
- Create handler registration system
- Implement payment schedule auto-generation handler
- Implement draw status change handlers
- Add error handling and retries

**Phase 4.3: Integration (Day 5)**
- Update existing services to publish events
- Keep them as "log-only" (no side effects yet)
- Monitor event flow
- Validate event payloads

---

### 2. Domain Migration - Loan Domain

**Goal**: Migrate Loan domain to colocated structure with actions, schemas, and data logic.

#### Target Structure

```
src/app/(main)/loans/
├── page.tsx                  # Loan list page (existing)
├── actions.ts                # NEW - Server actions for loans
├── schema.ts                 # NEW - Zod schemas for validation
├── _components/              # Move existing components here
│   ├── loan-table.tsx
│   ├── loan-detail-drawer.tsx
│   └── loan-status-badge.tsx
├── applications/
│   ├── page.tsx
│   ├── actions.ts            # NEW - Application-specific actions
│   ├── schema.ts             # NEW - Application validation
│   └── _components/
│       └── loan-wizard.tsx
├── active/
│   ├── [id]/
│   │   ├── page.tsx          # Individual loan page
│   │   ├── actions.ts        # NEW - Loan-specific actions
│   │   └── _components/
│   │       ├── overview-tab.tsx
│   │       ├── payments-tab.tsx
│   │       ├── draws-tab.tsx
│   │       ├── documents-tab.tsx
│   │       └── notes-tab.tsx
├── payments/                  # NEW - Nested payment management
│   ├── page.tsx
│   ├── actions.ts
│   ├── schema.ts
│   └── _components/
│       ├── payment-entry-form.tsx
│       ├── payment-history-table.tsx
│       └── payment-schedule-view.tsx
└── draws/                     # NEW - Nested draw management
    ├── page.tsx
    ├── actions.ts
    ├── schema.ts
    └── _components/
        ├── draw-request-form.tsx
        ├── draw-approval-workflow.tsx
        └── draw-timeline.tsx
```

#### Migration Tasks

**Phase 4.4: Create Domain Actions (Days 6-7)**

Create `src/app/(main)/loans/actions.ts`:
```typescript
'use server'

import { LoanService } from '@/services/loan.service'
import { eventBus } from '@/lib/events/eventBus'
import { loanSchema, updateLoanSchema } from './schema'

export async function createLoan(formData: FormData) {
  const validated = loanSchema.parse(Object.fromEntries(formData))
  const loan = await LoanService.createLoan(validated)

  await eventBus.publish({
    type: 'Loan.Created',
    domain: 'loan',
    payload: { loanId: loan.id, borrowerId: loan.borrowerId }
  })

  return { success: true, loanId: loan.id }
}

export async function updateLoanStatus(loanId: string, status: string) {
  const loan = await LoanService.updateLoanStatus(loanId, status)

  await eventBus.publish({
    type: 'Loan.StatusChanged',
    domain: 'loan',
    payload: { loanId, oldStatus: loan.previousStatus, newStatus: status }
  })

  return { success: true }
}
```

Create `src/app/(main)/loans/schema.ts`:
```typescript
import { z } from 'zod'

export const loanSchema = z.object({
  borrowerId: z.string().uuid(),
  lenderId: z.string().uuid(),
  propertyId: z.string().uuid(),
  amount: z.number().positive(),
  interestRate: z.number().min(0).max(100),
  term: z.number().int().min(1).max(360),
  // ... other fields
})

export const updateLoanSchema = loanSchema.partial()

export type LoanFormData = z.infer<typeof loanSchema>
```

**Phase 4.5: Migrate Payment Domain (Days 8-9)**
- Create `loans/payments/` folder structure
- Build payment action handlers
- Create payment schemas
- Build payment UI components

**Phase 4.6: Migrate Draw Domain (Day 10)**
- Create `loans/draws/` folder structure
- Build draw action handlers
- Create draw schemas
- Build draw UI components

---

### 3. Payment & Draw UI Components

**Goal**: Create production-ready, properly integrated UI components for payment and draw management.

#### Payment Components

**3.1: Payment Entry Form**
```typescript
// src/app/(main)/loans/payments/_components/payment-entry-form.tsx
interface PaymentEntryFormProps {
  loanId: string
  onSuccess?: (paymentId: string) => void
}

export function PaymentEntryForm({ loanId, onSuccess }: PaymentEntryFormProps) {
  // Form for recording new payments
  // - Payment type selection (principal, interest, combined)
  // - Amount input with breakdown
  // - Payment method selection
  // - Transaction reference
  // - Date picker
  // - Notes field
}
```

**3.2: Payment History Table**
```typescript
// src/app/(main)/loans/payments/_components/payment-history-table.tsx
interface PaymentHistoryTableProps {
  loanId: string
  filters?: PaymentFilters
}

export function PaymentHistoryTable({ loanId, filters }: PaymentHistoryTableProps) {
  // Data table showing payment history
  // - Sortable columns (date, amount, method, status)
  // - Filterable by date range, method, status
  // - Row actions (view details, edit, reverse)
  // - Export to CSV
}
```

**3.3: Payment Schedule View**
```typescript
// src/app/(main)/loans/payments/_components/payment-schedule-view.tsx
interface PaymentScheduleViewProps {
  loanId: string
  scheduleType: 'amortized' | 'interest_only' | 'balloon'
}

export function PaymentScheduleView({ loanId, scheduleType }: PaymentScheduleViewProps) {
  // Display generated payment schedule
  // - Schedule table with payment breakdown
  // - Progress indicator (payments made vs scheduled)
  // - Next payment due date highlighted
  // - Option to regenerate schedule
}
```

**3.4: Balance Summary Cards**
```typescript
// src/app/(main)/loans/payments/_components/balance-summary-cards.tsx
export function BalanceSummaryCards({ loanId }: { loanId: string }) {
  // Display current loan balance information
  // - Principal balance
  // - Interest accrued
  // - Total outstanding
  // - Next payment due
  // - Last payment received
}
```

#### Draw Components

**3.5: Draw Request Form**
```typescript
// src/app/(main)/loans/draws/_components/draw-request-form.tsx
interface DrawRequestFormProps {
  loanId: string
  onSuccess?: (drawId: string) => void
}

export function DrawRequestForm({ loanId, onSuccess }: DrawRequestFormProps) {
  // Form for creating draw requests
  // - Amount requested input
  // - Work description textarea
  // - Budget line item selector (from draw schedule)
  // - Contractor information
  // - Expected completion date
  // - Supporting documents upload
}
```

**3.6: Draw Approval Workflow**
```typescript
// src/app/(main)/loans/draws/_components/draw-approval-workflow.tsx
interface DrawApprovalWorkflowProps {
  drawId: string
  onStatusChange?: (newStatus: string) => void
}

export function DrawApprovalWorkflow({ drawId, onStatusChange }: DrawApprovalWorkflowProps) {
  // Draw approval interface
  // - Draw details display
  // - Workflow status visualization
  // - Approve/reject actions
  // - Inspection scheduling
  // - Notes and comments
}
```

**3.7: Draw Timeline**
```typescript
// src/app/(main)/loans/draws/_components/draw-timeline.tsx
export function DrawTimeline({ loanId }: { loanId: string }) {
  // Visual timeline of all draws
  // - Chronological display
  // - Status indicators
  // - Budget utilization visualization
  // - Milestone markers
}
```

---

### 4. API v2 Foundation

**Goal**: Set up API v2 structure for domain-centric endpoints.

#### Directory Structure

```
src/app/api/v2/
├── loans/
│   ├── route.ts              # GET /api/v2/loans, POST /api/v2/loans
│   ├── [id]/
│   │   ├── route.ts          # GET/PATCH/DELETE /api/v2/loans/:id
│   │   ├── payments/
│   │   │   └── route.ts      # GET/POST /api/v2/loans/:id/payments
│   │   └── draws/
│   │       └── route.ts      # GET/POST /api/v2/loans/:id/draws
├── borrowers/
│   └── route.ts              # Borrower endpoints
└── middleware.ts             # v2 API middleware
```

#### API v2 Characteristics

- **RESTful**: Consistent REST patterns
- **Versioned**: Clear v1 vs v2 separation
- **Event-aware**: All mutations publish events
- **Validated**: Zod schema validation
- **Typed**: Full TypeScript types
- **Documented**: OpenAPI/Swagger docs

---

## 🔧 Technical Implementation Details

### Event Bus Implementation

**Option 1: PostgreSQL LISTEN/NOTIFY (Simple)**
```typescript
// lib/events/eventBus.ts
import { db } from '@/db/client'

class PostgresEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>()

  async publish<T>(event: DomainEvent<T>) {
    // 1. Store event in domain_events table
    await db.insert(domainEvents).values({
      eventType: event.type,
      domain: event.domain,
      aggregateId: event.aggregateId,
      payload: event.payload,
      metadata: event.metadata,
    })

    // 2. Trigger handlers synchronously (for now)
    const handlers = this.handlers.get(event.type) || []
    await Promise.all(handlers.map(h => h(event)))
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>) {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)
  }
}
```

**Option 2: pgmq (Scalable)**
- Use PostgreSQL message queue extension
- Better for production with high event volume
- Deferred for Sprint 5+

### Service Layer Updates

**Pattern: Publish events after state changes**

```typescript
// services/loan.service.ts
export class LoanService {
  static async fundLoan(loanId: string, amount: number) {
    // 1. Business logic
    const loan = await db.update(loans)
      .set({ status: 'active', fundedAt: new Date() })
      .where(eq(loans.id, loanId))
      .returning()

    // 2. Publish event
    await eventBus.publish({
      type: 'Loan.Funded',
      domain: 'loan',
      aggregateId: loanId,
      aggregateType: 'loan',
      payload: {
        loanId,
        fundedAmount: amount,
        fundedAt: loan.fundedAt
      },
      metadata: {
        userId: getCurrentUser(),
        correlationId: generateId()
      }
    })

    return loan
  }
}
```

### Event Handler Registration

```typescript
// lib/events/eventHandlers/index.ts
import { eventBus } from '../eventBus'
import { registerLoanHandlers } from './loanHandlers'
import { registerPaymentHandlers } from './paymentHandlers'

export function registerAllHandlers() {
  registerLoanHandlers(eventBus)
  registerPaymentHandlers(eventBus)
}

// Call on app startup
registerAllHandlers()
```

```typescript
// lib/events/eventHandlers/paymentHandlers.ts
import { EventBus } from '../eventBus'
import { PaymentService } from '@/services/payment.service'

export function registerPaymentHandlers(bus: EventBus) {
  // Auto-generate payment schedule when loan is funded
  bus.subscribe('Loan.Funded', async (event) => {
    await PaymentService.generatePaymentSchedule(event.payload.loanId)
  })

  // Recalculate schedule when loan terms change
  bus.subscribe('Loan.Modified', async (event) => {
    await PaymentService.updatePaymentSchedule(event.payload.loanId)
  })
}
```

---

## 📅 Sprint 4 Timeline

### Week 1: Event Infrastructure & Domain Setup

| Day | Focus | Deliverables |
|-----|-------|-------------|
| **Mon** | Event Bus Core | eventBus.ts, eventStore.ts, DB migration |
| **Tue** | Event Types & Handlers | eventTypes.ts, handler registry |
| **Wed** | Service Integration | Update loan/payment services to publish events |
| **Thu** | Loan Domain Actions | loans/actions.ts, loans/schema.ts |
| **Fri** | Testing & Documentation | Unit tests, event flow validation |

### Week 2: UI Components & Migration

| Day | Focus | Deliverables |
|-----|-------|-------------|
| **Mon** | Payment UI Components | PaymentEntryForm, PaymentHistoryTable |
| **Tue** | Payment Schedule UI | PaymentScheduleView, BalanceSummaryCards |
| **Wed** | Draw UI Components | DrawRequestForm, DrawApprovalWorkflow |
| **Thu** | Draw Timeline & Integration | DrawTimeline, full integration testing |
| **Fri** | API v2 Setup & Polish | v2 endpoints, documentation, cleanup |

---

## ✅ Acceptance Criteria

### Event Bus
- [ ] Events are published for all loan state changes
- [ ] Events are persisted in domain_events table
- [ ] Handlers execute successfully
- [ ] Payment schedule auto-generates on Loan.Funded
- [ ] Event history can be retrieved
- [ ] All events have proper types and schemas
- [ ] Unit tests pass (>80% coverage)

### Domain Migration
- [ ] Loan domain has colocated actions.ts and schema.ts
- [ ] Payment domain nested under loans/payments/
- [ ] Draw domain nested under loans/draws/
- [ ] All forms use server actions
- [ ] Validation uses Zod schemas
- [ ] Clear domain boundaries established

### UI Components
- [ ] Payment entry form functional and integrated
- [ ] Payment history displays correctly
- [ ] Payment schedule generates and displays
- [ ] Draw request form functional
- [ ] Draw approval workflow operational
- [ ] All components responsive and accessible
- [ ] Components follow Shadcn UI patterns

### API v2
- [ ] v2 endpoint structure created
- [ ] v1 endpoints remain functional
- [ ] All mutations publish events
- [ ] Proper error handling
- [ ] API documentation updated

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// lib/events/__tests__/eventBus.test.ts
describe('EventBus', () => {
  it('should publish events to database', async () => {
    await eventBus.publish({
      type: 'Loan.Created',
      domain: 'loan',
      payload: { loanId: 'test-123' }
    })

    const events = await getEvents('Loan.Created')
    expect(events).toHaveLength(1)
  })

  it('should trigger registered handlers', async () => {
    const handler = jest.fn()
    eventBus.subscribe('Loan.Funded', handler)

    await eventBus.publish({
      type: 'Loan.Funded',
      domain: 'loan',
      payload: { loanId: 'test-123' }
    })

    expect(handler).toHaveBeenCalled()
  })
})
```

### Integration Tests
```typescript
// __tests__/integration/loan-funding-flow.test.ts
describe('Loan Funding Flow', () => {
  it('should generate payment schedule when loan is funded', async () => {
    // Fund loan (publishes event)
    await LoanService.fundLoan(loanId, 100000)

    // Wait for event handler to process
    await waitForEvent('PaymentSchedule.Generated')

    // Verify schedule was created
    const schedule = await PaymentService.getSchedule(loanId)
    expect(schedule).toBeDefined()
    expect(schedule.totalPayments).toBe(36)
  })
})
```

### E2E Tests
- Complete payment recording workflow
- Draw request and approval flow
- Event propagation end-to-end

---

## 📊 Success Metrics

### Technical Metrics
- [ ] Event latency < 100ms
- [ ] Event success rate > 99%
- [ ] API response time < 200ms
- [ ] Zero data loss during events
- [ ] Test coverage > 80%

### Development Metrics
- [ ] All team members can work independently
- [ ] No domain boundary conflicts
- [ ] Clear ownership of code
- [ ] Improved code discoverability

### User Metrics
- [ ] Payment entry time < 30 seconds
- [ ] Draw request submission < 2 minutes
- [ ] Zero user-facing errors
- [ ] Smooth, responsive UI

---

## 🚧 Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Event bus performance issues | High | Low | Start simple (sync), optimize later |
| Complex domain migration | Medium | Medium | Do incrementally, keep v1 working |
| UI component integration bugs | Medium | Medium | Thorough testing, staged rollout |
| Breaking changes to existing features | High | Low | Maintain v1 API, extensive testing |

---

## 📚 Documentation Deliverables

1. **Event System Guide** - How to publish and subscribe to events
2. **Domain Migration Guide** - Step-by-step for migrating domains
3. **Component Library** - Payment & draw component documentation
4. **API v2 Documentation** - Endpoint reference and examples
5. **Sprint 4 Retrospective** - Lessons learned and improvements

---

## 🔗 Related Documentation

- [Event-Driven System](../architecture/event-driven-system.md)
- [Domain Architecture v2](../architecture/domain-architecture-v2.md)
- [Migration Guide](../architecture/migration-v1-to-v2.md)
- [Domain Rules](../../rules/domain-rules.md)

---

**Sprint 4 Start Date**: TBD
**Sprint 4 End Date**: TBD (2 weeks from start)
**Sprint Lead**: TBD
**Status**: 📋 Planning Complete - Ready for Kickoff
