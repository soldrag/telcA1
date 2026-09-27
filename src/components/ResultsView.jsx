import React from 'react';
import ResultsHeroCard from './results/ResultsHeroCard.jsx';
import ResultsActionBar from './results/ResultsActionBar.jsx';
import ResultsReviewList from './results/ResultsReviewList.jsx';
import SchreibenResultsBody from './results/schreiben/SchreibenResultsBody.jsx';
import TeacherReviewBanner from './results/TeacherReviewBanner.jsx';
import AssignmentSubmissionBanner from './results/AssignmentSubmissionBanner.jsx';
import Band from './layout/Band.jsx';
import { PAGE_STACK, SPAN } from './layout/pageLayout.js';

// The actions block beside the score is bare on phones (its buttons live in the bottom bar there)
// and a card of the same height as the score from 1024 px.
const ACTIONS_BLOCK = `${SPAN.side} max-lg:-mt-4 min-w-0 flex flex-col justify-center lg:rounded-2xl lg:bg-surface-card lg:border lg:border-border-default lg:p-6`;

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
  const hasActions = !isTeacherReview && (!isAssignment || Boolean(shareSubmissionUrl));

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
    <div className={`${PAGE_STACK} animate-fadeIn max-sm:pb-24`}>
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

      <Band>
        <ResultsHeroCard results={results} teilChipsFromLg={isSchreiben} className={hasActions ? SPAN.main : SPAN.full} />
        {hasActions && <div className={ACTIONS_BLOCK}>{actions}</div>}
      </Band>

      {isSchreiben ? (
        <SchreibenResultsBody reviewItems={results.reviewItems} onUpdateItemScore={onUpdateItemScore} />
      ) : (
        <ResultsReviewList results={results} mistakesCount={mistakesCount} onUpdateItemScore={onUpdateItemScore} />
      )}
    </div>
  );
}
