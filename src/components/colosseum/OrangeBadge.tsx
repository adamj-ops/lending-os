import React from 'react';

interface OrangeBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function OrangeBadge({ children, className = '' }: OrangeBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-xs font-bold uppercase tracking-wider
        bg-brand-accent-500 text-white
        border border-brand-accent-600
        rounded-md shadow-sm
        before:content-['◆'] before:text-xs before:opacity-90 before:-ml-0.5
        ${className}
      `}
    >
      {children}
    </span>
  );
}

