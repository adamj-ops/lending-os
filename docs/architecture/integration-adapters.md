# Integration Adapters

> **Status**: Planned (Sprint 6+)
> **Pattern**: Adapter Pattern for Third-Party Services

---

## Overview

Integration adapters provide a **consistent interface** for external services, decoupling LendingOS from specific vendor implementations. This allows for easy switching between providers and testing with mocks.

---

## Adapter Pattern

```typescript
// Generic adapter interface
interface ServiceAdapter<TConfig, TClient> {
  initialize(config: TConfig): Promise<TClient>;
  healthCheck(): Promise<boolean>;
  disconnect(): Promise<void>;
}
```

---

## Banking Integrations

### Mercury / Relay Bank

**Purpose**: ACH/wire payment processing, account reconciliation

**Location**: `src/app/integrations/banking/mercury.ts`

```typescript
interface BankingAdapter {
  // Payments
  initiateACH(params: ACHParams): Promise<Transaction>;
  initiateWire(params: WireParams): Promise<Transaction>;
  getTransactionStatus(txId: string): Promise<TransactionStatus>;

  // Reconciliation
  getTransactions(dateRange: DateRange): Promise<Transaction[]>;
  getAccountBalance(): Promise<Balance>;

  // Webhooks
  handleWebhook(payload: WebhookPayload): Promise<void>;
}
```

**Events Published**:
- `Payment.BankConfirmed`
- `Payment.BankFailed`
- `Transaction.Reconciled`

---

## Document Signing

### DocuSign / Dropbox Sign

**Purpose**: E-signature for loan documents, promissory notes, investor agreements

**Location**: `src/app/integrations/docsign/docusign.ts`

```typescript
interface DocSignAdapter {
  createEnvelope(document: Document, signers: Signer[]): Promise<Envelope>;
  sendEnvelope(envelopeId: string): Promise<void>;
  getEnvelopeStatus(envelopeId: string): Promise<EnvelopeStatus>;
  downloadSignedDocument(envelopeId: string): Promise<Buffer>;
  handleWebhook(payload: WebhookPayload): Promise<void>;
}
```

**Events Published**:
- `Document.Sent`
- `Document.Viewed`
- `Document.Signed`
- `Document.Completed`

---

## KYC / AML Verification

### Alloy / Persona

**Purpose**: Borrower and investor identity verification

**Location**: `src/app/integrations/kyc/alloy.ts`

```typescript
interface KYCAdapter {
  createVerification(person: PersonData): Promise<Verification>;
  getVerificationStatus(verificationId: string): Promise<VerificationStatus>;
  uploadDocument(verificationId: string, doc: Document): Promise<void>;
  rerunVerification(verificationId: string): Promise<Verification>;
}
```

**Events Published**:
- `KYC.Initiated`
- `KYC.DocumentUploaded`
- `KYC.Approved`
- `KYC.Rejected`
- `KYC.RequiresReview`

---

## Title & Recording

### Simplifile / Title API

**Purpose**: Lien recording, title insurance, document filing

**Location**: `src/app/integrations/title/simplifile.ts`

```typescript
interface TitleAdapter {
  recordLien(loanId: string, document: Document): Promise<RecordingResult>;
  releaseLien(loanId: string): Promise<RecordingResult>;
  getRecordingStatus(recordingId: string): Promise<RecordingStatus>;
  orderTitleInsurance(propertyId: string): Promise<TitleOrder>;
}
```

**Events Published**:
- `Lien.Recorded`
- `Lien.Released`
- `TitleInsurance.Ordered`
- `TitleInsurance.Issued`

---

## Accounting Sync

### QuickBooks Online

**Purpose**: Fund-level accounting synchronization

**Location**: `src/app/integrations/accounting/quickbooks.ts`

```typescript
interface AccountingAdapter {
  syncTransaction(transaction: Transaction): Promise<void>;
  syncInvoice(invoice: Invoice): Promise<void>;
  getChartOfAccounts(): Promise<Account[]>;
  createJournalEntry(entry: JournalEntry): Promise<void>;
}
```

**Events Published**:
- `Accounting.TransactionSynced`
- `Accounting.InvoiceCreated`

---

## Adapter Configuration

### Environment Variables

```env
# Banking
MERCURY_API_KEY=xxx
MERCURY_WEBHOOK_SECRET=xxx

# DocuSign
DOCUSIGN_INTEGRATION_KEY=xxx
DOCUSIGN_USER_ID=xxx
DOCUSIGN_ACCOUNT_ID=xxx
DOCUSIGN_PRIVATE_KEY=xxx

# KYC
ALLOY_API_KEY=xxx
ALLOY_SECRET_KEY=xxx

# QuickBooks
QUICKBOOKS_CLIENT_ID=xxx
QUICKBOOKS_CLIENT_SECRET=xxx
QUICKBOOKS_REFRESH_TOKEN=xxx
```

---

## Adapter Registry

Central registry for all adapters.

**Location**: `src/app/integrations/index.ts`

```typescript
export const integrations = {
  banking: mercuryAdapter,
  docSign: docusignAdapter,
  kyc: alloyAdapter,
  title: simplifileAdapter,
  accounting: quickbooksAdapter,
};

// Access adapters
import { integrations } from '@/integrations';
await integrations.banking.initiateACH(params);
```

---

## Testing Adapters

### Mock Adapters

```typescript
// src/integrations/__mocks__/banking.mock.ts
export const mockBankingAdapter: BankingAdapter = {
  initiateACH: jest.fn().mockResolvedValue({ id: 'mock-tx-123' }),
  initiateWire: jest.fn().mockResolvedValue({ id: 'mock-tx-456' }),
  // ... other methods
};
```

### Integration Tests

```typescript
describe('Banking Adapter', () => {
  it('should initiate ACH payment', async () => {
    const result = await mercuryAdapter.initiateACH({
      amount: 1000,
      recipientAccount: '123456789',
    });
    expect(result.id).toBeDefined();
  });
});
```

---

## Related Documentation

- [Event-Driven System](./event-driven-system.md)
- [Domain Architecture](./domain-architecture-v2.md)

---

**Version**: 1.0
**Last Updated**: October 26, 2025
