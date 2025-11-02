import { NextResponse } from "next/server";
import { FundService } from "@/services/fund.service";
import { requireOrganization } from "@/lib/clerk-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/v1/allocations/[id]/return
 *
 * Record capital return from loan to fund
 */
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { id } = await context.params;
    const body = await request.json();

    if (!body.amount) {
      return NextResponse.json(
        { code: 400, message: "Missing required field: amount", traceId: crypto.randomUUID() },
        { status: 400 }
      );
    }

    const allocation = await FundService.returnFromLoan(
      id,
      session.organizationId,
      body.amount,
      body.date ? new Date(body.date) : new Date()
    );

    if (!allocation) {
      return NextResponse.json(
        { code: 404, message: "Allocation not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    return NextResponse.json(allocation);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error recording capital return:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to record capital return", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

