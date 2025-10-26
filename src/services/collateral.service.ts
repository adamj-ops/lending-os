import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { collateral } from "@/db/schema";
import type { Collateral, CreateCollateralDTO, UpdateCollateralDTO } from "@/types/collateral";

export class CollateralService {
  /**
   * Create collateral record
   */
  static async createCollateral(data: CreateCollateralDTO): Promise<Collateral> {
    const [record] = await db
      .insert(collateral)
      .values({
        loanId: data.loanId,
        lienPosition: data.lienPosition || null,
        description: data.description || null,
        drawSchedule: data.drawSchedule || null,
      })
      .returning();

    return record as Collateral;
  }

  /**
   * Get collateral by loan ID
   */
  static async getByLoanId(loanId: string): Promise<Collateral | null> {
    const [record] = await db
      .select()
      .from(collateral)
      .where(eq(collateral.loanId, loanId))
      .limit(1);

    return (record as Collateral) || null;
  }

  /**
   * Update collateral
   */
  static async updateCollateral(
    loanId: string,
    data: UpdateCollateralDTO
  ): Promise<Collateral | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.lienPosition !== undefined) updateData.lienPosition = data.lienPosition;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.drawSchedule !== undefined) updateData.drawSchedule = data.drawSchedule;

    const [updated] = await db
      .update(collateral)
      .set(updateData)
      .where(eq(collateral.loanId, loanId))
      .returning();

    return (updated as Collateral) || null;
  }

  /**
   * Delete collateral
   */
  static async deleteCollateral(loanId: string): Promise<boolean> {
    await db.delete(collateral).where(eq(collateral.loanId, loanId));
    return true;
  }
}

