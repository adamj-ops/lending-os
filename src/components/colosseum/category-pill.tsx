"use client";

import { cn } from '@/lib/utils';

interface CategoryPillProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryPill({ children, active, onClick, className }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      data-selected={active}
      className={cn(
        // Base styles - exact match to Colosseum screenshot
        "w-fit whitespace-nowrap rounded border text-sm",
        "inline-flex items-center",
        "px-3 py-1.5",  // Matches px-sm
        "font-medium",
        "border-brand-primary-800 text-brand-primary-400",
        "ring-1 ring-transparent",
        "transition-colors duration-200 ease-in-out",
        // Hover state
        "hover:bg-brand-primary-800 hover:ring-brand-primary-800 hover:text-white",
        // Active state
        active && "bg-brand-primary-500 text-white ring-brand-primary-500 border-brand-primary-500",
        className
      )}
    >
      <span>{children}</span>
    </button>
  );
}

