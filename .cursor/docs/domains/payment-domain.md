# Payment Domain

> **Domain Owner**: Loan Servicing & Collections Team
> **Status**: Active (Sprint 3 Complete)

---

## Overview

The **Payment Domain** handles all payment processing, reconciliation, accrual calculations, and collections activities.

---

## Responsibilities

- Payment recording and processing
- Payment schedule generation (amortization)
- Real-time loan balance calculations
- Interest accrual tracking
- Payment reconciliation with bank accounts
- Late payment detection and fees
- Payment method management (ACH, wire, check)

---

## Data Models

### Core Tables

- `payments` - Payment transactions
- `payment_schedules` - Generated amortization schedules
- `payment_allocations` - Payment split (principal/interest/fees)
- `accruals` - Interest accrual tracking

---

## Events Emitted

- `Payment.Received`
- `Payment.Applied`
- `Payment.Late`
- `Payment.Reversed`
- `Payment.Failed`
- `PaymentSchedule.Generated`
- `Interest.Accrued`
- `LateFee.Assessed`

---

## API Endpoints

- `POST /api/v1/loans/:loanId/payments` - Record payment
- `GET /api/v1/loans/:loanId/payments` - Payment history
- `GET /api/v1/loans/:loanId/payment-schedule` - Get schedule
- `GET /api/v1/loans/:loanId/balance` - Current balance
- `PATCH /api/v1/payments/:id` - Update payment

---

## UI Components

Located in: `src/app/(main)/dashboard/loans/payments/`

- `PaymentHistoryTable` - All payments for a loan
- `PaymentEntryForm` - Record new payment
- `PaymentScheduleView` - Amortization table
- `BalanceSummaryCards` - Current balance breakdown
- `PaymentMethodSelector` - Choose payment method

---

## Service Layer

Located in: `src/services/payment.service.ts`

### Key Methods

- `recordPayment()` - Record and apply payment
- `generatePaymentSchedule()` - Create amortization schedule
- `calculateBalance()` - Real-time balance calculation
- `calculateInterestAccrued()` - Daily interest accrual
- `applyPayment()` - Allocate payment to principal/interest/fees
- `reversePayment()` - Reverse incorrect payment

---

## Business Rules

### Payment Application Order

1. Outstanding fees (late fees, NSF fees)
2. Accrued interest
3. Principal balance

### Late Payment Logic

- Grace period: 10 days after due date
- Late fee: Lesser of 5% of payment or $50
- Late status triggers after grace period expires

### Interest Calculation

- Daily interest = (Principal × Annual Rate) / 365
- Compounding: Simple interest (no compound)
- Accrual: Daily, paid monthly

---

## Integration Points

### External Services

- **Banking APIs**: Automated payment import (Mercury, Relay)
- **ACH Provider**: Direct debit processing
- **Payment Gateway**: Credit card processing (if applicable)

### Internal Events

**Subscribes To**:
- `Loan.Funded` - Generate initial payment schedule
- `Loan.Modified` - Regenerate payment schedule

**Publishes**:
- All payment events listed above

---

## Testing Strategy

### Unit Tests
- Payment allocation logic
- Interest calculation accuracy
- Late fee calculation
- Balance calculation with various payment scenarios

### Integration Tests
- Payment recording and balance update
- Schedule generation for various loan types
- Late payment detection and fee assessment

---

## Future Enhancements

- [ ] Automated ACH payment processing
- [ ] Borrower payment portal
- [ ] Auto-pay enrollment
- [ ] Payment reminders (email/SMS)
- [ ] Partial payment handling improvements
- [ ] Payment plan creation for delinquent loans

---

## Related Documentation

- [Loan Domain](./loan-domain.md)
- [Database Schema](../technical/database-schema.md)
- [Sprint 3 Summary](../sprints/sprint-3-summary.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
**Sprint**: Sprint 3 Complete
