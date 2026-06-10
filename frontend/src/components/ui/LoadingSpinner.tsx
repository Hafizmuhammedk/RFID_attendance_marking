import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'white' | 'slate';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
};

const colorClasses = {
  brand: 'border-brand-200 border-t-brand-600',
  white: 'border-white/30 border-t-white',
  slate: 'border-slate-200 border-t-slate-600',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'brand',
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      style={{ borderStyle: 'solid' }}
    />
  );
};
