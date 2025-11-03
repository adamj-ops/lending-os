/**
 * Alert Event Handlers
 *
 * Handlers that create alerts from domain events.
 */

import { AlertService } from '@/services/alert.service';
import type { DomainEvent } from './types';

/**
 * Handler for Payment.Late events
 * Creates critical alert when payment is late
 */
export async function handlePaymentLate(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Payment.Late',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Payment.Late:', error);
    throw error;
  }
}

/**
 * Handler for Payment.Failed events
 */
export async function handlePaymentFailed(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Payment.Failed',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Payment.Failed:', error);
    throw error;
  }
}

/**
 * Handler for Draw.StatusChanged events
 */
export async function handleDrawStatusChanged(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Draw.StatusChanged',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Draw.StatusChanged:', error);
    throw error;
  }
}

/**
 * Handler for Draw.Approved events
 */
export async function handleDrawApproved(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Draw.Approved',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Draw.Approved:', error);
    throw error;
  }
}

/**
 * Handler for Draw.Rejected events
 */
export async function handleDrawRejected(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Draw.Rejected',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Draw.Rejected:', error);
    throw error;
  }
}

/**
 * Handler for Inspection.Due events
 */
export async function handleInspectionDue(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Inspection.Due',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Inspection.Due:', error);
    throw error;
  }
}

/**
 * Handler for Inspection.Overdue events
 */
export async function handleInspectionOverdue(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Inspection.Overdue',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Inspection.Overdue:', error);
    throw error;
  }
}

/**
 * Handler for Loan.Delinquent events
 */
export async function handleLoanDelinquent(event: DomainEvent): Promise<void> {
  try {
    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Loan.Delinquent',
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata,
    });
  } catch (error) {
    console.error('Error creating alert for Loan.Delinquent:', error);
    throw error;
  }
}

