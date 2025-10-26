import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireAuth } from "@/lib/session";
import { LoanStatus } from "@/types/loan";

/**
 * PATCH /api/v1/loans/[id]/status
 * Update loan status with validation
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

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
    const loan = await LoanService.transitionLoanStatus(id, status);

    if (!loan) {
      return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    }

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

