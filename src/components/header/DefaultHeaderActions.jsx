import React from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import RoleSelector from '../welcome/RoleSelector.jsx';
import HeaderSettingsButton from '../nav/HeaderSettingsButton.jsx';
import { useWelcomeRole } from '../../hooks/useWelcomeRole.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

// On phones History and Settings live in the bottom tab bar, so the header buttons start at 640 px.
// Settings shows up for teachers, whose key lives there.
export default function DefaultHeaderActions({ screen, onNavigateHome, onOpenHistory, themeControl }) {
  const { t } = useI18n();
  const { activeRole } = useWelcomeRole();

  if (screen === 'history') {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        title={t('header.menu')}
        aria-label={t('header.menu')}
        className="text-sm font-semibold min-w-[44px] px-2.5 sm:px-3"
      >
        <ArrowLeft className="w-4 h-4 sm:mr-1.5 shrink-0" />
        <span className="hidden sm:inline">{t('header.menu')}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenHistory}
        title={t('header.history')}
        aria-label={t('header.history')}
        className="hidden sm:inline-flex text-sm font-semibold border border-border-default min-w-[44px] px-2.5 sm:px-3 whitespace-nowrap"
      >
        <History className="w-4 h-4 sm:mr-1.5 shrink-0" />
        <span>{t('header.history')}</span>
      </Button>
      {screen === 'welcome' && activeRole === 'teacher' && <HeaderSettingsButton themeControl={themeControl} />}
      {screen === 'welcome' && <RoleSelector />}
    </>
  );
}
