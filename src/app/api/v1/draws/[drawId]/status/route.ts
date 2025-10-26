import { NextRequest, NextResponse } from "next/server";
import { DrawService } from "@/services/draw.service";
import { DrawStatus } from "@/types/draw";

/**
 * PUT /api/v1/draws/:drawId/status
 * Update draw status (approve/reject/disburse)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const body = await request.json();

    const { status, amountApproved, notes, rejectionReason, amountDisbursed, approvedBy, rejectedBy, disbursedBy } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    let draw;

    switch (status) {
      case DrawStatus.APPROVED:
        if (!amountApproved || !approvedBy) {
          return NextResponse.json(
            { success: false, error: "amountApproved and approvedBy are required for approval" },
            { status: 400 }
          );
        }
        draw = await DrawService.approveDraw(drawId, {
          amountApproved,
          approvedBy,
          notes,
        });
        break;

      case DrawStatus.REJECTED:
        if (!rejectedBy || !rejectionReason) {
          return NextResponse.json(
            { success: false, error: "rejectedBy and rejectionReason are required for rejection" },
            { status: 400 }
          );
        }
        draw = await DrawService.rejectDraw(drawId, {
          rejectedBy,
          rejectionReason,
        });
        break;

      case DrawStatus.DISBURSED:
        if (!amountDisbursed || !disbursedBy) {
          return NextResponse.json(
            { success: false, error: "amountDisbursed and disbursedBy are required for disbursement" },
            { status: 400 }
          );
        }
        draw = await DrawService.disburseDraw(drawId, {
          amountDisbursed,
          disbursedBy,
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
      data: draw,
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

