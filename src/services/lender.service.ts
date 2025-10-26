import { eq, and, sum } from "drizzle-orm";
import { db } from "@/db/client";
import { lenders, loans, lenderLoans } from "@/db/schema";
import type { CreateLenderDTO, UpdateLenderDTO, Lender } from "@/types/lender";
import { LenderRole } from "@/types/loan";

export class LenderService {
  /**
   * Create a new lender (v2 with contactPhone support)
   */
  static async createLender(data: CreateLenderDTO): Promise<Lender> {
    const [lender] = await db
      .insert(lenders)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        entityType: data.entityType,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        totalCommitted: data.totalCommitted?.toString() || "0",
        totalDeployed: data.totalDeployed?.toString() || "0",
      })
      .returning();

    return lender as Lender;
  }

  /**
   * Get lender by ID
   */
  static async getLenderById(id: string): Promise<Lender | null> {
    const [lender] = await db
      .select()
      .from(lenders)
      .where(eq(lenders.id, id))
      .limit(1);

    return (lender as Lender) || null;
  }

  /**
   * Get all lenders for an organization
   */
  static async getLendersByOrganization(organizationId: string): Promise<Lender[]> {
    const result = await db
      .select()
      .from(lenders)
      .where(eq(lenders.organizationId, organizationId));

    return result as Lender[];
  }

  /**
   * Update a lender (v2 with contactPhone support)
   */
  static async updateLender(id: string, data: UpdateLenderDTO): Promise<Lender | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.entityType !== undefined) updateData.entityType = data.entityType;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.totalCommitted !== undefined) updateData.totalCommitted = data.totalCommitted.toString();
    if (data.totalDeployed !== undefined) updateData.totalDeployed = data.totalDeployed.toString();

    const [lender] = await db
      .update(lenders)
      .set(updateData)
      .where(eq(lenders.id, id))
      .returning();

    return (lender as Lender) || null;
  }

  /**
   * Delete a lender
   */
  static async deleteLender(id: string): Promise<boolean> {
    await db.delete(lenders).where(eq(lenders.id, id));
    return true;
  }

  /**
   * Get all loans funded by a lender (primary loans only - using direct FK)
   * @deprecated Use getLenderLoansAll() for hybrid model queries
   */
  static async getLenderLoans(lenderId: string) {
    const result = await db
      .select()
      .from(loans)
      .where(eq(loans.lenderId, lenderId));

    return result;
  }

  /**
   * Get all loans for a lender (Hybrid Model - includes primary + participant roles)
   * Returns loans where lender is primary OR participant with percentage
   */
  static async getLenderLoansAll(lenderId: string) {
    const result = await db
      .select({
        loan: loans,
        role: lenderLoans.role,
        isPrimary: lenderLoans.isPrimary,
        percentage: lenderLoans.percentage,
      })
      .from(lenderLoans)
      .innerJoin(loans, eq(lenderLoans.loanId, loans.id))
      .where(eq(lenderLoans.lenderId, lenderId));

    return result;
  }

  /**
   * Add a participant lender to an existing loan (syndication)
   */
  static async addParticipantLender(
    lenderId: string,
    loanId: string,
    percentage: number
  ) {
    const [relationship] = await db
      .insert(lenderLoans)
      .values({
        lenderId,
        loanId,
        role: LenderRole.PARTICIPANT,
        isPrimary: false,
        percentage: percentage.toString(),
      })
      .onConflictDoNothing()
      .returning();

    return relationship;
  }

  /**
   * Remove a participant lender from a loan (cannot remove primary lender)
   */
  static async removeParticipantLenderFromLoan(lenderId: string, loanId: string) {
    // First check if this is the primary lender
    const [relationship] = await db
      .select()
      .from(lenderLoans)
      .where(
        and(
          eq(lenderLoans.lenderId, lenderId),
          eq(lenderLoans.loanId, loanId)
        )
      )
      .limit(1);

    if (relationship?.isPrimary) {
      throw new Error("Cannot remove primary lender. Reassign loans.lenderId first.");
    }

    await db
      .delete(lenderLoans)
      .where(
        and(
          eq(lenderLoans.lenderId, lenderId),
          eq(lenderLoans.loanId, loanId)
        )
      );

    return true;
  }

  /**
   * Get total participation across all loans for a lender
   * Returns: { totalLoans, totalPrincipal, averageParticipation }
   */
  static async getLenderParticipation(lenderId: string) {
    const participations = await db
      .select({
        loanId: lenderLoans.loanId,
        percentage: lenderLoans.percentage,
        principal: loans.principal,
        isPrimary: lenderLoans.isPrimary,
      })
      .from(lenderLoans)
      .innerJoin(loans, eq(lenderLoans.loanId, loans.id))
      .where(eq(lenderLoans.lenderId, lenderId));

    const totalLoans = participations.length;
    const totalPrincipal = participations.reduce((sum, p) => {
      const principal = parseFloat(p.principal);
      const percentage = p.percentage ? parseFloat(p.percentage) : 100;
      return sum + (principal * percentage / 100);
    }, 0);

    const averageParticipation = totalLoans > 0
      ? participations.reduce((sum, p) => {
          const percentage = p.percentage ? parseFloat(p.percentage) : 100;
          return sum + percentage;
        }, 0) / totalLoans
      : 0;

    return {
      totalLoans,
      totalPrincipal,
      averageParticipation,
      participations,
    };
  }

  /**
   * Get lender loan count (all roles)
   */
  static async getLenderLoanCount(lenderId: string): Promise<number> {
    const result = await db
      .select()
      .from(lenderLoans)
      .where(eq(lenderLoans.lenderId, lenderId));

    return result.length;
  }
}

