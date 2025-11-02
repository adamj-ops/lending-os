import { NextRequest, NextResponse } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";

/**
 * Submit Filing API
 * 
 * POST /api/v1/compliance/filings/:id/submit - Submit a filing
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: filingId } = await params;
    const body = await request.json();
    const { submittedDate, filingNumber } = body;

    const filing = await ComplianceService.submitFiling(
      filingId,
      session.organizationId,
      new Date(submittedDate || Date.now()),
      filingNumber
    );

    return NextResponse.json(filing, { status: 200 });
  } catch (error) {
    console.error("[Submit Filing API] Error:", error);
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Filing not found") {
        return NextResponse.json({ error: "Filing not found" }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to submit filing" },
      { status: 500 }
    );
  }
}

