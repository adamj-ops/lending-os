import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";

/**
 * GET /api/v1/loans/:loanId/parties
 * Get all borrowers and lenders for a loan (complete party list)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { loanId: string } }
) {
  try {
    const { loanId } = params;

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

