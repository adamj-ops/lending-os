# Event Bus Implementation Guide

> **Quick Reference for Sprint 4 Event Bus Development**

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# No new dependencies needed - using native PostgreSQL
npm install # Already have drizzle, postgres client
```

### 2. Create Database Migration

```bash
npm run db:generate -- --name add_domain_events_table
```

Edit the generated migration:

```typescript
// drizzle/migrations/XXXX_add_domain_events_table.ts
import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core'

export const domainEvents = pgTable('domain_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  domain: text('domain').notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  aggregateType: text('aggregate_type').notNull(),
  payload: jsonb('payload').notNull(),
  metadata: jsonb('metadata'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, (table) => ({
  eventTypeIdx: index('domain_events_event_type_idx').on(table.eventType),
  aggregateIdx: index('domain_events_aggregate_idx').on(table.aggregateType, table.aggregateId),
  occurredAtIdx: index('domain_events_occurred_at_idx').on(table.occurredAt),
}))
```

Run migration:
```bash
npm run db:migrate
```

---

## 📝 Implementation Steps

### Step 1: Create Event Types

**File**: `src/lib/events/eventTypes.ts`

```typescript
export interface DomainEvent<TPayload = any> {
  id?: string
  type: string
  domain: string
  aggregateId: string
  aggregateType: string
  payload: TPayload
  metadata?: {
    userId?: string
    correlationId?: string
    causationId?: string
    timestamp?: Date
  }
  occurredAt?: Date
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void

// Loan Events
export interface LoanCreatedPayload {
  loanId: string
  borrowerId: string
  amount: number
  interestRate: number
}

export interface LoanFundedPayload {
  loanId: string
  fundedAmount: number
  fundedAt: Date
}

// Payment Events
export interface PaymentReceivedPayload {
  paymentId: string
  loanId: string
  amount: number
  paymentMethod: string
}

export interface PaymentScheduleGeneratedPayload {
  scheduleId: string
  loanId: string
  totalPayments: number
}

// ... more event payload types
```

---

### Step 2: Create Event Bus

**File**: `src/lib/events/eventBus.ts`

```typescript
import { db } from '@/db/client'
import { domainEvents } from '@/db/schema'
import type { DomainEvent, EventHandler } from './eventTypes'

class EventBus {
  private handlers = new Map<string, EventHandler[]>()
  private static instance: EventBus

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    try {
      // 1. Store event in database
      const [storedEvent] = await db.insert(domainEvents).values({
        eventType: event.type,
        domain: event.domain,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        payload: event.payload as any,
        metadata: event.metadata as any,
        occurredAt: new Date(),
      }).returning()

      // 2. Execute handlers synchronously (for now)
      const handlers = this.handlers.get(event.type) || []

      for (const handler of handlers) {
        try {
          await handler({ ...event, id: storedEvent.id })
        } catch (error) {
          console.error(`Handler failed for ${event.type}:`, error)
          // Continue with other handlers
        }
      }

      // 3. Mark as processed
      await db.update(domainEvents)
        .set({ processedAt: new Date() })
        .where(eq(domainEvents.id, storedEvent.id))

    } catch (error) {
      console.error('Failed to publish event:', error)
      throw error
    }
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): string {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler as EventHandler)
    this.handlers.set(eventType, handlers)

    // Return handler ID for unsubscribe
    return `${eventType}-${handlers.length - 1}`
  }

  unsubscribe(eventType: string, handlerId: string): void {
    const handlers = this.handlers.get(eventType) || []
    const index = parseInt(handlerId.split('-')[1])
    if (index >= 0 && index < handlers.length) {
      handlers.splice(index, 1)
    }
  }

  async getEventHistory(aggregateId: string): Promise<DomainEvent[]> {
    const events = await db.select()
      .from(domainEvents)
      .where(eq(domainEvents.aggregateId, aggregateId))
      .orderBy(asc(domainEvents.occurredAt))

    return events as DomainEvent[]
  }
}

export const eventBus = EventBus.getInstance()
```

---

### Step 3: Create Event Handlers

**File**: `src/lib/events/eventHandlers/paymentHandlers.ts`

```typescript
import { eventBus } from '../eventBus'
import { PaymentService } from '@/services/payment.service'
import type { LoanFundedPayload } from '../eventTypes'

export function registerPaymentHandlers() {
  // Auto-generate payment schedule when loan is funded
  eventBus.subscribe<LoanFundedPayload>('Loan.Funded', async (event) => {
    console.log(`[Event Handler] Generating payment schedule for loan ${event.payload.loanId}`)

    try {
      await PaymentService.generatePaymentSchedule(event.payload.loanId)
      console.log(`[Event Handler] Payment schedule generated successfully`)
    } catch (error) {
      console.error('[Event Handler] Failed to generate payment schedule:', error)
      // In production, would retry or send to DLQ
    }
  })

  // Update payment schedule when loan is modified
  eventBus.subscribe('Loan.Modified', async (event) => {
    console.log(`[Event Handler] Updating payment schedule for loan ${event.payload.loanId}`)
    await PaymentService.updatePaymentSchedule(event.payload.loanId)
  })

  console.log('[Event Handlers] Payment handlers registered')
}
```

**File**: `src/lib/events/eventHandlers/index.ts`

```typescript
import { registerPaymentHandlers } from './paymentHandlers'
import { registerLoanHandlers } from './loanHandlers'
import { registerDrawHandlers } from './drawHandlers'

export function registerAllEventHandlers() {
  console.log('[Event Handlers] Registering all event handlers...')

  registerPaymentHandlers()
  registerLoanHandlers()
  registerDrawHandlers()

  console.log('[Event Handlers] All handlers registered successfully')
}
```

---

### Step 4: Initialize on App Startup

**File**: `src/app/layout.tsx` (or a startup file)

```typescript
import { registerAllEventHandlers } from '@/lib/events/eventHandlers'

// Call once on app startup
if (typeof window === 'undefined') {
  registerAllEventHandlers()
}
```

---

### Step 5: Update Services to Publish Events

**Example**: `src/services/loan.service.ts`

```typescript
import { eventBus } from '@/lib/events/eventBus'
import type { LoanFundedPayload } from '@/lib/events/eventTypes'

export class LoanService {
  static async fundLoan(loanId: string, amount: number) {
    // 1. Business logic
    const [loan] = await db.update(loans)
      .set({
        status: 'active',
        fundedAt: new Date(),
        fundedAmount: amount.toString()
      })
      .where(eq(loans.id, loanId))
      .returning()

    // 2. Publish event
    await eventBus.publish<LoanFundedPayload>({
      type: 'Loan.Funded',
      domain: 'loan',
      aggregateId: loanId,
      aggregateType: 'loan',
      payload: {
        loanId,
        fundedAmount: amount,
        fundedAt: loan.fundedAt!
      },
      metadata: {
        userId: 'system', // Get from context
        correlationId: crypto.randomUUID()
      }
    })

    return loan
  }
}
```

---

## 🧪 Testing the Event Bus

### Unit Test

```typescript
// __tests__/lib/events/eventBus.test.ts
import { eventBus } from '@/lib/events/eventBus'

describe('EventBus', () => {
  beforeEach(() => {
    // Clear handlers between tests
  })

  it('should publish event to database', async () => {
    await eventBus.publish({
      type: 'Test.Event',
      domain: 'test',
      aggregateId: 'test-123',
      aggregateType: 'test',
      payload: { data: 'test' }
    })

    const events = await eventBus.getEventHistory('test-123')
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('Test.Event')
  })

  it('should trigger registered handlers', async () => {
    const handler = jest.fn()
    eventBus.subscribe('Test.Event', handler)

    await eventBus.publish({
      type: 'Test.Event',
      domain: 'test',
      aggregateId: 'test-123',
      aggregateType: 'test',
      payload: { data: 'test' }
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Test

```typescript
// __tests__/integration/event-flow.test.ts
import { LoanService } from '@/services/loan.service'
import { PaymentService } from '@/services/payment.service'
import { eventBus } from '@/lib/events/eventBus'

describe('Loan Funding Event Flow', () => {
  it('should generate payment schedule when loan is funded', async () => {
    // Fund the loan
    await LoanService.fundLoan(testLoanId, 100000)

    // Give handlers time to process (in real app, use await or polling)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify payment schedule was created
    const schedule = await PaymentService.getSchedule(testLoanId)
    expect(schedule).toBeDefined()
    expect(schedule.totalPayments).toBe(36)
  })
})
```

---

## 📊 Monitoring Events

### View Event Log

```typescript
// Quick script to view events
import { db } from '@/db/client'
import { domainEvents } from '@/db/schema'

const recentEvents = await db.select()
  .from(domainEvents)
  .orderBy(desc(domainEvents.occurredAt))
  .limit(50)

console.table(recentEvents)
```

### Event Metrics

```typescript
// Count events by type
const eventCounts = await db.select({
  eventType: domainEvents.eventType,
  count: count()
})
.from(domainEvents)
.groupBy(domainEvents.eventType)
.orderBy(desc(count()))
```

---

## 🔧 Best Practices

### 1. Event Naming
- Use `Domain.Action` format (PascalCase)
- Examples: `Loan.Created`, `Payment.Received`, `Draw.Approved`

### 2. Event Payload
- Include only necessary data
- Don't include entire entities (just IDs + changed fields)
- Use TypeScript types for payloads

### 3. Idempotency
- Handlers should be idempotent (safe to run multiple times)
- Check if action already completed before executing

### 4. Error Handling
- Don't let one handler failure stop others
- Log all errors
- Consider retry logic for transient failures

### 5. Performance
- Keep handlers fast (<100ms)
- Offload heavy work to background jobs
- Monitor event processing latency

---

## 🚨 Common Issues

### Issue: Handlers not triggering
**Solution**: Ensure `registerAllEventHandlers()` is called on app startup

### Issue: Duplicate event processing
**Solution**: Make handlers idempotent, check `processedAt` timestamp

### Issue: Events not persisting
**Solution**: Check database connection, ensure migration ran

### Issue: Circular dependencies
**Solution**: Use event bus for cross-domain communication, avoid direct imports

---

## 📈 Future Enhancements (Sprint 5+)

- [ ] Async event processing with worker queues
- [ ] Event replay capability
- [ ] Event versioning strategy
- [ ] Dead letter queue for failed events
- [ ] Event bus dashboard/monitoring UI
- [ ] Webhooks for external systems
- [ ] Event-driven analytics pipeline

---

## 🔗 Related Documentation

- [Event-Driven System Architecture](./event-driven-system.md)
- [Event Catalog](./event-catalog.md)
- [Sprint 4 Plan](../sprints/sprint-4-plan.md)

---

**Last Updated**: October 26, 2025
**Status**: Ready for Implementation
