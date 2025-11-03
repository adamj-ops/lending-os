import React from 'react';

interface FilterPillProps {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function FilterPill({ 
  active = false, 
  onClick, 
  className = '',
  children 
}: FilterPillProps) {
  const baseClasses = `
    inline-flex items-center gap-1.5 px-3 py-1.5
    text-xs font-medium uppercase tracking-wider
    rounded-md transition-all duration-200 ease-in-out
    whitespace-nowrap cursor-pointer
  `;
  
  const inactiveClasses = `
    border border-brand-primary-500 
    text-brand-primary-500 
    bg-brand-primary-50
    hover:bg-brand-primary-100 
    hover:shadow hover:shadow-brand-primary-500/30
  `;
  
  const activeClasses = `
    bg-brand-primary-500 
    text-slate-900 
    font-semibold
    border-brand-primary-600
  `;

  return (
    <button
      type="button"
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

