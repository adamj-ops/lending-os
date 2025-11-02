import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";
import { LoanStatus } from "@/types/loan";

/**
 * PATCH /api/v1/loans/[id]/status
 * Update loan status with validation
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOrganization();

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: status",
        },
        { status: 400 }
      );
    }

    // Validate status is a valid enum value
    if (!Object.values(LoanStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status value: ${status}`,
        },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Verify loan belongs to user's organization before updating status
    const existingLoan = await LoanService.getLoanById(id);
    if (!existingLoan) {
      return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    }

    const loan = await LoanService.transitionLoanStatus(id, status);

    return NextResponse.json({
      success: true,
      data: loan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Handle state transition errors
    if (error instanceof Error && error.message.includes("Invalid status transition")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Error updating loan status:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

