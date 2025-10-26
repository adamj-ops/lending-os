import { generateAIObject, generateAIText, lendingSchemas } from './config';
import type { ForecastInput, ForecastOutput } from '@/types/forecast';
import type { Payment } from '@/types/payment';
import type { Draw } from '@/types/draw';
import type { Inspection } from '@/types/inspection';

// Enhanced AI-powered loan forecast
export async function aiEnhancedForecast(input: ForecastInput): Promise<ForecastOutput> {
  const prompt = `
    Analyze this loan application and provide a comprehensive risk assessment:
    
    Loan Details:
    - Principal: $${input.principal.toLocaleString()}
    - Interest Rate: ${input.rate}%
    - Term: ${input.termMonths} months
    - Category: ${input.category}
    - Borrower Credit Score: ${input.borrowerCreditScore || 'Not provided'}
    - Loan-to-Value Ratio: ${input.loanToValue ? (input.loanToValue * 100).toFixed(1) + '%' : 'Not provided'}
    
    Please provide a detailed risk assessment considering:
    1. Market conditions
    2. Borrower profile
    3. Loan structure
    4. Collateral (if applicable)
    5. Industry trends
    
    Focus on practical recommendations for risk mitigation.
  `;

  const result = await generateAIObject(
    prompt,
    lendingSchemas.loanRiskAssessment,
    {
      model: 'gpt-4o',
      temperature: 0.1,
      provider: 'openai',
    }
  );

  if (!result.success || !result.object) {
    // Fallback to existing heuristic-based forecast
    const { forecastLoan } = await import('./forecast');
    return forecastLoan(input);
  }

  // Convert AI assessment to ForecastOutput format
  const assessment = result.object;
  
  // Calculate ROI based on risk level
  const baseROI = (input.rate / 100) * (input.termMonths / 12) * 100;
  const riskAdjustment = assessment.riskLevel === 'high' ? 0.8 : 
                        assessment.riskLevel === 'medium' ? 0.9 : 1.0;
  const adjustedROI = baseROI * riskAdjustment;

  // Calculate default probability from risk score
  const defaultProb = assessment.riskScore / 100;

  // Determine recommended funding based on risk and amount
  let recommendedFunding: ForecastOutput['recommendedFunding'];
  if (input.principal > 1000000 || assessment.riskLevel === 'high') {
    recommendedFunding = 'bank';
  } else if (input.category === 'yield_note') {
    recommendedFunding = 'escrow';
  } else {
    recommendedFunding = 'internal';
  }

  return {
    roiPct: Math.round(adjustedROI * 100) / 100,
    defaultProb: Math.round(defaultProb * 10000) / 10000,
    efficiency: Math.round(assessment.riskScore * 10) / 10,
    recommendedFunding,
    riskLevel: assessment.riskLevel,
    // Additional AI insights
    aiInsights: {
      riskFactors: assessment.riskFactors,
      recommendations: assessment.recommendations,
      confidence: assessment.confidence,
    },
  };
}

// AI-powered payment analysis
export async function analyzePaymentPatterns(payments: Payment[]) {
  if (payments.length === 0) {
    return {
      success: false,
      error: 'No payment data available',
    };
  }

  const paymentSummary = payments.map(p => ({
    amount: p.amount,
    date: p.paymentDate,
    status: p.status,
    method: p.paymentMethod,
  }));

  const prompt = `
    Analyze these payment patterns for a lending platform:
    
    Payment History:
    ${JSON.stringify(paymentSummary, null, 2)}
    
    Provide insights on:
    1. Payment trends and patterns
    2. Risk indicators
    3. Recommendations for improving payment collection
    4. Predictions for future payments
  `;

  return generateAIObject(
    prompt,
    lendingSchemas.paymentAnalysis,
    {
      model: 'gpt-4o',
      temperature: 0.2,
      provider: 'openai',
    }
  );
}

// AI-powered document processing
export async function processLoanDocument(documentText: string, documentType: string) {
  const prompt = `
    Extract structured data from this ${documentType} document:
    
    Document Content:
    ${documentText}
    
    Please extract all relevant information including:
    - Personal/Company details
    - Financial information
    - Dates and amounts
    - Terms and conditions
    - Any risk indicators
    
    Provide confidence scores for each extracted field.
  `;

  return generateAIObject(
    prompt,
    lendingSchemas.documentExtraction,
    {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.0,
      provider: 'anthropic',
    }
  );
}

// AI-powered draw request analysis
export async function analyzeDrawRequest(draw: Draw) {
  const prompt = `
    Analyze this construction draw request for risk assessment:
    
    Draw Details:
    - Amount: $${parseFloat(draw.amountRequested).toLocaleString()}
    - Description: ${draw.workDescription}
    - Contractor: ${draw.contractorName || 'Not specified'}
    - Requested Date: ${draw.requestedDate}
    - Budget Line Item: ${draw.budgetLineItem || 'Not specified'}
    
    Please assess:
    1. Reasonableness of the amount
    2. Quality of work description
    3. Contractor reliability indicators
    4. Risk factors
    5. Recommendations for approval/denial
  `;

  return generateAIText(prompt,     {
      model: 'gpt-4o',
      temperature: 0.1,
      provider: 'openai',
    });
}

// AI-powered inspection report analysis
export async function analyzeInspectionReport(inspection: Inspection) {
  const prompt = `
    Analyze this inspection report for quality and compliance:
    
    Inspection Details:
    - Type: ${inspection.inspectionType}
    - Inspector: ${inspection.inspectorName || 'Not specified'}
    - Findings: ${inspection.findings || 'No findings provided'}
    - Photos: ${inspection.photos?.length || 0} photos
    - Status: ${inspection.status}
    
    Please provide:
    1. Quality assessment
    2. Compliance check
    3. Risk identification
    4. Recommendations for follow-up
  `;

  return generateAIText(prompt,     {
      model: 'gpt-4o',
      temperature: 0.1,
      provider: 'openai',
    });
}

// AI-powered borrower communication
export async function generateBorrowerCommunication(
  borrowerName: string,
  communicationType: 'payment_reminder' | 'draw_approval' | 'inspection_scheduled' | 'default_notice',
  context: Record<string, any>
) {
  const prompts = {
    payment_reminder: `
      Generate a professional payment reminder email for ${borrowerName}.
      Context: ${JSON.stringify(context)}
      Tone: Professional but friendly, emphasizing the importance of timely payments.
    `,
    draw_approval: `
      Generate a draw approval notification for ${borrowerName}.
      Context: ${JSON.stringify(context)}
      Tone: Professional, congratulatory, with clear next steps.
    `,
    inspection_scheduled: `
      Generate an inspection scheduling notification for ${borrowerName}.
      Context: ${JSON.stringify(context)}
      Tone: Professional, informative, with clear instructions.
    `,
    default_notice: `
      Generate a default notice for ${borrowerName}.
      Context: ${JSON.stringify(context)}
      Tone: Professional, firm but not threatening, with clear consequences and options.
    `,
  };

  return generateAIText(prompts[communicationType],     {
      model: 'gpt-4o',
      temperature: 0.3,
      provider: 'openai',
    });
}

// AI-powered market analysis
export async function analyzeMarketConditions(loanCategory: string, region: string) {
  const prompt = `
    Provide a current market analysis for ${loanCategory} loans in ${region}.
    
    Include:
    1. Current market trends
    2. Interest rate environment
    3. Risk factors
    4. Opportunities
    5. Recommendations for lenders
    
    Focus on practical insights for lending decisions.
  `;

  return generateAIText(prompt,     {
      model: 'gpt-4o',
      temperature: 0.2,
      provider: 'openai',
    });
}
