import { NextRequest, NextResponse } from "next/server";
import { KYCService } from "@/services/kyc.service";
import { PersonaAdapter, createPersonaAdapter } from "@/integrations/kyc/persona.adapter";
import { BorrowerService } from "@/services/borrower.service";

/**
 * KYC Operations API
 * 
 * POST /api/v1/borrowers/:id/kyc - Initiate verification
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: borrowerId } = await params;
    const body = await request.json();

    // Get borrower to verify it exists and get organization
    const borrower = await BorrowerService.getBorrowerById(borrowerId);
    if (!borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Create verification record
    const verification = await KYCService.initiateVerification({
      borrowerId,
      userId: body.userId,
      organizationId: borrower.organizationId,
      provider: body.provider || "persona",
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

    return NextResponse.json(
      {
        id: verification.id,
        verificationId: personaVerification.inquiryId,
        status: verification.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[KYC API] Error:", error);
    return NextResponse.json(
      { error: "Failed to initiate KYC verification" },
      { status: 500 }
    );
  }
}


