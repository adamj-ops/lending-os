/**
 * Domain Event Types and Interfaces
 *
 * Core types for the event-driven architecture.
 * All domain events must conform to these interfaces.
 */

/**
 * Base Domain Event
 *
 * All domain events extend this interface.
 */
export interface DomainEvent<T = unknown> {
  id: string;
  eventType: string;
  eventVersion: string;
  aggregateId: string;
  aggregateType: string;
  payload: T;
  metadata?: EventMetadata;
  sequenceNumber: number;
  causationId?: string;
  correlationId?: string;
  occurredAt: Date;
}

/**
 * Event Metadata
 *
 * Additional context about the event.
 */
export interface EventMetadata {
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  [key: string]: unknown;
}

/**
 * Event Handler Function
 *
 * Function signature for event handlers.
 */
export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;

/**
 * Event Handler Registration
 *
 * Configuration for registering an event handler.
 */
export interface EventHandlerRegistration {
  handlerName: string;
  eventType: string;
  handler: EventHandler;
  priority?: number;
  isEnabled?: boolean;
}

/**
 * Event Bus Interface
 *
 * Main interface for publishing and subscribing to domain events.
 */
export interface IEventBus {
  /**
   * Publish a domain event
   */
  publish<T>(event: Omit<DomainEvent<T>, 'id' | 'occurredAt' | 'sequenceNumber'>): Promise<void>;

  /**
   * Subscribe to an event type
   */
  subscribe<T>(registration: EventHandlerRegistration): void;

  /**
   * Unsubscribe a handler
   */
  unsubscribe(handlerName: string): void;

  /**
   * Get event history for an aggregate
   */
  getEventHistory(aggregateId: string, aggregateType?: string): Promise<DomainEvent[]>;

  /**
   * Replay events for an aggregate
   */
  replay(aggregateId: string, aggregateType?: string): Promise<void>;
}

/**
 * Event Processing Status
 */
export type EventProcessingStatus = 'pending' | 'processing' | 'processed' | 'failed';

/**
 * Event Processing Result
 */
export interface EventProcessingResult {
  eventId: string;
  handlerName: string;
  status: 'success' | 'failure' | 'skipped';
  executionTimeMs?: number;
  error?: string;
}

// ==========================================
// Domain-Specific Event Types
// ==========================================

/**
 * Loan Domain Events
 */

export interface LoanCreatedPayload {
  loanId: string;
  organizationId: string;
  borrowerId?: string;
  lenderId?: string;
  principal: string;
  rate: string;
  termMonths: number;
  loanCategory: string;
  createdBy?: string;
}

export interface LoanFundedPayload {
  loanId: string;
  organizationId: string;
  principal: string;
  rate: string;
  termMonths: number;
  paymentType: string;
  paymentFrequency: string;
  fundedDate: Date;
  maturityDate?: Date;
  fundedBy?: string;
}

export interface LoanStatusChangedPayload {
  loanId: string;
  organizationId: string;
  previousStatus: string;
  newStatus: string;
  changedBy?: string;
  reason?: string;
}

/**
 * Payment Domain Events
 */

export interface PaymentScheduleCreatedPayload {
  scheduleId: string;
  loanId: string;
  organizationId: string;
  numberOfPayments: number;
  startDate: Date;
  frequency: string;
  createdBy?: string;
}

export interface PaymentScheduledPayload {
  paymentId: string;
  scheduleId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  dueDate: Date;
  paymentNumber: number;
}

export interface PaymentProcessedPayload {
  paymentId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  processedDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  processedBy?: string;
}

/**
 * Draw Domain Events
 */

export interface DrawRequestedPayload {
  drawId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  requestedDate: Date;
  requestedBy?: string;
  notes?: string;
}

export interface DrawApprovedPayload {
  drawId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  approvedDate: Date;
  approvedBy?: string;
  notes?: string;
}

export interface DrawDisbursedPayload {
  drawId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  disbursedDate: Date;
  disbursedBy?: string;
  transactionId?: string;
}

/**
 * Compliance Domain Events
 */

export interface DocumentGeneratedPayload {
  documentId: string;
  loanId: string;
  organizationId: string;
  documentType: string;
  documentUrl: string;
  generatedDate: Date;
}

/**
 * Fund Domain Events
 */

export interface FundCreatedPayload {
  fundId: string;
  organizationId: string;
  name: string;
  fundType: string;
  totalCapacity: string;
  inceptionDate: Date;
  createdBy?: string;
}

export interface FundUpdatedPayload {
  fundId: string;
  organizationId: string;
  changes: Record<string, unknown>;
  updatedBy?: string;
}

export interface FundClosedPayload {
  fundId: string;
  organizationId: string;
  closingDate: Date;
  closedBy?: string;
}

export interface CommitmentAddedPayload {
  commitmentId: string;
  fundId: string;
  lenderId: string;
  organizationId: string;
  committedAmount: string;
  commitmentDate: Date;
}

export interface CommitmentCancelledPayload {
  commitmentId: string;
  fundId: string;
  lenderId: string;
  organizationId: string;
  cancelledBy?: string;
  reason?: string;
}

export interface CapitalCalledPayload {
  callId: string;
  fundId: string;
  organizationId: string;
  callNumber: number;
  callAmount: string;
  dueDate: Date;
  purpose?: string;
}

export interface CapitalReceivedPayload {
  callId: string;
  fundId: string;
  lenderId: string;
  organizationId: string;
  amount: string;
  receivedDate: Date;
}

export interface CapitalAllocatedPayload {
  allocationId: string;
  fundId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  allocatedDate: Date;
}

export interface CapitalReturnedPayload {
  allocationId: string;
  fundId: string;
  loanId: string;
  organizationId: string;
  amount: string;
  returnedDate: Date;
}

export interface DistributionMadePayload {
  distributionId: string;
  fundId: string;
  organizationId: string;
  totalAmount: string;
  distributionType: string;
  distributionDate: Date;
}

/**
 * Event Type Constants
 *
 * Centralized event type strings to avoid typos.
 */
export const EventTypes = {
  // Loan Events
  LOAN_CREATED: 'Loan.Created',
  LOAN_FUNDED: 'Loan.Funded',
  LOAN_STATUS_CHANGED: 'Loan.StatusChanged',
  LOAN_UPDATED: 'Loan.Updated',

  // Payment Events
  PAYMENT_SCHEDULE_CREATED: 'Payment.ScheduleCreated',
  PAYMENT_SCHEDULED: 'Payment.Scheduled',
  PAYMENT_PROCESSED: 'Payment.Processed',
  PAYMENT_FAILED: 'Payment.Failed',
  PAYMENT_LATE: 'Payment.Late',
  PAYMENT_RECONCILED: 'Payment.Reconciled',

  // Draw Events
  DRAW_REQUESTED: 'Draw.Requested',
  DRAW_APPROVED: 'Draw.Approved',
  DRAW_REJECTED: 'Draw.Rejected',
  DRAW_DISBURSED: 'Draw.Disbursed',
  DRAW_STATUS_CHANGED: 'Draw.StatusChanged',

  // Compliance Events
  DOCUMENT_GENERATED: 'Compliance.DocumentGenerated',
  DOCUMENT_SIGNED: 'Compliance.DocumentSigned',

  // Fund Events
  FUND_CREATED: 'Fund.Created',
  FUND_UPDATED: 'Fund.Updated',
  FUND_CLOSED: 'Fund.Closed',
  COMMITMENT_ADDED: 'Fund.CommitmentAdded',
  COMMITMENT_CANCELLED: 'Fund.CommitmentCancelled',
  COMMITMENT_ACTIVATED: 'Fund.CommitmentActivated',
  CAPITAL_CALLED: 'Fund.CapitalCalled',
  CAPITAL_RECEIVED: 'Fund.CapitalReceived',
  CAPITAL_ALLOCATED: 'Fund.CapitalAllocated',
  CAPITAL_RETURNED: 'Fund.CapitalReturned',
  DISTRIBUTION_MADE: 'Fund.DistributionMade',
  DISTRIBUTION_POSTED: 'Fund.DistributionPosted',
  CAPITAL_EVENT_RECORDED: 'Fund.CapitalEventRecorded',

  // Inspection / Loan Alerts
  INSPECTION_DUE: 'Inspection.Due',
  INSPECTION_OVERDUE: 'Inspection.Overdue',
  LOAN_DELINQUENT: 'Loan.Delinquent',

  // Investor Events
  INVESTOR_CREATED: 'Investor.Created',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];
