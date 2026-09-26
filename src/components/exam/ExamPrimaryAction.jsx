import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const NAV_FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';
const PRIMARY = `min-h-[52px] px-5 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer ${NAV_FOCUS_RING}`;

/**
 * "Next" until the last Teil, then "Finish" (or leave, when a teacher only inspects the variant).
 */
export default function ExamPrimaryAction({ activeTeil, maxTeile, isInspection, onNextTeil, onSubmit, onExit, hint = null }) {
  const { t } = useI18n();
  if (activeTeil < maxTeile) {
    return (
      <button type="button" onClick={onNextTeil} className={PRIMARY}>
        {t('exam.navNext')} <ArrowRight className="w-4 h-4" />{hint}
      </button>
    );
  }
  return (
    <button type="button" onClick={isInspection ? onExit : onSubmit} className={PRIMARY}>
      {isInspection ? t('exam.finishInspectionBtn') : t('exam.navFinish')}
    </button>
  );
}
