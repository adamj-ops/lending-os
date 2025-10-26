import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireAuth } from "@/lib/session";
import type { CreateLoanDTO } from "@/types/loan";

/**
 * GET /api/v1/loans
 * Get all loans for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // For now, we'll use the user ID as organization ID
    // In Sprint 2, we'll properly handle organization relationships
    const loans = await LoanService.getLoansByOrganization(session.userId);

    return NextResponse.json({
      success: true,
      data: loans,
      count: loans.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching loans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/loans
 * Create a new loan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body: CreateLoanDTO = await request.json();

    // Validate required fields
    if (!body.propertyAddress || !body.loanAmount || !body.interestRate || !body.termMonths) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: propertyAddress, loanAmount, interestRate, termMonths",
        },
        { status: 400 }
      );
    }

    // For now, use user ID as organization ID
    const loanData: CreateLoanDTO = {
      ...body,
      organizationId: session.userId,
    };

    const loan = await LoanService.createLoan(loanData);

    return NextResponse.json(
      {
        success: true,
        data: loan,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating loan:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

