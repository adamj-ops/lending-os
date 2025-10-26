import { NextRequest, NextResponse } from "next/server";
import { aiEnhancedForecast } from "@/lib/ai/utils";
import type { ForecastInput } from "@/types/forecast";

/**
 * POST /api/v1/ai/forecast
 * Enhanced AI-powered loan forecast with risk assessment
 */
export async function POST(request: NextRequest) {
  try {
    const body: ForecastInput = await request.json();

    // Validate required fields
    if (!body.principal || !body.rate || !body.termMonths || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: principal, rate, termMonths, category",
        },
        { status: 400 }
      );
    }

    const forecast = await aiEnhancedForecast(body);

    return NextResponse.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Error generating AI forecast:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI forecast",
      },
      { status: 500 }
    );
  }
}
