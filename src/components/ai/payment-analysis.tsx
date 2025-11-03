"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { IconRobot, IconTrendingUp, IconTrendingDown, IconAlertTriangle, IconCircleCheck, IconBrain, IconLoader2, IconCurrencyDollar, IconClock } from "@tabler/icons-react";
import { Payment, PaymentSummary } from "@/types/payment";
import { cn } from "@/lib/utils";

interface PaymentAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  insights: string[];
  recommendations: string[];
  trends: {
    paymentFrequency: 'increasing' | 'decreasing' | 'stable';
    amountConsistency: 'consistent' | 'variable' | 'erratic';
    timingPattern: 'on-time' | 'early' | 'late' | 'irregular';
  };
  anomalies: {
    type: 'amount' | 'timing' | 'frequency' | 'method';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  forecast: {
    nextPaymentDate: string;
    expectedAmount: number;
    confidence: number;
  };
}

interface AIPaymentAnalysisProps {
  payments: Payment[];
  paymentSummary: PaymentSummary | null;
  loanId: string;
  onAnalysisComplete?: (analysis: PaymentAnalysis) => void;
  className?: string;
}

export function AIPaymentAnalysis({
  payments,
  paymentSummary,
  loanId,
  onAnalysisComplete,
  className
}: AIPaymentAnalysisProps) {
  const [analysis, setAnalysis] = useState<PaymentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (payments.length === 0) {
      setError('No payment data available for analysis');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch('/api/v1/ai/payment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payments,
          paymentSummary,
          loanId
        })
      });

      if (response.ok) {
        const analysisData = await response.json();
        setAnalysis(analysisData);
        onAnalysisComplete?.(analysisData);
      } else {
        throw new Error('Failed to analyze payments');
      }
    } catch (error) {
      console.error('Error running payment analysis:', error);
      setError('Failed to analyze payment data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (payments.length > 0) {
      runAnalysis();
    }
  }, [payments.length]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-brand-success bg-green-100';
      case 'medium': return 'text-brand-accent bg-yellow-100';
      case 'high': return 'text-brand-danger bg-red-100';
      default: return 'text-brand-muted bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <IconAlertTriangle size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      case 'medium': return <IconAlertTriangle size={20} stroke={2} className="h-4 w-4 text-brand-accent" />;
      case 'low': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      default: return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-muted" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <IconTrendingUp size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      case 'decreasing': return <IconTrendingDown size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      default: return <IconTrendingUp size={20} stroke={2} className="h-4 w-4 text-brand-muted" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-brand-primary-600" />
            AI Payment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <IconLoader2 size={20} stroke={2} className="h-8 w-8 animate-spin text-brand-primary-600 mx-auto mb-4" />
              <p className="text-brand-muted">Analyzing payment patterns...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-brand-primary-600" />
            AI Payment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <IconAlertTriangle size={20} stroke={2} className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={runAnalysis} className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-brand-primary-600" />
            AI Payment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconRobot size={48} stroke={2} className="h-12 w-12 text-brand-muted mx-auto mb-4" />
            <p className="text-brand-muted mb-4">No analysis available</p>
            <Button onClick={runAnalysis}>
              Run Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-brand-primary-600" />
            AI Payment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Score */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Payment Risk Score</h3>
              <p className="text-sm text-brand-muted">Based on payment patterns and history</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{analysis.riskScore}/100</div>
              <Badge className={getRiskColor(analysis.riskLevel)}>
                {analysis.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
          </div>
          
          <Progress value={analysis.riskScore} className="h-2" />

          {/* Key Insights */}
          <div>
            <h4 className="font-medium mb-2">Key Insights</h4>
            <div className="space-y-2">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-brand-primary-50 rounded-lg dark:bg-brand-primary-950">
                  <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-primary-600 dark:text-brand-primary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-brand-primary-800 dark:text-brand-primary-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTrendIcon(analysis.trends.paymentFrequency)}
                <span className="font-medium">Frequency</span>
              </div>
              <p className="text-sm text-brand-muted capitalize">
                {analysis.trends.paymentFrequency}
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4 text-brand-primary-600" />
                <span className="font-medium">Amount</span>
              </div>
              <p className="text-sm text-brand-muted capitalize">
                {analysis.trends.amountConsistency}
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <IconClock size={20} stroke={2} className="h-4 w-4 text-brand-success" />
                <span className="font-medium">Timing</span>
              </div>
              <p className="text-sm text-brand-muted capitalize">
                {analysis.trends.timingPattern}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {analysis.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconAlertTriangle size={20} stroke={2} className="h-5 w-5 text-brand-accent" />
              Detected Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.anomalies.map((anomaly, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getSeverityIcon(anomaly.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {anomaly.type.toUpperCase()}
                      </Badge>
                      <Badge className={
                        anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                        anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{anomaly.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <IconRobot size={16} stroke={2} className="h-4 w-4 text-brand-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-brand-muted mb-1">Next Payment</h4>
              <p className="text-lg font-bold">
                {new Date(analysis.forecast.nextPaymentDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-brand-muted mb-1">Expected Amount</h4>
              <p className="text-lg font-bold">
                ${analysis.forecast.expectedAmount.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-brand-muted mb-1">Confidence</h4>
              <div className="flex items-center justify-center gap-2">
                <Progress value={analysis.forecast.confidence} className="flex-1 h-2" />
                <span className="text-sm font-medium">
                  {analysis.forecast.confidence}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AI Chat Assistant for Payment Questions
interface AIPaymentChatProps {
  loanId: string;
  payments: Payment[];
  className?: string;
}

export function AIPaymentChat({ loanId, payments, className }: AIPaymentChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {
            type: 'payment_analysis',
            loanId,
            payments: payments.slice(0, 10) // Send recent payments for context
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconRobot size={20} stroke={2} className="h-5 w-5 text-brand-primary-600" />
          Payment AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Messages */}
          <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-brand-muted py-8">
                <IconRobot size={32} stroke={2} className="h-8 w-8 mx-auto mb-2" />
                <p>Ask me anything about payment patterns, trends, or recommendations!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs p-3 rounded-lg text-sm",
                      message.role === 'user'
                        ? 'bg-brand-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <IconLoader2 size={20} stroke={2} className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about payment patterns..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
