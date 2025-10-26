import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { loanTerms } from "@/db/schema";

export interface LoanTerms {
  loanId: string;
  amortizationMonths: number | null;
  compounding: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLoanTermsDTO {
  loanId: string;
  amortizationMonths?: number;
  compounding?: "simple" | "compound";
  notes?: string;
}

export interface UpdateLoanTermsDTO {
  amortizationMonths?: number;
  compounding?: "simple" | "compound";
  notes?: string;
}

export class LoanTermsService {
  /**
   * Create loan terms record
   */
  static async createLoanTerms(data: CreateLoanTermsDTO): Promise<LoanTerms> {
    const [record] = await db
      .insert(loanTerms)
      .values({
        loanId: data.loanId,
        amortizationMonths: data.amortizationMonths || null,
        compounding: data.compounding || null,
        notes: data.notes || null,
      })
      .returning();

    return record as LoanTerms;
  }

  /**
   * Get loan terms by loan ID
   */
  static async getByLoanId(loanId: string): Promise<LoanTerms | null> {
    const [record] = await db
      .select()
      .from(loanTerms)
      .where(eq(loanTerms.loanId, loanId))
      .limit(1);

    return (record as LoanTerms) || null;
  }

  /**
   * Update loan terms
   */
  static async updateLoanTerms(
    loanId: string,
    data: UpdateLoanTermsDTO
  ): Promise<LoanTerms | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.amortizationMonths !== undefined)
      updateData.amortizationMonths = data.amortizationMonths;
    if (data.compounding !== undefined)
      updateData.compounding = data.compounding;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await db
      .update(loanTerms)
      .set(updateData)
      .where(eq(loanTerms.loanId, loanId))
      .returning();

    return (updated as LoanTerms) || null;
  }

  /**
   * Delete loan terms
   */
  static async deleteLoanTerms(loanId: string): Promise<boolean> {
    await db.delete(loanTerms).where(eq(loanTerms.loanId, loanId));
    return true;
  }
}

