"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconRobot, IconX, IconMinimize, IconMaximize, IconMessageCircle, IconLoader2, IconSend } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    type: string;
    data: any;
  };
}

interface FloatingAIChatProps {
  className?: string;
}

export function FloatingAIChat({ className }: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant for the Lending OS platform. I can help you with payments, draws, inspections, and general questions about your loans. How can I assist you today?',
        timestamp: new Date()
      }]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            type: 'general_assistant',
            timestamp: userMessage.timestamp
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        
        // Simulate typing delay
        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
        }, 1000);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I create a new payment?",
    "What's the status of my draws?",
    "Schedule an inspection",
    "Show me payment trends",
    "Help with draw approval"
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <IconMessageCircle size={20} stroke={2} className="h-6 w-6" />
        </Button>
        <Badge 
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs"
        >
          AI
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card className={cn(
        "w-80 shadow-xl transition-all duration-300",
        isMinimized ? "h-16" : "h-96"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconRobot size={16} stroke={2} className="h-4 w-4 text-blue-600" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <IconMaximize size={12} stroke={2} className="h-3 w-3" /> : <IconMinimize size={12} stroke={2} className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <IconX size={20} stroke={2} className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            <div className="flex flex-col h-80">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs p-2 rounded-lg text-xs",
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <IconLoader2 size={20} stroke={2} className="h-3 w-3 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="p-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(question)}
                        className="text-xs h-6 justify-start"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-2 py-1 text-xs border rounded"
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="h-6 px-2"
                  >
                    <IconSend size={12} stroke={2} className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Context-aware AI Chat for specific pages
interface ContextualAIChatProps {
  context: {
    type: 'payment' | 'draw' | 'inspection' | 'loan';
    data: any;
  };
  className?: string;
}

export function ContextualAIChat({ context, className }: ContextualAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getContextualPrompt = () => {
    switch (context.type) {
      case 'payment':
        return `I'm looking at payment data for loan ${context.data.loanId}. I can see ${context.data.payments?.length || 0} payments.`;
      case 'draw':
        return `I'm reviewing draw request ${context.data.id} for $${context.data.amountRequested?.toLocaleString()}.`;
      case 'inspection':
        return `I'm working on inspection ${context.data.id} at ${context.data.location?.address}.`;
      case 'loan':
        return `I'm viewing loan ${context.data.id} with status ${context.data.status}.`;
      default:
        return 'I need help with this data.';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      context
    };

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
          message: userMessage.content,
          context: {
            type: `${context.type}_assistant`,
            data: context.data
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("", className)}>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <IconRobot size={16} stroke={2} className="h-4 w-4" />
        Ask AI Assistant
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <IconRobot size={20} stroke={2} className="h-5 w-5 text-blue-600" />
                  Contextual AI Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <IconX size={20} stroke={2} className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{getContextualPrompt()}</p>
                </div>
                
                <div className="h-48 overflow-y-auto space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "p-2 rounded text-sm",
                        message.role === 'user'
                          ? 'bg-blue-100 text-blue-800 ml-4'
                          : 'bg-gray-100 text-gray-800 mr-4'
                      )}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about this data..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    size="sm"
                  >
                    <IconSend size={16} stroke={2} className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
