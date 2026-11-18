import React from 'react';
import { AlertTriangle, Flame } from 'lucide-react';

export default function EscalationBadge({ level, escalatedAt, showDetails = true, className = '' }) {
  if (!level || level === 0 || level === '0') return null;

  const isL2 = level === 2 || level === '2' || level === 'L2';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
        isL2
          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 animate-pulse'
          : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
      } ${className}`}
      title={
        escalatedAt
          ? `Escalated ${isL2 ? 'Level 2' : 'Level 1'} on ${new Date(escalatedAt).toLocaleString()}`
          : `Escalated ${isL2 ? 'Level 2' : 'Level 1'}`
      }
    >
      {isL2 ? <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
      <span>{isL2 ? 'Escalated L2 (Critical)' : 'Escalated L1'}</span>
      {showDetails && escalatedAt && (
        <span className="text-[10px] opacity-75 font-normal ml-0.5">
          ({new Date(escalatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
        </span>
      )}
    </span>
  );
}
