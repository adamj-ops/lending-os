import { NextResponse } from "next/server";
import { FundService } from "@/services/fund.service";
import { requireOrganization } from "@/lib/clerk-server";
import type { CreateFundDTO } from "@/types/fund";

/**
 * GET /api/v1/funds
 * 
 * Get all funds for an organization with optional filters
 */
export async function GET(request: Request) {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fundType = searchParams.get("fundType");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const funds = await FundService.getAllFunds(session.organizationId, {
      status: status || undefined,
      fundType: fundType || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json({
      funds,
      count: funds.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ code: 401, message: "Unauthorized", traceId: crypto.randomUUID() }, { status: 401 });
    }

    console.error("Error fetching funds:", error);
    return NextResponse.json(
      { code: 500, message: "Failed to fetch funds", traceId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/funds
 *
 * Create a new fund
 */
export async function POST(request: Request) {
  try {
    const session = await requireOrganization();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.fundType || !body.totalCapacity || !body.inceptionDate) {
      return NextResponse.json(
        { code: 400, message: "Missing required fields: name, fundType, totalCapacity, inceptionDate", traceId: crypto.randomUUID() },
        { status: 400 }
      );
    }

    const fundData: CreateFundDTO = {
      organizationId: session.organizationId, // Use session org ID, not client-supplied
      name: body.name,
      fundType: body.fundType,
      totalCapacity: body.totalCapacity,
      inceptionDate: new Date(body.inceptionDate),
      strategy: body.strategy,
      targetReturn: body.targetReturn,
      managementFeeBps: body.managementFeeBps,
      performanceFeeBps: body.performanceFeeBps,
    };

    const fund = await FundService.createFund(fundData, session.organizationId);

    return NextResponse.json(fund, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating fund:", error);
    return NextResponse.json(
      { error: "Failed to create fund" },
      { status: 500 }
    );
  }
}

