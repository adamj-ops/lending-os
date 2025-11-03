# Loan Domain

> **Domain Owner**: Loan Origination & Servicing Team
> **Status**: Active (Sprint 1-3 Complete)

---

## Overview

The **Loan Domain** is the central domain of LendingOS, responsible for the entire loan lifecycle from application through funding, servicing, and payoff.

---

## Responsibilities

- **Loan Origination**: Application intake, underwriting, approval workflows
- **Loan Servicing**: Payment tracking, draw management, balance calculations
- **Collateral Management**: Property tracking, lien recording, title insurance
- **Document Management**: Loan agreements, promissory notes, disclosures
- **Loan Modification**: Rate changes, extensions, restructuring
- **Payoff Processing**: Final payment calculation, lien release

---

## Data Models

### Core Tables

#### `loans`
Primary loan record containing terms, status, and relationships.

**Key Fields**:
- `id` - UUID primary key
- `borrowerId` - FK to borrowers
- `lenderId` - FK to lenders
- `propertyId` - FK to properties (collateral)
- `status` - Enum: pending, approved, active, paid_off, defaulted
- `amount` - Principal amount
- `interestRate` - Annual percentage rate
- `term` - Loan term in months
- `originationDate` - Date loan was created
- `fundingDate` - Date loan was funded
- `maturityDate` - Date loan is due

#### `payments`
Individual payment transactions against loans.

**Key Fields**:
- `id` - UUID
- `loanId` - FK to loans
- `paymentType` - Enum: principal, interest, fee, combined
- `amount` - Payment amount
- `paymentDate` - Date of payment
- `paymentMethod` - Enum: wire, ach, check, cash
- `status` - Enum: pending, completed, failed

#### `draws`
Construction draw requests and disbursements.

**Key Fields**:
- `id` - UUID
- `loanId` - FK to loans
- `drawNumber` - Sequential per loan
- `amountRequested` - Requested draw amount
- `amountApproved` - Approved amount
- `status` - Enum: requested, approved, inspected, disbursed, rejected

#### `collateral`
Property collateral details and LTV calculations.

**Key Fields**:
- `id` - UUID
- `loanId` - FK to loans
- `propertyId` - FK to properties
- `collateralType` - Enum: primary, additional
- `lienPosition` - First, second, etc.
- `currentValue` - Appraised value
- `ltv` - Loan-to-value ratio

---

## Events Emitted

### Loan Lifecycle Events

- `Loan.Created` - New loan application submitted
- `Loan.Approved` - Loan approved for funding
- `Loan.Funded` - Loan funds disbursed
- `Loan.Modified` - Loan terms changed
- `Loan.PaidOff` - Loan fully paid
- `Loan.Defaulted` - Loan entered default status

### Payment Events

- `Payment.Received` - Payment recorded
- `Payment.Late` - Payment past due
- `Payment.Reversed` - Payment reversed/refunded
- `Payment.ScheduleGenerated` - Payment schedule created

### Draw Events

- `Draw.Requested` - Draw request submitted
- `Draw.Approved` - Draw approved
- `Draw.Disbursed` - Draw funds released
- `Draw.Rejected` - Draw request denied

### Document Events

- `Document.Generated` - Loan document created
- `Document.Signed` - Document signed by parties
- `Document.Recorded` - Document filed with county

---

## API Endpoints

### Loan Management

- `POST /api/v1/loans` - Create new loan
- `GET /api/v1/loans` - List loans with filters
- `GET /api/v1/loans/:id` - Get loan details
- `PATCH /api/v1/loans/:id` - Update loan
- `DELETE /api/v1/loans/:id` - Delete loan (soft delete)
- `POST /api/v1/loans/:id/status` - Change loan status

### Payment Management

- `POST /api/v1/loans/:loanId/payments` - Record payment
- `GET /api/v1/loans/:loanId/payments` - Get payment history
- `GET /api/v1/loans/:loanId/payment-schedule` - Get payment schedule
- `GET /api/v1/loans/:loanId/balance` - Get current balance

### Draw Management

- `POST /api/v1/loans/:loanId/draws` - Create draw request
- `GET /api/v1/loans/:loanId/draws` - List draws
- `PUT /api/v1/draws/:drawId/status` - Update draw status

### Document Management

- `POST /api/v1/loans/:loanId/documents` - Upload document
- `GET /api/v1/loans/:loanId/documents` - List documents
- `DELETE /api/v1/loans/:loanId/documents/:docId` - Delete document

---

## UI Components

### Domain-Specific Components

Located in: `src/app/(main)/dashboard/loans/`

#### Loan Application
- `LoanWizard` - Multi-step loan creation wizard
- `ApplicationForm` - Loan details form
- `BorrowerSelector` - Select or create borrower
- `PropertySelector` - Select or create property
- `LenderSelector` - Select or create lender

#### Loan Management
- `LoanTable` - Data table with filtering
- `LoanDetailDrawer` - Comprehensive loan details
- `LoanStatusBadge` - Status indicator
- `LoanMetricsCards` - Key loan metrics

#### Payment Management
- `PaymentHistoryTable` - Payment transaction list
- `PaymentEntryForm` - Record new payment
- `PaymentScheduleView` - Amortization schedule
- `BalanceSummaryCards` - Current balance display

#### Draw Management
- `DrawRequestWizard` - Create draw request
- `DrawTimelineTracker` - Draw status timeline
- `DrawApprovalForm` - Approve/reject draws
- `BudgetVsActualChart` - Budget tracking

---

## Business Rules

### Loan Creation

1. Must have valid borrower
2. Must have property collateral
3. LTV must be within lender guidelines (typically < 75%)
4. Interest rate must be within valid range (6% - 18%)
5. Term must be 6-360 months

### Payment Processing

1. Payments are applied: fees → interest → principal
2. Partial payments are allowed
3. Overpayments are applied to principal
4. Late fees calculated after grace period (typically 10 days)

### Draw Disbursement

1. Draws require inspection if > $5,000
2. Cannot exceed total loan amount
3. Must have approved budget line item
4. Sequential draw numbering per loan

---

## Service Layer

Located in: `src/services/loan.service.ts`, `payment.service.ts`, `draw.service.ts`

### Key Methods

#### LoanService
- `createLoan()` - Create new loan with validation
- `approveLoan()` - Approve loan and generate documents
- `fundLoan()` - Mark loan as funded, emit events
- `calculateLTV()` - Calculate loan-to-value ratio
- `getLoanSummary()` - Get comprehensive loan data

#### PaymentService
- `recordPayment()` - Record payment and update balance
- `generatePaymentSchedule()` - Create amortization schedule
- `calculateBalance()` - Get current loan balance
- `calculateInterestAccrued()` - Calculate accrued interest

#### DrawService
- `createDraw()` - Create draw request
- `approveDraw()` - Approve draw for disbursement
- `disburseDraw()` - Disburse draw funds
- `getBudgetStatus()` - Get remaining budget

---

## Dependencies

### Depends On

- **Borrower Domain**: Borrower data and verification
- **Fund Domain**: Lender/investor data and capital availability
- **Compliance Domain**: Required documents and disclosures

### Depended On By

- **Payment Domain**: Payment processing and reconciliation
- **Reporting Domain**: Loan portfolio analytics
- **Compliance Domain**: Regulatory reporting

---

## Integration Points

### External Services

- **Banking APIs**: Payment processing (ACH, wire)
- **Title Companies**: Lien recording and title insurance
- **Appraisal Services**: Property valuation
- **Credit Bureaus**: Borrower credit checks
- **Document Signing**: E-signature for loan documents

### Internal Events

**Subscribes To**:
- `Borrower.KYCApproved` - Proceed with loan approval
- `Property.AppraiseCompleted` - Update LTV calculations
- `Fund.CapitalAvailable` - Fund approved loans

**Publishes**:
- All loan, payment, and draw events listed above

---

## Testing Strategy

### Unit Tests
- Loan creation validation
- LTV calculation accuracy
- Payment application logic
- Interest calculation formulas

### Integration Tests
- Loan-to-payment workflow
- Draw request and approval process
- Document generation and storage
- Event emission and handling

### E2E Tests
- Complete loan origination flow
- Payment processing and balance updates
- Draw request with inspection
- Loan payoff process

---

## Future Enhancements

- [ ] Automated underwriting engine
- [ ] Real-time payment processing via webhooks
- [ ] Mobile borrower portal
- [ ] Automated draw inspection scheduling
- [ ] ML-based default prediction
- [ ] Secondary market loan sales

---

## Related Documentation

- [Payment Domain](./payment-domain.md)
- [Borrower Domain](./borrower-domain.md)
- [Database Schema](../technical/database-schema.md)
- [API Documentation](../technical/api-endpoints.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
**Sprint**: Sprint 3 Complete
