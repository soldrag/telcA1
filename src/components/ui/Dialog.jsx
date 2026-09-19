import React, { useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export function Dialog({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) {
  const { t } = useI18n();
  useEffect(() => {
    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      lockBodyScroll();
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-h-[calc(100dvh-2rem)] flex flex-col bg-surface-card rounded-3xl border border-border-default shadow-2xl overflow-hidden z-10 transition-all p-6 sm:p-7 overscroll-contain',
          maxWidth
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
          <div>
            {title && (
              <h2 className="text-lg sm:text-xl font-extrabold text-content-primary leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-content-tertiary mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary shrink-0"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
