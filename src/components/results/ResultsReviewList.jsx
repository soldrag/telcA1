import React, { useState } from 'react';
import ResultsFilterBar from './ResultsFilterBar.jsx';
import ResultsReviewCard from './ResultsReviewCard.jsx';
import Section from '../layout/Section.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

function filterReviewItems(items, filter) {
  if (filter === 'mistakes') return items.filter((item) => !item.is_correct);
  if (filter === 'correct') return items.filter((item) => item.is_correct);
  return items;
}

/**
 * Per-task review cards under the page's section title with the all / mistakes / correct filter; a failed attempt opens on mistakes.
 */
export default function ResultsReviewList({ results, mistakesCount, onUpdateItemScore }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState(() => (results.passed === false && mistakesCount > 0 ? 'mistakes' : 'all'));
  const [expanded, setExpanded] = useState({});
  const items = filterReviewItems(results.reviewItems || [], filter);
  const isAllExpanded = Object.keys(expanded).length > 0;

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleExpandAll = () => {
    setExpanded(isAllExpanded ? {} : Object.fromEntries(items.map((item) => [item.id, true])));
  };

  return (
    <Section id="results-review-title" title={t('results.breakdownTitle')} bodyClassName="gap-4 lg:gap-6">
      <ResultsFilterBar
        filter={filter}
        onSetFilter={setFilter}
        totalQuestions={(results.reviewItems || []).length}
        mistakesCount={mistakesCount}
        score={(results.reviewItems || []).length - mistakesCount}
        isAllExpanded={isAllExpanded}
        onToggleExpandAll={toggleExpandAll}
      />
      <div className="space-y-4">
        {items.map((item) => (
          <ResultsReviewCard
            key={item.id}
            item={item}
            isExpanded={Boolean(expanded[item.id])}
            onToggleExpand={() => toggleExpand(item.id)}
            onUpdateItemScore={onUpdateItemScore}
          />
        ))}
      </div>
    </Section>
  );
}
