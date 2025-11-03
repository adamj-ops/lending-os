"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { IconRobot, IconAlertTriangle, IconCircleCheck, IconBrain, IconLoader2, IconCurrencyDollar, IconCalendar, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { Draw, Inspection } from "@/types/draw";
import { Payment } from "@/types/payment";
import { cn } from "@/lib/utils";

interface DrawRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  riskFactors: {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
  }[];
  approvalRecommendation: 'approve' | 'approve_with_conditions' | 'reject' | 'request_more_info';
  confidence: number;
  alternativeOptions: {
    option: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

interface AIDrawRiskAssessmentProps {
  draw: Draw;
  loanId: string;
  relatedInspections?: Inspection[];
  relatedPayments?: Payment[];
  onAssessmentComplete?: (assessment: DrawRiskAssessment) => void;
  className?: string;
}

export function AIDrawRiskAssessment({
  draw,
  loanId,
  relatedInspections = [],
  relatedPayments = [],
  onAssessmentComplete,
  className
}: AIDrawRiskAssessmentProps) {
  const [assessment, setAssessment] = useState<DrawRiskAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = async () => {
    try {
      setIsAssessing(true);
      setError(null);

      const response = await fetch('/api/v1/ai/draw-risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draw,
          loanId,
          relatedInspections,
          relatedPayments
        })
      });

      if (response.ok) {
        const assessmentData = await response.json();
        setAssessment(assessmentData);
        onAssessmentComplete?.(assessmentData);
      } else {
        throw new Error('Failed to assess draw risk');
      }
    } catch (error) {
      console.error('Error running draw risk assessment:', error);
      setError('Failed to assess draw risk');
    } finally {
      setIsAssessing(false);
    }
  };

  useEffect(() => {
    if (draw) {
      runAssessment();
    }
  }, [draw.id]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-brand-success bg-green-100';
      case 'medium': return 'text-brand-accent bg-yellow-100';
      case 'high': return 'text-brand-danger bg-red-100';
      default: return 'text-brand-muted bg-gray-100';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <IconAlertTriangle size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      case 'medium': return <IconAlertTriangle size={20} stroke={2} className="h-4 w-4 text-brand-accent" />;
      case 'low': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      default: return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-muted" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return <IconCircleCheck size={20} stroke={2} className="h-5 w-5 text-brand-success" />;
      case 'approve_with_conditions': return <IconAlertTriangle size={20} stroke={2} className="h-5 w-5 text-brand-accent" />;
      case 'reject': return <IconAlertTriangle size={20} stroke={2} className="h-5 w-5 text-brand-danger" />;
      case 'request_more_info': return <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />;
      default: return <IconBrain size={20} stroke={2} className="h-5 w-5 text-brand-muted" />;
    }
  };

  if (isAssessing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
            AI Draw Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <IconLoader2 size={20} stroke={2} className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-brand-muted">Assessing draw risk factors...</p>
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
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
            AI Draw Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <IconAlertTriangle size={20} stroke={2} className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={runAssessment} className="mt-4">
            Retry Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
            AI Draw Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconRobot size={48} stroke={2} className="h-12 w-12 text-brand-muted mx-auto mb-4" />
            <p className="text-brand-muted mb-4">No assessment available</p>
            <Button onClick={runAssessment}>
              Run Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
            AI Draw Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Score */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Overall Risk Assessment</h3>
              <p className="text-sm text-brand-muted">Based on draw amount, timing, and project progress</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{assessment.riskScore}/100</div>
              <Badge className={getRiskColor(assessment.overallRisk)}>
                {assessment.overallRisk.toUpperCase()} RISK
              </Badge>
            </div>
          </div>
          
          <Progress value={assessment.riskScore} className="h-2" />

          {/* Approval Recommendation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getApprovalIcon(assessment.approvalRecommendation)}
              <div>
                <h4 className="font-medium">AI Recommendation</h4>
                <p className="text-sm text-brand-muted capitalize">
                  {assessment.approvalRecommendation.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-brand-muted">Confidence</div>
              <div className="text-lg font-bold">{assessment.confidence}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconAlertTriangle size={20} stroke={2} className="h-5 w-5 text-brand-accent" />
            Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.riskFactors.map((factor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{factor.factor}</h4>
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <Badge className={getRiskColor(factor.impact)}>
                      {factor.impact.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-brand-muted mb-2">{factor.description}</p>
                <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Mitigation:</strong> {factor.mitigation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessment.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className={getPriorityColor(rec.priority)}>
                  {rec.priority.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium text-sm">{rec.action}</p>
                  <p className="text-xs text-brand-muted mt-1">{rec.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Options */}
      {assessment.alternativeOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessment.alternativeOptions.map((option, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{option.option}</h4>
                    <Badge className={getRiskColor(option.riskLevel)}>
                      {option.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-brand-muted">{option.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {/* Request more info */}}
            >
              <IconBrain size={16} stroke={2} className="h-4 w-4" />
              Request Info
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {/* Schedule inspection */}}
            >
              <IconCalendar size={20} stroke={2} className="h-4 w-4" />
              Schedule Inspection
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {/* Approve with conditions */}}
            >
              <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />
              Approve with Conditions
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {/* Reject draw */}}
            >
              <IconAlertTriangle size={20} stroke={2} className="h-4 w-4" />
              Reject Draw
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AI Draw Analysis Summary Component
interface AIDrawAnalysisSummaryProps {
  draws: Draw[];
  className?: string;
}

export function AIDrawAnalysisSummary({ draws, className }: AIDrawAnalysisSummaryProps) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/v1/ai/draw-analysis-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draws })
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error generating draw summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (draws.length > 0) {
      generateSummary();
    }
  }, [draws.length]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <IconLoader2 size={20} stroke={2} className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-brand-muted">Generating analysis summary...</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <IconRobot size={32} stroke={2} className="h-8 w-8 text-brand-muted mx-auto mb-2" />
          <p className="text-sm text-brand-muted">No summary available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
          Draw Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{summary.totalDraws}</div>
              <div className="text-sm text-brand-muted">Total Draws</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-success">{summary.approvedDraws}</div>
              <div className="text-sm text-brand-muted">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-danger">{summary.rejectedDraws}</div>
              <div className="text-sm text-brand-muted">Rejected</div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-1">Key Insights</h4>
            <p className="text-sm text-blue-700">{summary.insights}</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">Recommendations</h4>
            <p className="text-sm text-green-700">{summary.recommendations}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
