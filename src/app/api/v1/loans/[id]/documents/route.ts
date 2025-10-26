import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { LoanDocumentType } from "@/types/loan-document";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    const body = await request.json();

    const document = await LoanService.createDocument({
      loanId: id,
      documentType: body.documentType as LoanDocumentType,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize,
      uploadedBy: body.uploadedBy,
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

