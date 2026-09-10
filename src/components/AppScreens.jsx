import React from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import ExamView from './ExamView.jsx';
import ResultsView from './ResultsView.jsx';
import HistoryView from './HistoryView.jsx';

export default function AppScreens({
  screen,
  welcomeProps,
  historyProps,
  resultsProps,
  examProps,
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
  if (screen === 'exam' && examProps?.examData) {
    return <ExamView {...examProps} />;
  }
  return null;
}
