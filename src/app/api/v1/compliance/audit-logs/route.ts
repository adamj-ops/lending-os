import { NextRequest, NextResponse } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";
import { auditLogFilterSchema } from "@/lib/validation/compliance";

/**
 * GET /api/v1/compliance/audit-logs
 * Query audit logs with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireOrganization();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const filterInput = {
      entityType: searchParams.get("entityType") || undefined,
      entityId: searchParams.get("entityId") || undefined,
      userId: searchParams.get("userId") || undefined,
      action: searchParams.get("action") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validation = auditLogFilterSchema.safeParse(filterInput);
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

    // Query audit logs
    const logs = await ComplianceService.queryAuditLog({
      organizationId: session.organizationId,
      entityType: filters.entityType,
      entityId: filters.entityId,
      userId: filters.userId,
      action: filters.action,
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: filters.limit,
      offset: filters.offset,
    });

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error querying audit logs:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

