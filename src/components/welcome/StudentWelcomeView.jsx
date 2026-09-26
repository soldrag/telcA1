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
import Section from '../layout/Section.jsx';
import { BAND, PAGE_STACK, SPAN } from '../layout/pageLayout.js';

function collectAssignedExamIds(assignments, testType) {
  return assignments
    .filter((assignment) => !assignment.submittedAt && assignment.testType === testType)
    .map((assignment) => assignment.examId);
}

function StructureAside({ testType, t, className }) {
  return (
    <Section id="module-structure-title" title={t('welcome.randomCard.structureToggle')} padding="flush" className={`hidden lg:flex ${className}`}>
      <ModuleStructureCards testType={testType} variant="list" />
    </Section>
  );
}

/**
 * Student home on the 12-column page grid: the module heading, then three bands whose two blocks
 * share their top and bottom edges — exam | from the teacher, progress | recent attempts,
 * variants | module structure. Below 1024 px the bands dissolve into one stream in `order`:
 * start → teacher → progress → variants → attempts.
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
    <div className={`${PAGE_STACK} lg:pt-4`}>
      <ModuleHeading moduleInfo={currentModule} />
      <div className={BAND}>
        <RandomExamCard onStartRandomExam={onStartRandomExam} moduleInfo={currentModule} className={`order-1 lg:order-none ${SPAN.main}`} />
        <TeacherTasksSection assignments={assignments} onOpenTask={onOpenTask} className={`order-2 lg:order-none ${SPAN.side}`} />
      </div>
      <div className={BAND}>
        <ModuleProgressCard progress={progress} testType={activeTestType} className={`order-3 lg:order-none ${SPAN.main}`} />
        <RecentAttemptsList recentAttempts={recentAttempts} onOpenHistory={navigation.onOpenHistory} onLoadAttempt={onLoadAttempt} className={`order-5 lg:order-none ${SPAN.side}`} />
      </div>
      <div className={BAND}>
        <VariantGrid
          exams={exams}
          scores={scores}
          assignedExamIds={collectAssignedExamIds(assignments, activeTestType)}
          passScore={currentModule.passScore}
          onStartVariant={startVariant}
          className={`order-4 lg:order-none ${SPAN.main}`}
        />
        <StructureAside testType={activeTestType} t={t} className={SPAN.side} />
      </div>
    </div>
  );
}
