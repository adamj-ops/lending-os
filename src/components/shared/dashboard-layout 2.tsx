"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown, IconMinus, IconCurrencyDollar, IconCalendar, IconAlertCircle, IconCircleCheck, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  description,
  className
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <IconTrendingUp size={20} stroke={2} className="h-4 w-4 text-brand-success" />;
      case 'decrease':
        return <IconTrendingDown size={20} stroke={2} className="h-4 w-4 text-brand-danger" />;
      case 'neutral':
        return <IconMinus size={16} stroke={2} className="h-4 w-4 text-brand-muted" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-brand-success';
      case 'decrease':
        return 'text-brand-danger';
      case 'neutral':
        return 'text-brand-muted';
      default:
        return '';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-brand-muted">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-brand-muted">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
            {getTrendIcon()}
            <span>
              {change.value > 0 ? '+' : ''}{change.value}%
            </span>
            {change.period && (
              <span className="text-brand-muted">vs {change.period}</span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-brand-muted mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export interface StatusMetricProps {
  title: string;
  total: number;
  breakdown: {
    label: string;
    value: number;
    color: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}

export function StatusMetric({
  title,
  total,
  breakdown,
  className
}: StatusMetricProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-brand-muted">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4">{total}</div>
        <div className="space-y-2">
          {breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.icon && (
                  <div className={cn("p-1 rounded", item.color)}>
                    {item.icon}
                  </div>
                )}
                <span className="text-sm text-brand-muted">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.value}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full", item.color)}
                    style={{ width: `${(item.value / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  title,
  subtitle,
  children,
  actions,
  className
}: DashboardLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">{title}</h1>
          {subtitle && (
            <p className="text-brand-muted mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

export interface QuickStatsProps {
  stats: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }[];
  className?: string;
}

export function QuickStats({ stats, className }: QuickStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-sm text-brand-muted">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Common metric configurations
export const METRIC_CONFIGS = {
  payment: {
    icon: <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />,
    color: "text-blue-600 bg-blue-100"
  },
  draw: {
    icon: <IconCalendar size={20} stroke={2} className="h-4 w-4" />,
    color: "text-brand-success bg-green-100"
  },
  inspection: {
    icon: <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />,
    color: "text-brand-accent bg-yellow-100"
  },
  deadline: {
    icon: <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />,
    color: "text-brand-danger bg-red-100"
  },
  pending: {
    icon: <IconClock size={20} stroke={2} className="h-4 w-4" />,
    color: "text-brand-muted bg-gray-100"
  }
};
