import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";

/**
 * Initiate Signing API
 * 
 * POST /api/v1/compliance/documents/:id/sign - Send envelope to signers
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: signatureId } = await params;
    const signature = await SignatureService.getSignature(signatureId);

    if (!signature) {
      return NextResponse.json(
        { error: "Signature not found" },
        { status: 404 }
      );
    }

    // Get adapter
    const adapter = createDocuSignAdapter({
      integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || "",
      userId: process.env.DOCUSIGN_USER_ID || "",
      accountId: process.env.DOCUSIGN_ACCOUNT_ID || "",
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY || "",
    });

    // Send envelope
    await adapter.sendEnvelope(signature.envelopeId);

    // Update status
    const updated = await SignatureService.updateStatus(signature.id, {
      status: "sent",
    });

    return NextResponse.json(
      {
        id: updated.id,
        envelopeId: updated.envelopeId,
        status: updated.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Sign API] Error:", error);
    return NextResponse.json(
      { error: "Failed to send signature request" },
      { status: 500 }
    );
  }
}


