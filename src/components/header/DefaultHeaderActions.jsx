import React from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function DefaultHeaderActions({ screen, onNavigateHome, onOpenHistory }) {
  const { t } = useI18n();

  if (screen === 'history') {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        className="text-xs sm:text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>{t('header.menu')}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpenHistory}
      title={t('header.history')}
      className="text-xs sm:text-sm font-bold border border-border-default"
    >
      <History className="w-4 h-4 mr-1.5 text-telc-600 dark:text-telc-400" />
      <span>{t('header.history')}</span>
    </Button>
  );
}
