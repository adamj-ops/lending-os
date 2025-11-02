import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { deleteFromS3, extractFileKeyFromUrl } from "@/lib/s3-upload";
import { requireOrganization } from "@/lib/clerk-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId, docId } = await params;

    // Verify loan belongs to user's organization
    const loan = await LoanService.getLoanById(loanId);
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

    // Get document to extract file key
    const documents = await LoanService.getDocuments(loanId);
    const document = documents.find((d) => d.id === docId);

    if (document) {
      // Delete from S3
      const fileKey = extractFileKeyFromUrl(document.fileUrl);
      if (fileKey) {
        try {
          await deleteFromS3(fileKey);
        } catch (error) {
          console.error("Error deleting file from S3:", error);
        }
      }
    }

    // Delete from database
    const success = await LoanService.deleteDocument(docId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting loan document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

