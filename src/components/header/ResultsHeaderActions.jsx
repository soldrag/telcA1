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
        className="text-xs sm:text-sm font-semibold"
      >
        <Home className="w-4 h-4 mr-1.5" />
        <span>{t('header.menu')}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onResetExam}
        className="text-xs sm:text-sm font-semibold text-telc-700 border-telc-200 bg-telc-50/50 hover:bg-telc-100/70"
      >
        <RotateCcw className="w-4 h-4 mr-1.5" />
        <span>{t('header.retake')}</span>
      </Button>
    </>
  );
}
