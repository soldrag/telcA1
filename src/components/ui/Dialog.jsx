import React, { useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { DIALOG_TITLE } from '../layout/typography.js';
import { useModalDialog } from '../../hooks/useModalDialog.js';

// Phones get a bottom sheet (thumb reach, safe area); from 640 px a centred window.
const DIALOG_CLASS = 'w-full mx-auto mt-auto mb-0 sm:m-auto sm:w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] p-0 bg-surface-card text-content-primary rounded-t-3xl sm:rounded-3xl border border-border-default shadow-2xl overscroll-contain backdrop:bg-black/60 backdrop:backdrop-blur-sm';

function CloseButton({ onClose, label }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="min-h-[2.75rem] min-w-[2.75rem] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary shrink-0"
      aria-label={label}
    >
      <X className="w-5 h-5" />
    </button>
  );
}

/**
 * Modal window on the native <dialog>: focus trap, Esc, inert page and focus return come from the browser.
 */
export function Dialog({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md', labelledBy }) {
  const { t } = useI18n();
  const titleId = useId();
  const { dialogRef, handleBackdropClick, handleCancel } = useModalDialog(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : labelledBy}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={cn(DIALOG_CLASS, maxWidth)}
    >
      <div className="flex flex-col max-h-[calc(100dvh-2rem)] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
          <div>
            {title && <h2 id={titleId} className={`${DIALOG_TITLE} leading-tight`}>{title}</h2>}
            {description && <p className="text-sm text-content-secondary mt-1 leading-relaxed">{description}</p>}
          </div>
          {onClose && <CloseButton onClose={onClose} label={t('common.close')} />}
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </dialog>
  );
}
