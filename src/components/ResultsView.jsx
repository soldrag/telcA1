import React from 'react';
import ResultsHeroCard from './results/ResultsHeroCard.jsx';
import ResultsActionBar from './results/ResultsActionBar.jsx';
import ResultsReviewList from './results/ResultsReviewList.jsx';
import SchreibenResultsBody from './results/schreiben/SchreibenResultsBody.jsx';
import TeacherReviewBanner from './results/TeacherReviewBanner.jsx';
import AssignmentSubmissionBanner from './results/AssignmentSubmissionBanner.jsx';

// Tasks, not points: a Schreiben letter at 3.5/10 is one task to rework, not 6.5 "mistakes".
function countMistakes(reviewItems = []) {
  return reviewItems.filter((item) => !item.is_correct).length;
}

export default function ResultsView({
  results,
  onResetExam,
  onRetakeMistakes,
  onOpenHistory,
  onShareResult,
  isTeacherReview = false,
  reviewStudentName = null,
  reviewInfo = null,
  onVerifyWithKey,
  onExitReview,
  onUpdateItemScore,
  assignmentSubmission = null,
}) {
  if (!results) return null;

  const mistakesCount = countMistakes(results.reviewItems);
  const isAssignment = Boolean(assignmentSubmission?.isAssignment);
  const shareSubmissionUrl = assignmentSubmission?.lockoutState?.shareUrl || null;
  const isSchreiben = results.exam?.test_type === 'schreiben';

  const actions = (
    <ResultsActionBar
      mistakesCount={mistakesCount}
      onResetExam={onResetExam}
      onRetakeMistakes={onRetakeMistakes}
      onOpenHistory={onOpenHistory}
      onShareResult={onShareResult}
      isTeacherReview={isTeacherReview}
      isAssignment={isAssignment}
      shareSubmissionUrl={shareSubmissionUrl}
    />
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {isAssignment && shareSubmissionUrl && (
        <AssignmentSubmissionBanner
          studentName={assignmentSubmission?.assignmentData?.studentName || null}
          shareUrl={shareSubmissionUrl}
          onExitAssignment={assignmentSubmission?.onExitAssignment}
        />
      )}

      {isTeacherReview && (
        <TeacherReviewBanner
          studentName={reviewStudentName}
          reviewInfo={reviewInfo}
          onVerifyWithKey={onVerifyWithKey}
          onExitReview={onExitReview}
        />
      )}

      <ResultsHeroCard results={results} actions={actions} />

      {isSchreiben ? (
        <SchreibenResultsBody reviewItems={results.reviewItems} onUpdateItemScore={onUpdateItemScore} />
      ) : (
        <ResultsReviewList results={results} mistakesCount={mistakesCount} onUpdateItemScore={onUpdateItemScore} />
      )}
    </div>
  );
}
