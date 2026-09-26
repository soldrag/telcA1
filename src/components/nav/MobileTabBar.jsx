import React, { lazy, Suspense, useState } from 'react';
import { Home, History, Settings } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const SettingsSheet = lazy(() => import('./SettingsSheet.jsx'));
const TAB_SCREENS = new Set(['welcome', 'history']);

function TabButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`min-h-[56px] flex flex-col items-center justify-center gap-0.5 text-xs font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary ${
        isActive ? 'text-action-primary' : 'text-content-secondary'
      }`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * Phone-only bottom tabs: Home / History / Settings. From 640 px these live in the header.
 */
export default function MobileTabBar({ screen, onNavigateHome, onOpenHistory, themeControl }) {
  const { t } = useI18n();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  if (!TAB_SCREENS.has(screen)) return null;

  const openSettings = () => { setHasOpenedSettings(true); setSettingsOpen(true); };

  return (
    <>
      <div aria-hidden="true" className="sm:hidden h-[calc(56px+env(safe-area-inset-bottom,0px))]" />
      <nav
        aria-label={t('nav.tabBar')}
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-card border-t border-border-default pb-[env(safe-area-inset-bottom,0px)] grid grid-cols-3"
      >
        <TabButton icon={Home} label={t('nav.home')} isActive={screen === 'welcome' && !isSettingsOpen} onClick={onNavigateHome} />
        <TabButton icon={History} label={t('nav.history')} isActive={screen === 'history' && !isSettingsOpen} onClick={onOpenHistory} />
        <TabButton icon={Settings} label={t('nav.settings')} isActive={isSettingsOpen} onClick={openSettings} />
      </nav>
      {hasOpenedSettings && (
        <Suspense fallback={null}>
          <SettingsSheet isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} themeControl={themeControl} />
        </Suspense>
      )}
    </>
  );
}
