import { NextRequest, NextResponse } from "next/server";
import { LoanService } from "@/services/loan.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notes = await LoanService.getNotes(id);

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Error fetching loan notes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
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

    const note = await LoanService.createNote({
      loanId: id,
      content: body.content,
      createdBy: body.createdBy || "System",
    });

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Error creating loan note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}

