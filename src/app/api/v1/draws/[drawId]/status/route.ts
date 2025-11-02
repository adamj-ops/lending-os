import { NextRequest, NextResponse } from "next/server";
import { DrawService } from "@/services/draw.service";
import { LoanService } from "@/services/loan.service";
import { DrawStatusValues as DrawStatus } from "@/db/schema";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * PUT /api/v1/draws/:drawId/status
 * Update draw status (approve/reject/disburse)
 */
export async function PUT(
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

    const { status, amountApproved, notes, rejectionReason, amountDisbursed } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    let updatedDraw;

    switch (status) {
      case DrawStatus.APPROVED:
        if (!amountApproved) {
          return NextResponse.json(
            { success: false, error: "amountApproved is required for approval" },
            { status: 400 }
          );
        }
        updatedDraw = await DrawService.approveDraw(drawId, {
          amountApproved,
          approvedBy: session.userId,
          notes,
        });
        break;

      case DrawStatus.REJECTED:
        if (!rejectionReason) {
          return NextResponse.json(
            { success: false, error: "rejectionReason is required for rejection" },
            { status: 400 }
          );
        }
        updatedDraw = await DrawService.rejectDraw(drawId, {
          rejectedBy: session.userId,
          rejectionReason,
        });
        break;

      case DrawStatus.DISBURSED:
        if (!amountDisbursed) {
          return NextResponse.json(
            { success: false, error: "amountDisbursed is required for disbursement" },
            { status: 400 }
          );
        }
        updatedDraw = await DrawService.disburseDraw(drawId, {
          amountDisbursed,
          disbursedBy: session.userId,
          notes,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Invalid status: ${status}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: updatedDraw,
    });
  } catch (error) {
    console.error("Error updating draw status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update draw status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

