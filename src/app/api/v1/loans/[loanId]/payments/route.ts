import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";
import { PaymentType, PaymentMethod } from "@/types/payment";

/**
 * POST /api/v1/loans/:loanId/payments
 * Create a new payment for a loan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.paymentMethod || !body.paymentDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, paymentMethod, paymentDate",
        },
        { status: 400 }
      );
    }

    const payment = await PaymentService.createPayment({
      loanId,
      paymentType: body.paymentType || PaymentType.COMBINED,
      amount: body.amount,
      principalAmount: body.principalAmount,
      interestAmount: body.interestAmount,
      feeAmount: body.feeAmount,
      paymentMethod: body.paymentMethod,
      paymentDate: body.paymentDate,
      transactionReference: body.transactionReference,
      bankReference: body.bankReference,
      checkNumber: body.checkNumber,
      notes: body.notes,
      createdBy: body.createdBy,
    });

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/loans/:loanId/payments
 * Get payment history for a loan with filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const filters = {
      status: searchParams.get("status") as any,
      paymentMethod: searchParams.get("paymentMethod") as any,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const history = await PaymentService.getPaymentHistory(loanId, filters);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

