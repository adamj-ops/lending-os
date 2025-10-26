# Domain Rules & Boundaries

> **Purpose**: Guidelines for organizing code by domain
> **Applies To**: All developers working on LendingOS

---

## Core Principles

1. **Domain Isolation**: Each domain owns its data, logic, and UI
2. **Event-Driven Communication**: Domains communicate via events, not direct calls
3. **Single Responsibility**: Each domain has clear, non-overlapping responsibilities
4. **Loose Coupling**: Minimize dependencies between domains

---

## Domain Definitions

### Loan Domain
- **Owns**: Loan lifecycle, collateral, loan documents
- **Does NOT Own**: Payment processing (Payment domain), investor management (Fund domain)

### Payment Domain
- **Owns**: Payment recording, reconciliation, balance calculation, schedules
- **Does NOT Own**: Loan creation (Loan domain), fund distribution (Fund domain)

### Borrower Domain
- **Owns**: Borrower profiles, KYC verification, relationships
- **Does NOT Own**: Loan terms (Loan domain), payment history (Payment domain)

### Fund Domain
- **Owns**: Investor management, capital calls, distributions, fund accounting
- **Does NOT Own**: Individual loans (Loan domain), borrower data (Borrower domain)

### Compliance Domain
- **Owns**: Regulatory filings, document generation, licenses, audit logs
- **Does NOT Own**: Business logic (other domains), actual loan processing

---

## Cross-Domain Communication

### ✅ ALLOWED: Event-Driven

```typescript
// In LoanService
await eventBus.publish({
  type: 'Loan.Funded',
  payload: { loanId, amount }
});

// In PaymentService (separate file)
eventBus.subscribe('Loan.Funded', async (event) => {
  await PaymentService.generateSchedule(event.payload.loanId);
});
```

### ❌ NOT ALLOWED: Direct Service Calls

```typescript
// DON'T DO THIS
import { PaymentService } from '@/services/payment.service';
await PaymentService.generateSchedule(loanId); // Called directly from LoanService
```

**Why?** Creates tight coupling, makes testing harder, prevents independent deployment.

---

## File Organization Rules

### Domain Folder Structure

```
src/app/(main)/[domain]/
├── [subdomain]/
│   ├── page.tsx              # Route component
│   ├── actions.ts            # Server actions
│   ├── schema.ts             # Zod validation schemas
│   ├── db.ts                 # Database queries (optional)
│   └── _components/          # Domain-specific UI
```

### What Goes Where

| File | Purpose | Example |
|------|---------|---------|
| `page.tsx` | Route component, data fetching | `loans/applications/page.tsx` |
| `actions.ts` | Server actions (form handling, mutations) | `createLoan()`, `updateLoan()` |
| `schema.ts` | Zod schemas for validation | `loanApplicationSchema` |
| `db.ts` | Domain-specific database queries | `getLoansByBorrower()` |
| `_components/` | UI components used only in this domain | `LoanWizard`, `ApplicationForm` |

---

## Service Layer Guidelines

### When to Use Services

Services (`src/services/`) are for:
- Complex business logic that spans multiple routes
- Logic that needs to be reused across domains (via events)
- Integration with external APIs
- Background jobs and cron tasks

### Service Responsibilities

Each service should:
- ✅ Handle one domain's business logic
- ✅ Publish events after state changes
- ✅ Be independently testable
- ❌ NOT directly call other domain services
- ❌ NOT contain UI logic

---

## Shared Code Guidelines

### Allowed to Share

- **UI Primitives** (`src/components/ui/`): Buttons, inputs, tables
- **Utilities** (`src/lib/`): Date formatting, string helpers, validation
- **Types** (`src/types/`): Shared TypeScript interfaces
- **Hooks** (`src/hooks/`): Generic React hooks

### NOT Allowed to Share

- Domain-specific components (keep in `_components/`)
- Domain business logic (keep in domain folder or service)
- Domain-specific types (keep in `schema.ts` or domain types file)

---

## Naming Conventions

### Events

Format: `Domain.Action`

Examples:
- `Loan.Created`
- `Payment.Received`
- `Borrower.KYCApproved`

### Files

- **Components**: PascalCase (e.g., `LoanWizard.tsx`)
- **Actions**: camelCase (e.g., `createLoan.ts` or grouped in `actions.ts`)
- **Schemas**: camelCase with `Schema` suffix (e.g., `loanApplicationSchema`)
- **Types**: PascalCase (e.g., `LoanApplication`)

---

## Testing Within Domains

### Unit Tests

Colocate with domain code:

```
loans/applications/
├── actions.ts
├── actions.test.ts           # Test server actions
├── schema.ts
├── schema.test.ts            # Test validation
```

### Integration Tests

Test cross-domain event flows:

```typescript
// tests/integration/loan-payment-flow.test.ts
describe('Loan Funding Flow', () => {
  it('should generate payment schedule when loan is funded', async () => {
    await LoanService.fundLoan(loanId);
    await waitForEvent('PaymentSchedule.Generated');
    // assertions
  });
});
```

---

## When to Create a New Domain

Ask these questions:

1. **Does it have distinct business logic?**
   - If yes: Likely a new domain
   - If no: Probably belongs in existing domain

2. **Does it own unique data models?**
   - If yes: Likely a new domain
   - If no: Might be a subdomain

3. **Does it interact with multiple other domains equally?**
   - If yes: Could be a new domain
   - If no: Probably belongs in one of those domains

4. **Would it benefit from independent deployment/scaling?**
   - If yes: Strong case for new domain
   - If no: Consider subdomain instead

---

## Examples

### ✅ GOOD: Clear Domain Boundaries

```
loans/applications/
  └─ Create loan, manage application workflow

loans/payments/
  └─ Record payments for a loan (nested under loans)

borrowers/profile/
  └─ Manage borrower info, separate from loans
```

### ❌ BAD: Unclear Boundaries

```
loans/
  └─ Contains payment logic, borrower management, and investor data (too broad)

everything/
  └─ All business logic in one place (no domain isolation)
```

---

## Migration from Old to New

If you find code that violates these rules:

1. Don't rewrite everything at once
2. Follow the boy scout rule: Leave it better than you found it
3. Move one domain at a time
4. Keep old code working during migration
5. Document what you change

---

## Questions?

If you're unsure about domain boundaries:
1. Check existing domain documentation (`.cursor/docs/domains/`)
2. Look at similar features in the codebase
3. Ask in `#lending-os-architecture` Slack channel
4. Refer to the migration guide

---

## Related Documentation

- [Domain Architecture v2](../docs/architecture/domain-architecture-v2.md)
- [Migration Guide](../docs/architecture/migration-v1-to-v2.md)
- [Event-Driven System](../docs/architecture/event-driven-system.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
