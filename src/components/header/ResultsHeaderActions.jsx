import React from 'react';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

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
        className="text-xs sm:text-sm font-semibold min-h-[38px] px-2 sm:px-3"
      >
        <Home className="w-4 h-4 sm:mr-1.5" />
        <span className="hidden sm:inline">{t('header.menu')}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onResetExam}
        title={t('header.retake')}
        aria-label={t('header.retake')}
        className="text-xs sm:text-sm font-semibold text-telc-700 border-telc-200 bg-telc-50/50 hover:bg-telc-100/70 min-h-[38px] px-2 sm:px-3"
      >
        <RotateCcw className="w-4 h-4 sm:mr-1.5" />
        <span className="hidden sm:inline">{t('header.retake')}</span>
      </Button>
    </>
  );
}
