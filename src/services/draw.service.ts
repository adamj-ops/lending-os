import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { draws, drawSchedules, loans } from "@/db/schema";
import {
  type Draw,
  type CreateDrawDTO,
  type UpdateDrawDTO,
  type ApproveDrawDTO,
  type RejectDrawDTO,
  type DisburseDrawDTO,
  type DrawFilters,
  type DrawHistory,
  type DrawSummary,
  type BudgetStatus,
  type BudgetLineItem,
  DrawStatus,
} from "@/types/draw";

export class DrawService {
  // ============ CRUD OPERATIONS ============

  /**
   * Create a new draw request
   */
  static async createDraw(data: CreateDrawDTO): Promise<Draw> {
    // Get next draw number for this loan
    const existingDraws = await db
      .select()
      .from(draws)
      .where(eq(draws.loanId, data.loanId))
      .orderBy(desc(draws.drawNumber));

    const nextDrawNumber = existingDraws.length > 0 ? existingDraws[0].drawNumber! + 1 : 1;

    const [draw] = await db
      .insert(draws)
      .values({
        loanId: data.loanId,
        drawNumber: nextDrawNumber,
        amountRequested: data.amountRequested.toString(),
        workDescription: data.workDescription,
        budgetLineItem: data.budgetLineItem || null,
        contractorName: data.contractorName || null,
        contractorContact: data.contractorContact || null,
        notes: data.notes || null,
        requestedBy: data.requestedBy || null,
        status: DrawStatus.REQUESTED,
      })
      .returning();

    return draw as Draw;
  }

  /**
   * Get draw by ID
   */
  static async getDraw(id: string): Promise<Draw | null> {
    const [draw] = await db.select().from(draws).where(eq(draws.id, id));

    return draw ? (draw as Draw) : null;
  }

  /**
   * Update draw
   */
  static async updateDraw(id: string, data: UpdateDrawDTO): Promise<Draw> {
    const [draw] = await db
      .update(draws)
      .set({
        amountRequested: data.amountRequested?.toString(),
        workDescription: data.workDescription,
        budgetLineItem: data.budgetLineItem,
        contractorName: data.contractorName,
        contractorContact: data.contractorContact,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(draws.id, id))
      .returning();

    return draw as Draw;
  }

  /**
   * Delete draw
   */
  static async deleteDraw(id: string): Promise<boolean> {
    await db.delete(draws).where(eq(draws.id, id));
    return true;
  }

  // ============ LOAN-SPECIFIC OPERATIONS ============

  /**
   * Get all draws for a loan with filters
   */
  static async getLoanDraws(loanId: string, filters?: DrawFilters): Promise<Draw[]> {
    const conditions = [eq(draws.loanId, loanId)];

    if (filters?.status) {
      conditions.push(eq(draws.status, filters.status));
    }

    if (filters?.contractor) {
      conditions.push(sql`${draws.contractorName} ILIKE ${`%${filters.contractor}%`}`);
    }

    const result = await db
      .select()
      .from(draws)
      .where(and(...conditions))
      .orderBy(desc(draws.requestedDate));

    return result as Draw[];
  }

  /**
   * Get draw history with summary
   */
  static async getDrawHistory(loanId: string, filters?: DrawFilters): Promise<DrawHistory> {
    const loanDraws = await this.getLoanDraws(loanId, filters);
    const summary = await this.getDrawSummary(loanId);

    return {
      draws: loanDraws,
      summary,
    };
  }

  /**
   * Get draw summary for a loan
   */
  static async getDrawSummary(loanId: string): Promise<DrawSummary> {
    const loanDraws = await db.select().from(draws).where(eq(draws.loanId, loanId));

    const totalRequested = loanDraws.reduce(
      (sum, d) => sum + parseFloat(d.amountRequested || "0"),
      0
    );
    const totalApproved = loanDraws.reduce(
      (sum, d) => sum + parseFloat(d.amountApproved || "0"),
      0
    );
    const totalDisbursed = loanDraws.reduce(
      (sum, d) => sum + parseFloat(d.amountDisbursed || "0"),
      0
    );

    // Get loan principal to calculate remaining budget
    const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));
    const principal = parseFloat(loan?.principal || "0");
    const remainingBudget = principal - totalDisbursed;

    const pendingDraws = loanDraws.filter((d) => d.status === DrawStatus.REQUESTED).length;

    return {
      totalRequested: totalRequested.toFixed(2),
      totalApproved: totalApproved.toFixed(2),
      totalDisbursed: totalDisbursed.toFixed(2),
      remainingBudget: remainingBudget.toFixed(2),
      drawsCount: loanDraws.length,
      pendingDraws,
    };
  }

  // ============ WORKFLOW OPERATIONS ============

  /**
   * Approve a draw request
   */
  static async approveDraw(drawId: string, data: ApproveDrawDTO): Promise<Draw> {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const [draw] = await db
      .update(draws)
      .set({
        status: DrawStatus.APPROVED,
        amountApproved: data.amountApproved.toString(),
        approvedBy: data.approvedBy,
        approvedDate: currentDate,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(draws.id, drawId))
      .returning();

    return draw as Draw;
  }

  /**
   * Reject a draw request
   */
  static async rejectDraw(drawId: string, data: RejectDrawDTO): Promise<Draw> {
    const [draw] = await db
      .update(draws)
      .set({
        status: DrawStatus.REJECTED,
        approvedBy: data.rejectedBy,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(draws.id, drawId))
      .returning();

    return draw as Draw;
  }

  /**
   * Disburse a draw
   */
  static async disburseDraw(drawId: string, data: DisburseDrawDTO): Promise<Draw> {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const [draw] = await db
      .update(draws)
      .set({
        status: DrawStatus.DISBURSED,
        amountDisbursed: data.amountDisbursed.toString(),
        disbursedDate: currentDate,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(draws.id, drawId))
      .returning();

    return draw as Draw;
  }

  // ============ SCHEDULE MANAGEMENT ============

  /**
   * Generate draw schedule for a loan
   */
  static async generateDrawSchedule(
    loanId: string,
    scheduleData: any[]
  ): Promise<any> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));

    if (!loan) {
      throw new Error("Loan not found");
    }

    const totalBudget = parseFloat(loan.principal || "0");
    const totalDraws = scheduleData.length;

    const [schedule] = await db
      .insert(drawSchedules)
      .values({
        loanId,
        totalDraws,
        totalBudget: totalBudget.toString(),
        scheduleData: JSON.stringify(scheduleData),
        isActive: true,
      })
      .returning();

    return {
      ...schedule,
      scheduleData: JSON.parse(schedule.scheduleData),
    };
  }

  /**
   * Update draw schedule
   */
  static async updateDrawSchedule(loanId: string, scheduleData: any[]): Promise<any> {
    // Deactivate old schedules
    await db
      .update(drawSchedules)
      .set({ isActive: false })
      .where(eq(drawSchedules.loanId, loanId));

    // Generate new schedule
    return this.generateDrawSchedule(loanId, scheduleData);
  }

  // ============ BUDGET TRACKING ============

  /**
   * Get budget status for a loan
   */
  static async getBudgetStatus(loanId: string): Promise<BudgetStatus> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));

    if (!loan) {
      throw new Error("Loan not found");
    }

    const totalBudget = parseFloat(loan.principal || "0");

    const loanDraws = await db.select().from(draws).where(eq(draws.loanId, loanId));

    const totalRequested = loanDraws.reduce(
      (sum, d) => sum + parseFloat(d.amountRequested || "0"),
      0
    );
    const totalApproved = loanDraws.reduce(
      (sum, d) => sum + parseFloat(d.amountApproved || "0"),
      0
    );
    const totalDisbursed = loanDraws.reduce(
      (sum, d) => sum + parseFloat(d.amountDisbursed || "0"),
      0
    );

    const remainingBudget = totalBudget - totalDisbursed;
    const percentageUsed = (totalDisbursed / totalBudget) * 100;

    // Group draws by budget line item
    const lineItemMap = new Map<string, { budget: number; spent: number }>();

    loanDraws.forEach((draw) => {
      const lineItem = draw.budgetLineItem || "Unassigned";
      const spent = parseFloat(draw.amountDisbursed || "0");

      if (!lineItemMap.has(lineItem)) {
        lineItemMap.set(lineItem, { budget: 0, spent: 0 });
      }

      const item = lineItemMap.get(lineItem)!;
      item.spent += spent;
    });

    const lineItems: BudgetLineItem[] = Array.from(lineItemMap.entries()).map(
      ([name, data]) => {
        const budgetAmount = totalBudget / lineItemMap.size; // Simplified allocation
        const spentAmount = data.spent;
        const remainingAmount = budgetAmount - spentAmount;
        const percentageUsed = (spentAmount / budgetAmount) * 100;

        return {
          name,
          budgetAmount: budgetAmount.toFixed(2),
          spentAmount: spentAmount.toFixed(2),
          remainingAmount: remainingAmount.toFixed(2),
          percentageUsed,
        };
      }
    );

    return {
      totalBudget: totalBudget.toFixed(2),
      totalRequested: totalRequested.toFixed(2),
      totalApproved: totalApproved.toFixed(2),
      totalDisbursed: totalDisbursed.toFixed(2),
      remainingBudget: remainingBudget.toFixed(2),
      percentageUsed,
      lineItems,
    };
  }

  /**
   * Update budget line item
   */
  static async updateBudgetLineItem(
    loanId: string,
    lineItem: string,
    amount: number
  ): Promise<void> {
    // This would update the draw schedule
    // For simplicity, we'll skip the implementation details
    // In a real system, you'd update the draw schedule and recalculate allocations
  }
}

