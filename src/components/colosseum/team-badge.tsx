"use client";

import { cn } from '@/lib/utils';

interface TeamBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function TeamBadge({ children, className }: TeamBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1",
        "text-xs font-bold uppercase tracking-wider",
        "bg-brand-accent-500 text-white",
        "border border-brand-accent-600",
        "rounded-md shadow-sm",
        "before:content-['◆'] before:text-xs before:opacity-90 before:-ml-0.5",
        className
      )}
    >
      {children}
    </span>
  );
}

