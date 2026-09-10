import React from 'react';
import { cn } from '../../lib/utils.js';

const badgeVariants = {
  default: 'bg-telc-50 dark:bg-telc-950/60 text-telc-700 dark:text-telc-300 border-telc-200 dark:border-telc-800',
  primary: 'bg-telc-600 text-white border-transparent',
  secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  success: 'bg-state-success-subtle dark:bg-emerald-950/60 text-state-success-text dark:text-emerald-300 border-state-success-border dark:border-emerald-800',
  warning: 'bg-state-warning-subtle dark:bg-amber-950/60 text-state-warning-text dark:text-amber-300 border-state-warning-border dark:border-amber-800',
  destructive: 'bg-state-error-subtle dark:bg-rose-950/60 text-state-error-text dark:text-rose-300 border-state-error-border dark:border-rose-800',
  outline: 'text-content-secondary border-border-default bg-transparent',
};

export function Badge({ className = '', variant = 'default', children, ...props }) {
  const variantClasses = badgeVariants[variant] || badgeVariants.default;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors',
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
