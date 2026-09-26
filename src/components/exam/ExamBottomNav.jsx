import React from 'react';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';
const PRIMARY = `min-h-[52px] px-5 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer ${FOCUS_RING}`;

function PrimaryAction({ activeTeil, maxTeile, isInspection, onNextTeil, onSubmit, onExit, t }) {
  if (activeTeil < maxTeile) {
    return (
      <button type="button" onClick={onNextTeil} className={PRIMARY}>
        {t('exam.navNext')} <ArrowRight className="w-4 h-4" />
      </button>
    );
  }
  const label = isInspection ? t('exam.finishInspectionBtn') : t('exam.navFinish');
  return (
    <button type="button" onClick={isInspection ? onExit : onSubmit} className={PRIMARY}>
      {label}
    </button>
  );
}

export default function ExamBottomNav({ pagination = {}, actions = {}, sheet = {}, isInspection = false }) {
  const { t } = useI18n();
  const { activeTeil, maxTeile } = pagination;

  return (
    <nav
      aria-label={t('exam.navAriaLabel')}
      className="fixed bottom-0 inset-x-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-default pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={activeTeil === 1}
          onClick={actions.onPreviousTeil}
          aria-label={t('exam.navPrevious')}
          title={t('exam.navPrevious')}
          className={`min-w-[52px] min-h-[52px] px-3 rounded-xl border border-border-default text-content-primary hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${FOCUS_RING}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">{t('exam.navPrevious')}</span>
        </button>

        <button
          type="button"
          onClick={sheet.onOpen}
          className={`lg:hidden flex-1 min-h-[52px] rounded-xl text-content-primary hover:bg-surface-raised flex items-center justify-center gap-2 font-semibold cursor-pointer ${FOCUS_RING}`}
        >
          <ClipboardList className="w-5 h-5 text-content-secondary" />
          <span className="tabular-nums">{t('exam.sheetButton', { answered: sheet.answered, total: sheet.total })}</span>
        </button>
        <span className="hidden lg:block flex-1 text-center text-sm text-content-secondary">
          {t('exam.partOfTotalParts', { current: activeTeil, total: maxTeile })}
        </span>

        <PrimaryAction activeTeil={activeTeil} maxTeile={maxTeile} isInspection={isInspection} {...actions} t={t} />
      </div>
    </nav>
  );
}
