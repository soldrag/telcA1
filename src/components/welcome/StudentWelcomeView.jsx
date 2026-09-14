import React from 'react';
import TestTypeSelector from './TestTypeSelector.jsx';
import RandomExamCard from './RandomExamCard.jsx';
import RecentAttemptsList from './RecentAttemptsList.jsx';
import EnterTaskCard from './student/EnterTaskCard.jsx';

export default function StudentWelcomeView({
  examState = {},
  navigation = {},
  actions = {},
  currentModule = {},
  onOpenTask,
}) {
  const {
    testTypes = [],
    activeTestType = 'lesen',
    recentAttempts = [],
  } = examState;

  const {
    onSelectTestType,
    onStartRandomExam,
    onLoadAttempt,
    onShareAttempt,
  } = actions;

  const { onOpenHistory } = navigation;

  return (
    <div className="space-y-6">
      <TestTypeSelector
        testTypes={testTypes}
        activeTypeId={activeTestType}
        onSelectType={onSelectTestType}
      />

      <RandomExamCard
        onStartRandomExam={onStartRandomExam}
        attemptsCount={recentAttempts.length}
        moduleInfo={currentModule}
      />

      <EnterTaskCard onOpenTask={onOpenTask} />

      <RecentAttemptsList
        recentAttempts={recentAttempts}
        onOpenHistory={onOpenHistory}
        onLoadAttempt={onLoadAttempt}
        onShareAttempt={onShareAttempt}
      />
    </div>
  );
}
