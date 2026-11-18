import React from 'react';
import { cn } from '../../utils/cn.js';
import { AlertCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const PRIORITY_MAP = {
  Urgent: {
    bg: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: AlertCircle
  },
  High: {
    bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    icon: AlertTriangle
  },
  Medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock
  },
  Low: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle
  }
};

export function PriorityBadge({ priority, className, showIcon = true, size = 'md' }) {
  const current = PRIORITY_MAP[priority] || PRIORITY_MAP.Medium;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1 gap-1.5 font-semibold'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors shadow-2xs select-none',
        current.bg,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />}
      <span>{priority}</span>
    </span>
  );
}

export function OverdueBadge({ escalationLevel = 0, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse',
        className
      )}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{escalationLevel >= 2 ? 'Critical Overdue (L2)' : escalationLevel === 1 ? 'Escalated (L1)' : 'Overdue'}</span>
    </span>
  );
}

export default PriorityBadge;
