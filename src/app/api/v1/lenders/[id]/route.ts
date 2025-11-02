import { NextRequest, NextResponse } from "next/server";
import { LenderService } from "@/services/lender.service";
import { requireOrganization } from "@/lib/clerk-server";
import { updateLenderSchema } from "@/lib/validation/lenders";
import type { UpdateLenderDTO } from "@/types/lender";

/**
 * GET /api/v1/lenders/[id]
 * Get a single lender by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOrganization();

    const { id } = await params;
    const lender = await LenderService.getLenderById(id);

    if (!lender) {
      return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
    }

    // Verify lender belongs to user's organization
    if (lender.organizationId !== session.organizationId) {
      return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lender,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching lender:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/lenders/[id]
 * Update a lender
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOrganization();

    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const validationResult = updateLenderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Get lender first to verify ownership
    const existingLender = await LenderService.getLenderById(id);
    if (!existingLender) {
      return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
    }

    // Verify lender belongs to user's organization
    if (existingLender.organizationId !== session.organizationId) {
      return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
    }

    const lender = await LenderService.updateLender(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: lender,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error updating lender:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/lenders/[id]
 * Delete a lender
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOrganization();

    const { id } = await params;

    // Get lender first to verify ownership
    const lender = await LenderService.getLenderById(id);
    if (!lender) {
      return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
    }

    // Verify lender belongs to user's organization
    if (lender.organizationId !== session.organizationId) {
      return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
    }

    const success = await LenderService.deleteLender(id);

    return NextResponse.json({
      success: true,
      message: "Lender deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error deleting lender:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

