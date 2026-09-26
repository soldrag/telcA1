import React from 'react';
import { X, Sun, Moon, Laptop } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useModalDialog } from '../../hooks/useModalDialog.js';

const THEME_OPTIONS = [
  { id: 'light', icon: Sun, labelKey: 'header.themeLight' },
  { id: 'dark', icon: Moon, labelKey: 'header.themeDark' },
  { id: 'system', icon: Laptop, labelKey: 'header.themeSystem' },
];
const OPTION = 'min-h-[48px] px-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

function optionClass(isActive) {
  return `${OPTION} ${isActive ? 'bg-action-primary border-action-primary text-white' : 'bg-surface-card border-border-default text-content-primary hover:bg-surface-raised'}`;
}

function OptionGroup({ label, children }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-content-secondary mb-2">{label}</legend>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </fieldset>
  );
}

/**
 * Phone settings (language, theme) — on larger screens these live in the header.
 */
export default function SettingsSheet({ isOpen, onClose, themeControl = {} }) {
  const { t, language, setLanguage, supportedLanguages = ['en', 'ru'] } = useI18n();
  const { dialogRef, handleBackdropClick } = useModalDialog(isOpen, onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-[85dvh] overflow-y-auto p-0 rounded-t-3xl bg-surface-card text-content-primary backdrop:bg-black/40"
    >
      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="settings-title" className="text-lg font-semibold">{t('settings.title')}</h2>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-surface-raised cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <OptionGroup label={t('settings.language')}>
          {supportedLanguages.map((code) => (
            <button key={code} type="button" aria-pressed={language === code} onClick={() => setLanguage(code)} className={optionClass(language === code)}>
              {t(`languages.${code}`)}
            </button>
          ))}
        </OptionGroup>
        <OptionGroup label={t('settings.theme')}>
          {THEME_OPTIONS.map(({ id, icon: Icon, labelKey }) => (
            <button key={id} type="button" aria-pressed={themeControl.theme === id} onClick={() => themeControl.setTheme?.(id)} className={optionClass(themeControl.theme === id)}>
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {t(labelKey)}
            </button>
          ))}
        </OptionGroup>
      </div>
    </dialog>
  );
}
