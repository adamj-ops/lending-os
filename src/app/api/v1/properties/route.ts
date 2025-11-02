import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/services/property.service";
import { requireOrganization } from "@/lib/clerk-server";
import type { CreatePropertyDTO } from "@/types/property";

/**
 * GET /api/v1/properties
 * Get all properties for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();

    // Filter properties by organizationId from session
    const properties = await PropertyService.getProperties(session.organizationId);

    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching properties:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/v1/properties
 * Create a new property
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const body: CreatePropertyDTO = await request.json();

    // Validate required fields
    if (!body.address || !body.city || !body.state || !body.zip || !body.propertyType || !body.purchasePrice) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: address, city, state, zip, propertyType, purchasePrice",
        },
        { status: 400 }
      );
    }

    // Add organizationId to property data
    const propertyData: CreatePropertyDTO = {
      ...body,
      organizationId: session.organizationId,
    };

    const property = await PropertyService.createProperty(propertyData);

    return NextResponse.json(
      {
        success: true,
        data: property,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating property:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

