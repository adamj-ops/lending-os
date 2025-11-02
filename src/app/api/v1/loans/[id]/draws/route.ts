import { NextRequest, NextResponse } from "next/server";
import { DrawService } from "@/services/draw.service";
import { requireOrganization } from "@/lib/clerk-server";
import { LoanService } from "@/services/loan.service";

/**
 * POST /api/v1/loans/:id/draws
 * Create a new draw request for a loan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId } = await params;
    const body = await request.json();

    // Verify loan belongs to user's organization
    const loan = await LoanService.getLoanById(loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }

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
      requestedBy: session.userId,
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
 * GET /api/v1/loans/:id/draws
 * Get draw history for a loan with filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId } = await params;
    const { searchParams } = new URL(request.url);

    // Verify loan belongs to user's organization
    const loan = await LoanService.getLoanById(loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }

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

