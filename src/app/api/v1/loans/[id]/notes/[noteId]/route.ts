import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";
import { requireOrganization } from "@/lib/clerk-server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId, noteId } = await params;
    const body = await request.json();

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

    const note = await LoanService.updateNote(noteId, {
      content: body.content,
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Error updating loan note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await requireOrganization();
    const { id: loanId, noteId } = await params;

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

    const success = await LoanService.deleteNote(noteId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting loan note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete note" },
      { status: 500 }
    );
  }
}

