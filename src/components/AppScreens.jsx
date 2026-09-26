import React, { lazy, Suspense } from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';

const ExamView = lazy(() => import('./ExamView.jsx'));
const ResultsView = lazy(() => import('./ResultsView.jsx'));
const HistoryView = lazy(() => import('./HistoryView.jsx'));
const AssignmentLandingScreen = lazy(() => import('./assignment/AssignmentLandingScreen.jsx'));

function ScreenLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action-primary" />
    </div>
  );
}

export default function AppScreens({
  screen,
  screenProps = {},
  welcomeProps = screenProps.welcome,
  historyProps = screenProps.history,
  resultsProps = screenProps.results,
  examProps = screenProps.exam,
  assignmentProps = screenProps.assignment,
}) {
  if (assignmentProps?.isAssignmentMode && screen === 'welcome') {
    return (
      <Suspense fallback={<ScreenLoadingFallback />}>
        <AssignmentLandingScreen {...assignmentProps} />
      </Suspense>
    );
  }
  if (screen === 'welcome') {
    return <WelcomeScreen {...welcomeProps} />;
  }
  if (screen === 'history') {
    return (
      <Suspense fallback={<ScreenLoadingFallback />}>
        <HistoryView {...historyProps} />
      </Suspense>
    );
  }
  if (screen === 'results') {
    if (resultsProps?.results) {
      return (
        <Suspense fallback={<ScreenLoadingFallback />}>
          <ResultsView {...resultsProps} />
        </Suspense>
      );
    }
    return <ScreenLoadingFallback />;
  }
  if (screen === 'exam' && (examProps?.examConfig || examProps?.examData)) {
    return (
      <Suspense fallback={<ScreenLoadingFallback />}>
        <ExamView {...examProps} />
      </Suspense>
    );
  }
  return null;
}
