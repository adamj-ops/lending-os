import { NextRequest, NextResponse } from "next/server";
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
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
    const body = await request.json();
    const { message, context } = chatRequestSchema.parse(body);

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
