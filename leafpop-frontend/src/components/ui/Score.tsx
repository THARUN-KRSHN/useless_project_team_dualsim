'use client';

import React, { useEffect, useState } from 'react';

interface ScoreProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'md' | 'lg' | 'hero';
  className?: string;
}

export const Score: React.FC<ScoreProps> = ({
  value,
  max = 100,
  label = 'Score',
  size = 'lg',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const sizes = {
    md: 'text-3xl md:text-4xl',
    lg: 'text-5xl md:text-6xl',
    hero: 'text-6xl md:text-8xl',
  };

  return (
    <div className={`text-center ${className}`}>
      {label && (
        <span className="block text-xs md:text-sm font-semibold text-primary-700 uppercase tracking-wider mb-1">
          {label}
        </span>
      )}
      <div className={`font-black tracking-tight text-forest ${sizes[size]}`}>
        {displayValue}
        <span className="text-xl md:text-2xl font-bold text-primary-600/70 ml-1">
          /{max}
        </span>
      </div>
    </div>
  );
};
