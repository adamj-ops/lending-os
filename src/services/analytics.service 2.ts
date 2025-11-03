import { and, count, eq, gte, lte, sql, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  fundSnapshots,
  loanSnapshots,
  paymentSnapshots,
  inspectionSnapshots,
  eventIngest,
} from "@/db/schema";
import { loans, lenders, payments, inspections, properties } from "@/db/schema";
import { fundLoanAllocations } from "@/db/schema/funds";
import { LoanStatus } from "@/types/loan";

function toYyyyMmDd(date?: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : (date || new Date());
  return d.toISOString().slice(0, 10);
}

interface DomainEventInput {
  id: string;
  type: string;
  domain?: string;
  aggregateId?: string;
  payload: Record<string, any>;
  occurredAt: string | Date;
}

export class AnalyticsService {
  // ============ COMPUTE SNAPSHOTS (BATCH) ============

  static async computeFundSnapshot(snapshotDate?: string | Date) {
    const dateStr = toYyyyMmDd(snapshotDate);

    // Totals from lenders table
    const totals = await db
      .select({
        totalCommitments: sql<string>`COALESCE(SUM(${lenders.totalCommitted}), '0')`,
        capitalDeployed: sql<string>`COALESCE(SUM(${lenders.totalDeployed}), '0')`,
      })
      .from(lenders);

    const totalCommitments = totals[0]?.totalCommitments || "0";
    const capitalDeployed = totals[0]?.capitalDeployed || "0";

    // avgInvestorYield not yet modeled → leave null for now
    const [row] = await db
      .insert(fundSnapshots)
      .values({
        snapshotDate: dateStr,
        totalCommitments,
        capitalDeployed,
        avgInvestorYield: null,
      })
      .onConflictDoUpdate({
        target: [fundSnapshots.snapshotDate],
        set: {
          totalCommitments,
          capitalDeployed,
          avgInvestorYield: null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  static async computeLoanSnapshot(snapshotDate?: string | Date) {
    const dateStr = toYyyyMmDd(snapshotDate);

    // Active loans (simple status-based)
    const activeCountRes = await db
      .select({ c: count() })
      .from(loans)
      .where(eq(loans.status, "funded"));
    const activeCount = Number(activeCountRes[0]?.c || 0);

    // Delinquent count (placeholder: 0 until we model due dates/aging)
    const delinquentCount = 0;

    // Total principal across funded loans
    const totalPrincipalRes = await db
      .select({
        total: sql<string>`COALESCE(SUM(${loans.principal}), '0')`,
      })
      .from(loans)
      .where(eq(loans.status, "funded"));
    const totalPrincipal = totalPrincipalRes[0]?.total || "0";

    // Avg LTV (principal / property.estimated_value) for loans that have property with estimated_value
    const avgLtvRes = await db
      .select({
        avg: sql<string>`COALESCE(AVG(${loans.principal} / NULLIF(${properties.estimatedValue}, 0)), NULL)`,
      })
      .from(loans)
      .leftJoin(properties, eq(loans.propertyId, properties.id))
      .where(eq(loans.status, "funded"));
    const avgLtv = avgLtvRes[0]?.avg || null;

    // Interest accrued is non-trivial; placeholder 0 until a daily accrual job exists
    const interestAccrued = "0";

    const [row] = await db
      .insert(loanSnapshots)
      .values({
        snapshotDate: dateStr,
        activeCount,
        delinquentCount,
        avgLtv,
        totalPrincipal,
        interestAccrued,
      })
      .onConflictDoUpdate({
        target: [loanSnapshots.snapshotDate],
        set: {
          activeCount,
          delinquentCount,
          avgLtv,
          totalPrincipal,
          interestAccrued,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  static async computePaymentSnapshot(snapshotDate?: string | Date) {
    const dateStr = toYyyyMmDd(snapshotDate);

    // Amounts received on the date
    const receivedRes = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(and(eq(payments.status, "completed"), eq(payments.receivedDate, dateStr)));
    const amountReceived = receivedRes[0]?.total || "0";

    // Amounts scheduled on the date (pending with payment_date == date)
    const schedRes = await db
      .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), '0')` })
      .from(payments)
      .where(and(eq(payments.status, "pending"), eq(payments.paymentDate, dateStr)));
    const amountScheduled = schedRes[0]?.total || "0";

    // Late count: pending where payment_date < today
    const today = toYyyyMmDd(new Date());
    const lateCountRes = await db
      .select({ c: count() })
      .from(payments)
      .where(and(eq(payments.status, "pending"), lte(payments.paymentDate, today)));
    const lateCount = Number(lateCountRes[0]?.c || 0);

    // Avg collection days: completed payments on the date
    const collectionRes = await db
      .select({
        avgDays: sql<string>`AVG(EXTRACT(EPOCH FROM (${payments.receivedDate}::timestamp - ${payments.paymentDate}::timestamp)) / 86400.0)`,
      })
      .from(payments)
      .where(and(eq(payments.status, "completed"), eq(payments.receivedDate, dateStr)));
    const avgCollectionDays = collectionRes[0]?.avgDays || null;

    const [row] = await db
      .insert(paymentSnapshots)
      .values({
        snapshotDate: dateStr,
        amountReceived,
        amountScheduled,
        lateCount,
        avgCollectionDays,
      })
      .onConflictDoUpdate({
        target: [paymentSnapshots.snapshotDate],
        set: {
          amountReceived,
          amountScheduled,
          lateCount,
          avgCollectionDays,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  static async computeInspectionSnapshot(snapshotDate?: string | Date) {
    const dateStr = toYyyyMmDd(snapshotDate);

    const scheduledRes = await db
      .select({ c: count() })
      .from(inspections)
      .where(eq(inspections.status, "scheduled"));
    const scheduledCount = Number(scheduledRes[0]?.c || 0);

    const completedRes = await db
      .select({ c: count() })
      .from(inspections)
      .where(eq(inspections.status, "completed"));
    const completedCount = Number(completedRes[0]?.c || 0);

    const avgHoursRes = await db
      .select({
        avgHours: sql<string>`AVG(EXTRACT(EPOCH FROM (${inspections.completedDate}::timestamp - ${inspections.scheduledDate}::timestamp)) / 3600.0)`,
      })
      .from(inspections)
      .where(and(eq(inspections.status, "completed")));
    const avgCompletionHours = avgHoursRes[0]?.avgHours || null;

    const [row] = await db
      .insert(inspectionSnapshots)
      .values({
        snapshotDate: dateStr,
        scheduledCount,
        completedCount,
        avgCompletionHours,
      })
      .onConflictDoUpdate({
        target: [inspectionSnapshots.snapshotDate],
        set: {
          scheduledCount,
          completedCount,
          avgCompletionHours,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  static async computeAll(date?: string | Date) {
    const d = toYyyyMmDd(date);
    await this.computeFundSnapshot(d);
    await this.computeLoanSnapshot(d);
    await this.computePaymentSnapshot(d);
    await this.computeInspectionSnapshot(d);
  }

  // ============ INCREMENTAL UPDATE (EVENT-DRIVEN) ============

  static async computeFromEvent(event: DomainEventInput) {
    const occurredAtStr = toYyyyMmDd(event.occurredAt);

    // Idempotent ingest (unique by event_id)
    await db
      .insert(eventIngest)
      .values({
        eventId: event.id,
        eventType: event.type,
        aggregateId: event.aggregateId || null,
        payload: event.payload as any,
        occurredAt: new Date(event.occurredAt as any),
      })
      .onConflictDoNothing({ target: [eventIngest.eventId] });

    // Dispatch minimal recompute by domain/type
    if (event.type === "Loan.Funded") {
      await this.computeLoanSnapshot(occurredAtStr);
      await this.computeFundSnapshot(occurredAtStr);
    } else if (event.type === "Payment.Received") {
      await this.computePaymentSnapshot(occurredAtStr);
      await this.computeLoanSnapshot(occurredAtStr);
    } else if (event.type === "Inspection.Completed") {
      await this.computeInspectionSnapshot(occurredAtStr);
    }

    return true;
  }

  // ============ QUERIES (KPIs + TIMELINES) ============

  static async getFundKpis(filters: {
    start?: string;
    end?: string;
    loanIds?: string[];
    propertyIds?: string[];
    statuses?: string[];
    fundIds?: string[];
    organizationId?: string;
  } = {}) {
    const start = filters.start || toYyyyMmDd(new Date(Date.now() - 30 * 86400000));
    const end = filters.end || toYyyyMmDd();
    
    // Fund snapshots are aggregate data, so filtering by fundIds, loanIds, propertyIds, or statuses
    // would require computing filtered snapshots. For now, return all snapshots in date range.
    // TODO: Implement filtered fund snapshot computation if needed for specific fund analysis
    const rows = await db
      .select()
      .from(fundSnapshots)
      .where(and(gte(fundSnapshots.snapshotDate, start), lte(fundSnapshots.snapshotDate, end)))
      .orderBy(fundSnapshots.snapshotDate);
    return rows;
  }

  static async getLoanKpis(filters: {
    start?: string;
    end?: string;
    loanIds?: string[];
    propertyIds?: string[];
    statuses?: string[];
    fundIds?: string[];
    organizationId?: string;
  } = {}) {
    const start = filters.start || toYyyyMmDd(new Date(Date.now() - 30 * 86400000));
    const end = filters.end || toYyyyMmDd();
    
    // Build conditions array for date filters
    const conditions: any[] = [
      gte(loanSnapshots.snapshotDate, start),
      lte(loanSnapshots.snapshotDate, end)
    ];

    // Note: Loan snapshots are aggregate data, so we filter at snapshot level
    // For granular filtering by loan/property/status/fund, we'd need to query raw loans table
    // and recompute snapshots for filtered loans. For now, return all snapshots in date range.
    // TODO: Implement filtered loan snapshot computation if granular filtering is needed
    
    const rows = await db
      .select()
      .from(loanSnapshots)
      .where(and(...conditions))
      .orderBy(loanSnapshots.snapshotDate);
    return rows;
  }

  static async getCollectionsKpis(filters: {
    start?: string;
    end?: string;
    loanIds?: string[];
    propertyIds?: string[];
    statuses?: string[];
    fundIds?: string[];
    organizationId?: string;
  } = {}) {
    const start = filters.start || toYyyyMmDd(new Date(Date.now() - 30 * 86400000));
    const end = filters.end || toYyyyMmDd();
    
    const conditions: any[] = [
      gte(paymentSnapshots.snapshotDate, start),
      lte(paymentSnapshots.snapshotDate, end)
    ];

    // Note: Payment snapshots are aggregate data. For granular filtering by loan/property/status/fund,
    // we'd need to filter payments table and recompute snapshots. For now, return all snapshots in date range.
    // TODO: Implement filtered payment snapshot computation if granular filtering is needed

    const rows = await db
      .select()
      .from(paymentSnapshots)
      .where(and(...conditions))
      .orderBy(paymentSnapshots.snapshotDate);
    return rows;
  }

  static async getInspectionKpis(filters: {
    start?: string;
    end?: string;
    loanIds?: string[];
    propertyIds?: string[];
    statuses?: string[];
    fundIds?: string[];
    organizationId?: string;
  } = {}) {
    const start = filters.start || toYyyyMmDd(new Date(Date.now() - 30 * 86400000));
    const end = filters.end || toYyyyMmDd();
    
    const conditions: any[] = [
      gte(inspectionSnapshots.snapshotDate, start),
      lte(inspectionSnapshots.snapshotDate, end)
    ];

    // Note: Inspection snapshots are aggregate data. For granular filtering by loan/property/status/fund,
    // we'd need to filter inspections table and recompute snapshots. For now, return all snapshots in date range.
    // TODO: Implement filtered inspection snapshot computation if granular filtering is needed

    const rows = await db
      .select()
      .from(inspectionSnapshots)
      .where(and(...conditions))
      .orderBy(inspectionSnapshots.snapshotDate);
    return rows;
  }

  // Helper method to get filtered loan IDs based on filters (including fund filtering)
  static async getFilteredLoanIds(filters: {
    loanIds?: string[];
    propertyIds?: string[];
    statuses?: string[];
    fundIds?: string[];
  }): Promise<string[] | undefined> {
    if (!filters.loanIds && !filters.propertyIds && !filters.statuses && !filters.fundIds) {
      return undefined;
    }

    const conditions: any[] = [];

    if (filters.loanIds && filters.loanIds.length > 0) {
      conditions.push(inArray(loans.id, filters.loanIds));
    }

    if (filters.propertyIds && filters.propertyIds.length > 0) {
      conditions.push(inArray(loans.propertyId, filters.propertyIds));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      conditions.push(inArray(loans.status, filters.statuses as LoanStatus[]));
    }

    // Handle fund filtering by resolving fund IDs to loan IDs via allocations
    let fundFilteredLoanIds: string[] | undefined;
    if (filters.fundIds && filters.fundIds.length > 0) {
      const allocations = await db
        .select({ loanId: fundLoanAllocations.loanId })
        .from(fundLoanAllocations)
        .where(inArray(fundLoanAllocations.fundId, filters.fundIds));
      
      fundFilteredLoanIds = allocations.map(a => a.loanId);
      
      if (fundFilteredLoanIds.length === 0) {
        // No loans allocated to selected funds, return empty array
        return [];
      }
      
      // Add fund-filtered loan IDs to conditions
      conditions.push(inArray(loans.id, fundFilteredLoanIds));
    }

    if (conditions.length === 0) {
      return undefined;
    }

    const filteredLoans = await db
      .select({ id: loans.id })
      .from(loans)
      .where(and(...conditions));

    return filteredLoans.map(l => l.id);
  }

  // Helper method to get loan IDs filtered by funds only
  static async getFilteredLoanIdsByFunds(fundIds: string[]): Promise<string[]> {
    if (fundIds.length === 0) {
      return [];
    }

    const allocations = await db
      .select({ loanId: fundLoanAllocations.loanId })
      .from(fundLoanAllocations)
      .where(inArray(fundLoanAllocations.fundId, fundIds));

    return allocations.map(a => a.loanId);
  }
}
