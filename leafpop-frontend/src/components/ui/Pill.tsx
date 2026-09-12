import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'green' | 'dark' | 'outline' | 'amber' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  children,
  variant = 'green',
  size = 'md',
  icon,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    green: 'bg-primary-50 text-primary-800 border border-primary-200/60',
    dark: 'bg-forest text-white shadow-sm',
    outline: 'bg-white text-forest-muted border border-border',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    neutral: 'bg-surface-muted text-forest-text',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-xs px-3.5 py-1.5 gap-1.5 font-semibold',
    lg: 'text-sm px-4 py-2 gap-2 font-semibold',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
