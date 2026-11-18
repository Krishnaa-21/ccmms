import React from 'react';
import { cn } from '../../utils/cn.js';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-xl border border-surface-border shadow-card p-5 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  trend,
  trendDirection = 'neutral',
  subtitle,
  icon,
  iconBg = 'bg-primary-50 dark:bg-primary-950/60 text-primary-600',
  className
}) {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-xl border border-surface-border p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className={cn('p-2.5 rounded-lg shrink-0', iconBg)}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          {value}
        </div>

        {(trend || subtitle) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center font-semibold',
                  trendDirection === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : trendDirection === 'down'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500'
                )}
              >
                {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {trend}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
