import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireAuth } from "@/lib/session";
import type { UpdateLoanDTO } from "@/types/loan";

/**
 * GET /api/v1/loans/[id]
 * Get a single loan by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const { id } = await params;
    const loan = await LoanService.getLoanById(id);

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

    console.error("Error fetching loan:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/loans/[id]
 * Update a loan
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const body: UpdateLoanDTO = await request.json();

    const { id } = await params;
    const loan = await LoanService.updateLoan(id, body);

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

    console.error("Error updating loan:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/loans/[id]
 * Delete a loan
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const { id } = await params;
    const success = await LoanService.deleteLoan(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Loan deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error deleting loan:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

