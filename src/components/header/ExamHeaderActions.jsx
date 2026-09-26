import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { EXAM_HEADER_SLOT_ID } from '../exam/examHeaderSlot.js';

export default function ExamHeaderActions({
  onNavigateHome,
  onSubmitExam,
  isInspection = false,
  onExitInspection,
  children,
}) {
  const { t } = useI18n();
  const exitLabel = isInspection ? t('header.exitInspection') : t('header.exitExam');
  const handleExit = isInspection ? (onExitInspection || onNavigateHome) : onNavigateHome;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">
      <Button variant="ghost" size="sm" onClick={handleExit} title={exitLabel} aria-label={exitLabel} className="min-w-[44px] px-2.5 shrink-0">
        <X className="w-5 h-5 lg:mr-1.5 shrink-0" />
        <span className="hidden lg:inline">{exitLabel}</span>
      </Button>

      <div id={EXAM_HEADER_SLOT_ID} className="flex-1 min-w-0 flex items-center gap-2 sm:gap-4" />

      {!isInspection && (
        <Button size="sm" onClick={onSubmitExam} title={t('header.finish')} aria-label={t('header.finish')} className="hidden sm:inline-flex shrink-0">
          <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
          <span>{t('header.finish')}</span>
        </Button>
      )}

      <div className="hidden lg:flex items-center gap-1.5 shrink-0">{children}</div>
    </div>
  );
}
