import { NextRequest, NextResponse } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";
import { updateFilingSchema, submitFilingSchema } from "@/lib/validation/compliance";

/**
 * GET /api/v1/compliance/filings/[id]
 * Get a single filing by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id } = await params;

    const filing = await ComplianceService.getFilingById(id, session.organizationId);

    if (!filing) {
      return NextResponse.json({ success: false, error: "Filing not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: filing,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching filing:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/compliance/filings/[id]
 * Update a filing
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id } = await params;
    const body = await request.json();

    // Determine if this is a submit operation or regular update
    const isSubmit = body.submittedDate !== undefined;
    const schema = isSubmit ? submitFilingSchema : updateFilingSchema;

    const validation = schema.safeParse(body);
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

    let filing;

    if (isSubmit) {
      // Submit filing
      const submitData = data as { submittedDate: Date; filingNumber?: string };
      filing = await ComplianceService.submitFiling(
        id,
        session.organizationId,
        submitData.submittedDate,
        submitData.filingNumber
      );
    } else {
      // Regular update
      filing = await ComplianceService.updateFiling(id, session.organizationId, data);
    }

    return NextResponse.json({
      success: true,
      data: filing,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Filing not found") {
        return NextResponse.json({ success: false, error: "Filing not found" }, { status: 404 });
      }
      if (error.message.includes("Invalid status transition")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    console.error("Error updating filing:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
