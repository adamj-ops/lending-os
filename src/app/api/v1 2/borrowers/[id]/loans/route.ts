import { NextRequest, NextResponse } from "next/server";
import { BorrowerService } from "@/services/borrower.service";
import { requireAuth } from "@/lib/clerk-server";

/**
 * GET /api/v1/borrowers/[id]/loans
 * Get all loans for a specific borrower
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const loans = await BorrowerService.getBorrowerLoans(id);

    return NextResponse.json({
      success: true,
      data: loans,
      count: loans.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching borrower loans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

