import { NextRequest, NextResponse } from "next/server";
import { LenderService } from "@/services/lender.service";
import { requireOrganization } from "@/lib/clerk-server";
import { createLenderSchema } from "@/lib/validation/lenders";
import type { CreateLenderDTO } from "@/types/lender";

/**
 * GET /api/v1/lenders
 * Get all lenders for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();

    const lenders = await LenderService.getLendersByOrganization(session.organizationId);

    return NextResponse.json({
      success: true,
      data: lenders,
      count: lenders.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching lenders:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/lenders
 * Create a new lender
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const body = await request.json();

    // Validate with Zod
    const validationResult = createLenderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const lenderData: CreateLenderDTO = {
      ...validationResult.data,
      organizationId: session.organizationId,
    };

    const lender = await LenderService.createLender(lenderData);

    return NextResponse.json(
      {
        success: true,
        data: lender,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating lender:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

