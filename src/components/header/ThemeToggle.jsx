import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ThemeToggle({ theme, toggleTheme, isDark }) {
  const { t } = useI18n();

  const getIcon = () => {
    if (theme === 'system') {
      return <Laptop className="w-5 h-5 text-content-tertiary" />;
    }
    if (theme === 'dark' || isDark) {
      return <Moon className="w-5 h-5 text-amber-400" />;
    }
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  const getLabel = () => {
    if (theme === 'system') return t('header.themeSystem');
    if (theme === 'dark') return t('header.themeDark');
    return t('header.themeLight');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Тема: ${getLabel()} (нажмите для смены)`}
      aria-label={`Текущая тема: ${getLabel()}. Нажмите для смены темы.`}
      className="flex items-center justify-center min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl border border-border-default bg-surface-card text-content-primary hover:bg-surface-raised transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
    >
      {getIcon()}
    </button>
  );
}
