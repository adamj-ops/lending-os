import { NextRequest, NextResponse } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { PersonaAdapter, createPersonaAdapter } from "@/integrations/kyc/persona.adapter";
import { BorrowerService } from "@/services/borrower.service";

/**
 * KYC Status API
 * 
 * GET /api/v1/borrowers/:id/kyc/status - Get verification status
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: borrowerId } = await params;

    // Get borrower
    const borrower = await BorrowerService.getBorrowerById(borrowerId);
    if (!borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Get latest verification
    const verifications = await KYCService.getVerificationsByBorrowerId(borrowerId);
    const latestVerification = verifications[0];

    if (!latestVerification) {
      return NextResponse.json(
        {
          status: borrower.kycStatus || "pending",
          verified: false,
        },
        { status: 200 }
      );
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

    return NextResponse.json(
      {
        verificationId: latestVerification.id,
        status: mappedStatus,
        borrowerStatus: borrower.kycStatus,
        submittedAt: latestVerification.submittedAt,
        completedAt: latestVerification.completedAt,
        verified: mappedStatus === "approved",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[KYC Status API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get KYC status" },
      { status: 500 }
    );
  }
}


