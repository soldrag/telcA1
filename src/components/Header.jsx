import React from 'react';
import { BookOpen, History, RotateCcw, CheckCircle2, ArrowLeft, Home, User } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';

export default function Header({
  screen,
  onNavigateHome,
  onOpenHistory,
  onResetExam,
  answeredCount,
  totalQuestions,
  onSubmitExam,
  userShortId,
  activeModuleTitle = 'Lesen',
  activeModulePoints = 15,
}) {
  return (
    <header
      className="app-header bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 shadow-xs"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo and title */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group select-none flex-shrink-0" 
          onClick={onNavigateHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateHome(); } }}
        >
          <div className="w-10 h-10 rounded-xl bg-telc-700 flex items-center justify-center text-white shadow-md shadow-telc-700/20 group-hover:bg-telc-800 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <Badge variant="default" className="text-[11px] py-0 px-2 uppercase tracking-wide">
                telc A1 / Start Deutsch 1
              </Badge>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {activeModuleTitle} ({activeModulePoints} Punkte)
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Prüfungssimulator
            </h1>
          </div>
        </div>

        {/* Navigation & actions based on screen */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {screen === 'exam' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onNavigateHome}
                title="Вернуться к выбору вариантов"
                className="text-xs sm:text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>В меню</span>
              </Button>

              <Badge variant="secondary" className="px-3 py-1.5 hidden md:inline-flex text-xs font-bold text-slate-700">
                Отвечено: {answeredCount} / {totalQuestions}
              </Badge>

              <Button
                variant={answeredCount === totalQuestions ? 'success' : 'default'}
                size="sm"
                onClick={onSubmitExam}
                className="text-xs sm:text-sm shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Завершить ({answeredCount}/{totalQuestions})</span>
              </Button>
            </>
          )}

          {screen === 'results' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onNavigateHome}
                className="text-xs sm:text-sm font-semibold"
              >
                <Home className="w-4 h-4 mr-1.5" />
                <span>В меню</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onResetExam}
                className="text-xs sm:text-sm font-semibold text-telc-700 border-telc-200 bg-telc-50/50 hover:bg-telc-100/70"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                <span>Пройти заново</span>
              </Button>
            </>
          )}

          {screen === 'history' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateHome}
              className="text-xs sm:text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Главное меню</span>
            </Button>
          )}

          {screen !== 'history' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenHistory}
              title="История ваших прохождений"
              className="text-xs sm:text-sm font-bold border border-slate-200/80"
            >
              <History className="w-4 h-4 mr-1.5 text-telc-700" />
              <span>История</span>
            </Button>
          )}

          {/* User badge */}
          {userShortId && (
            <div className="hidden lg:flex items-center space-x-1 px-3 py-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{userShortId}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
