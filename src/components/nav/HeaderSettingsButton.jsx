import React, { lazy, Suspense, useState } from 'react';
import { Settings } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const SettingsSheet = lazy(() => import('./SettingsSheet.jsx'));

/**
 * «Settings» in the header from 640 px (phones reach it from the tab bar). Opens the same settings window.
 */
export default function HeaderSettingsButton({ themeControl }) {
  const { t } = useI18n();
  const [isOpen, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const open = () => { setHasOpened(true); setOpen(true); };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-2.5 lg:px-3 rounded-xl text-sm font-semibold text-content-primary hover:bg-surface-raised cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      >
        <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="max-lg:sr-only">{t('nav.settings')}</span>
      </button>
      {hasOpened && (
        <Suspense fallback={null}>
          <SettingsSheet isOpen={isOpen} onClose={() => setOpen(false)} themeControl={themeControl} />
        </Suspense>
      )}
    </>
  );
}
