/**
 * Fund Alert Handlers
 *
 * Creates alerts for important fund domain events.
 * Handlers:
 * - CommitmentActivatedAlertHandler: Notifies when new commitments are activated
 * - DistributionPostedAlertHandler: Notifies when distributions are posted
 * - CapitalLowAlertHandler: Warns when fund capital is running low
 */

import { DomainEvent } from '../types';
import { AlertService } from '@/services/alert.service';

/**
 * Alert when commitment is activated
 */
export class CommitmentActivatedAlertHandler {
  static readonly HANDLER_NAME = 'CommitmentActivatedAlertHandler';
  static readonly PRIORITY = 100;

  static async handle(event: DomainEvent): Promise<void> {
    console.log(`🔔 [${this.HANDLER_NAME}] Processing commitment activation`);

    const { fundId, investorId, amount } = event.payload as any;

    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Commitment.Activated',
      aggregateType: 'Commitment',
      aggregateId: event.aggregateId,
      payload: {
        commitmentId: event.aggregateId,
        fundId,
        investorId,
        amount,
        activatedAt: new Date().toISOString(),
      },
      metadata: event.metadata,
    });
  }
}

/**
 * Alert when distribution is posted
 */
export class DistributionPostedAlertHandler {
  static readonly HANDLER_NAME = 'DistributionPostedAlertHandler';
  static readonly PRIORITY = 100;

  static async handle(event: DomainEvent): Promise<void> {
    console.log(`🔔 [${this.HANDLER_NAME}] Processing distribution posted`);

    const { accountId, fundId, investorId, amount, effectiveDate } = event.payload as any;

    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Distribution.Posted',
      aggregateType: 'CapitalEvent',
      aggregateId: event.aggregateId,
      payload: {
        distributionId: event.aggregateId,
        accountId,
        fundId,
        investorId,
        amount,
        effectiveDate,
      },
      metadata: event.metadata,
    });
  }
}

/**
 * Alert when fund is created
 */
export class FundCreatedAlertHandler {
  static readonly HANDLER_NAME = 'FundCreatedAlertHandler';
  static readonly PRIORITY = 100;

  static async handle(event: DomainEvent): Promise<void> {
    console.log(`🔔 [${this.HANDLER_NAME}] Processing fund creation`);

    const { name, status, inceptionDate, targetSize } = event.payload as any;

    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Fund.Created',
      aggregateType: 'Fund',
      aggregateId: event.aggregateId,
      payload: {
        fundId: event.aggregateId,
        name,
        status,
        inceptionDate,
        targetSize,
      },
      metadata: event.metadata,
    });
  }
}

/**
 * Alert when investor is created
 */
export class InvestorCreatedAlertHandler {
  static readonly HANDLER_NAME = 'InvestorCreatedAlertHandler';
  static readonly PRIORITY = 100;

  static async handle(event: DomainEvent): Promise<void> {
    console.log(`🔔 [${this.HANDLER_NAME}] Processing investor creation`);

    const { fundId, name, email, accreditationStatus } = event.payload as any;

    await AlertService.handleEvent({
      id: event.id,
      eventType: 'Investor.Created',
      aggregateType: 'Investor',
      aggregateId: event.aggregateId,
      payload: {
        investorId: event.aggregateId,
        fundId,
        name,
        email,
        accreditationStatus,
      },
      metadata: event.metadata,
    });
  }
}
