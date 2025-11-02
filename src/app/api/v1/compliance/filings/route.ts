import { NextRequest, NextResponse } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";
import { createFilingSchema, filingFilterSchema } from "@/lib/validation/compliance";

/**
 * GET /api/v1/compliance/filings
 * Get all filings for organization with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const filterInput = {
      status: searchParams.get("status") || undefined,
      dueDateStart: searchParams.get("dueDateStart") || undefined,
      dueDateEnd: searchParams.get("dueDateEnd") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validation = filingFilterSchema.safeParse(filterInput);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Get filings with filters
    const filings = await ComplianceService.getFilings(
      session.organizationId,
      filters
    );

    return NextResponse.json({
      success: true,
      data: filings,
      count: filings.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching filings:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/compliance/filings
 * Create a new filing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const body = await request.json();

    // Validate request body
    const validation = createFilingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create filing
    const filing = await ComplianceService.createFiling({
      organizationId: session.organizationId,
      filingType: data.filingType,
      filingName: data.filingName,
      description: data.description,
      dueDate: data.dueDate,
      documentId: data.documentId,
    });

    return NextResponse.json(
      {
        success: true,
        data: filing,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating filing:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
