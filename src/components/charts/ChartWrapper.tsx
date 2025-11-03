"use client";

import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartWrapperProps {
  children: React.ReactElement;
  className?: string;
  height?: number;
}

export function ChartWrapper({ children, className = '', height = 300 }: ChartWrapperProps) {
  return (
    <div className={cn('w-full', className)} style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

