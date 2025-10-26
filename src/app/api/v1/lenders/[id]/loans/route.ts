import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RelationshipService } from "@/services/relationship.service";
import { requireAuth } from "@/lib/session";

const syncLoansSchema = z.object({
  loanIds: z.array(z.string()),
});

/**
 * GET /api/v1/lenders/[id]/loans
 * Get all loans for a specific lender
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const loans = await RelationshipService.getLenderLoans(id);

    return NextResponse.json({
      success: true,
      data: loans,
      count: loans.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching lender loans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/v1/lenders/[id]/loans
 * Sync loans for a lender (replace all relationships)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const validationResult = syncLoansSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    await RelationshipService.syncLenderLoans(id, validationResult.data.loanIds);

    return NextResponse.json({
      success: true,
      message: "Lender loans synced successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error syncing lender loans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
