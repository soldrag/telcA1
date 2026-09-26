import React from 'react';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

// From 1024 px the score card beside it already offers «Retake», so the header keeps only the way home.
export default function ResultsHeaderActions({ onNavigateHome, onResetExam }) {
  const { t } = useI18n();

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        title={t('header.menu')}
        aria-label={t('header.menu')}
        className="text-xs sm:text-sm font-semibold min-w-[2.75rem] px-2.5 sm:px-3"
      >
        <Home className="w-4 h-4 sm:mr-1.5 shrink-0" />
        <span className="hidden sm:inline">{t('header.menu')}</span>
      </Button>

      {onResetExam && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetExam}
          title={t('header.retake')}
          aria-label={t('header.retake')}
          className="lg:hidden text-xs sm:text-sm font-semibold min-w-[2.75rem] px-2.5 sm:px-3"
        >
          <RotateCcw className="w-4 h-4 sm:mr-1.5 shrink-0" />
          <span className="hidden sm:inline">{t('header.retake')}</span>
        </Button>
      )}
    </>
  );
}
