import React from 'react';
import { X } from 'lucide-react';
import AnswerSheetGrid from './AnswerSheetGrid.jsx';
import FontSizeControl from '../teil1/FontSizeControl.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useModalDialog } from '../../hooks/useModalDialog.js';

export default function AnswerSheetSheet({ isOpen, onClose, sheet, onSelectQuestion, onSubmit, isInspection }) {
  const { t } = useI18n();
  const { dialogRef, handleBackdropClick } = useModalDialog(isOpen, onClose);
  const unanswered = sheet.total - sheet.answered;
  const submitLabel = unanswered > 0 ? t('exam.sheetSubmitUnanswered', { count: unanswered }) : t('exam.navFinish');

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="answer-sheet-title"
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-[85dvh] overflow-y-auto p-0 rounded-t-2xl bg-surface-card text-content-primary backdrop:bg-black/40"
    >
      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 id="answer-sheet-title" className="text-lg font-semibold">
            Antwortbogen <span className="text-content-secondary font-normal">· {t('exam.sheetProgress', { answered: sheet.answered, total: sheet.total })}</span>
          </h2>
          <button type="button" onClick={onClose} aria-label={t('exam.sheetClose')} className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-surface-raised cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnswerSheetGrid {...sheet} onSelect={onSelectQuestion} />

        <p className="text-xs text-content-tertiary">{t('exam.sheetLegend')}</p>
        <FontSizeControl />

        {!isInspection && (
          <button type="button" onClick={onSubmit} className="w-full min-h-[52px] rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2">
            {submitLabel}
          </button>
        )}
      </div>
    </dialog>
  );
}
