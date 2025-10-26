# AI SDK Setup Guide

## Overview

This guide covers the AI SDK integration for the Lending OS platform, including OpenAI and Anthropic providers for enhanced loan analysis, document processing, and user assistance.

## Architecture

### AI Providers
- **OpenAI**: Primary provider for general tasks, chat, and code generation
- **Anthropic**: Specialized provider for document processing and complex analysis

### AI Services
- **Enhanced Loan Forecasting**: AI-powered risk assessment and ROI analysis
- **Document Processing**: Automated extraction of loan documents
- **Payment Analysis**: Pattern recognition and risk identification
- **Chat Assistant**: Context-aware help system
- **Market Analysis**: Real-time market condition insights

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# AI SDK Configuration
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

### AI Configuration File

The main configuration is in `src/lib/ai/config.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export const aiProviders = {
  openai: openai({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  anthropic: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
};
```

## AI Services

### 1. Enhanced Loan Forecasting

**Location**: `src/lib/ai/utils.ts` - `aiEnhancedForecast()`

**Features**:
- AI-powered risk assessment
- Market condition analysis
- Borrower profile evaluation
- Collateral assessment
- Industry trend analysis

**Usage**:
```typescript
import { aiEnhancedForecast } from '@/lib/ai/utils';

const forecast = await aiEnhancedForecast({
  principal: 500000,
  rate: 8.5,
  termMonths: 24,
  category: 'asset_backed',
  borrowerCreditScore: 750,
  loanToValue: 0.75
});
```

**API Endpoint**: `POST /api/v1/ai/forecast`

### 2. Document Processing

**Location**: `src/lib/ai/utils.ts` - `processLoanDocument()`

**Supported Document Types**:
- Loan applications
- Financial statements
- Tax returns
- Bank statements
- Property appraisals
- Insurance documents
- Contracts

**Usage**:
```typescript
import { processLoanDocument } from '@/lib/ai/utils';

const result = await processLoanDocument(
  documentText,
  'loan_application'
);
```

**API Endpoint**: `POST /api/v1/ai/document-process`

### 3. Payment Analysis

**Location**: `src/lib/ai/utils.ts` - `analyzePaymentPatterns()`

**Features**:
- Payment trend analysis
- Risk indicator identification
- Collection recommendations
- Future payment predictions

**Usage**:
```typescript
import { analyzePaymentPatterns } from '@/lib/ai/utils';

const analysis = await analyzePaymentPatterns(payments);
```

### 4. Chat Assistant

**Location**: `src/app/api/v1/ai/chat/route.ts`

**Features**:
- Context-aware responses
- Role-based assistance (borrower/lender/admin)
- Loan-specific guidance
- Platform navigation help

**Usage**:
```typescript
const response = await fetch('/api/v1/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How do I submit a draw request?',
    context: {
      userRole: 'borrower',
      loanId: 'loan-123'
    }
  })
});
```

### 5. Draw Request Analysis

**Location**: `src/lib/ai/utils.ts` - `analyzeDrawRequest()`

**Features**:
- Amount reasonableness assessment
- Work description quality evaluation
- Contractor reliability indicators
- Risk factor identification
- Approval recommendations

### 6. Inspection Report Analysis

**Location**: `src/lib/ai/utils.ts` - `analyzeInspectionReport()`

**Features**:
- Quality assessment
- Compliance checking
- Risk identification
- Follow-up recommendations

### 7. Borrower Communication

**Location**: `src/lib/ai/utils.ts` - `generateBorrowerCommunication()`

**Communication Types**:
- Payment reminders
- Draw approvals
- Inspection scheduling
- Default notices

**Usage**:
```typescript
import { generateBorrowerCommunication } from '@/lib/ai/utils';

const email = await generateBorrowerCommunication(
  'John Doe',
  'payment_reminder',
  { amount: 2500, dueDate: '2024-01-15' }
);
```

### 8. Market Analysis

**Location**: `src/lib/ai/utils.ts` - `analyzeMarketConditions()`

**Features**:
- Current market trends
- Interest rate environment
- Risk factors
- Opportunities
- Lender recommendations

## API Endpoints

### AI Forecast
```
POST /api/v1/ai/forecast
Content-Type: application/json

{
  "principal": 500000,
  "rate": 8.5,
  "termMonths": 24,
  "category": "asset_backed",
  "borrowerCreditScore": 750,
  "loanToValue": 0.75
}
```

### AI Chat
```
POST /api/v1/ai/chat
Content-Type: application/json

{
  "message": "How do I submit a draw request?",
  "context": {
    "userRole": "borrower",
    "loanId": "loan-123"
  }
}
```

### Document Processing
```
POST /api/v1/ai/document-process
Content-Type: application/json

{
  "documentText": "Document content here...",
  "documentType": "loan_application"
}
```

## Error Handling

### Fallback Strategies

1. **AI Service Unavailable**: Fall back to heuristic-based calculations
2. **Rate Limiting**: Implement exponential backoff
3. **Invalid Responses**: Validate AI output against schemas
4. **Timeout**: Set appropriate timeouts for AI calls

### Error Response Format

```typescript
{
  success: false,
  error: "Error message",
  fallback?: {
    // Fallback data when AI fails
  }
}
```

## Performance Optimization

### Caching Strategy

1. **AI Responses**: Cache frequently requested analyses
2. **Document Processing**: Cache extracted data
3. **Market Analysis**: Cache for 1 hour
4. **Forecast Results**: Cache for 30 minutes

### Rate Limiting

1. **Client-Side**: Implement request throttling
2. **Server-Side**: Use Redis for rate limiting
3. **AI Providers**: Monitor usage and implement backoff

### Cost Optimization

1. **Model Selection**: Use appropriate models for tasks
2. **Prompt Optimization**: Minimize token usage
3. **Response Caching**: Cache similar requests
4. **Batch Processing**: Group similar operations

## Security Considerations

### API Key Management

1. **Environment Variables**: Never commit API keys
2. **Key Rotation**: Regular key rotation
3. **Access Control**: Limit API key permissions
4. **Monitoring**: Monitor API key usage

### Data Privacy

1. **PII Handling**: Avoid sending PII to AI providers
2. **Data Anonymization**: Anonymize sensitive data
3. **Retention Policies**: Implement data retention
4. **Compliance**: Ensure regulatory compliance

### Input Validation

1. **Schema Validation**: Validate all inputs
2. **Sanitization**: Sanitize user inputs
3. **Length Limits**: Implement input length limits
4. **Content Filtering**: Filter inappropriate content

## Testing

### Unit Tests

```typescript
import { aiEnhancedForecast } from '@/lib/ai/utils';

describe('AI Enhanced Forecast', () => {
  it('should return valid forecast data', async () => {
    const input = {
      principal: 500000,
      rate: 8.5,
      termMonths: 24,
      category: 'asset_backed' as const,
    };
    
    const result = await aiEnhancedForecast(input);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('roiPct');
    expect(result.data).toHaveProperty('riskLevel');
  });
});
```

### Integration Tests

```typescript
describe('AI API Endpoints', () => {
  it('should process forecast request', async () => {
    const response = await fetch('/api/v1/ai/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal: 500000,
        rate: 8.5,
        termMonths: 24,
        category: 'asset_backed',
      }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Monitoring and Analytics

### Metrics to Track

1. **AI Response Times**: Monitor latency
2. **Success Rates**: Track AI call success
3. **Token Usage**: Monitor AI provider costs
4. **Error Rates**: Track failure patterns
5. **User Satisfaction**: Monitor user feedback

### Logging

```typescript
// Log AI requests and responses
console.log('AI Request:', {
  service: 'forecast',
  input: sanitizedInput,
  timestamp: new Date().toISOString(),
});

console.log('AI Response:', {
  service: 'forecast',
  success: result.success,
  tokensUsed: result.usage?.totalTokens,
  duration: Date.now() - startTime,
});
```

## Future Enhancements

### Planned Features

1. **Custom Models**: Train models on lending data
2. **Real-time Analysis**: Stream analysis results
3. **Multi-language Support**: Support multiple languages
4. **Voice Integration**: Voice-based interactions
5. **Predictive Analytics**: Advanced forecasting models

### Integration Opportunities

1. **External APIs**: Integrate with credit bureaus
2. **Market Data**: Real-time market data feeds
3. **Regulatory Updates**: Automated compliance checking
4. **Third-party Tools**: Integration with existing tools
