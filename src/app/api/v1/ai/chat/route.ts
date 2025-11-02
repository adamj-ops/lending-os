import { NextRequest, NextResponse } from "next/server";
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { requireOrganization } from "@/lib/clerk-server";
import { LoanService } from "@/services/loan.service";
import { BorrowerService } from "@/services/borrower.service";
import { LenderService } from "@/services/lender.service";
import { z } from 'zod';

const chatRequestSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    loanId: z.string().optional(),
    borrowerId: z.string().optional(),
    lenderId: z.string().optional(),
    userRole: z.enum(['borrower', 'lender', 'admin']).optional(),
  }).optional(),
});

/**
 * POST /api/v1/ai/chat
 * AI-powered chat assistant for lending platform
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication to prevent unauthorized AI usage
    const session = await requireOrganization();

    const body = await request.json();
    const { message, context } = chatRequestSchema.parse(body);

    // Verify context entities belong to user's organization
    if (context?.loanId) {
      const loan = await LoanService.getLoanById(context.loanId);
    if (!loan || loan.organizationId !== session.organizationId) {
      return NextResponse.json(
        { success: false, error: "Loan not found or access denied" },
        { status: 404 }
      );
    }
      if (!loan || loan.organizationId !== session.organizationId) {
        return NextResponse.json(
          { success: false, error: "Loan not found or access denied" },
          { status: 404 }
        );
      }
    }

    if (context?.borrowerId) {
      const borrower = await BorrowerService.getBorrowerById(context.borrowerId);
      if (!borrower || borrower.organizationId !== session.organizationId) {
        return NextResponse.json(
          { success: false, error: "Borrower not found or access denied" },
          { status: 404 }
        );
      }
    }

    if (context?.lenderId) {
      const lender = await LenderService.getLenderById(context.lenderId);
      if (!lender || lender.organizationId !== session.organizationId) {
        return NextResponse.json(
          { success: false, error: "Lender not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Build context-aware prompt
    let systemPrompt = `You are an AI assistant for a lending platform. You help users with:
- Loan applications and processes
- Payment questions and issues
- Draw request guidance
- Inspection scheduling
- General lending platform navigation
- Risk assessment explanations

Be helpful, professional, and accurate. If you don't know something specific about the platform, say so.`;

    if (context?.userRole) {
      systemPrompt += `\n\nThe user is a ${context.userRole}.`;
    }

    if (context?.loanId) {
      systemPrompt += `\n\nThe user is asking about loan ID: ${context.loanId}`;
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in AI chat:", error);

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
        error: "Failed to process chat request",
      },
      { status: 500 }
    );
  }
}
