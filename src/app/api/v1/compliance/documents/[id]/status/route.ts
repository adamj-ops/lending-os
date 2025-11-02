import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";

/**
 * Signature Status API
 * 
 * GET /api/v1/compliance/documents/:id/status - Get signature status
 */

export async function GET(
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

    // Get latest status from provider
    const providerStatus = await adapter.getEnvelopeStatus(signature.envelopeId);

    // Map provider status to our status
    const statusMap: Record<string, string> = {
      sent: "sent",
      delivered: "viewed",
      signed: "signed",
      completed: "completed",
      declined: "declined",
      voided: "voided",
    };

    const mappedStatus = statusMap[providerStatus.status] || signature.status;

    // Update if status changed
    if (mappedStatus !== signature.status) {
      await SignatureService.updateStatus(signature.id, {
        status: mappedStatus as any,
      });
    }

    return NextResponse.json(
      {
        id: signature.id,
        envelopeId: signature.envelopeId,
        status: mappedStatus,
        signers: signature.signers,
        sentAt: signature.sentAt,
        viewedAt: signature.viewedAt,
        signedAt: signature.signedAt,
        completedAt: signature.completedAt,
        documentUrl: signature.documentUrl,
        signedDocumentUrl: signature.signedDocumentUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Status API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get signature status" },
      { status: 500 }
    );
  }
}


