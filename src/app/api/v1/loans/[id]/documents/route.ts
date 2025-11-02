import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { LoanDocumentType } from "@/types/loan-document";
import { requireOrganization } from "@/lib/clerk-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id } = await params;

    // Verify loan belongs to user's organization
    const loan = await LoanService.getLoanById(id);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }

    const documents = await LoanService.getDocuments(id);

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching loan documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id } = await params;
    const body = await request.json();

    // Verify loan belongs to user's organization
    const loan = await LoanService.getLoanById(id);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }

    const document = await LoanService.createDocument({
      loanId: id,
      documentType: body.documentType as LoanDocumentType,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize,
      uploadedBy: session.userId,
    });

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error creating loan document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create document" },
      { status: 500 }
    );
  }
}

