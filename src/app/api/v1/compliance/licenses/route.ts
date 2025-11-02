import { NextRequest, NextResponse } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";
import { trackLicenseSchema, licenseFilterSchema } from "@/lib/validation/compliance";

/**
 * GET /api/v1/compliance/licenses
 * Get all licenses for organization with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const filterInput = {
      status: searchParams.get("status") || undefined,
      expirationDateStart: searchParams.get("expirationDateStart") || undefined,
      expirationDateEnd: searchParams.get("expirationDateEnd") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validation = licenseFilterSchema.safeParse(filterInput);
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

    // Get licenses with filters
    const licenses = await ComplianceService.getLicenses(
      session.organizationId,
      filters
    );

    return NextResponse.json({
      success: true,
      data: licenses,
      count: licenses.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching licenses:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/compliance/licenses
 * Track a new license
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const body = await request.json();

    // Validate request body
    const validation = trackLicenseSchema.safeParse(body);
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

    // Track license
    const license = await ComplianceService.trackLicense({
      organizationId: session.organizationId,
      licenseType: data.licenseType,
      licenseNumber: data.licenseNumber,
      issuer: data.issuer,
      issueDate: data.issueDate,
      expirationDate: data.expirationDate,
      notes: data.notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: license,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error tracking license:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
