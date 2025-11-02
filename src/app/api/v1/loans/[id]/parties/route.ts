import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * GET /api/v1/loans/:id/parties
 * Get all borrowers and lenders for a loan (complete party list)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId } = await params;

    // Verify loan belongs to user's organization
    const loan = await LoanService.getLoanById(loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch all borrowers and lenders in parallel
    const [borrowers, lenders] = await Promise.all([
      LoanService.getLoanBorrowers(loanId),
      LoanService.getLoanLenders(loanId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        borrowers,
        lenders,
        totalBorrowers: borrowers.length,
        totalLenders: lenders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching loan parties:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch loan parties",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

