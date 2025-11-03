"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconRobot, IconCamera, IconMapPin, IconCircleCheck, IconAlertTriangle, IconBrain, IconLoader2, IconBulb, IconFileText } from "@tabler/icons-react";
import { Inspection } from "@/types/inspection";
import { InspectionPhoto } from "@/components/inspections/enhanced-photo-uploader";
import { cn } from "@/lib/utils";

interface InspectionChecklistItem {
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

interface InspectionRecommendation {
  category: 'safety' | 'quality' | 'compliance' | 'progress' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  checklistItems?: string[];
  photos?: string[];
}

interface InspectionInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface AIInspectionAssistantProps {
  inspection: Inspection;
  photos: InspectionPhoto[];
  checklist: InspectionChecklistItem[];
  onRecommendationApplied?: (recommendation: InspectionRecommendation) => void;
  className?: string;
}

export function AIInspectionAssistant({
  inspection,
  photos,
  checklist,
  onRecommendationApplied,
  className
}: AIInspectionAssistantProps) {
  const [recommendations, setRecommendations] = useState<InspectionRecommendation[]>([]);
  const [insights, setInsights] = useState<InspectionInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'chat'>('recommendations');

  const analyzeInspection = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch('/api/v1/ai/inspection-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspection,
          photos: photos.map(p => ({
            category: p.category,
            description: p.description,
            timestamp: p.timestamp
          })),
          checklist
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setInsights(data.insights || []);
      } else {
        throw new Error('Failed to analyze inspection');
      }
    } catch (error) {
      console.error('Error analyzing inspection:', error);
      setError('Failed to analyze inspection data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (inspection && photos.length > 0) {
      analyzeInspection();
    }
  }, [inspection.id, photos.length]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <IconAlertTriangle size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      case 'quality': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      case 'compliance': return <IconFileText size={20} stroke={2} className="h-4 w-4 text-blue-600" />;
      case 'progress': return <IconMapPin size={20} stroke={2} className="h-4 w-4 text-brand-accent" />;
      default: return <IconBulb size={16} stroke={2} className="h-4 w-4 text-brand-muted" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'quality': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <IconCircleCheck size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      case 'negative': return <IconAlertTriangle size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      case 'neutral': return <IconBrain size={16} stroke={2} className="h-4 w-4 text-brand-muted" />;
      default: return <IconBrain size={16} stroke={2} className="h-4 w-4 text-brand-muted" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
            AI Inspection Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <IconLoader2 size={20} stroke={2} className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-brand-muted">Analyzing inspection data...</p>
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
            AI Inspection Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <IconAlertTriangle size={20} stroke={2} className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={analyzeInspection} className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBrain size={20} stroke={2} className="h-5 w-5 text-blue-600" />
          AI Inspection Assistant
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'recommendations' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </Button>
          <Button
            variant={activeTab === 'insights' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <IconBulb size={32} stroke={2} className="h-8 w-8 text-brand-muted mx-auto mb-2" />
                <p className="text-brand-muted">No recommendations available</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rec.category)}
                      <h4 className="font-medium">{rec.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(rec.category)}>
                        {rec.category.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-brand-muted mb-3">{rec.description}</p>
                  
                  <div className="p-3 bg-blue-50 rounded-lg mb-3">
                    <h5 className="font-medium text-blue-800 mb-1">Recommended Action</h5>
                    <p className="text-sm text-blue-700">{rec.action}</p>
                  </div>

                  {rec.checklistItems && rec.checklistItems.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 mb-2">Checklist Items</h5>
                      <ul className="space-y-1">
                        {rec.checklistItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2 text-sm">
                            <IconCircleCheck size={20} stroke={2} className="h-3 w-3 text-brand-success" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    onClick={() => onRecommendationApplied?.(rec)}
                    className="w-full"
                  >
                    Apply Recommendation
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <IconBrain size={32} stroke={2} className="h-8 w-8 text-brand-muted mx-auto mb-2" />
                <p className="text-brand-muted">No insights available</p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(insight.impact)}
                      <h4 className="font-medium">{insight.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-brand-muted">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-brand-muted">{insight.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <AIChatAssistant 
            inspection={inspection}
            photos={photos}
            checklist={checklist}
          />
        )}
      </CardContent>
    </Card>
  );
}

// AI Chat Assistant for Inspection Questions
interface AIChatAssistantProps {
  inspection: Inspection;
  photos: InspectionPhoto[];
  checklist: InspectionChecklistItem[];
}

function AIChatAssistant({ inspection, photos, checklist }: AIChatAssistantProps) {
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
            type: 'inspection_assistant',
            inspection,
            photos: photos.slice(0, 5), // Send recent photos for context
            checklist: checklist.slice(0, 10) // Send recent checklist items
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
    <div className="space-y-4">
      {/* Messages */}
      <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-brand-muted py-8">
            <IconRobot size={32} stroke={2} className="h-8 w-8 mx-auto mb-2" />
            <p>Ask me anything about this inspection!</p>
            <p className="text-xs mt-1">I can help with safety concerns, quality issues, compliance questions, and more.</p>
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
                    ? 'bg-blue-600 text-white'
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
          placeholder="Ask about safety, quality, compliance..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </div>

      {/* Quick Questions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("What safety concerns should I look for?")}
        >
          Safety Check
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Are there any quality issues?")}
        >
          Quality Review
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("What compliance items need attention?")}
        >
          Compliance Check
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("How is the project progress?")}
        >
          Progress Update
        </Button>
      </div>
    </div>
  );
}
