import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";
import { requireOrganization } from "@/lib/clerk-server";
import { LoanService } from "@/services/loan.service";

/**
 * GET /api/v1/loans/:id/payment-schedule
 * Get generated payment schedule for a loan
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

    const schedule = await PaymentService.generatePaymentSchedule(loanId);

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error generating payment schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate payment schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/loans/:id/payment-schedule
 * Regenerate payment schedule for a loan
 */
export async function POST(
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

    const schedule = await PaymentService.updatePaymentSchedule(loanId);

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error updating payment schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

