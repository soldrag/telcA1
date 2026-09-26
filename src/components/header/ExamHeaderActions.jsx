import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { EXAM_HEADER_SLOT_ID } from '../exam/examHeaderSlot.js';
import { PAGE_CONTAINER } from '../layout/pageLayout.js';

function ProgressLine({ answered, total }) {
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div aria-hidden="true" className="lg:hidden absolute inset-x-0 bottom-0 h-0.5 bg-surface-inset">
      <div className="h-full bg-action-primary transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
}

/**
 * Exam chrome in one row: under 1024 px ✕ · position · timer (44 px) with a progress line;
 * from 1024 px ✕ Exit · exam name · answer strip or Teil tabs · timer · Submit (64 px).
 */
export default function ExamHeaderActions({
  onNavigateHome,
  onSubmitExam,
  isInspection = false,
  onExitInspection,
  examLabel = '',
  progress = { answered: 0, total: 0 },
}) {
  const { t } = useI18n();
  const exitLabel = isInspection ? t('header.exitInspection') : t('header.exitExam');
  const handleExit = isInspection ? (onExitInspection || onNavigateHome) : onNavigateHome;

  return (
    <>
      <div className={`${PAGE_CONTAINER} h-11 lg:h-16 flex items-center gap-2 lg:gap-4`}>
        <Button variant="ghost" size="sm" onClick={handleExit} title={exitLabel} aria-label={exitLabel} className="min-w-[2.75rem] min-h-[2.75rem] px-2 -ml-2 shrink-0">
          <X className="w-5 h-5 2xl:mr-1.5 shrink-0" />
          <span className="hidden 2xl:inline">{exitLabel}</span>
        </Button>

        {examLabel && (
          <span lang="de" className="hidden lg:block text-sm font-semibold text-content-primary whitespace-nowrap">{examLabel}</span>
        )}

        <div id={EXAM_HEADER_SLOT_ID} className="flex-1 min-w-0 flex items-center gap-2 lg:gap-4" />

        {!isInspection && (
          <Button size="sm" onClick={onSubmitExam} title={t('header.finish')} aria-label={t('header.finish')} className="hidden lg:inline-flex shrink-0 min-h-[2.75rem]">
            <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
            <span>{t('header.finish')}</span>
          </Button>
        )}
      </div>
      <ProgressLine answered={progress.answered} total={progress.total} />
    </>
  );
}
