import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { LenderRole } from "@/types/loan";

/**
 * POST /api/v1/loans/:loanId/lenders
 * Add a participant lender to an existing loan (syndication)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { loanId: string } }
) {
  try {
    const { loanId } = params;
    const body = await request.json();

    const { lenderId, percentage } = body;

    if (!lenderId) {
      return NextResponse.json(
        { success: false, error: "lenderId is required" },
        { status: 400 }
      );
    }

    if (percentage === undefined || percentage === null) {
      return NextResponse.json(
        { success: false, error: "percentage is required" },
        { status: 400 }
      );
    }

    // Validate percentage
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { success: false, error: "percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    const relationship = await LoanService.addParticipantLender(
      loanId,
      lenderId,
      percentage
    );

    return NextResponse.json({
      success: true,
      data: relationship,
    });
  } catch (error) {
    console.error("Error adding participant lender:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add participant lender",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/loans/:loanId/lenders
 * Get all lenders for a loan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { loanId: string } }
) {
  try {
    const { loanId } = params;

    const lenders = await LoanService.getLoanLenders(loanId);

    return NextResponse.json({
      success: true,
      data: lenders,
    });
  } catch (error) {
    console.error("Error fetching loan lenders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lenders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

