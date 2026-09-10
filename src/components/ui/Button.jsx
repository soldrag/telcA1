import React from 'react';
import { cn } from '../../lib/utils.js';

const buttonVariants = {
  variant: {
    default: 'bg-telc-600 text-white hover:bg-telc-700 shadow-sm shadow-telc-600/30',
    primary: 'bg-telc-700 text-white hover:bg-telc-800 shadow-sm',
    secondary: 'bg-surface-inset text-content-secondary hover:bg-slate-200 hover:text-content-primary',
    outline: 'border border-border-default bg-white text-content-secondary hover:bg-slate-50 hover:border-slate-400',
    ghost: 'hover:bg-slate-100 text-content-secondary hover:text-content-primary',
    destructive: 'bg-state-error text-white hover:bg-state-error-hover shadow-sm',
    success: 'bg-state-success text-white hover:bg-state-success-hover shadow-sm shadow-state-success/30',
  },
  size: {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-6 text-base font-bold',
    icon: 'h-9 w-9 p-0',
  }
};

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', size = 'default', disabled, children, ...props },
  ref
) {
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default;

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.98]',
        variantClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
