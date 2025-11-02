import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/services/inspection.service";
import { DrawService } from "@/services/draw.service";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * PUT /api/v1/inspections/:inspectionId/complete
 * Complete an inspection with results
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

    // Validate required fields
    if (body.workCompletionPercentage === undefined || body.qualityRating === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: workCompletionPercentage, qualityRating",
        },
        { status: 400 }
      );
    }

    const completedInspection = await InspectionService.completeInspection(inspectionId, {
      workCompletionPercentage: body.workCompletionPercentage,
      qualityRating: body.qualityRating,
      safetyCompliant: body.safetyCompliant ?? true,
      findings: body.findings,
      recommendations: body.recommendations,
      photos: body.photos,
      signatures: body.signatures,
      weatherConditions: body.weatherConditions,
      equipmentUsed: body.equipmentUsed,
      inspectionDurationMinutes: body.inspectionDurationMinutes,
    });

    return NextResponse.json({
      success: true,
      data: completedInspection,
    });
  } catch (error) {
    console.error("Error completing inspection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

