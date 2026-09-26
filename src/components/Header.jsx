import React from 'react';
import { BookOpen } from 'lucide-react';
import ExamHeaderActions from './header/ExamHeaderActions.jsx';
import ResultsHeaderActions from './header/ResultsHeaderActions.jsx';
import DefaultHeaderActions from './header/DefaultHeaderActions.jsx';
import ThemeToggle from './header/ThemeToggle.jsx';
import LanguageSelector from './header/LanguageSelector.jsx';
import NetworkStatusBadge from './header/NetworkStatusBadge.jsx';
import TestTypeSelector from './welcome/TestTypeSelector.jsx';
import { PAGE_CONTAINER } from './layout/pageLayout.js';
import { formatExamName } from '../utils/examFormat.js';
import { useI18n } from '../i18n/I18nContext.jsx';

const HEADER_CLASS = 'app-header border-b border-border-default sticky top-0 z-50 shadow-xs transition-colors';

function HeaderLogo({ onNavigateHome }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onNavigateHome}
      aria-label={t('header.menu')}
      className="flex items-center gap-2.5 min-h-[2.75rem] min-w-0 shrink-0 rounded-xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
    >
      <span className="w-9 h-9 rounded-xl bg-action-primary group-hover:bg-action-primary-hover flex items-center justify-center text-white shrink-0 transition-colors">
        <BookOpen className="w-4 h-4" aria-hidden="true" />
      </span>
      <span className="text-base font-bold text-content-primary whitespace-nowrap">telc A1</span>
      <NetworkStatusBadge />
    </button>
  );
}

function ExamHeader({ navigation, stats, exam }) {
  return (
    <header className={`${HEADER_CLASS} relative`}>
      <ExamHeaderActions
        onNavigateHome={navigation.onNavigateHome}
        onSubmitExam={navigation.onSubmitExam}
        isInspection={navigation.isInspection}
        onExitInspection={navigation.onExitInspection}
        examLabel={[exam.moduleTitle, exam.examId && formatExamName(exam.examId)].filter(Boolean).join(' · ')}
        progress={{ answered: stats.answeredCount || 0, total: stats.totalQuestions || 0 }}
      />
    </header>
  );
}

/**
 * Phone: logo + role. From 640 px: + history, language, theme. From 1024 px: module tabs on the home screen.
 */
export default function Header({ navigation = {}, stats = {}, modules = {}, exam = {}, themeControl = {} }) {
  const { screen, onNavigateHome, onOpenHistory, onResetExam } = navigation;
  if (screen === 'exam') return <ExamHeader navigation={navigation} stats={stats} exam={exam} />;

  return (
    <header className={HEADER_CLASS}>
      <div className={`${PAGE_CONTAINER} h-14 sm:h-16 flex items-center gap-3 lg:gap-6`}>
        <HeaderLogo onNavigateHome={onNavigateHome} />
        {screen === 'welcome' && (
          <div className="hidden lg:block min-w-0">
            <TestTypeSelector variant="tabs" testTypes={modules.testTypes} activeTypeId={modules.activeTestType} onSelectType={modules.onSelectTestType} />
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {screen === 'results'
            ? <ResultsHeaderActions onNavigateHome={onNavigateHome} onResetExam={onResetExam} />
            : <DefaultHeaderActions screen={screen} onNavigateHome={onNavigateHome} onOpenHistory={onOpenHistory} themeControl={themeControl} />}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 ml-1 border-l border-border-subtle">
            <LanguageSelector />
            <ThemeToggle theme={themeControl.theme} toggleTheme={themeControl.toggleTheme} isDark={themeControl.isDark} />
          </div>
        </div>
      </div>
    </header>
  );
}
