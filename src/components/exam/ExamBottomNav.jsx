import React from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import ExamPrimaryAction, { NAV_FOCUS_RING } from './ExamPrimaryAction.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useTextEntryFocus } from '../../hooks/useTextEntryFocus.js';

/**
 * Phone and tablet bottom bar: ← · answer sheet · Next/Finish. Hidden from 1024 px (the page ends with
 * its own buttons) and while typing, so the field's tools sit right above the keyboard.
 */
export default function ExamBottomNav({ pagination = {}, actions = {}, sheet = {}, isInspection = false }) {
  const { t } = useI18n();
  const isTyping = useTextEntryFocus();
  const { activeTeil, maxTeile } = pagination;

  return (
    <nav
      aria-label={t('exam.navAriaLabel')}
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-default pb-[env(safe-area-inset-bottom,0px)] ${isTyping ? 'hidden' : ''}`}
    >
      <div className="mx-auto w-full sm:max-w-[720px] px-4 sm:px-6 py-2 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={activeTeil === 1}
          onClick={actions.onPreviousTeil}
          aria-label={t('exam.navPrevious')}
          title={t('exam.navPrevious')}
          className={`min-w-[52px] min-h-[52px] px-3 rounded-xl border border-border-default text-content-primary hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${NAV_FOCUS_RING}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">{t('exam.navPrevious')}</span>
        </button>

        <button
          type="button"
          onClick={sheet.onOpen}
          className={`flex-1 min-h-[52px] rounded-xl text-content-primary hover:bg-surface-raised flex items-center justify-center gap-2 font-semibold cursor-pointer ${NAV_FOCUS_RING}`}
        >
          <ClipboardList className="w-5 h-5 text-content-secondary" />
          <span className="tabular-nums">{t('exam.sheetButton', { answered: sheet.answered, total: sheet.total })}</span>
        </button>

        <ExamPrimaryAction activeTeil={activeTeil} maxTeile={maxTeile} isInspection={isInspection} {...actions} />
      </div>
    </nav>
  );
}
