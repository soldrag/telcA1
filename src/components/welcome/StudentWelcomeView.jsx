import React, { useMemo, useState } from 'react';
import RandomExamCard from './RandomExamCard.jsx';
import VariantGrid from './VariantGrid.jsx';
import RecentAttemptsList from './RecentAttemptsList.jsx';
import EnterTaskCard from './student/EnterTaskCard.jsx';
import ReceivedAssignmentsList from './student/ReceivedAssignmentsList.jsx';
import { summarizeVariantScores } from '../../utils/attemptStats.js';
import { getReceivedAssignments } from '../../services/storage/receivedAssignmentsStorage.js';

// On phones both columns dissolve (display: contents) so `order` can interleave them into one stream.
const COLUMN = 'contents lg:flex lg:flex-col lg:gap-8';

function collectAssignedExamIds(assignments, testType) {
  return assignments
    .filter((assignment) => !assignment.submittedAt && assignment.testType === testType)
    .map((assignment) => assignment.examId);
}

export default function StudentWelcomeView({
  examState = {},
  navigation = {},
  actions = {},
  currentModule = {},
  onOpenTask,
}) {
  const { exams = [], activeTestType = 'lesen', recentAttempts = [], attempts = [] } = examState;
  const { onStartRandomExam, onStartExam, onLoadAttempt } = actions;
  const [assignments] = useState(getReceivedAssignments);
  const scores = useMemo(() => summarizeVariantScores(attempts, activeTestType), [attempts, activeTestType]);
  const startVariant = (examId) => onStartExam?.({ timed: true, specificExamId: examId });

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10 lg:items-start">
      <div className={COLUMN}>
        <div className="order-2 lg:order-none">
          <RandomExamCard onStartRandomExam={onStartRandomExam} moduleInfo={currentModule} />
        </div>
        <div className="order-3 lg:order-none">
          <VariantGrid
            exams={exams}
            scores={scores}
            assignedExamIds={collectAssignedExamIds(assignments, activeTestType)}
            passScore={currentModule.passScore}
            onStartVariant={startVariant}
          />
        </div>
      </div>
      <div className={COLUMN}>
        <div className="order-1 lg:order-none empty:hidden">
          <ReceivedAssignmentsList assignments={assignments} onOpenTask={onOpenTask} />
        </div>
        <div className="order-4 lg:order-none">
          <EnterTaskCard onOpenTask={onOpenTask} />
        </div>
        <div className="order-5 lg:order-none">
          <RecentAttemptsList recentAttempts={recentAttempts} onOpenHistory={navigation.onOpenHistory} onLoadAttempt={onLoadAttempt} />
        </div>
      </div>
    </div>
  );
}
