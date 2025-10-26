import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/services/inspection.service";

/**
 * POST /api/v1/draws/:drawId/inspections
 * Schedule an inspection for a draw
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const body = await request.json();

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
    const { drawId } = await params;

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

