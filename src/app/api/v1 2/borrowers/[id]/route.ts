import { NextRequest, NextResponse } from "next/server";
import { BorrowerService } from "@/services/borrower.service";
import { requireAuth } from "@/lib/clerk-server";
import type { UpdateBorrowerDTO } from "@/types/borrower";

/**
 * GET /api/v1/borrowers/[id]
 * Get a single borrower by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const borrower = await BorrowerService.getBorrowerById(id);

    if (!borrower) {
      return NextResponse.json({ success: false, error: "Borrower not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: borrower,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching borrower:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/borrowers/[id]
 * Update a borrower
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const body: UpdateBorrowerDTO = await request.json();

    const { id } = await params;
    const borrower = await BorrowerService.updateBorrower(id, body);

    if (!borrower) {
      return NextResponse.json({ success: false, error: "Borrower not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: borrower,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error updating borrower:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/borrowers/[id]
 * Delete a borrower
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const success = await BorrowerService.deleteBorrower(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "Borrower not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Borrower deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error deleting borrower:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

