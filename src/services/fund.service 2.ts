import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
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
import {
  eventBus,
  EventTypes,
  FundCreatedPayload,
  FundUpdatedPayload,
  FundClosedPayload,
  CommitmentAddedPayload,
  CommitmentCancelledPayload,
  CapitalCalledPayload,
  CapitalAllocatedPayload,
  CapitalReturnedPayload,
  DistributionMadePayload,
} from "@/lib/events";
import type {
  Fund,
  FundCommitment,
  FundCall,
  FundDistribution,
  FundLoanAllocation,
  CreateFundDTO,
  UpdateFundDTO,
  CreateFundCommitmentDTO,
  CreateFundCallDTO,
  CreateFundDistributionDTO,
  CreateFundAllocationDTO,
  FundWithMetrics,
  FundCommitmentWithLender,
  FundAllocationWithLoan,
} from "@/types/fund";

/**
 * Fund Service
 *
 * Manages fund operations including creation, commitment management,
 * capital calls, allocations, and distributions with event publishing.
 */
export class FundService {
  /**
   * Helper to get fund's organization ID
   */
  private static async getFundOrganizationId(fundId: string): Promise<string | null> {
    const [fund] = await db
      .select({ organizationId: funds.organizationId })
      .from(funds)
      .where(eq(funds.id, fundId))
      .limit(1);
    return fund?.organizationId || null;
  }

  /**
   * Create a new fund
   */
  static async createFund(data: CreateFundDTO, createdBy?: string): Promise<Fund> {
    const [fund] = await db
      .insert(funds)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        fundType: data.fundType,
        totalCapacity: data.totalCapacity.toString(),
        inceptionDate: data.inceptionDate,
        strategy: data.strategy,
        targetReturn: data.targetReturn?.toString(),
        managementFeeBps: data.managementFeeBps || 0,
        performanceFeeBps: data.performanceFeeBps || 0,
      })
      .returning();

    // Publish Fund.Created event
    await eventBus.publish<FundCreatedPayload>({
      eventType: EventTypes.FUND_CREATED,
      eventVersion: "1.0",
      aggregateId: fund.id,
      aggregateType: "Fund",
      payload: {
        fundId: fund.id,
        organizationId: fund.organizationId,
        name: fund.name,
        fundType: fund.fundType,
        totalCapacity: fund.totalCapacity,
        inceptionDate: fund.inceptionDate,
        createdBy,
      },
      metadata: {
        organizationId: fund.organizationId,
        userId: createdBy,
        source: "FundService.createFund",
      },
    });

    return fund as Fund;
  }

  /**
   * Get fund by ID
   */
  static async getFundById(id: string, organizationId: string): Promise<Fund | null> {
    const [fund] = await db
      .select()
      .from(funds)
      .where(and(eq(funds.id, id), eq(funds.organizationId, organizationId)))
      .limit(1);

    return (fund as Fund) || null;
  }

  /**
   * Get fund with calculated metrics
   */
  static async getFundWithMetrics(id: string, organizationId: string): Promise<FundWithMetrics | null> {
    const fund = await this.getFundById(id, organizationId);
    if (!fund) return null;

    // Get investor count
    const [investorCountResult] = await db
      .select({ count: sql<number>`count(distinct ${fundCommitments.lenderId})` })
      .from(fundCommitments)
      .where(eq(fundCommitments.fundId, id));

    // Get allocation count
    const [allocationCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(fundLoanAllocations)
      .where(eq(fundLoanAllocations.fundId, id));

    // Get active call count
    const [activeCallCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(fundCalls)
      .where(
        and(eq(fundCalls.fundId, id), sql`${fundCalls.status} IN ('pending', 'sent', 'overdue')`)
      );

    const totalCommitted = parseFloat(fund.totalCommitted);
    const totalDeployed = parseFloat(fund.totalDeployed);
    const totalReturned = parseFloat(fund.totalReturned);
    const totalCapacity = parseFloat(fund.totalCapacity);

    return {
      ...fund,
      deploymentRate: totalCommitted > 0 ? (totalDeployed / totalCommitted) * 100 : 0,
      returnRate: totalDeployed > 0 ? (totalReturned / totalDeployed) * 100 : 0,
      uncommittedCapacity: totalCapacity - totalCommitted,
      availableCapital: totalCommitted - totalDeployed,
      investorCount: investorCountResult.count,
      allocationCount: allocationCountResult.count,
      activeCallCount: activeCallCountResult.count,
    };
  }

  /**
   * Get all funds for an organization
   */
  static async getAllFunds(
    organizationId: string,
    filters?: {
      status?: string;
      fundType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Fund[]> {
    const conditions = [eq(funds.organizationId, organizationId)];

    if (filters?.status) {
      conditions.push(eq(funds.status, filters.status as any));
    }

    if (filters?.fundType) {
      conditions.push(eq(funds.fundType, filters.fundType as any));
    }

    let query = db
      .select()
      .from(funds)
      .where(and(...conditions))
      .orderBy(desc(funds.createdAt));

    if (filters?.limit) {
      query = (query as any).limit(filters.limit);
    }

    if (filters?.offset) {
      query = (query as any).offset(filters.offset);
    }

    const result = await query;
    return result as Fund[];
  }

  /**
   * Update fund
   */
  static async updateFund(
    id: string,
    data: UpdateFundDTO,
    organizationId: string,
    updatedBy?: string
  ): Promise<Fund | null> {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.totalCapacity !== undefined) {
      updateData.totalCapacity = data.totalCapacity.toString();
    }

    if (data.targetReturn !== undefined) {
      updateData.targetReturn = data.targetReturn.toString();
    }

    const [fund] = await db
      .update(funds)
      .set(updateData)
      .where(and(eq(funds.id, id), eq(funds.organizationId, organizationId)))
      .returning();

    if (!fund) return null;

    // Publish Fund.Updated event
    await eventBus.publish<FundUpdatedPayload>({
      eventType: EventTypes.FUND_UPDATED,
      eventVersion: "1.0",
      aggregateId: fund.id,
      aggregateType: "Fund",
      payload: {
        fundId: fund.id,
        organizationId: fund.organizationId,
        changes: data as Record<string, unknown>,
        updatedBy,
      },
      metadata: {
        organizationId: fund.organizationId,
        userId: updatedBy,
        source: "FundService.updateFund",
      },
    });

    return fund as Fund;
  }

  /**
   * Close fund
   */
  static async closeFund(id: string, organizationId: string, closedBy?: string): Promise<Fund | null> {
    const closingDate = new Date();

    const [fund] = await db
      .update(funds)
      .set({
        status: "closed",
        closingDate,
        updatedAt: closingDate,
      })
      .where(and(eq(funds.id, id), eq(funds.organizationId, organizationId)))
      .returning();

    if (!fund) return null;

    // Publish Fund.Closed event
    await eventBus.publish<FundClosedPayload>({
      eventType: EventTypes.FUND_CLOSED,
      eventVersion: "1.0",
      aggregateId: fund.id,
      aggregateType: "Fund",
      payload: {
        fundId: fund.id,
        organizationId: fund.organizationId,
        closingDate,
        closedBy,
      },
      metadata: {
        organizationId: fund.organizationId,
        userId: closedBy,
        source: "FundService.closeFund",
      },
    });

    return fund as Fund;
  }

  /**
   * Add commitment to fund
   */
  static async addCommitment(data: CreateFundCommitmentDTO): Promise<FundCommitment> {
    const [commitment] = await db
      .insert(fundCommitments)
      .values({
        fundId: data.fundId,
        lenderId: data.lenderId,
        committedAmount: data.committedAmount.toString(),
        commitmentDate: data.commitmentDate,
        status: data.status || "active",
      })
      .returning();

    // Update fund's total committed
    await db
      .update(funds)
      .set({
        totalCommitted: sql`${funds.totalCommitted} + ${data.committedAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(funds.id, data.fundId));

    // Get fund organization for event metadata
    const orgId = await this.getFundOrganizationId(data.fundId);

    // Publish Commitment.Added event
    await eventBus.publish<CommitmentAddedPayload>({
      eventType: EventTypes.COMMITMENT_ADDED,
      eventVersion: "1.0",
      aggregateId: commitment.id,
      aggregateType: "FundCommitment",
      payload: {
        commitmentId: commitment.id,
        fundId: commitment.fundId,
        lenderId: commitment.lenderId,
        organizationId: orgId!,
        committedAmount: commitment.committedAmount,
        commitmentDate: commitment.commitmentDate,
      },
      metadata: {
        organizationId: orgId!,
        source: "FundService.addCommitment",
      },
    });

    return commitment as FundCommitment;
  }

  /**
   * Get commitments for a fund
   */
  static async getFundCommitments(fundId: string): Promise<FundCommitmentWithLender[]> {
    const result = await db
      .select({
        commitment: fundCommitments,
        lender: {
          id: lenders.id,
          name: lenders.name,
          entityType: lenders.entityType,
          contactEmail: lenders.contactEmail,
        },
      })
      .from(fundCommitments)
      .leftJoin(lenders, eq(fundCommitments.lenderId, lenders.id))
      .where(eq(fundCommitments.fundId, fundId))
      .orderBy(desc(fundCommitments.commitmentDate));

    return result.map((row) => {
      const committedAmount = parseFloat(row.commitment.committedAmount);
      const calledAmount = parseFloat(row.commitment.calledAmount);
      const returnedAmount = parseFloat(row.commitment.returnedAmount);

      return {
        ...row.commitment,
        lender: row.lender!,
        uncalledAmount: committedAmount - calledAmount,
        netPosition: calledAmount - returnedAmount,
      } as FundCommitmentWithLender;
    });
  }

  /**
   * Cancel commitment
   */
  static async cancelCommitment(
    commitmentId: string,
    organizationId: string,
    cancelledBy?: string,
    reason?: string
  ): Promise<FundCommitment | null> {
    // Get commitment first
    const [existingCommitment] = await db
      .select()
      .from(fundCommitments)
      .innerJoin(funds, eq(fundCommitments.fundId, funds.id))
      .where(
        and(
          eq(fundCommitments.id, commitmentId),
          eq(funds.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!existingCommitment) return null;

    const [commitment] = await db
      .update(fundCommitments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(fundCommitments.id, commitmentId))
      .returning();

    // Update fund's total committed
    await db
      .update(funds)
      .set({
        totalCommitted: sql`${funds.totalCommitted} - ${existingCommitment.fund_commitments.committedAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(funds.id, commitment.fundId));

    // Get fund organization for event metadata
    const orgId = await this.getFundOrganizationId(commitment.fundId);

    // Publish Commitment.Cancelled event
    await eventBus.publish<CommitmentCancelledPayload>({
      eventType: EventTypes.COMMITMENT_CANCELLED,
      eventVersion: "1.0",
      aggregateId: commitment.id,
      aggregateType: "FundCommitment",
      payload: {
        commitmentId: commitment.id,
        fundId: commitment.fundId,
        lenderId: commitment.lenderId,
        organizationId: orgId!,
        cancelledBy,
        reason,
      },
      metadata: {
        organizationId: orgId!,
        userId: cancelledBy,
        source: "FundService.cancelCommitment",
      },
    });

    return commitment as FundCommitment;
  }

  /**
   * Call capital from investors
   */
  static async callCapital(data: CreateFundCallDTO): Promise<FundCall> {
    const [call] = await db
      .insert(fundCalls)
      .values({
        fundId: data.fundId,
        callNumber: data.callNumber,
        callAmount: data.callAmount.toString(),
        dueDate: data.dueDate,
        purpose: data.purpose || null,
        notes: data.notes || null,
      })
      .returning();

    // Get fund organization for event metadata
    const orgId = await this.getFundOrganizationId(data.fundId);

    // Publish Capital.Called event
    await eventBus.publish<CapitalCalledPayload>({
      eventType: EventTypes.CAPITAL_CALLED,
      eventVersion: "1.0",
      aggregateId: call.id,
      aggregateType: "FundCall",
      payload: {
        callId: call.id,
        fundId: call.fundId,
        organizationId: orgId!,
        callNumber: call.callNumber,
        callAmount: call.callAmount,
        dueDate: call.dueDate,
        purpose: call.purpose ?? undefined,
      },
      metadata: {
        organizationId: orgId!,
        source: "FundService.callCapital",
      },
    });

    return call as FundCall;
  }

  /**
   * Get capital calls for a fund
   */
  static async getFundCalls(fundId: string): Promise<FundCall[]> {
    const result = await db
      .select()
      .from(fundCalls)
      .where(eq(fundCalls.fundId, fundId))
      .orderBy(desc(fundCalls.callNumber));

    return result as FundCall[];
  }

  /**
   * Allocate capital to a loan
   */
  static async allocateToLoan(data: CreateFundAllocationDTO): Promise<FundLoanAllocation> {
    const [allocation] = await db
      .insert(fundLoanAllocations)
      .values({
        fundId: data.fundId,
        loanId: data.loanId,
        allocatedAmount: data.allocatedAmount.toString(),
        allocationDate: data.allocationDate,
      })
      .returning();

    // Update fund's total deployed
    await db
      .update(funds)
      .set({
        totalDeployed: sql`${funds.totalDeployed} + ${data.allocatedAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(funds.id, data.fundId));

    // Get fund organization for event metadata
    const orgId = await this.getFundOrganizationId(data.fundId);

    // Publish Capital.Allocated event
    await eventBus.publish<CapitalAllocatedPayload>({
      eventType: EventTypes.CAPITAL_ALLOCATED,
      eventVersion: "1.0",
      aggregateId: allocation.id,
      aggregateType: "FundLoanAllocation",
      payload: {
        allocationId: allocation.id,
        fundId: allocation.fundId,
        loanId: allocation.loanId,
        organizationId: orgId!,
        amount: allocation.allocatedAmount,
        allocatedDate: allocation.allocationDate,
      },
      metadata: {
        organizationId: orgId!,
        source: "FundService.allocateToLoan",
      },
    });

    return allocation as FundLoanAllocation;
  }

  /**
   * Return capital from a loan
   */
  static async returnFromLoan(
    allocationId: string,
    organizationId: string,
    returnAmount: number | string,
    returnedDate: Date
  ): Promise<FundLoanAllocation | null> {
    // First verify the allocation belongs to the organization
    const [existingAllocation] = await db
      .select()
      .from(fundLoanAllocations)
      .innerJoin(funds, eq(fundLoanAllocations.fundId, funds.id))
      .where(
        and(
          eq(fundLoanAllocations.id, allocationId),
          eq(funds.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!existingAllocation) return null;
    const [allocation] = await db
      .update(fundLoanAllocations)
      .set({
        returnedAmount: sql`${fundLoanAllocations.returnedAmount} + ${returnAmount}`,
        fullReturnDate:
          sql`CASE WHEN ${fundLoanAllocations.returnedAmount} + ${returnAmount} >= ${fundLoanAllocations.allocatedAmount} THEN ${returnedDate} ELSE ${fundLoanAllocations.fullReturnDate} END`,
        updatedAt: new Date(),
      })
      .where(eq(fundLoanAllocations.id, allocationId))
      .returning();

    if (!allocation) return null;

    // Update fund's total returned
    await db
      .update(funds)
      .set({
        totalReturned: sql`${funds.totalReturned} + ${returnAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(funds.id, allocation.fundId));

    // Get fund organization for event metadata
    const orgId = await this.getFundOrganizationId(allocation.fundId);

    // Publish Capital.Returned event
    await eventBus.publish<CapitalReturnedPayload>({
      eventType: EventTypes.CAPITAL_RETURNED,
      eventVersion: "1.0",
      aggregateId: allocation.id,
      aggregateType: "FundLoanAllocation",
      payload: {
        allocationId: allocation.id,
        fundId: allocation.fundId,
        loanId: allocation.loanId,
        organizationId: orgId!,
        amount: returnAmount.toString(),
        returnedDate,
      },
      metadata: {
        organizationId: orgId!,
        source: "FundService.returnFromLoan",
      },
    });

    return allocation as FundLoanAllocation;
  }

  /**
   * Get fund allocations
   */
  static async getFundAllocations(fundId: string): Promise<FundAllocationWithLoan[]> {
    const result = await db
      .select({
        allocation: fundLoanAllocations,
        loan: {
          id: loans.id,
          loanAmount: loans.loanAmount,
          interestRate: loans.interestRate,
          status: loans.status,
          borrowerId: loans.borrowerId,
        },
      })
      .from(fundLoanAllocations)
      .leftJoin(loans, eq(fundLoanAllocations.loanId, loans.id))
      .where(eq(fundLoanAllocations.fundId, fundId))
      .orderBy(desc(fundLoanAllocations.allocationDate));

    return result.map((row) => {
      const allocatedAmount = parseFloat(row.allocation.allocatedAmount);
      const returnedAmount = parseFloat(row.allocation.returnedAmount);

      return {
        ...row.allocation,
        loan: row.loan!,
        outstandingAmount: allocatedAmount - returnedAmount,
        returnPercentage: allocatedAmount > 0 ? (returnedAmount / allocatedAmount) * 100 : 0,
      } as FundAllocationWithLoan;
    });
  }

  /**
   * Record distribution to investors
   */
  static async recordDistribution(data: CreateFundDistributionDTO): Promise<FundDistribution> {
    const [distribution] = await db
      .insert(fundDistributions)
      .values({
        fundId: data.fundId,
        distributionDate: data.distributionDate,
        totalAmount: data.totalAmount.toString(),
        distributionType: data.distributionType,
        notes: data.notes || null,
      })
      .returning();

    // Get fund organization for event metadata
    const orgId = await this.getFundOrganizationId(data.fundId);

    // Publish Distribution.Made event
    await eventBus.publish<DistributionMadePayload>({
      eventType: EventTypes.DISTRIBUTION_MADE,
      eventVersion: "1.0",
      aggregateId: distribution.id,
      aggregateType: "FundDistribution",
      payload: {
        distributionId: distribution.id,
        fundId: distribution.fundId,
        organizationId: orgId!,
        totalAmount: distribution.totalAmount,
        distributionType: distribution.distributionType,
        distributionDate: distribution.distributionDate,
      },
      metadata: {
        organizationId: orgId!,
        source: "FundService.recordDistribution",
      },
    });

    return distribution as FundDistribution;
  }

  /**
   * Get fund distributions
   */
  static async getFundDistributions(
    fundId: string,
    organizationId: string
  ): Promise<FundDistribution[]> {
    // Use innerJoin for single-query org-scoped access
    const result = await db
      .select({
        id: fundDistributions.id,
        fundId: fundDistributions.fundId,
        distributionDate: fundDistributions.distributionDate,
        totalAmount: fundDistributions.totalAmount,
        distributionType: fundDistributions.distributionType,
        status: fundDistributions.status,
        notes: fundDistributions.notes,
        createdAt: fundDistributions.createdAt,
        updatedAt: fundDistributions.updatedAt,
      })
      .from(fundDistributions)
      .innerJoin(funds, eq(fundDistributions.fundId, funds.id))
      .where(
        and(
          eq(fundDistributions.fundId, fundId),
          eq(funds.organizationId, organizationId)
        )
      )
      .orderBy(desc(fundDistributions.distributionDate));

    return result as FundDistribution[];
  }
}
