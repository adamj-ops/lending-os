import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * GET /api/v1/payments/:paymentId
 * Get payment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { paymentId } = await params;

    const payment = await PaymentService.getPayment(paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment's loan belongs to user's organization
    const loan = await LoanService.getLoanById(payment.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Payment not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/payments/:paymentId
 * Update payment status or details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { paymentId } = await params;
    const body = await request.json();

    // Get payment first
    const payment = await PaymentService.getPayment(paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment's loan belongs to user's organization
    const loan = await LoanService.getLoanById(payment.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Payment not found or access denied" },
        { status: 404 }
      );
    }

    const updatedPayment = await PaymentService.updatePayment(paymentId, {
      status: body.status,
      receivedDate: body.receivedDate,
      processedDate: body.processedDate,
      bankReference: body.bankReference,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/payments/:paymentId
 * Delete a payment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { paymentId } = await params;

    // Get payment first
    const payment = await PaymentService.getPayment(paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment's loan belongs to user's organization
    const loan = await LoanService.getLoanById(payment.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Payment not found or access denied" },
        { status: 404 }
      );
    }

    await PaymentService.deletePayment(paymentId);

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

