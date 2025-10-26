import { NextRequest, NextResponse } from "next/server";
import { DrawService } from "@/services/draw.service";

/**
 * POST /api/v1/loans/:loanId/draws
 * Create a new draw request for a loan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.amountRequested || !body.workDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amountRequested, workDescription",
        },
        { status: 400 }
      );
    }

    const draw = await DrawService.createDraw({
      loanId,
      amountRequested: body.amountRequested,
      workDescription: body.workDescription,
      budgetLineItem: body.budgetLineItem,
      contractorName: body.contractorName,
      contractorContact: body.contractorContact,
      notes: body.notes,
      requestedBy: body.requestedBy,
    });

    return NextResponse.json({
      success: true,
      data: draw,
    });
  } catch (error) {
    console.error("Error creating draw:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create draw",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/loans/:loanId/draws
 * Get draw history for a loan with filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const filters = {
      status: searchParams.get("status") as any,
      contractor: searchParams.get("contractor") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const history = await DrawService.getDrawHistory(loanId, filters);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching draws:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch draws",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

