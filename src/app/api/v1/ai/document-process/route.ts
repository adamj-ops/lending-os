import { NextRequest, NextResponse } from "next/server";
import { processLoanDocument } from "@/lib/ai/utils";
import { requireOrganization } from "@/lib/clerk-server";
import { z } from "zod";

const documentProcessingSchema = z.object({
  documentText: z.string().min(1),
  documentType: z.enum([
    'loan_application',
    'financial_statement',
    'tax_return',
    'bank_statement',
    'property_appraisal',
    'insurance_document',
    'contract',
    'other'
  ]),
});

/**
 * POST /api/v1/ai/document-process
 * AI-powered document processing and data extraction
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication to prevent unauthorized AI usage
    const session = await requireOrganization();

    const body = await request.json();
    const { documentText, documentType } = documentProcessingSchema.parse(body);

    const result = await processLoanDocument(documentText, documentType);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.object,
    });
  } catch (error) {
    console.error("Error processing document:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process document",
      },
      { status: 500 }
    );
  }
}
