import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";
import type { UpdateLoanDTO } from "@/types/loan";

/**
 * GET /api/v1/loans/[id]
 * Get a single loan by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOrganization();

    const { id } = await params;
    const loan = await LoanService.getLoanById(id);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }

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
    const session = await requireOrganization();

    const body: UpdateLoanDTO = await request.json();

    const { id } = await params;

    // Verify loan belongs to user's organization
    const existingLoan = await LoanService.getLoanById(id);
    if (!existingLoan) {
      return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    }

    const loan = await LoanService.updateLoan(id, body);

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
    const session = await requireOrganization();

    const { id } = await params;

    // Verify loan belongs to user's organization before deleting
    const loan = await LoanService.getLoanById(id);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json({ success: false, error: "Loan not found" }, { status: 404 });
    }

    const success = await LoanService.deleteLoan(id);

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

