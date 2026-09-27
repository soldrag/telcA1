import React, { useMemo, useState } from 'react';
import RandomExamCard, { ModuleHeading } from './RandomExamCard.jsx';
import VariantGrid from './VariantGrid.jsx';
import RecentAttemptsList from './RecentAttemptsList.jsx';
import ModuleStructureCards from './ModuleStructureCards.jsx';
import TeacherTasksSection from './student/TeacherTasksSection.jsx';
import ModuleProgressCard from './student/ModuleProgressCard.jsx';
import { summarizeVariantScores } from '../../utils/attemptStats.js';
import { summarizeModuleProgress } from '../../utils/moduleProgress.js';
import { getReceivedAssignments } from '../../services/storage/receivedAssignmentsStorage.js';
import { splitByModule } from '../../utils/moduleSplit.js';
import Band from '../layout/Band.jsx';
import { PAGE_STACK, SPAN } from '../layout/pageLayout.js';

function collectAssignedExamIds(assignments, testType) {
  return assignments
    .filter((assignment) => !assignment.submittedAt && assignment.testType === testType)
    .map((assignment) => assignment.examId);
}

/**
 * Student home on the 12-column page grid: the briefing (module heading and, from 1024 px, its parts
 * in one strip), two bands whose blocks share their top and bottom edges — exam | from the teacher,
 * progress | recent attempts — and the variants across the full width. Below 1024 px the bands
 * dissolve into one stream in `order`: start → teacher → progress → variants → attempts.
 * Teacher tasks follow the open module; the other modules' ones are one chip away.
 */
export default function StudentWelcomeView({
  examState = {},
  navigation = {},
  actions = {},
  currentModule = {},
  onOpenTask,
}) {
  const { exams = [], activeTestType = 'lesen', recentAttempts = [], attempts = [] } = examState;
  const { onStartRandomExam, onStartExam, onLoadAttempt, onSelectTestType } = actions;
  const [assignments] = useState(getReceivedAssignments);
  const scores = useMemo(() => summarizeVariantScores(attempts, activeTestType), [attempts, activeTestType]);
  const progress = useMemo(() => summarizeModuleProgress(attempts, activeTestType), [attempts, activeTestType]);
  const tasks = useMemo(() => splitByModule(assignments, activeTestType), [assignments, activeTestType]);
  const startVariant = (examId) => onStartExam?.({ timed: true, specificExamId: examId });

  return (
    <div className={`${PAGE_STACK} lg:pt-4`}>
      <div className="flex flex-col gap-5">
        <ModuleHeading moduleInfo={currentModule} />
        <ModuleStructureCards testType={activeTestType} variant="strip" className="max-lg:hidden" />
      </div>
      <Band>
        <RandomExamCard onStartRandomExam={onStartRandomExam} moduleInfo={currentModule} className={`order-1 lg:order-none ${SPAN.main}`} />
        <TeacherTasksSection
          assignments={tasks.current}
          elsewhere={tasks.elsewhere}
          testType={activeTestType}
          onSelectTestType={onSelectTestType}
          onOpenTask={onOpenTask}
          className={`order-2 lg:order-none ${SPAN.side}`}
        />
      </Band>
      <Band>
        <ModuleProgressCard progress={progress} testType={activeTestType} className={`order-3 lg:order-none ${SPAN.main}`} />
        <RecentAttemptsList recentAttempts={recentAttempts} onOpenHistory={navigation.onOpenHistory} onLoadAttempt={onLoadAttempt} className={`order-5 lg:order-none ${SPAN.side}`} />
      </Band>
      <VariantGrid
        exams={exams}
        scores={scores}
        assignedExamIds={collectAssignedExamIds(assignments, activeTestType)}
        passScore={currentModule.passScore}
        onStartVariant={startVariant}
        className="order-4 lg:order-none"
      />
    </div>
  );
}
