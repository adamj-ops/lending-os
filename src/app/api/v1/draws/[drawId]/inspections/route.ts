import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/services/inspection.service";
import { DrawService } from "@/services/draw.service";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * POST /api/v1/draws/:drawId/inspections
 * Schedule an inspection for a draw
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { drawId } = await params;
    const body = await request.json();

    // Get draw first
    const draw = await DrawService.getDraw(drawId);
    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Draw not found" },
        { status: 404 }
      );
    }

    // Verify the draw's loan belongs to user's organization
    const loan = await LoanService.getLoanById(draw.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Draw not found or access denied" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.inspectionType || !body.inspectorName || !body.scheduledDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: inspectionType, inspectorName, scheduledDate",
        },
        { status: 400 }
      );
    }

    const inspection = await InspectionService.scheduleInspection(drawId, {
      inspectionType: body.inspectionType,
      inspectorName: body.inspectorName,
      inspectorContact: body.inspectorContact,
      scheduledDate: body.scheduledDate,
      inspectionLocation: body.inspectionLocation,
    });

    return NextResponse.json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    console.error("Error scheduling inspection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to schedule inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/draws/:drawId/inspections
 * Get all inspections for a draw
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { drawId } = await params;

    // Get draw first
    const draw = await DrawService.getDraw(drawId);
    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Draw not found" },
        { status: 404 }
      );
    }

    // Verify the draw's loan belongs to user's organization
    const loan = await LoanService.getLoanById(draw.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Draw not found or access denied" },
        { status: 404 }
      );
    }

    const inspections = await InspectionService.getDrawInspections(drawId);

    return NextResponse.json({
      success: true,
      data: inspections,
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inspections",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

