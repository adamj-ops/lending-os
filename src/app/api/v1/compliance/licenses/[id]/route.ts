import { NextRequest, NextResponse } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";
import { updateLicenseSchema } from "@/lib/validation/compliance";

/**
 * GET /api/v1/compliance/licenses/[id]
 * Get a single license by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id } = await params;

    const license = await ComplianceService.getLicenseById(id, session.organizationId);

    if (!license) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: license,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching license:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/compliance/licenses/[id]
 * Update a license
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateLicenseSchema.safeParse(body);
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

    // Update license
    const license = await ComplianceService.updateLicense(
      id,
      session.organizationId,
      data
    );

    return NextResponse.json({
      success: true,
      data: license,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "License not found") {
        return NextResponse.json({ success: false, error: "License not found" }, { status: 404 });
      }
      if (error.message.includes("Invalid status transition")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    console.error("Error updating license:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

