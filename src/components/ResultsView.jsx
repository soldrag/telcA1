import React, { useState } from 'react';
import ResultsHeroCard from './results/ResultsHeroCard.jsx';
import ResultsActionBar from './results/ResultsActionBar.jsx';
import ResultsFilterBar from './results/ResultsFilterBar.jsx';
import ResultsReviewCard from './results/ResultsReviewCard.jsx';
import TeacherReviewBanner from './results/TeacherReviewBanner.jsx';

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
}) {
  const [filter, setFilter] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!results) return null;

  const mistakesCount = results.totalQuestions - results.score;
  const filteredItems = filterReviewItems(results.reviewItems || [], filter);
  const isAllExpanded = Object.keys(expandedQuestions).length > 0;

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedQuestions({});
    } else {
      const nextState = {};
      filteredItems.forEach((item) => { nextState[item.id] = true; });
      setExpandedQuestions(nextState);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {isTeacherReview && (
        <TeacherReviewBanner
          studentName={reviewStudentName}
          reviewInfo={reviewInfo}
          onVerifyWithKey={onVerifyWithKey}
          onExitReview={onExitReview}
        />
      )}

      <ResultsHeroCard results={results} />

      <ResultsActionBar
        mistakesCount={mistakesCount}
        onResetExam={onResetExam}
        onRetakeMistakes={onRetakeMistakes}
        onOpenHistory={onOpenHistory}
        onShareResult={onShareResult}
        isTeacherReview={isTeacherReview}
      />

      <div className="bg-surface-card rounded-2xl border border-border-default p-4 sm:p-6 shadow-sm space-y-6">
        <ResultsFilterBar
          filter={filter}
          onSetFilter={setFilter}
          totalQuestions={results.totalQuestions}
          mistakesCount={mistakesCount}
          score={results.score}
          isAllExpanded={isAllExpanded}
          onToggleExpandAll={handleToggleExpandAll}
        />

        <div className="space-y-4">
          {filteredItems.map((item) => (
            <ResultsReviewCard
              key={item.id}
              item={item}
              isExpanded={Boolean(expandedQuestions[item.id])}
              onToggleExpand={() => toggleExpand(item.id)}
              onUpdateItemScore={onUpdateItemScore}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function filterReviewItems(items, filter) {
  if (filter === 'mistakes') return items.filter((item) => !item.is_correct);
  if (filter === 'correct') return items.filter((item) => item.is_correct);
  return items;
}
