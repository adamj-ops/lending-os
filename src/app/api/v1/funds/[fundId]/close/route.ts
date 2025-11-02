import { NextResponse } from "next/server";
import { requireOrganization } from "@/lib/clerk-server";
import { FundService } from "@/services/fund.service";

type RouteContext = {
  params: Promise<{ fundId: string }>;
};

/**
 * POST /api/v1/funds/[fundId]/close
 * 
 * Close a fund (no longer accepting commitments)
 */
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireOrganization();
    const { fundId } = await context.params;
    const body = await request.json();

    const fund = await FundService.closeFund(fundId, session.organizationId, body.closedBy);

    if (!fund) {
      return NextResponse.json(
        { code: 404, message: "Fund not found", traceId: crypto.randomUUID() },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fund,
      message: "Fund closed successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error closing fund:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to close fund", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}
