import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn('bg-surface-card rounded-2xl border border-border-subtle shadow-xs transition-shadow', className)}
      {...props}
    >
      {children}
    </div>
  );
}
