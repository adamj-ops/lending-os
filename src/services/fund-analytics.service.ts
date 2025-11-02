import { eq, and, sql, gte, lte, desc, count } from "drizzle-orm";
import { db } from "@/db/client";
import {
  funds,
  fundCommitments,
  fundCalls,
  fundDistributions,
  fundLoanAllocations,
  lenders,
  loans,
} from "@/db/schema";
import type {
  FundPerformance,
  FundPortfolioSummary,
  FundType,
} from "@/types/fund";

/**
 * Fund Analytics Service
 *
 * Provides comprehensive analytics for fund performance including:
 * - IRR (Internal Rate of Return) calculations
 * - MOIC (Multiple on Invested Capital) calculations
 * - Portfolio aggregations and summaries
 * - Time-weighted returns
 * - Deployment and return metrics
 */
export class FundAnalyticsService {
  /**
   * Calculate fund performance metrics including IRR and MOIC
   */
  static async calculateFundPerformance(
    fundId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<FundPerformance | null> {
    // Get fund details
    const [fund] = await db.select().from(funds).where(eq(funds.id, fundId)).limit(1);
    if (!fund) return null;

    // Set date range (default to fund inception to today)
    const start = startDate || new Date(fund.inceptionDate);
    const end = endDate || new Date();

    // Get total committed capital
    const committedRes = await db
      .select({
        total: sql<string>`COALESCE(SUM(${fundCommitments.committedAmount}), '0')`,
      })
      .from(fundCommitments)
      .where(
        and(
          eq(fundCommitments.fundId, fundId),
          eq(fundCommitments.status, "active"),
          gte(fundCommitments.commitmentDate, start),
          lte(fundCommitments.commitmentDate, end),
        ),
      );
    const totalCommitted = Number(committedRes[0]?.total || "0");

    // Get total deployed capital
    const deployedRes = await db
      .select({
        total: sql<string>`COALESCE(SUM(${fundLoanAllocations.allocatedAmount}), '0')`,
      })
      .from(fundLoanAllocations)
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          gte(fundLoanAllocations.allocationDate, start),
          lte(fundLoanAllocations.allocationDate, end),
        ),
      );
    const totalDeployed = Number(deployedRes[0]?.total || "0");

    // Get total returned capital
    const returnedRes = await db
      .select({
        total: sql<string>`COALESCE(SUM(${fundLoanAllocations.returnedAmount}), '0')`,
      })
      .from(fundLoanAllocations)
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          lte(fundLoanAllocations.allocationDate, end),
        ),
      );
    const totalReturned = Number(returnedRes[0]?.total || "0");

    // Calculate net deployed (deployed minus returned)
    const netDeployed = totalDeployed - totalReturned;

    // Calculate deployment rate (deployed / committed)
    const deploymentRate = totalCommitted > 0 ? (totalDeployed / totalCommitted) * 100 : 0;

    // Calculate return rate (returned / deployed)
    const returnRate = totalDeployed > 0 ? (totalReturned / totalDeployed) * 100 : 0;

    // Calculate average deployment days (commitment to allocation)
    const avgDeploymentDaysRes = await db
      .select({
        avgDays: sql<string>`AVG(EXTRACT(EPOCH FROM (${fundLoanAllocations.allocationDate}::timestamp - ${fundCommitments.commitmentDate}::timestamp)) / 86400.0)`,
      })
      .from(fundLoanAllocations)
      .innerJoin(fundCommitments, eq(fundLoanAllocations.fundId, fundCommitments.fundId))
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          lte(fundLoanAllocations.allocationDate, end),
        ),
      );
    const avgDeploymentDays = avgDeploymentDaysRes[0]?.avgDays || null;

    // Calculate average return days (allocation to return)
    const avgReturnDaysRes = await db
      .select({
        avgDays: sql<string>`AVG(EXTRACT(EPOCH FROM (${fundLoanAllocations.fullReturnDate}::timestamp - ${fundLoanAllocations.allocationDate}::timestamp)) / 86400.0)`,
      })
      .from(fundLoanAllocations)
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          lte(fundLoanAllocations.allocationDate, end),
          sql`${fundLoanAllocations.fullReturnDate} IS NOT NULL`,
        ),
      );
    const avgReturnDays = avgReturnDaysRes[0]?.avgDays || null;

    // Calculate IRR using cash flow approach
    // Simplified: assumes periodic cash flows for committed/allocated/returned
    const irr = await this.calculateIRR(fundId, start, end);

    // Calculate MOIC (Multiple on Invested Capital)
    const moic = totalDeployed > 0 ? totalReturned / totalDeployed : null;

    return {
      fundId: fund.id,
      fundName: fund.name,
      totalCommitted,
      totalDeployed,
      totalReturned,
      netDeployed,
      deploymentRate,
      returnRate,
      irr,
      moic,
      avgDeploymentDays: avgDeploymentDays ? Number(avgDeploymentDays) : null,
      avgReturnDays: avgReturnDays ? Number(avgReturnDays) : null,
      startDate: start,
      endDate: end,
    };
  }

  /**
   * Calculate IRR using Newton-Raphson method
   * Simplified for periodic cash flows from commitments, allocations, and returns
   */
  private static async calculateIRR(
    fundId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number | null> {
    // Get all cash flows for the fund in the date range
    const commitments = await db
      .select({
        date: fundCommitments.commitmentDate,
        amount: fundCommitments.committedAmount,
        type: sql<string>`'outflow'`,
      })
      .from(fundCommitments)
      .where(
        and(
          eq(fundCommitments.fundId, fundId),
          gte(fundCommitments.commitmentDate, startDate),
          lte(fundCommitments.commitmentDate, endDate),
        ),
      );

    const returns = await db
      .select({
        date: fundLoanAllocations.fullReturnDate,
        amount: fundLoanAllocations.returnedAmount,
        type: sql<string>`'inflow'`,
      })
      .from(fundLoanAllocations)
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          sql`${fundLoanAllocations.fullReturnDate} IS NOT NULL`,
          gte(fundLoanAllocations.fullReturnDate, startDate),
          lte(fundLoanAllocations.fullReturnDate, endDate),
        ),
      );

    // Combine and sort by date
    const cashFlows: Array<{ date: Date; amount: number; type: string }> = [
      ...commitments.map((c) => ({
        date: new Date(c.date),
        amount: Number(c.amount),
        type: c.type,
      })),
      ...returns.map((r) => ({
        date: r.date ? new Date(r.date) : new Date(),
        amount: Number(r.amount),
        type: r.type,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    // If we don't have enough data, return null
    if (cashFlows.length < 2) return null;

    // Calculate using Newton-Raphson method
    // Start with reasonable guess (e.g., 10% annual)
    let rate = 0.1;
    const tolerance = 1e-6;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashFlows, rate);
      const npvPrime = this.calculateNPVDerivative(cashFlows, rate);

      if (Math.abs(npv) < tolerance) break;

      if (Math.abs(npvPrime) < 1e-10) {
        rate = rate + 0.01; // Try a different rate
        continue;
      }

      const newRate = rate - npv / npvPrime;

      if (Math.abs(newRate - rate) < tolerance) break;

      rate = newRate;

      // Avoid extremely large or small rates
      if (rate > 10 || rate < -0.99) {
        return null;
      }
    }

    // Convert to annual percentage
    return rate * 100;
  }

  /**
   * Calculate Net Present Value of cash flows
   */
  private static calculateNPV(
    cashFlows: Array<{ date: Date; amount: number; type: string }>,
    rate: number,
  ): number {
    if (cashFlows.length === 0) return 0;

    const startDate = cashFlows[0].date;
    let npv = 0;

    for (const cf of cashFlows) {
      const days = (cf.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const years = days / 365;
      const sign = cf.type === "inflow" ? 1 : -1;
      npv += (sign * cf.amount) / Math.pow(1 + rate, years);
    }

    return npv;
  }

  /**
   * Calculate derivative of NPV for Newton-Raphson
   */
  private static calculateNPVDerivative(
    cashFlows: Array<{ date: Date; amount: number; type: string }>,
    rate: number,
  ): number {
    if (cashFlows.length === 0) return 1;

    const startDate = cashFlows[0].date;
    let derivative = 0;

    for (const cf of cashFlows) {
      const days = (cf.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const years = days / 365;
      const sign = cf.type === "inflow" ? 1 : -1;
      derivative -= (sign * cf.amount * years) / Math.pow(1 + rate, years + 1);
    }

    return derivative;
  }

  /**
   * Get portfolio summary across all funds
   */
  static async getPortfolioSummary(organizationId: string): Promise<FundPortfolioSummary | null> {
    // Get all funds for the organization
    const fundList = await db
      .select()
      .from(funds)
      .where(eq(funds.organizationId, organizationId));

    if (fundList.length === 0) return null;

    // Aggregate totals
    let totalAUM = 0;
    let totalCommitted = 0;
    let totalDeployed = 0;
    let totalReturned = 0;

    for (const fund of fundList) {
      totalAUM += Number(fund.totalDeployed) - Number(fund.totalReturned);
      totalCommitted += Number(fund.totalCommitted);
      totalDeployed += Number(fund.totalDeployed);
      totalReturned += Number(fund.totalReturned);
    }

    // Calculate portfolio IRR and MOIC
    let portfolioIRR: number | null = null;
    let portfolioMOIC: number | null = totalDeployed > 0 ? totalReturned / totalDeployed : null;

    // Get performance data for all funds to calculate weighted IRR
    let totalWeightedIRR = 0;
    let totalWeight = 0;

    for (const fund of fundList) {
      const performance = await this.calculateFundPerformance(fund.id);
      if (performance && performance.irr !== null && performance.irr !== undefined) {
        const weight = performance.totalDeployed;
        totalWeightedIRR += performance.irr * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      portfolioIRR = totalWeightedIRR / totalWeight;
    }

    // Group by fund type
    const byFundType: Array<{
      fundType: FundType;
      count: number;
      totalAUM: number;
      avgIRR: number | null;
    }> = [];

    const fundTypes = ["private", "syndicated", "institutional"] as const;
    for (const type of fundTypes) {
      const typeFunds = fundList.filter((f) => f.fundType === type);
      const count = typeFunds.length;

      if (count === 0) continue;

      let totalTypeAUM = 0;
      let totalTypeIRR = 0;
      let typeIRRCount = 0;

      for (const fund of typeFunds) {
        totalTypeAUM += Number(fund.totalDeployed) - Number(fund.totalReturned);
        const perf = await this.calculateFundPerformance(fund.id);
        if (perf && perf.irr !== null && perf.irr !== undefined) {
          totalTypeIRR += perf.irr;
          typeIRRCount++;
        }
      }

      byFundType.push({
        fundType: type,
        count,
        totalAUM: totalTypeAUM,
        avgIRR: typeIRRCount > 0 ? totalTypeIRR / typeIRRCount : null,
      });
    }

    // Get top performers (by MOIC or IRR)
    const topFunds: Array<{
      fundId: string;
      fundName: string;
      aum: number;
      irr: number | null;
      moic: number | null;
    }> = [];

    const performances = await Promise.all(
      fundList.map(async (fund) => {
        const perf = await this.calculateFundPerformance(fund.id);
        return perf ? { ...perf, fund } : null;
      }),
    );

    const validPerformances = performances.filter((p) => p !== null);
    topFunds.push(
      ...validPerformances
        .sort((a, b) => {
          // Sort by MOIC descending, then by IRR descending
          if (a.moic !== null && b.moic !== null) {
            return b.moic - a.moic;
          }
          if (a.moic !== null) return -1;
          if (b.moic !== null) return 1;
          if (a.irr !== null && b.irr !== null) {
            return b.irr - a.irr;
          }
          return 0;
        })
        .slice(0, 5)
        .map((p) => ({
          fundId: p.fund.id,
          fundName: p.fund.name,
          aum: Number(p.fund.totalDeployed) - Number(p.fund.totalReturned),
          irr: p.irr,
          moic: p.moic,
        })),
    );

    return {
      organizationId,
      totalFunds: fundList.length,
      activeFunds: fundList.filter((f) => f.status === "active").length,
      totalAUM,
      totalCommitted,
      totalDeployed,
      totalReturned,
      portfolioIRR,
      portfolioMOIC,
      byFundType,
      topFunds,
    };
  }

  /**
   * Get fund comparison data for multiple funds
   */
  static async getFundComparison(
    fundIds: string[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<FundPerformance[]> {
    const performances = await Promise.all(
      fundIds.map((fundId) => this.calculateFundPerformance(fundId, startDate, endDate)),
    );

    return performances.filter((p) => p !== null) as FundPerformance[];
  }

  /**
   * Get deployment timeline for a fund
   */
  static async getDeploymentTimeline(
    fundId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<{ date: Date; allocated: number; returned: number }>> {
    const fund = await db.select().from(funds).where(eq(funds.id, fundId)).limit(1);
    if (!fund.length) return [];

    const start = startDate || new Date(fund[0].inceptionDate);
    const end = endDate || new Date();

    const allocations = await db
      .select({
        date: fundLoanAllocations.allocationDate,
        amount: fundLoanAllocations.allocatedAmount,
      })
      .from(fundLoanAllocations)
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          gte(fundLoanAllocations.allocationDate, start),
          lte(fundLoanAllocations.allocationDate, end),
        ),
      )
      .orderBy(fundLoanAllocations.allocationDate);

    const returns = await db
      .select({
        date: fundLoanAllocations.fullReturnDate,
        amount: fundLoanAllocations.returnedAmount,
      })
      .from(fundLoanAllocations)
      .where(
        and(
          eq(fundLoanAllocations.fundId, fundId),
          sql`${fundLoanAllocations.fullReturnDate} IS NOT NULL`,
          gte(fundLoanAllocations.fullReturnDate, start),
          lte(fundLoanAllocations.fullReturnDate, end),
        ),
      )
      .orderBy(fundLoanAllocations.fullReturnDate);

    const timeline: Map<string, { allocated: number; returned: number }> = new Map();

    allocations.forEach((a) => {
      const dateStr = new Date(a.date).toISOString().slice(0, 10);
      const existing = timeline.get(dateStr) || { allocated: 0, returned: 0 };
      timeline.set(dateStr, {
        ...existing,
        allocated: existing.allocated + Number(a.amount),
      });
    });

    returns.forEach((r) => {
      if (!r.date) return;
      const dateStr = new Date(r.date).toISOString().slice(0, 10);
      const existing = timeline.get(dateStr) || { allocated: 0, returned: 0 };
      timeline.set(dateStr, {
        ...existing,
        returned: existing.returned + Number(r.amount),
      });
    });

    return Array.from(timeline.entries())
      .map(([date, data]) => ({
        date: new Date(date),
        allocated: data.allocated,
        returned: data.returned,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get top performing investments for a fund
   */
  static async getTopInvestments(
    fundId: string,
    limit: number = 5,
  ): Promise<Array<{ loanId: string; loanName: string; moic: number; irr: number | null }>> {
    const allocations = await db
      .select({
        allocationId: fundLoanAllocations.id,
        loanId: fundLoanAllocations.loanId,
        allocatedAmount: fundLoanAllocations.allocatedAmount,
        returnedAmount: fundLoanAllocations.returnedAmount,
        allocationDate: fundLoanAllocations.allocationDate,
        fullReturnDate: fundLoanAllocations.fullReturnDate,
      })
      .from(fundLoanAllocations)
      .where(eq(fundLoanAllocations.fundId, fundId));

    const loanList = await db
      .select({
        id: loans.id,
        borrowerId: loans.borrowerId,
        principal: loans.principal,
      })
      .from(loans);

    const results = allocations
      .map((alloc) => {
        const loan = loanList.find((l) => l.id === alloc.loanId);
        if (!loan) return null;

        const moic =
          Number(alloc.allocatedAmount) > 0
            ? Number(alloc.returnedAmount) / Number(alloc.allocatedAmount)
            : 0;

        // Calculate simple IRR for this allocation (return / allocation) ^ (1/years) - 1
        let irr: number | null = null;
        if (
          alloc.fullReturnDate &&
          alloc.returnedAmount &&
          Number(alloc.returnedAmount) > 0
        ) {
          const years =
            (new Date(alloc.fullReturnDate).getTime() -
              new Date(alloc.allocationDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365);
          if (years > 0 && moic > 0) {
            irr = (Math.pow(moic, 1 / years) - 1) * 100;
          }
        }

        return {
          loanId: alloc.loanId,
          loanName: `Loan ${alloc.loanId.slice(0, 8)}`,
          moic,
          irr,
        };
      })
      .filter((r): r is { loanId: string; loanName: string; moic: number; irr: number | null } => r !== null)
      .sort((a, b) => b.moic - a.moic)
      .slice(0, limit);

    return results;
  }
}

