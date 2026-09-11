import React from 'react';
import { cn } from '../../lib/utils.js';

export function Progress({ value = 0, max = 100, className = '', indicatorClassName = '', ...props }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-surface-inset border border-border-subtle/50', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 bg-action-primary transition-all duration-300', indicatorClassName)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
