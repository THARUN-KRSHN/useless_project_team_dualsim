import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-border/80 rounded-3xl p-6 md:p-8 shadow-soft ${
        hoverable
          ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-md hover:border-primary-300/60 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
