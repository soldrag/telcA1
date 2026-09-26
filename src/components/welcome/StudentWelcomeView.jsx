import React, { useMemo, useState } from 'react';
import RandomExamCard, { ModuleHeading } from './RandomExamCard.jsx';
import VariantGrid from './VariantGrid.jsx';
import RecentAttemptsList from './RecentAttemptsList.jsx';
import ModuleStructureCards from './ModuleStructureCards.jsx';
import TeacherTasksSection from './student/TeacherTasksSection.jsx';
import ModuleProgressCard from './student/ModuleProgressCard.jsx';
import { summarizeVariantScores } from '../../utils/attemptStats.js';
import { summarizeModuleProgress } from '../../utils/moduleProgress.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { getReceivedAssignments } from '../../services/storage/receivedAssignmentsStorage.js';

// On phones both columns dissolve (display: contents) so `order` can interleave them into one stream.
const COLUMN = 'contents lg:flex lg:flex-col lg:gap-10';

function collectAssignedExamIds(assignments, testType) {
  return assignments
    .filter((assignment) => !assignment.submittedAt && assignment.testType === testType)
    .map((assignment) => assignment.examId);
}

function StructureAside({ testType, t }) {
  return (
    <section aria-labelledby="module-structure-title" className="hidden lg:block space-y-2">
      <h2 id="module-structure-title" className="text-sm font-medium text-content-secondary">{t('welcome.randomCard.structureToggle')}</h2>
      <ModuleStructureCards testType={testType} variant="list" />
    </section>
  );
}

/**
 * Student home. Phones and tablets: one stream (start → teacher → progress → variants → attempts).
 * From 1024 px the module heading spans the page over two top-aligned columns:
 * start, progress and variants on the left; teacher tasks, attempts and the structure on the right.
 */
export default function StudentWelcomeView({
  examState = {},
  navigation = {},
  actions = {},
  currentModule = {},
  onOpenTask,
}) {
  const { t } = useI18n();
  const { exams = [], activeTestType = 'lesen', recentAttempts = [], attempts = [] } = examState;
  const { onStartRandomExam, onStartExam, onLoadAttempt } = actions;
  const [assignments] = useState(getReceivedAssignments);
  const scores = useMemo(() => summarizeVariantScores(attempts, activeTestType), [attempts, activeTestType]);
  const progress = useMemo(() => summarizeModuleProgress(attempts, activeTestType), [attempts, activeTestType]);
  const startVariant = (examId) => onStartExam?.({ timed: true, specificExamId: examId });

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-8 lg:items-start lg:pt-4">
      <div className="lg:col-span-2">
        <ModuleHeading moduleInfo={currentModule} />
      </div>
      <div className={COLUMN}>
        <div className="order-1 lg:order-none">
          <RandomExamCard onStartRandomExam={onStartRandomExam} moduleInfo={currentModule} />
        </div>
        <div className="order-3 lg:order-none empty:hidden">
          <ModuleProgressCard progress={progress} testType={activeTestType} />
        </div>
        <div className="order-4 lg:order-none">
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
        <div className="order-2 lg:order-none">
          <TeacherTasksSection assignments={assignments} onOpenTask={onOpenTask} />
        </div>
        <div className="order-5 lg:order-none">
          <RecentAttemptsList recentAttempts={recentAttempts} onOpenHistory={navigation.onOpenHistory} onLoadAttempt={onLoadAttempt} />
        </div>
        <StructureAside testType={activeTestType} t={t} />
      </div>
    </div>
  );
}
