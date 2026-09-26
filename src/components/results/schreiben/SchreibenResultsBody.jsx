import React from 'react';
import SchreibenSelfCheck from '../../schreiben/SchreibenSelfCheck.jsx';
import SchreibenFormReviewTable from './SchreibenFormReviewTable.jsx';

function isEssay(item) {
  return item.options_json?.type === 'essay';
}

/**
 * Schreiben results are read, not filtered: the letter review is open from the start,
 * with the Teil 1 form as one table beside it.
 */
export default function SchreibenResultsBody({ reviewItems = [], onUpdateItemScore }) {
  const essay = reviewItems.find(isEssay);
  const formItems = reviewItems.filter((item) => !isEssay(item));
  const formReview = formItems.length > 0 ? <SchreibenFormReviewTable items={formItems} /> : null;
  if (!essay) return formReview;

  const handleScoreChange = (total, breakdown) => onUpdateItemScore?.(essay.id, total, breakdown);
  return <SchreibenSelfCheck item={essay} onScoreChange={handleScoreChange} formReview={formReview} />;
}
