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
        title={t('header.menu')}
        aria-label={t('header.menu')}
        className="text-xs sm:text-sm font-bold min-w-[44px] px-2.5 sm:px-3"
      >
        <ArrowLeft className="w-4 h-4 sm:mr-1.5 shrink-0" />
        <span className="hidden sm:inline">{t('header.menu')}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpenHistory}
      title={t('header.history')}
      aria-label={t('header.history')}
      className="text-xs sm:text-sm font-bold border border-border-default min-w-[44px] px-2.5 sm:px-3"
    >
      <History className="w-4 h-4 sm:mr-1.5 text-telc-600 dark:text-telc-400 shrink-0" />
      <span className="hidden sm:inline">{t('header.history')}</span>
    </Button>
  );
}
