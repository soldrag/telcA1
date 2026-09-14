import React from 'react';
import TestTypeSelector from './TestTypeSelector.jsx';
import TeacherKeyCard from './teacher/TeacherKeyCard.jsx';
import QuickReviewInputCard from './teacher/QuickReviewInputCard.jsx';
import TeacherVariantsCatalog from './teacher/TeacherVariantsCatalog.jsx';

export default function TeacherWelcomeView({
  examState = {},
  actions = {},
  onOpenCreateAssignment,
  onProcessReview,
}) {
  const {
    exams = [],
    testTypes = [],
    activeTestType = 'lesen',
  } = examState;

  const {
    onSelectTestType,
    onSelectExam,
    onStartExam,
    onInspectExam,
  } = actions;

  return (
    <div className="space-y-6">
      <TestTypeSelector
        testTypes={testTypes}
        activeTypeId={activeTestType}
        onSelectType={onSelectTestType}
      />

      <TeacherKeyCard />

      <QuickReviewInputCard onProcessReview={onProcessReview} />

      <TeacherVariantsCatalog
        exams={exams}
        onSelectExam={onSelectExam}
        onStartExam={onStartExam}
        onInspectExam={onInspectExam}
        onOpenCreateAssignment={onOpenCreateAssignment}
      />
    </div>
  );
}
