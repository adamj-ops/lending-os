"use client";

import { IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = "Search for topics", value, onChange, className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "w-full pl-10 pr-4 py-2 rounded-md",
          "bg-brand-primary-950/20 border border-brand-primary-900/40",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-500/20",
          "transition-all"
        )}
      />
    </div>
  );
}

