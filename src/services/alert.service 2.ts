import { db } from "@/db/client";
import { alerts, type Alert, type NewAlert } from "@/db/schema/alerts";
import { loans, payments, inspections } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

interface DomainEvent {
  id: string;
  eventType: string;
  aggregateType: string | null;
  aggregateId: string | null;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
}

interface AlertConfig {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  messageTemplate: (payload: Record<string, unknown>) => string;
}

export class AlertService {
  /**
   * Create alert from domain event
   */
  static async handleEvent(event: DomainEvent): Promise<Alert | null> {
    const alertConfig = this.getAlertConfig(event.eventType);
    if (!alertConfig) {
      return null; // Event type doesn't trigger alerts
    }

    try {
      const [alert] = await db
        .insert(alerts)
        .values({
          entityType: (event.aggregateType || 'system') as string,
          entityId: event.aggregateId || event.id,
          code: alertConfig.code,
          severity: alertConfig.severity,
          message: alertConfig.messageTemplate(event.payload),
          metadata: event.metadata as any,
        })
        .returning();

      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Query alerts with optional filters
   */
  static async getAlerts(filters: { 
    status?: 'unread' | 'read' | 'archived'; 
    limit?: number;
    severity?: 'info' | 'warning' | 'critical';
    organizationId?: string;
  } = {}) {
    const { status, limit = 50, severity } = filters;

    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(alerts.status, status));
    }

    if (severity) {
      conditions.push(eq(alerts.severity, severity));
    }

    const query = db
      .select()
      .from(alerts)
      .orderBy(desc(alerts.createdAt))
      .limit(Math.min(limit, 100)); // Cap at 100

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  /**
   * Mark alert as read
   */
  static async markAsRead(alertId: string, organizationId?: string): Promise<Alert> {
    // First get the alert to check entity ownership
    const [alert] = await db
      .select()
      .from(alerts)
      .where(eq(alerts.id, alertId))
      .limit(1);

    if (!alert) {
      throw new Error('Alert not found');
    }

    // If organizationId provided, verify alert's entity belongs to that organization
    if (organizationId && alert.entityId && alert.entityType) {
      // Check entity ownership based on entityType
      if (alert.entityType === 'loan') {
        const [loan] = await db
          .select()
          .from(loans)
          .where(and(eq(loans.id, alert.entityId), eq(loans.organizationId, organizationId)))
          .limit(1);
        if (!loan) {
          throw new Error('Alert does not belong to your organization');
        }
      } else if (alert.entityType === 'payment') {
        // Payments reference loans, so check via loan's organizationId
        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.id, alert.entityId))
          .limit(1);
        if (payment) {
          const [loan] = await db
            .select()
            .from(loans)
            .where(and(eq(loans.id, payment.loanId), eq(loans.organizationId, organizationId)))
            .limit(1);
          if (!loan) {
            throw new Error('Alert does not belong to your organization');
          }
        }
      } else if (alert.entityType === 'inspection') {
        // Inspections reference draws, which reference loans
        const [inspection] = await db
          .select()
          .from(inspections)
          .where(eq(inspections.id, alert.entityId))
          .limit(1);
        if (inspection && inspection.drawId) {
          // Would need to join through draws->loans, but for now skip verification
          // TODO: Add proper verification once draw->loan relationship is clearer
        }
      }
    }

    // Mark as read
    const [updatedAlert] = await db
      .update(alerts)
      .set({ 
        status: 'read', 
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(alerts.id, alertId))
      .returning();

    return updatedAlert;
  }

  /**
   * Mark alert as archived
   */
  static async archive(alertId: string): Promise<Alert> {
    const [alert] = await db
      .update(alerts)
      .set({ 
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(alerts.id, alertId))
      .returning();

    if (!alert) {
      throw new Error('Alert not found');
    }

    return alert;
  }

  /**
   * Delete alert (hard delete)
   */
  static async delete(alertId: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, alertId));
  }

  /**
   * Get alert configuration for event types
   */
  private static getAlertConfig(eventType: string): AlertConfig | null {
    const configs: Record<string, AlertConfig> = {
      'Payment.Late': {
        code: 'PAYMENT_LATE',
        severity: 'warning',
        messageTemplate: (p: Record<string, unknown>) => 
          `Payment ${p.paymentId || 'N/A'} is ${p.daysLate || '?'} days overdue`,
      },
      'Payment.Failed': {
        code: 'PAYMENT_FAILED',
        severity: 'critical',
        messageTemplate: (p: Record<string, unknown>) => 
          `Payment ${p.paymentId || 'N/A'} failed: ${p.reason || 'Unknown reason'}`,
      },
      'Draw.StatusChanged': {
        code: 'DRAW_STATUS_CHANGED',
        severity: 'info',
        messageTemplate: (p: Record<string, unknown>) => 
          `Draw request ${p.drawId || 'N/A'} status changed to ${p.newStatus || 'unknown'}`,
      },
      'Draw.Approved': {
        code: 'DRAW_APPROVED',
        severity: 'info',
        messageTemplate: (p: Record<string, unknown>) => 
          `Draw request ${p.drawId || 'N/A'} approved for $${p.amount || '0'}`,
      },
      'Draw.Rejected': {
        code: 'DRAW_REJECTED',
        severity: 'warning',
        messageTemplate: (p: Record<string, unknown>) => 
          `Draw request ${p.drawId || 'N/A'} rejected: ${p.reason || 'No reason provided'}`,
      },
      'Inspection.Due': {
        code: 'INSPECTION_DUE',
        severity: 'warning',
        messageTemplate: (p: Record<string, unknown>) => 
          `Inspection ${p.inspectionId || 'N/A'} is due within 24 hours`,
      },
      'Inspection.Overdue': {
        code: 'INSPECTION_OVERDUE',
        severity: 'critical',
        messageTemplate: (p: Record<string, unknown>) => 
          `Inspection ${p.inspectionId || 'N/A'} is overdue by ${p.daysOverdue || '?'} days`,
      },
      'Loan.Delinquent': {
        code: 'LOAN_DELINQUENT',
        severity: 'critical',
        messageTemplate: (p: Record<string, unknown>) => 
          `Loan ${p.loanId || 'N/A'} is now delinquent`,
      },
    };

    return configs[eventType] || null;
  }
}

