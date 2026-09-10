import React from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import ExamView from './ExamView.jsx';
import ResultsView from './ResultsView.jsx';
import HistoryView from './HistoryView.jsx';

export default function AppScreens({
  screen,
  screenProps = {},
  welcomeProps = screenProps.welcome,
  historyProps = screenProps.history,
  resultsProps = screenProps.results,
  examProps = screenProps.exam,
}) {
  if (screen === 'welcome') {
    return <WelcomeScreen {...welcomeProps} />;
  }
  if (screen === 'history') {
    return <HistoryView {...historyProps} />;
  }
  if (screen === 'results' && resultsProps?.results) {
    return <ResultsView {...resultsProps} />;
  }
  if (screen === 'exam' && (examProps?.examConfig || examProps?.examData)) {
    return <ExamView {...examProps} />;
  }
  return null;
}
