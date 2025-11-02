/**
 * Fund Analytics Handler
 *
 * Responds to fund domain events to update analytics snapshots.
 * Triggered by: Fund.Created, Commitment.Activated, Distribution.Posted, CapitalEvent.Recorded
 */

import { DomainEvent } from '../types';
import { AnalyticsService } from '@/services/analytics.service';

export class FundAnalyticsHandler {
  static readonly HANDLER_NAME = 'FundAnalyticsHandler';
  static readonly PRIORITY = 50; // Execute before alert handlers

  /**
   * Handle fund-related events and update analytics snapshots
   */
  static async handle(event: DomainEvent): Promise<void> {
    console.log(`📊 [${this.HANDLER_NAME}] Processing event: ${event.eventType}`);

    try {
      switch (event.eventType) {
        case 'Fund.Created':
          await this.handleFundCreated(event);
          break;

        case 'Commitment.Activated':
          await this.handleCommitmentActivated(event);
          break;

        case 'Distribution.Posted':
        case 'CapitalEvent.Recorded':
          await this.handleCapitalEvent(event);
          break;

        default:
          console.log(`⚠️  [${this.HANDLER_NAME}] Unhandled event type: ${event.eventType}`);
      }
    } catch (error) {
      console.error(`❌ [${this.HANDLER_NAME}] Error processing event:`, error);
      throw error;
    }
  }

  /**
   * Handle Fund.Created event
   * - Compute initial fund snapshot
   */
  private static async handleFundCreated(event: DomainEvent): Promise<void> {
    console.log(`📊 [${this.HANDLER_NAME}] Computing initial snapshot for fund ${event.aggregateId}`);

    await AnalyticsService.computeFundSnapshot();
  }

  /**
   * Handle Commitment.Activated event
   * - Update fund snapshot with new commitment
   */
  private static async handleCommitmentActivated(event: DomainEvent): Promise<void> {
    const { fundId } = event.metadata || {};

    console.log(`📊 [${this.HANDLER_NAME}] Updating fund snapshot after commitment activation (fund: ${fundId})`);

    await AnalyticsService.computeFundSnapshot();
  }

  /**
   * Handle capital events (distributions, contributions, fees)
   * - Recalculate fund metrics
   */
  private static async handleCapitalEvent(event: DomainEvent): Promise<void> {
    const { fundId } = event.metadata || {};

    console.log(`📊 [${this.HANDLER_NAME}] Updating fund snapshot after capital event (fund: ${fundId})`);

    await AnalyticsService.computeFundSnapshot();
  }
}
