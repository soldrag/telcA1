import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ExamHeaderActions({ onNavigateHome, onSubmitExam, answeredCount, totalQuestions }) {
  const { t } = useI18n();

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        title={t('header.menu')}
        aria-label={t('header.menu')}
        className="text-xs sm:text-sm font-semibold min-w-[44px] px-2.5 sm:px-3"
      >
        <ArrowLeft className="w-4 h-4 sm:mr-1.5 shrink-0" />
        <span className="hidden sm:inline">{t('header.menu')}</span>
      </Button>

      <Badge variant="secondary" className="px-3 py-1.5 hidden md:inline-flex text-xs font-bold text-content-secondary">
        {t('header.answeredProgress', { answered: answeredCount, total: totalQuestions })}
      </Badge>

      <Button
        variant="secondary"
        size="sm"
        onClick={onSubmitExam}
        title={t('header.finish')}
        aria-label={t('header.finish')}
        className="text-xs sm:text-sm font-bold border border-border-default hover:border-action-primary min-w-[44px] px-2.5 sm:px-3"
      >
        <CheckCircle2 className="w-4 h-4 sm:mr-1.5 text-content-tertiary shrink-0" />
        <span className="hidden sm:inline">{t('header.finish')} </span>
        <span className="tabular-nums">({answeredCount}/{totalQuestions})</span>
      </Button>
    </>
  );
}
