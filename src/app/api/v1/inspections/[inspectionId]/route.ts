import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/services/inspection.service";
import { DrawService } from "@/services/draw.service";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * GET /api/v1/inspections/:inspectionId
 * Get inspection by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inspectionId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { inspectionId } = await params;

    const inspection = await InspectionService.getInspection(inspectionId);

    if (!inspection) {
      return NextResponse.json(
        { success: false, error: "Inspection not found" },
        { status: 404 }
      );
    }

    // Verify the inspection's draw's loan belongs to user's organization
    const draw = await DrawService.getDraw(inspection.drawId);
    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Inspection not found or access denied" },
        { status: 404 }
      );
    }

    const loan = await LoanService.getLoanById(draw.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Inspection not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/inspections/:inspectionId
 * Update inspection
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ inspectionId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { inspectionId } = await params;
    const body = await request.json();

    // Get inspection first
    const inspection = await InspectionService.getInspection(inspectionId);
    if (!inspection) {
      return NextResponse.json(
        { success: false, error: "Inspection not found" },
        { status: 404 }
      );
    }

    // Verify the inspection's draw's loan belongs to user's organization
    const draw = await DrawService.getDraw(inspection.drawId);
    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Inspection not found or access denied" },
        { status: 404 }
      );
    }

    const loan = await LoanService.getLoanById(draw.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Inspection not found or access denied" },
        { status: 404 }
      );
    }

    const updatedInspection = await InspectionService.updateInspection(inspectionId, {
      status: body.status,
      scheduledDate: body.scheduledDate,
      inspectionLocation: body.inspectionLocation,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: updatedInspection,
    });
  } catch (error) {
    console.error("Error updating inspection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/inspections/:inspectionId
 * Delete an inspection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inspectionId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { inspectionId } = await params;

    // Get inspection first
    const inspection = await InspectionService.getInspection(inspectionId);
    if (!inspection) {
      return NextResponse.json(
        { success: false, error: "Inspection not found" },
        { status: 404 }
      );
    }

    // Verify the inspection's draw's loan belongs to user's organization
    const draw = await DrawService.getDraw(inspection.drawId);
    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Inspection not found or access denied" },
        { status: 404 }
      );
    }

    const loan = await LoanService.getLoanById(draw.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Inspection not found or access denied" },
        { status: 404 }
      );
    }

    await InspectionService.deleteInspection(inspectionId);

    return NextResponse.json({
      success: true,
      message: "Inspection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

