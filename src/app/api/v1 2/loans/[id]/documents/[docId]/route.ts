import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { deleteFromS3, extractFileKeyFromUrl } from "@/lib/s3-upload";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { docId } = await params;

    // Get document to extract file key
    const documents = await LoanService.getDocuments((await params).id);
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

