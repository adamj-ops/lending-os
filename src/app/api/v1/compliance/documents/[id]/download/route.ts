import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";

/**
 * Download Signed Document API
 * 
 * GET /api/v1/compliance/documents/:id/download - Download signed document
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

    if (signature.status !== "completed") {
      return NextResponse.json(
        { error: "Document not yet completed" },
        { status: 400 }
      );
    }

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
    return new NextResponse(documentBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="signed_${signature.documentType}_${signature.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Download API] Error:", error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}


