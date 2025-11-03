"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, className, actions }: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        {children}
      </CardContent>
    </Card>
  );
}

