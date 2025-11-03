import { NextRequest } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";
import { withRequestLogging } from "@/lib/api-logger";
import { ok, notFound, serverError } from "@/lib/api-response";

/**
 * Signature Status API
 * 
 * GET /api/v1/compliance/documents/:id/status - Get signature status
 */

export const GET = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: signatureId } = await params;
    const signature = await SignatureService.getSignature(signatureId);

    if (!signature) return notFound("Signature not found");

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

    return ok({
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
    });
  } catch (error) {
    console.error("[Status API] Error:", error);
    return serverError("Failed to get signature status");
  }
});

