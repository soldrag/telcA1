import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ExamPrimaryAction, { NAV_FOCUS_RING } from './ExamPrimaryAction.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

function Kbd({ children }) {
  return <kbd className="ml-1 px-1.5 rounded border border-current text-xs font-sans opacity-60">{children}</kbd>;
}

/**
 * Desktop end-of-page navigation (the bottom bar is phone/tablet only), with the keyboard hints.
 */
export default function ExamPageNav({ pagination = {}, actions = {}, isInspection = false, showHotkeysHint = false }) {
  const { t } = useI18n();
  const { activeTeil, maxTeile } = pagination;

  return (
    <nav aria-label={t('exam.navAriaLabel')} className="hidden lg:flex items-center justify-end gap-3 pt-2">
      <p className="mr-auto text-sm text-content-muted">{showHotkeysHint ? t('exam.hotkeysHint') : null}</p>
      {activeTeil > 1 && (
        <button
          type="button"
          onClick={actions.onPreviousTeil}
          className={`min-h-[3.25rem] px-5 rounded-xl border border-border-default text-content-primary hover:bg-surface-raised font-semibold flex items-center gap-2 cursor-pointer ${NAV_FOCUS_RING}`}
        >
          <ArrowLeft className="w-4 h-4" /> {t('exam.navPrevious')} <Kbd>←</Kbd>
        </button>
      )}
      <ExamPrimaryAction activeTeil={activeTeil} maxTeile={maxTeile} isInspection={isInspection} {...actions} hint={<Kbd>→</Kbd>} />
    </nav>
  );
}
