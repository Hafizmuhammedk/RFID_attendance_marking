import React from 'react';
import type { AttendanceStatus } from '@/types';

type BadgeVariant = 'success' | 'info' | 'danger' | 'warning' | 'neutral' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  info:    'bg-blue-100 text-blue-700 border border-blue-200',
  danger:  'bg-red-100 text-red-700 border border-red-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  purple:  'bg-purple-100 text-purple-700 border border-purple-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  info:    'bg-blue-500',
  danger:  'bg-red-500',
  warning: 'bg-amber-500',
  neutral: 'bg-slate-400',
  purple:  'bg-purple-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`} />}
      {children}
    </span>
  );
};

/** Maps an AttendanceStatus to the correct Badge variant */
export function getStatusBadgeVariant(status: AttendanceStatus): BadgeVariant {
  switch (status) {
    case 'check-in':  return 'success';
    case 'check-out': return 'info';
    case 'denied':    return 'danger';
    default:          return 'neutral';
  }
}
