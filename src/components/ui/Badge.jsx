import React from 'react';
import { cn } from '../../lib/utils.js';

const badgeVariants = {
  default: 'bg-telc-50 text-telc-700 border-telc-200',
  primary: 'bg-telc-600 text-white border-transparent',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-state-success-subtle text-state-success-text border-state-success-border',
  warning: 'bg-state-warning-subtle text-state-warning-text border-state-warning-border',
  destructive: 'bg-state-error-subtle text-state-error-text border-state-error-border',
  outline: 'text-content-secondary border-border-default bg-transparent',
};

export function Badge({ className = '', variant = 'default', children, ...props }) {
  const vClass = badgeVariants[variant] || badgeVariants.default;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors',
        vClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
