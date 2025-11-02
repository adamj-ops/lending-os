import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { BorrowerService } from "@/services/borrower.service";
import { requireOrganization } from "@/lib/clerk-server";
import { createBorrowerSchema } from "@/lib/validation/borrowers";
import type { CreateBorrowerDTO } from "@/types/borrower";

/**
 * GET /api/v1/borrowers
 * Get all borrowers for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();

    const borrowers = await BorrowerService.getBorrowersByOrganization(session.organizationId);

    return NextResponse.json({
      success: true,
      data: borrowers,
      count: borrowers.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching borrowers:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/borrowers
 * Create a new borrower
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const body = await request.json();

    // Validate with Zod
    const validationResult = createBorrowerSchema.safeParse(body);
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

    const borrowerData: CreateBorrowerDTO = {
      ...validationResult.data,
      organizationId: session.organizationId,
    };

    const borrower = await BorrowerService.createBorrower(borrowerData);

    return NextResponse.json(
      {
        success: true,
        data: borrower,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating borrower:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

