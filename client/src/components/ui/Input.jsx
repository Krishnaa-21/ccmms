import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full text-sm rounded-lg border bg-surface-card text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 disabled:opacity-50 disabled:bg-surface-100',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',
              'py-2 h-10',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-surface-border',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const PasswordInput = React.forwardRef((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      ref={ref}
      type={show ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="focus:outline-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
});
PasswordInput.displayName = 'PasswordInput';

export const Textarea = React.forwardRef(
  ({ className, label, error, helperText, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full text-sm rounded-lg border bg-surface-card text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 disabled:opacity-50 disabled:bg-surface-100 resize-y',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-surface-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Input;
