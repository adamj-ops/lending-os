import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/services/inspection.service";

/**
 * PUT /api/v1/inspections/:inspectionId/complete
 * Complete an inspection with results
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ inspectionId: string }> }
) {
  try {
    const { inspectionId } = await params;
    const body = await request.json();

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

    const inspection = await InspectionService.completeInspection(inspectionId, {
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
      data: inspection,
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

