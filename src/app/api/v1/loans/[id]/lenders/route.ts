import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { LenderRole } from "@/types/loan";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * POST /api/v1/loans/:id/lenders
 * Add a participant lender to an existing loan (syndication)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId } = await params;
    const body = await request.json();

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
 * GET /api/v1/loans/:id/lenders
 * Get all lenders for a loan
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

