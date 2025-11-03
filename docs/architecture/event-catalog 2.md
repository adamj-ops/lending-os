# Event Catalog

> **Complete reference of all LendingOS domain events**
> **Last Updated**: October 26, 2025

---

## Loan Domain

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Loan.Created` | Loan application created | `{ loanId, borrowerId, amount, interestRate }` |
| `Loan.Approved` | Loan approved for funding | `{ loanId, approvedBy, approvedAt, conditions }` |
| `Loan.Funded` | Loan funds disbursed | `{ loanId, fundedAmount, fundedAt, fundedBy }` |
| `Loan.Modified` | Loan terms modified | `{ loanId, changes, reason, modifiedBy }` |
| `Loan.PaidOff` | Loan fully paid | `{ loanId, finalPaymentId, paidOffAt, totalPaid }` |
| `Loan.Defaulted` | Loan in default | `{ loanId, reason, defaultedAt, outstandingBalance }` |
| `Loan.Restructured` | Loan terms renegotiated | `{ loanId, newTerms, oldTerms, reason }` |

---

## Payment Domain

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Payment.Received` | Payment recorded | `{ paymentId, loanId, amount, method, receivedAt }` |
| `Payment.Applied` | Payment allocated | `{ paymentId, principal, interest, fees, remainingBalance }` |
| `Payment.Late` | Payment overdue | `{ loanId, daysLate, amountDue, lateFee }` |
| `Payment.Reversed` | Payment reversed | `{ paymentId, reason, reversedBy, reversedAt }` |
| `Payment.Failed` | Payment processing failed | `{ paymentId, reason, failedAt }` |
| `PaymentSchedule.Generated` | Schedule created | `{ loanId, scheduleId, totalPayments, firstDueDate }` |
| `Interest.Accrued` | Daily interest calculated | `{ loanId, date, amount, balance }` |
| `LateFee.Assessed` | Late fee added | `{ loanId, amount, daysLate, assessedAt }` |

---

## Draw Domain

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Draw.Requested` | Draw request submitted | `{ drawId, loanId, amount, workDescription }` |
| `Draw.Approved` | Draw approved | `{ drawId, approvedAmount, approvedBy, approvedAt }` |
| `Draw.Inspected` | Inspection completed | `{ drawId, inspectionId, completionPct, qualityRating }` |
| `Draw.Disbursed` | Draw funds released | `{ drawId, amount, disbursedAt, disbursedBy }` |
| `Draw.Rejected` | Draw denied | `{ drawId, reason, rejectedBy, rejectedAt }` |

---

## Borrower Domain

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Borrower.Created` | Borrower added | `{ borrowerId, type, name, createdBy }` |
| `Borrower.KYCApproved` | KYC verification passed | `{ borrowerId, verificationId, approvedAt }` |
| `Borrower.KYCFailed` | KYC verification failed | `{ borrowerId, verificationId, reason }` |
| `Borrower.Flagged` | Borrower flagged | `{ borrowerId, reason, flaggedBy }` |
| `Borrower.CreditUpdated` | Credit score refreshed | `{ borrowerId, newScore, oldScore, provider }` |
| `Borrower.RelationshipCreated` | Lender relationship established | `{ borrowerId, lenderId, type }` |

---

## Fund Domain (Planned)

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Fund.Created` | Fund established | `{ fundId, name, structure, targetSize }` |
| `Fund.Closed` | Fund closed to new investors | `{ fundId, closedAt, finalSize }` |
| `Commitment.Activated` | Investor commitment | `{ commitmentId, investorId, amount }` |
| `CapitalCall.Issued` | Capital call sent | `{ callId, fundId, amount, dueDate }` |
| `CapitalCall.Received` | Capital received | `{ callId, investorId, amount, receivedAt }` |
| `Distribution.Calculated` | Distribution computed | `{ distributionId, fundId, totalAmount, investors }` |
| `Distribution.Paid` | Distribution sent | `{ distributionId, investorId, amount, paidAt }` |
| `Investor.Onboarded` | Investor added | `{ investorId, fundId, accredited, onboardedAt }` |

---

## Compliance Domain (Planned)

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Filing.Due` | Regulatory filing due | `{ filingId, type, dueDate, jurisdiction }` |
| `Filing.Submitted` | Filing submitted | `{ filingId, submittedAt, submittedBy }` |
| `Document.Generated` | Compliance doc created | `{ documentId, type, loanId, generatedAt }` |
| `Document.Signed` | Document executed | `{ documentId, signedBy, signedAt, envelopeId }` |
| `Document.Expired` | Document needs renewal | `{ documentId, expiresAt, type }` |
| `License.Expiring` | License expiration warning | `{ licenseId, expiresAt, jurisdiction }` |
| `Audit.Created` | Audit log entry | `{ auditId, entityType, entityId, action, userId }` |

---

## Integration Events

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `Payment.BankConfirmed` | Bank confirmed payment | `{ paymentId, bankTxId, confirmedAt }` |
| `Payment.BankFailed` | Bank payment failed | `{ paymentId, reason, failedAt }` |
| `Document.Sent` | DocuSign sent | `{ documentId, envelopeId, recipients }` |
| `Document.Viewed` | DocuSign viewed | `{ documentId, viewedBy, viewedAt }` |
| `KYC.Initiated` | KYC check started | `{ verificationId, borrowerId, provider }` |
| `KYC.RequiresReview` | Manual KYC review needed | `{ verificationId, reason }` |
| `Lien.Recorded` | Lien filed | `{ loanId, recordingId, recordedAt, county }` |
| `TitleInsurance.Issued` | Title policy issued | `{ loanId, policyId, issuedAt }` |

---

## Event Schema

All events follow this structure:

```typescript
{
  id: string;                    // UUID
  type: string;                  // Event type (e.g., "Loan.Funded")
  domain: string;                // Source domain
  timestamp: Date;               // Event time
  payload: Record<string, any>;  // Event-specific data
  metadata: {
    userId?: string;             // User who triggered
    correlationId?: string;      // Trace related events
    causationId?: string;        // Event that caused this
  };
}
```

---

## Related Documentation

- [Event-Driven System](./event-driven-system.md)
- [Domain Definitions](../domains/)

