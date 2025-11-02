import { NextResponse } from "next/server";
import { FundService } from "@/services/fund.service";
import { requireOrganization } from "@/lib/clerk-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/v1/commitments/[id]/cancel
 * 
 * Cancel a fund commitment
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { id } = await context.params;
    const body = await request.json();

    const commitment = await FundService.cancelCommitment(
      id,
      session.organizationId,
      body.cancelledBy,
      body.reason
    );

    if (!commitment) {
      return NextResponse.json(
        { code: 404, message: "Commitment not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    return NextResponse.json(commitment);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error cancelling commitment:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to cancel commitment", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

