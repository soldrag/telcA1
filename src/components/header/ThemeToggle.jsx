import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme, isDark }) {
  const getIcon = () => {
    if (theme === 'system') {
      return <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
    if (theme === 'dark' || isDark) {
      return <Moon className="w-4 h-4 text-amber-400" />;
    }
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'Системная тема';
    if (theme === 'dark') return 'Тёмная тема';
    return 'Светлая тема';
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Тема: ${getLabel()} (нажмите для смены)`}
      aria-label={`Текущая тема: ${getLabel()}. Нажмите для смены темы.`}
      className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
    >
      {getIcon()}
    </button>
  );
}
