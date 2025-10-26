import { eq, or, and } from "drizzle-orm";
import { db } from "@/db/client";
import { borrowers, loans, borrowerLoans } from "@/db/schema";
import type { CreateBorrowerDTO, UpdateBorrowerDTO, Borrower } from "@/types/borrower";
import { BorrowerRole } from "@/types/loan";

export class BorrowerService {
  /**
   * Create a new borrower (v2 with type support)
   */
  static async createBorrower(data: CreateBorrowerDTO): Promise<Borrower> {
    const [borrower] = await db
      .insert(borrowers)
      .values({
        organizationId: data.organizationId,
        type: data.type,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        name: data.name || null,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        companyName: data.companyName || null,
        creditScore: data.creditScore || null,
        taxIdEncrypted: data.taxId || null, // TODO: Implement encryption
      })
      .returning();

    return borrower as Borrower;
  }

  /**
   * Get borrower by ID
   */
  static async getBorrowerById(id: string): Promise<Borrower | null> {
    const [borrower] = await db
      .select()
      .from(borrowers)
      .where(eq(borrowers.id, id))
      .limit(1);

    return (borrower as Borrower) || null;
  }

  /**
   * Get all borrowers for an organization
   */
  static async getBorrowersByOrganization(organizationId: string): Promise<Borrower[]> {
    const result = await db
      .select()
      .from(borrowers)
      .where(eq(borrowers.organizationId, organizationId));

    return result as Borrower[];
  }

  /**
   * Update a borrower (v2 with type support)
   */
  static async updateBorrower(id: string, data: UpdateBorrowerDTO): Promise<Borrower | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.type !== undefined) updateData.type = data.type;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.creditScore !== undefined) updateData.creditScore = data.creditScore;
    if (data.taxIdEncrypted !== undefined) updateData.taxIdEncrypted = data.taxIdEncrypted;

    const [borrower] = await db
      .update(borrowers)
      .set(updateData)
      .where(eq(borrowers.id, id))
      .returning();

    return (borrower as Borrower) || null;
  }

  /**
   * Delete a borrower
   */
  static async deleteBorrower(id: string): Promise<boolean> {
    await db.delete(borrowers).where(eq(borrowers.id, id));
    return true;
  }

  /**
   * Get all loans for a borrower (primary loans only - using direct FK)
   * @deprecated Use getBorrowerLoansAll() for hybrid model queries
   */
  static async getBorrowerLoans(borrowerId: string) {
    const result = await db
      .select()
      .from(loans)
      .where(eq(loans.borrowerId, borrowerId));

    return result;
  }

  /**
   * Get all loans for a borrower (Hybrid Model - includes primary + co-borrower roles)
   * Returns loans where borrower is primary OR co-borrower/guarantor
   */
  static async getBorrowerLoansAll(borrowerId: string) {
    const result = await db
      .select({
        loan: loans,
        role: borrowerLoans.role,
        isPrimary: borrowerLoans.isPrimary,
      })
      .from(borrowerLoans)
      .innerJoin(loans, eq(borrowerLoans.loanId, loans.id))
      .where(eq(borrowerLoans.borrowerId, borrowerId));

    return result;
  }

  /**
   * Add a co-borrower or guarantor to an existing loan
   */
  static async addCoBorrowerToLoan(
    borrowerId: string,
    loanId: string,
    role: BorrowerRole = BorrowerRole.CO_BORROWER
  ) {
    // Validate role (cannot add primary through this method)
    if (role === BorrowerRole.PRIMARY) {
      throw new Error("Cannot add primary borrower via this method. Use loans.borrowerId instead.");
    }

    const [relationship] = await db
      .insert(borrowerLoans)
      .values({
        borrowerId,
        loanId,
        role,
        isPrimary: false,
      })
      .onConflictDoNothing()
      .returning();

    return relationship;
  }

  /**
   * Remove a co-borrower from a loan (cannot remove primary borrower)
   */
  static async removeCoBorrowerFromLoan(borrowerId: string, loanId: string) {
    // First check if this is the primary borrower
    const [relationship] = await db
      .select()
      .from(borrowerLoans)
      .where(
        and(
          eq(borrowerLoans.borrowerId, borrowerId),
          eq(borrowerLoans.loanId, loanId)
        )
      )
      .limit(1);

    if (relationship?.isPrimary) {
      throw new Error("Cannot remove primary borrower. Reassign loans.borrowerId first.");
    }

    await db
      .delete(borrowerLoans)
      .where(
        and(
          eq(borrowerLoans.borrowerId, borrowerId),
          eq(borrowerLoans.loanId, loanId)
        )
      );

    return true;
  }

  /**
   * Get borrower loan count (all roles)
   */
  static async getBorrowerLoanCount(borrowerId: string): Promise<number> {
    const result = await db
      .select()
      .from(borrowerLoans)
      .where(eq(borrowerLoans.borrowerId, borrowerId));

    return result.length;
  }
}

