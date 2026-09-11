import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function LanguageSelector() {
  const { language, setLanguage, supportedLanguages, t } = useI18n();

  const list = supportedLanguages && supportedLanguages.length > 0 ? supportedLanguages : ['en', 'ru'];
  const currentIndex = list.indexOf(language);
  const nextIndex = (currentIndex + 1) % list.length;
  const nextLang = list[nextIndex];

  const handleToggle = () => {
    setLanguage(nextLang);
  };

  const currentCode = language.toUpperCase();
  const nextName = t(`languages.${nextLang}`);
  const label = `${t('header.changeLanguage')} -> ${nextName}`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={label}
      aria-label={label}
      className="flex items-center justify-center space-x-1.5 h-9 px-2.5 rounded-lg border border-border-default bg-surface-card text-content-primary hover:bg-surface-raised transition-colors shadow-xs cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
    >
      <Globe className="w-4 h-4 text-content-tertiary" />
      <span className="text-xs font-bold tracking-wider">{currentCode}</span>
    </button>
  );
}
