import React from 'react';
import { cn } from '../../utils/cn.js';

const buttonVariants = {
  variant: {
    default: 'bg-action-primary text-white hover:bg-action-primary-hover shadow-sm shadow-action-primary/20',
    primary: 'bg-telc-700 text-white hover:bg-telc-800 shadow-sm',
    secondary: 'bg-surface-inset text-content-secondary hover:bg-surface-raised hover:text-content-primary border border-border-subtle',
    outline: 'border border-border-default bg-surface-card text-content-secondary hover:bg-surface-raised hover:border-border-strong hover:text-content-primary',
    ghost: 'hover:bg-surface-raised text-content-secondary hover:text-content-primary',
    destructive: 'bg-state-error text-white hover:bg-state-error-hover shadow-sm',
    success: 'bg-state-success text-white hover:bg-state-success-hover shadow-sm shadow-state-success/30',
  },
  size: {
    default: 'min-h-[44px] h-11 px-4 py-2.5 text-sm',
    sm: 'min-h-[44px] px-3 py-2 text-xs',
    lg: 'min-h-[48px] h-12 px-6 text-base font-bold',
    icon: 'min-h-[44px] min-w-[44px] h-11 w-11 p-0',
  }
};

export const Button = React.forwardRef(function Button(
  {
    className = '',
    variant = 'default',
    size = 'default',
    disabled = false,
    isLoading = false,
    children,
    ...props
  },
  ref
) {
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default;
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
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
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});
