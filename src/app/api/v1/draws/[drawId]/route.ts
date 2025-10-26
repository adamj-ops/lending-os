import { NextRequest, NextResponse } from "next/server";
import { DrawService } from "@/services/draw.service";

/**
 * GET /api/v1/draws/:drawId
 * Get draw by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;

    const draw = await DrawService.getDraw(drawId);

    if (!draw) {
      return NextResponse.json(
        { success: false, error: "Draw not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: draw,
    });
  } catch (error) {
    console.error("Error fetching draw:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch draw",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/draws/:drawId
 * Update draw details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const body = await request.json();

    const draw = await DrawService.updateDraw(drawId, {
      amountRequested: body.amountRequested,
      workDescription: body.workDescription,
      budgetLineItem: body.budgetLineItem,
      contractorName: body.contractorName,
      contractorContact: body.contractorContact,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: draw,
    });
  } catch (error) {
    console.error("Error updating draw:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update draw",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/draws/:drawId
 * Delete a draw
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;

    await DrawService.deleteDraw(drawId);

    return NextResponse.json({
      success: true,
      message: "Draw deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting draw:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete draw",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

