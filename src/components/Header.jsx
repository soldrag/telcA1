import React from 'react';
import { BookOpen, User } from 'lucide-react';
import { Badge } from './ui/Badge.jsx';
import ExamHeaderActions from './header/ExamHeaderActions.jsx';
import ResultsHeaderActions from './header/ResultsHeaderActions.jsx';
import DefaultHeaderActions from './header/DefaultHeaderActions.jsx';
import ThemeToggle from './header/ThemeToggle.jsx';

export default function Header({
  navigation = {},
  stats = {},
  user = {},
  themeControl = {},
}) {
  const { screen, onNavigateHome, onOpenHistory, onResetExam, onSubmitExam } = navigation;
  const {
    answeredCount = 0,
    totalQuestions = 15,
    activeModuleTitle = 'Lesen',
    activeModulePoints = 15,
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
    <header className="app-header border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-50 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div 
          className="flex items-center space-x-3 cursor-pointer group select-none flex-shrink-0" 
          onClick={onNavigateHome}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="w-10 h-10 rounded-xl bg-telc-700 flex items-center justify-center text-white shadow-md shadow-telc-700/20 group-hover:bg-telc-800 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <Badge variant="default" className="text-[11px] py-0 px-2 uppercase tracking-wide">
                telc A1 / Start Deutsch 1
              </Badge>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                {activeModuleTitle} ({activeModulePoints} Punkte)
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              Prüfungssimulator
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {themeControl && (
            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
              isDark={isDark}
            />
          )}

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

          {userShortId && (
            <div className="hidden lg:flex items-center space-x-1 px-3 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{userShortId}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

