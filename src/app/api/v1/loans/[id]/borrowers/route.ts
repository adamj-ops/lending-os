import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { BorrowerRole } from "@/types/loan";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * POST /api/v1/loans/:id/borrowers
 * Add a co-borrower or guarantor to an existing loan
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

    const { borrowerId, role } = body;

    if (!borrowerId) {
      return NextResponse.json(
        { success: false, error: "borrowerId is required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = [BorrowerRole.CO_BORROWER, BorrowerRole.GUARANTOR];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const relationship = await LoanService.addCoBorrower(
      loanId,
      borrowerId,
      role || BorrowerRole.CO_BORROWER
    );

    return NextResponse.json({
      success: true,
      data: relationship,
    });
  } catch (error) {
    console.error("Error adding co-borrower:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add co-borrower",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/loans/:id/borrowers
 * Get all borrowers for a loan
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

    const borrowers = await LoanService.getLoanBorrowers(loanId);

    return NextResponse.json({
      success: true,
      data: borrowers,
    });
  } catch (error) {
    console.error("Error fetching loan borrowers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch borrowers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

