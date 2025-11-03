import { NextRequest } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { PersonaAdapter, createPersonaAdapter } from "@/integrations/kyc/persona.adapter";
import { BorrowerService } from "@/services/borrower.service";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, notFound, serverError } from "@/lib/api-response";

/**
 * KYC Status API
 * 
 * GET /api/v1/borrowers/:id/kyc/status - Get verification status
 */

export const GET = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: borrowerId } = await params;

    // Get borrower
    const borrower = await BorrowerService.getBorrowerById(borrowerId);
    if (!borrower) return notFound("Borrower not found");

    // Get latest verification
    const verifications = await KYCService.getVerificationsByBorrowerId(borrowerId);
    const latestVerification = verifications[0];

    if (!latestVerification) {
      return ok({ status: borrower.kycStatus || "pending", verified: false });
    }

    // Get latest status from provider
    const adapter = createPersonaAdapter({
      apiKey: process.env.PERSONA_API_KEY || "",
    });

    const providerStatus = await adapter.getVerificationStatus(latestVerification.verificationId);

    // Map provider status to our status
    const statusMap: Record<string, string> = {
      pending: "pending",
      processing: "in_progress",
      approved: "approved",
      rejected: "rejected",
      requires_review: "requires_review",
    };

    const mappedStatus = statusMap[providerStatus.status] || latestVerification.status;

    // Update if status changed
    if (mappedStatus !== latestVerification.status) {
      await KYCService.updateStatus(
        latestVerification.id,
        mappedStatus as any,
        providerStatus.result
      );
    }

    return ok({
      verificationId: latestVerification.id,
      status: mappedStatus,
      borrowerStatus: borrower.kycStatus,
      submittedAt: latestVerification.submittedAt,
      completedAt: latestVerification.completedAt,
      verified: mappedStatus === "approved",
    });
  } catch (error) {
    console.error("[KYC Status API] Error:", error);
    return serverError("Failed to get KYC status");
  }
});

