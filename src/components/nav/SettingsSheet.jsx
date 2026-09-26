import React, { lazy, Suspense } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useWelcomeRole } from '../../hooks/useWelcomeRole.js';

const TeacherKeySection = lazy(() => import('./TeacherKeySection.jsx'));

const THEME_OPTIONS = [
  { id: 'light', icon: Sun, labelKey: 'header.themeLight' },
  { id: 'dark', icon: Moon, labelKey: 'header.themeDark' },
  { id: 'system', icon: Laptop, labelKey: 'header.themeSystem' },
];
const OPTION = 'min-h-[3rem] px-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

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
 * Settings: language and theme (in the header from 640 px), plus the teacher key for teachers.
 * A bottom sheet on phones, a centred window from 640 px.
 */
export default function SettingsSheet({ isOpen, onClose, themeControl = {} }) {
  const { t, language, setLanguage, supportedLanguages = ['en', 'ru'] } = useI18n();
  const { activeRole } = useWelcomeRole();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('settings.title')} maxWidth="max-w-[30rem]">
      <div className="space-y-6">
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
        {activeRole === 'teacher' && <Suspense fallback={null}><TeacherKeySection /></Suspense>}
      </div>
    </Dialog>
  );
}
