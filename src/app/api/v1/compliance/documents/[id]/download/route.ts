import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";
import { withRequestLogging } from "@/lib/api-logger";
import { badRequest, notFound, serverError } from "@/lib/api-response";

/**
 * Download Signed Document API
 * 
 * GET /api/v1/compliance/documents/:id/download - Download signed document
 */

export const GET = withRequestLogging(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: signatureId } = await params;
    const signature = await SignatureService.getSignature(signatureId);

    if (!signature) return notFound("Signature not found");

    if (signature.status !== "completed") return badRequest("Document not yet completed");

    // Get adapter
    const adapter = createDocuSignAdapter({
      integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || "",
      userId: process.env.DOCUSIGN_USER_ID || "",
      accountId: process.env.DOCUSIGN_ACCOUNT_ID || "",
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY || "",
    });

    // Download document
    const documentBuffer = await adapter.downloadSignedDocument(signature.envelopeId);

    // Return as PDF
    return new NextResponse(documentBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="signed_${signature.documentType}_${signature.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Download API] Error:", error);
    return serverError("Failed to download document");
  }
});

