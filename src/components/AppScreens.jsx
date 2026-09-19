import React from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import ExamView from './ExamView.jsx';
import ResultsView from './ResultsView.jsx';
import HistoryView from './HistoryView.jsx';
import AssignmentLandingScreen from './assignment/AssignmentLandingScreen.jsx';

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
    return <AssignmentLandingScreen {...assignmentProps} />;
  }
  if (screen === 'welcome') {
    return <WelcomeScreen {...welcomeProps} />;
  }
  if (screen === 'history') {
    return <HistoryView {...historyProps} />;
  }
  if (screen === 'results') {
    if (resultsProps?.results) {
      return <ResultsView {...resultsProps} />;
    }
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action-primary" />
      </div>
    );
  }
  if (screen === 'exam' && (examProps?.examConfig || examProps?.examData)) {
    return <ExamView {...examProps} />;
  }
  return null;
}
