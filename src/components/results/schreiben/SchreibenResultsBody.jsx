import React, { useState } from 'react';
import SchreibenSelfCheck from '../../schreiben/SchreibenSelfCheck.jsx';
import SchreibenFormReviewTable from './SchreibenFormReviewTable.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { NUMERIC } from '../../layout/typography.js';
import { formatPoints } from '../../../utils/formatPoints.js';

function isEssay(item) {
  return item.options_json?.type === 'essay';
}

// Below 1024 px the two Teile are two tabs; the letter opens first, it carries most of the points.
function SectionSwitch({ section, onChange, labels }) {
  return (
    <div className="lg:hidden grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-inset">
      {['form', 'letter'].map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={section === key}
          onClick={() => onChange(key)}
          className={`min-h-[2.75rem] rounded-lg text-sm font-semibold ${NUMERIC} cursor-pointer transition-colors ${section === key ? 'bg-surface-card text-content-primary shadow-xs' : 'text-content-secondary'}`}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}

/**
 * Schreiben results are read, not filtered: the letter review is open from the start,
 * with the Teil 1 form as one table beside it (a separate tab below 1024 px).
 */
export default function SchreibenResultsBody({ reviewItems = [], onUpdateItemScore }) {
  const { t, language } = useI18n();
  const [section, setSection] = useState('letter');
  const essay = reviewItems.find(isEssay);
  const formItems = reviewItems.filter((item) => !isEssay(item));
  const formReview = formItems.length > 0 ? <SchreibenFormReviewTable items={formItems} /> : null;
  if (!essay) return formReview;

  const labels = {
    form: t('results.schreibenResult.formTab', { score: formItems.filter((item) => item.is_correct).length, max: formItems.length }),
    letter: t('results.schreibenResult.letterTab', { score: formatPoints(essay.points_earned, language), max: essay.max_points || 10 }),
  };
  const handleScoreChange = (total, breakdown) => onUpdateItemScore?.(essay.id, total, breakdown);

  return (
    // gap, not space-y: the switch is hidden from 1024 px and must not leave its margin behind.
    <div className="flex flex-col gap-4">
      {formReview && <SectionSwitch section={section} onChange={setSection} labels={labels} />}
      <SchreibenSelfCheck item={essay} onScoreChange={handleScoreChange} formReview={formReview} visibleSection={formReview ? section : null} />
    </div>
  );
}
