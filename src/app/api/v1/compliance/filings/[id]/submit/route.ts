import { NextRequest } from "next/server";
import { ComplianceService } from "@/services/compliance.service";
import { requireOrganization } from "@/lib/clerk-server";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, unauthorized, notFound, serverError, unprocessable } from "@/lib/api-response";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validation";

/**
 * Submit Filing API
 * 
 * POST /api/v1/compliance/filings/:id/submit - Submit a filing
 */

export const POST = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await requireOrganization();
    const { id: filingId } = await params;
    const body = await parseJsonBody(
      z.object({
        submittedDate: z.union([z.string(), z.date()]).optional(),
        filingNumber: z.string().optional(),
      }),
      request
    );
    if (!body.success) return unprocessable("Invalid request body", body.issues);
    const { submittedDate, filingNumber } = body.data as any;

    const filing = await ComplianceService.submitFiling(
      filingId,
      session.organizationId,
      new Date(submittedDate || Date.now()),
      filingNumber
    );

    return ok(filing);
  } catch (error) {
    console.error("[Submit Filing API] Error:", error);
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return unauthorized();
      }
      if (error.message === "Filing not found") {
        return notFound("Filing not found");
      }
    }
    return serverError("Failed to submit filing");
  }
});
