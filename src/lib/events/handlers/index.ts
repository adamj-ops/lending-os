/**
 * Event Handlers Registry
 *
 * Central registration point for all event handlers.
 * Import this file to register all handlers with the event bus.
 */

import { eventBus } from '../EventBus';
import { EventTypes, EventHandler } from '../types';
import { handleLoanFunded } from './PaymentScheduleCreator';
import {
  handlePaymentLate,
  handlePaymentFailed,
  handleDrawStatusChanged,
  handleDrawApproved,
  handleDrawRejected,
  handleInspectionDue,
  handleInspectionOverdue,
  handleLoanDelinquent,
} from '../alert-handlers';
import { FundAnalyticsHandler } from './FundAnalyticsHandler';
import {
  CommitmentActivatedAlertHandler,
  DistributionPostedAlertHandler,
  FundCreatedAlertHandler,
  InvestorCreatedAlertHandler,
} from './FundAlertHandlers';
import {
  handleLoanCreated,
  handleInvestorCreated,
  handleDocumentCompleted,
  handleLoanFundedAudit,
  handlePaymentReceivedAudit,
} from './ComplianceHandlers';
import {
  handleKYCApproved,
  handleKYCRejected,
  handleKYCRequiresReview,
  handleLoanCreatedKYCCheck,
} from './KYCHandlers';

/**
 * Register all event handlers
 *
 * Call this function on application startup to register all handlers.
 */
export function registerEventHandlers(): void {
  console.log('Registering event handlers...');

  // Payment Domain Handlers
  eventBus.subscribe({
    handlerName: 'PaymentScheduleCreator',
    eventType: EventTypes.LOAN_FUNDED,
    handler: handleLoanFunded as EventHandler,
    priority: 10, // Execute first
    isEnabled: true,
  });

  // Alert Handlers - Payment Domain
  eventBus.subscribe({
    handlerName: 'PaymentLateAlertHandler',
    eventType: EventTypes.PAYMENT_LATE,
    handler: handlePaymentLate,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'PaymentFailedAlertHandler',
    eventType: EventTypes.PAYMENT_FAILED,
    handler: handlePaymentFailed,
    priority: 5,
    isEnabled: true,
  });

  // Alert Handlers - Draw Domain
  eventBus.subscribe({
    handlerName: 'DrawStatusChangedAlertHandler',
    eventType: EventTypes.DRAW_STATUS_CHANGED,
    handler: handleDrawStatusChanged,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'DrawApprovedAlertHandler',
    eventType: EventTypes.DRAW_APPROVED,
    handler: handleDrawApproved,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'DrawRejectedAlertHandler',
    eventType: EventTypes.DRAW_REJECTED,
    handler: handleDrawRejected,
    priority: 5,
    isEnabled: true,
  });

  // Alert Handlers - Inspection Domain
  eventBus.subscribe({
    handlerName: 'InspectionDueAlertHandler',
    eventType: EventTypes.INSPECTION_DUE,
    handler: handleInspectionDue,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'InspectionOverdueAlertHandler',
    eventType: EventTypes.INSPECTION_OVERDUE,
    handler: handleInspectionOverdue,
    priority: 5,
    isEnabled: true,
  });

  // Alert Handlers - Loan Domain
  eventBus.subscribe({
    handlerName: 'LoanDelinquentAlertHandler',
    eventType: EventTypes.LOAN_DELINQUENT,
    handler: handleLoanDelinquent,
    priority: 5,
    isEnabled: true,
  });

  // Fund Analytics Handler
  eventBus.subscribe({
    handlerName: FundAnalyticsHandler.HANDLER_NAME,
    eventType: EventTypes.FUND_CREATED,
    handler: FundAnalyticsHandler.handle.bind(FundAnalyticsHandler),
    priority: FundAnalyticsHandler.PRIORITY,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: FundAnalyticsHandler.HANDLER_NAME,
    eventType: EventTypes.COMMITMENT_ACTIVATED,
    handler: FundAnalyticsHandler.handle.bind(FundAnalyticsHandler),
    priority: FundAnalyticsHandler.PRIORITY,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: FundAnalyticsHandler.HANDLER_NAME,
    eventType: EventTypes.DISTRIBUTION_POSTED,
    handler: FundAnalyticsHandler.handle.bind(FundAnalyticsHandler),
    priority: FundAnalyticsHandler.PRIORITY,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: FundAnalyticsHandler.HANDLER_NAME,
    eventType: EventTypes.CAPITAL_EVENT_RECORDED,
    handler: FundAnalyticsHandler.handle.bind(FundAnalyticsHandler),
    priority: FundAnalyticsHandler.PRIORITY,
    isEnabled: true,
  });

  // Fund Alert Handlers
  eventBus.subscribe({
    handlerName: CommitmentActivatedAlertHandler.HANDLER_NAME,
    eventType: EventTypes.COMMITMENT_ACTIVATED,
    handler: CommitmentActivatedAlertHandler.handle.bind(CommitmentActivatedAlertHandler),
    priority: CommitmentActivatedAlertHandler.PRIORITY,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: DistributionPostedAlertHandler.HANDLER_NAME,
    eventType: EventTypes.DISTRIBUTION_POSTED,
    handler: DistributionPostedAlertHandler.handle.bind(DistributionPostedAlertHandler),
    priority: DistributionPostedAlertHandler.PRIORITY,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: FundCreatedAlertHandler.HANDLER_NAME,
    eventType: EventTypes.FUND_CREATED,
    handler: FundCreatedAlertHandler.handle.bind(FundCreatedAlertHandler),
    priority: FundCreatedAlertHandler.PRIORITY,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: InvestorCreatedAlertHandler.HANDLER_NAME,
    eventType: EventTypes.INVESTOR_CREATED,
    handler: InvestorCreatedAlertHandler.handle.bind(InvestorCreatedAlertHandler),
    priority: InvestorCreatedAlertHandler.PRIORITY,
    isEnabled: true,
  });

  // Compliance Handlers
  eventBus.subscribe({
    handlerName: 'ComplianceLoanCreatedHandler',
    eventType: EventTypes.LOAN_CREATED,
    handler: handleLoanCreated as EventHandler,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'ComplianceInvestorCreatedHandler',
    eventType: EventTypes.INVESTOR_CREATED,
    handler: handleInvestorCreated as EventHandler,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'ComplianceDocumentCompletedHandler',
    eventType: 'Document.Completed', // Custom event type from SignatureService
    handler: handleDocumentCompleted as EventHandler,
    priority: 5,
    isEnabled: true,
  });

  // KYC Handlers
  eventBus.subscribe({
    handlerName: 'KYCApprovedHandler',
    eventType: 'KYC.Approved',
    handler: handleKYCApproved as EventHandler,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'KYCRejectedHandler',
    eventType: 'KYC.Rejected',
    handler: handleKYCRejected as EventHandler,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'KYCRequiresReviewHandler',
    eventType: 'KYC.RequiresReview',
    handler: handleKYCRequiresReview as EventHandler,
    priority: 5,
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'LoanCreatedKYCCheckHandler',
    eventType: EventTypes.LOAN_CREATED,
    handler: handleLoanCreatedKYCCheck as EventHandler,
    priority: 1, // Run before other Loan.Created handlers
    isEnabled: true,
  });

  // Compliance Audit Handlers
  eventBus.subscribe({
    handlerName: 'ComplianceLoanFundedAuditHandler',
    eventType: EventTypes.LOAN_FUNDED,
    handler: handleLoanFundedAudit as EventHandler,
    priority: 10, // Run after other handlers
    isEnabled: true,
  });

  eventBus.subscribe({
    handlerName: 'CompliancePaymentReceivedAuditHandler',
    eventType: EventTypes.PAYMENT_PROCESSED,
    handler: handlePaymentReceivedAudit as EventHandler,
    priority: 10, // Run after other handlers
    isEnabled: true,
  });

  console.log('Event handlers registered successfully (including 8 alert handlers + 9 fund handlers + 3 compliance handlers + 4 KYC handlers + 2 audit handlers)');
}

/**
 * Unregister all event handlers
 *
 * Useful for testing or cleanup.
 */
export function unregisterEventHandlers(): void {
  eventBus.unsubscribe('PaymentScheduleCreator');
  eventBus.unsubscribe('PaymentLateAlertHandler');
  eventBus.unsubscribe('PaymentFailedAlertHandler');
  eventBus.unsubscribe('DrawStatusChangedAlertHandler');
  eventBus.unsubscribe('DrawApprovedAlertHandler');
  eventBus.unsubscribe('DrawRejectedAlertHandler');
  eventBus.unsubscribe('InspectionDueAlertHandler');
  eventBus.unsubscribe('InspectionOverdueAlertHandler');
  eventBus.unsubscribe('LoanDelinquentAlertHandler');
  eventBus.unsubscribe(FundAnalyticsHandler.HANDLER_NAME);
  eventBus.unsubscribe(CommitmentActivatedAlertHandler.HANDLER_NAME);
  eventBus.unsubscribe(DistributionPostedAlertHandler.HANDLER_NAME);
  eventBus.unsubscribe(FundCreatedAlertHandler.HANDLER_NAME);
  eventBus.unsubscribe(InvestorCreatedAlertHandler.HANDLER_NAME);
  eventBus.unsubscribe('ComplianceLoanCreatedHandler');
  eventBus.unsubscribe('ComplianceInvestorCreatedHandler');
  eventBus.unsubscribe('ComplianceDocumentCompletedHandler');
  eventBus.unsubscribe('KYCApprovedHandler');
  eventBus.unsubscribe('KYCRejectedHandler');
  eventBus.unsubscribe('KYCRequiresReviewHandler');
  eventBus.unsubscribe('LoanCreatedKYCCheckHandler');
  eventBus.unsubscribe('ComplianceLoanFundedAuditHandler');
  eventBus.unsubscribe('CompliancePaymentReceivedAuditHandler');
}

// Export individual handlers for testing
export {
  handleLoanFunded,
  handlePaymentLate,
  handlePaymentFailed,
  handleDrawStatusChanged,
  handleDrawApproved,
  handleDrawRejected,
  handleInspectionDue,
  handleInspectionOverdue,
  handleLoanDelinquent,
  FundAnalyticsHandler,
  CommitmentActivatedAlertHandler,
  DistributionPostedAlertHandler,
  FundCreatedAlertHandler,
  InvestorCreatedAlertHandler,
  handleLoanCreated,
  handleInvestorCreated,
  handleDocumentCompleted,
  handleLoanFundedAudit,
  handlePaymentReceivedAudit,
  handleKYCApproved,
  handleKYCRejected,
  handleKYCRequiresReview,
  handleLoanCreatedKYCCheck,
};
