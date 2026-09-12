import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  displayValue?: string | number;
  variant?: 'green' | 'lime' | 'amber' | 'sky';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  displayValue,
  variant = 'green',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    green: 'bg-primary-500',
    lime: 'bg-lime-accent',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || displayValue !== undefined) && (
        <div className="flex justify-between items-center text-xs font-semibold text-forest mb-1.5">
          <span>{label}</span>
          <span className="font-mono text-forest-muted">
            {displayValue !== undefined ? displayValue : `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
      <div className="h-2.5 w-full bg-surface-muted rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${variants[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
