import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/services/property.service";
import { requireAuth } from "@/lib/clerk-server";
import type { UpdatePropertyDTO } from "@/types/property";

/**
 * GET /api/v1/properties/[id]
 * Get a single property by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const { id } = await params;
    const property = await PropertyService.getPropertyById(id);

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching property:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/properties/[id]
 * Update a property
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const body: UpdatePropertyDTO = await request.json();

    const { id } = await params;
    const property = await PropertyService.updateProperty(id, body);

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error updating property:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/properties/[id]
 * Delete a property
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    const { id } = await params;
    const success = await PropertyService.deleteProperty(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error deleting property:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

