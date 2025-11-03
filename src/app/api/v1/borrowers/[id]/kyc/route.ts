import { NextRequest } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { PersonaAdapter, createPersonaAdapter } from "@/integrations/kyc/persona.adapter";
import { BorrowerService } from "@/services/borrower.service";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, created, notFound, serverError, unprocessable } from "@/lib/api-response";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validation";

/**
 * KYC Operations API
 * 
 * POST /api/v1/borrowers/:id/kyc - Initiate verification
 */

export const POST = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: borrowerId } = await params;
    const body = await parseJsonBody(
      z.object({ userId: z.string().optional(), provider: z.enum(['persona']).optional() }),
      request
    );
    if (!body.success) return unprocessable("Invalid request body", body.issues);

    // Get borrower to verify it exists and get organization
    const borrower = await BorrowerService.getBorrowerById(borrowerId);
    if (!borrower) {
      return notFound("Borrower not found");
    }

    // Create verification record
    const verification = await KYCService.initiateVerification({
      borrowerId,
      userId: body.data.userId,
      organizationId: borrower.organizationId,
      provider: body.data.provider || "persona",
    });

    // Get Persona adapter
    const adapter = createPersonaAdapter({
      apiKey: process.env.PERSONA_API_KEY || "",
    });

    // Prepare person data
    const personData = {
      email: borrower.email,
      firstName: borrower.firstName || undefined,
      lastName: borrower.lastName || undefined,
      phone: borrower.phone || undefined,
    };

    // Create verification in Persona
    const personaVerification = await adapter.createVerification(personData);

    // Update verification with provider ID
    await KYCService.updateVerificationId(verification.id, personaVerification.inquiryId);

    return created({ id: verification.id, verificationId: personaVerification.inquiryId, status: verification.status });
  } catch (error) {
    console.error("[KYC API] Error:", error);
    return serverError("Failed to initiate KYC verification");
  }
});

