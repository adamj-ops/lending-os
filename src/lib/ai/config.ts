import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject, streamText } from 'ai';
import { z } from 'zod';

// AI Configuration Types
export interface AIConfig {
  model: string;
  temperature?: number;
  provider: 'openai' | 'anthropic';
}

// Common AI configurations for different use cases
export const aiConfigs = {
  // For loan analysis and risk assessment
  loanAnalysis: {
    model: 'gpt-4o',
    temperature: 0.1,
    provider: 'openai' as const,
  },
  // For document processing and extraction
  documentProcessing: {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.0,
    provider: 'anthropic' as const,
  },
  // For general chat and assistance
  chat: {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    provider: 'openai' as const,
  },
  // For code generation and technical tasks
  codeGeneration: {
    model: 'gpt-4o',
    temperature: 0.2,
    provider: 'openai' as const,
  },
};

// Utility function to generate text with error handling
export async function generateAIText(
  prompt: string,
  config: AIConfig = aiConfigs.chat
) {
  try {
    let model;
    
    if (config.provider === 'openai') {
      model = openai(config.model);
    } else {
      model = anthropic(config.model);
    }
    
    const result = await generateText({
      model,
      prompt,
      temperature: config.temperature,
    });

    return {
      success: true,
      text: result.text,
      usage: result.usage,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Utility function to generate structured objects
export async function generateAIObject<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  config: AIConfig = aiConfigs.loanAnalysis
) {
  try {
    let model;
    
    if (config.provider === 'openai') {
      model = openai(config.model);
    } else {
      model = anthropic(config.model);
    }
    
    const result = await generateObject({
      model,
      prompt,
      schema,
      temperature: config.temperature,
    });

    return {
      success: true,
      object: result.object,
      usage: result.usage,
    };
  } catch (error) {
    console.error('AI object generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Utility function to stream text
export async function streamAIText(
  prompt: string,
  config: AIConfig = aiConfigs.chat
) {
  try {
    let model;
    
    if (config.provider === 'openai') {
      model = openai(config.model);
    } else {
      model = anthropic(config.model);
    }
    
    const result = await streamText({
      model,
      prompt,
      temperature: config.temperature,
    });

    return {
      success: true,
      stream: result.textStream,
      usage: result.usage,
    };
  } catch (error) {
    console.error('AI streaming error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Validation schemas for common lending platform use cases
export const lendingSchemas = {
  // Loan risk assessment schema
  loanRiskAssessment: z.object({
    riskLevel: z.enum(['low', 'medium', 'high']),
    riskScore: z.number().min(0).max(100),
    riskFactors: z.array(z.string()),
    recommendations: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),

  // Document extraction schema
  documentExtraction: z.object({
    documentType: z.string(),
    extractedData: z.record(z.any()),
    confidence: z.number().min(0).max(1),
    missingFields: z.array(z.string()),
  }),

  // Payment analysis schema
  paymentAnalysis: z.object({
    paymentTrend: z.enum(['increasing', 'decreasing', 'stable', 'irregular']),
    riskIndicators: z.array(z.string()),
    recommendations: z.array(z.string()),
    nextPaymentPrediction: z.object({
      amount: z.number(),
      date: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  }),
};