import { NextRequest, NextResponse } from "next/server";
import { SignatureService } from "@/services/signature.service";
import { DocuSignAdapter, createDocuSignAdapter } from "@/integrations/signature/docusign.adapter";

/**
 * Document Management API
 * 
 * POST /api/v1/compliance/documents - Generate/create document
 * GET /api/v1/compliance/documents - List documents
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, documentType, documentId, loanId, fundId, signers, templateId } = body;

    // Validate required fields
    if (!organizationId || !documentType || !signers || !Array.isArray(signers)) {
      return NextResponse.json(
        { error: "Missing required fields: organizationId, documentType, signers" },
        { status: 400 }
      );
    }

    // Create signature record
    const signature = await SignatureService.createEnvelope({
      organizationId,
      documentType,
      documentId,
      loanId,
      fundId,
      signers,
      templateId,
    });

    // Get DocuSign adapter (in production, load from config/env)
    // For now, use mock adapter
    const adapter = createDocuSignAdapter({
      integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || "",
      userId: process.env.DOCUSIGN_USER_ID || "",
      accountId: process.env.DOCUSIGN_ACCOUNT_ID || "",
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY || "",
    });

    // Create envelope in DocuSign
    // TODO: Load actual document content from S3 or generate from template
    const document = {
      name: `${documentType}_${signature.id}.pdf`,
      content: Buffer.from(""), // Placeholder
      fileExtension: "pdf",
    };

    const envelope = await adapter.createEnvelope(document, signers, templateId);

    // Update signature with envelope ID
    await SignatureService.updateEnvelopeId(signature.id, envelope.envelopeId);

    // Send envelope if status is "sent"
    if (envelope.status === "sent") {
      await adapter.sendEnvelope(envelope.envelopeId);
      await SignatureService.updateStatus(signature.id, { status: "sent" });
    }

    return NextResponse.json(
      {
        id: signature.id,
        envelopeId: envelope.envelopeId,
        status: signature.status,
        documentUrl: envelope.uri,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Documents API] Error:", error);
    return NextResponse.json(
      { error: "Failed to create document signature" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const loanId = searchParams.get("loanId");
    const fundId = searchParams.get("fundId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing organizationId" },
        { status: 400 }
      );
    }

    let signatures;

    if (loanId) {
      signatures = await SignatureService.getSignaturesByLoanId(loanId);
    } else if (fundId) {
      signatures = await SignatureService.getSignaturesByFundId(fundId);
    } else {
      return NextResponse.json(
        { error: "Must provide loanId or fundId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ signatures }, { status: 200 });
  } catch (error) {
    console.error("[Documents API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}


