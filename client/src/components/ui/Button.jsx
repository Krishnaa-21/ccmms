import React from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-primary-900 hover:bg-primary-800 text-white shadow-sm dark:bg-primary-600 dark:hover:bg-primary-500',
      secondary:
        'bg-surface-100 hover:bg-surface-200 text-slate-700 dark:text-slate-200 border border-surface-border shadow-2xs',
      accent:
        'bg-accent-600 hover:bg-accent-500 text-white shadow-sm',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-surface-100 text-slate-700 dark:text-slate-200',
      ghost:
        'hover:bg-surface-100 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm'
    };

    const sizes = {
      sm: 'text-xs h-8 px-3 gap-1.5',
      md: 'text-sm h-10 px-4 gap-2',
      lg: 'text-base h-12 px-6 gap-2.5 font-semibold'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

