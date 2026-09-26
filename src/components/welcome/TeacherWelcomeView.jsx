import React from 'react';
import TeacherKeyCard from './teacher/TeacherKeyCard.jsx';
import QuickReviewInputCard from './teacher/QuickReviewInputCard.jsx';
import TeacherVariantsCatalog from './teacher/TeacherVariantsCatalog.jsx';

export default function TeacherWelcomeView({
  title,
  examState = {},
  actions = {},
  onOpenCreateAssignment,
  onProcessReview,
}) {
  const { exams = [] } = examState;

  const {
    onSelectExam,
    onStartExam,
    onInspectExam,
  } = actions;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{title}</h1>

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
