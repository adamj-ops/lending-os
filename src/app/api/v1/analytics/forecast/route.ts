import { NextRequest, NextResponse } from "next/server";
import { forecastLoan } from "@/lib/ai/forecast";
import type { ForecastInput } from "@/types/forecast";

/**
 * POST /api/v1/analytics/forecast
 * Generate AI forecast for loan risk and ROI
 * Phase 4: Will integrate with ML models
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

    const forecast = await forecastLoan(body);

    return NextResponse.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Error generating forecast:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate forecast",
      },
      { status: 500 }
    );
  }
}

