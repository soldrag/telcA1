import React from 'react';
import { cn } from '../../utils/cn.js';

const badgeVariants = {
  default: 'bg-action-primary-subtle text-action-primary border-action-primary-border',
  primary: 'bg-action-primary text-white border-transparent',
  secondary: 'bg-surface-inset text-content-secondary border-border-default',
  success: 'bg-state-success-subtle text-state-success-text border-state-success-border',
  warning: 'bg-state-warning-subtle text-state-warning-text border-state-warning-border',
  destructive: 'bg-state-error-subtle text-state-error-text border-state-error-border',
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
