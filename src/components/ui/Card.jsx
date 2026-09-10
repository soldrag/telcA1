import React from 'react';
import { cn } from '../../lib/utils.js';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn('bg-white rounded-2xl border border-slate-200/90 shadow-xs transition-shadow', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cn('text-lg font-extrabold text-slate-900 leading-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={cn('text-xs sm:text-sm text-slate-500 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={cn('p-5 pt-0 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}
