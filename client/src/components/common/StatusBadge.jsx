import React from 'react';
import { cn } from '../../utils/cn.js';

const STATUS_MAP = {
  Submitted: {
    bg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-500'
  },
  'Under Review': {
    bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500 animate-pulse'
  },
  Assigned: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500'
  },
  'In Progress': {
    bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-ping'
  },
  'Awaiting Parts': {
    bg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500'
  },
  Resolved: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500'
  },
  Closed: {
    bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700',
    dot: 'bg-zinc-400'
  },
  Rejected: {
    bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500'
  },
  Reopened: {
    bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500'
  }
};

export function StatusBadge({ status, className, showDot = true, size = 'md' }) {
  const current = STATUS_MAP[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
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
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', current.dot)} />
      )}
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;
