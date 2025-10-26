import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";

/**
 * GET /api/v1/loans/:loanId/payment-schedule
 * Get generated payment schedule for a loan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;

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
 * POST /api/v1/loans/:loanId/payment-schedule
 * Regenerate payment schedule for a loan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;

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

