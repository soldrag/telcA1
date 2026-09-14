import React from 'react';
import { BookOpen, User } from 'lucide-react';
import { Badge } from './ui/Badge.jsx';
import ExamHeaderActions from './header/ExamHeaderActions.jsx';
import ResultsHeaderActions from './header/ResultsHeaderActions.jsx';
import DefaultHeaderActions from './header/DefaultHeaderActions.jsx';
import ThemeToggle from './header/ThemeToggle.jsx';
import LanguageSelector from './header/LanguageSelector.jsx';
import NetworkStatusBadge from './header/NetworkStatusBadge.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Header({
  navigation = {},
  stats = {},
  user = {},
  themeControl = {},
}) {
  const { t } = useI18n();
  const { screen, onNavigateHome, onOpenHistory, onResetExam, onSubmitExam } = navigation;
  const {
    answeredCount = 0,
    totalQuestions = 0,
    activeModuleTitle = '',
    activeModulePoints = 0,
  } = stats;
  const userShortId = user.userShortId;
  const { theme, toggleTheme, isDark } = themeControl;

  const handleKeyDown = (keyboardEvent) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      onNavigateHome?.();
    }
  };

  return (
    <header className="app-header border-b border-border-default sticky top-0 z-50 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        <div 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group select-none min-w-0 flex-1 sm:flex-initial min-h-[44px]" 
          onClick={onNavigateHome}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-action-primary flex items-center justify-center text-white shadow-md shadow-action-primary/20 group-hover:bg-action-primary-hover transition-colors shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <Badge variant="default" className="text-[10px] sm:text-[11px] py-0 px-1.5 sm:px-2 uppercase tracking-wide shrink-0">
                telc A1
              </Badge>
              <NetworkStatusBadge />
              <span className="text-xs font-semibold text-content-tertiary hidden sm:inline truncate">
                {activeModuleTitle} ({activeModulePoints} Punkte)
              </span>
            </div>
            <h1 className="text-xs sm:text-lg font-extrabold text-content-primary leading-tight truncate">
              {t('header.simulatorTitle')}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {screen === 'exam' && (
              <ExamHeaderActions
                onNavigateHome={onNavigateHome}
                onSubmitExam={onSubmitExam}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
              />
            )}

            {screen === 'results' && (
              <ResultsHeaderActions
                onNavigateHome={onNavigateHome}
                onResetExam={onResetExam}
              />
            )}

            {screen !== 'exam' && screen !== 'results' && (
              <DefaultHeaderActions
                screen={screen}
                onNavigateHome={onNavigateHome}
                onOpenHistory={onOpenHistory}
              />
            )}
          </div>

          <div className="hidden sm:block h-6 w-px bg-border-subtle shrink-0" aria-hidden="true" />

          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            <LanguageSelector />

            {themeControl && (
              <ThemeToggle
                theme={theme}
                toggleTheme={toggleTheme}
                isDark={isDark}
              />
            )}

            {userShortId && (
              <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-content-secondary bg-surface-inset border border-border-default rounded-lg">
                <User className="w-3.5 h-3.5 text-content-muted" />
                <span>{String(userShortId).toLowerCase() === 'local' ? t('header.localUser') : userShortId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
