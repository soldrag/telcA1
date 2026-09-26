import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useSchreibenSelfCheck } from '../../hooks/useSchreibenSelfCheck.js';
import SchreibenLetterVerdict from './SchreibenLetterVerdict.jsx';
import SchreibenLetterTexts from './SchreibenLetterTexts.jsx';
import SchreibenMoreDetails from './SchreibenMoreDetails.jsx';

/**
 * Letter review: conclusion and criteria, the texts, then the Teil 1 form and secondary details.
 * Below 1024 px one stream (optionally only the section picked in the Form / Letter switch).
 * From 1024 px the letter is one row, criteria beside the sticky texts, and the form and details
 * run full width below it, so neither column is left half empty.
 */
export default function SchreibenSelfCheck({ item = {}, onScoreChange, formReview = null, visibleSection = null }) {
  const { t, language } = useI18n();
  const selfCheck = useSchreibenSelfCheck({ item, onScoreChange, t, language });
  const shared = { item, selfCheck, t, language };
  const onlyIn = (section) => (visibleSection && visibleSection !== section ? 'max-lg:hidden' : '');

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* The sticky texts stay inside the letter row and never slide over the form below. */}
      <div className="contents lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-6 lg:items-start">
        <SchreibenLetterVerdict {...shared} className={`order-1 min-w-0 ${onlyIn('letter')}`} />
        <div className={`order-2 lg:sticky lg:top-20 min-w-0 ${onlyIn('letter')}`}>
          <SchreibenLetterTexts {...shared} />
        </div>
      </div>
      {formReview && <div className={`order-3 min-w-0 ${onlyIn('form')}`}>{formReview}</div>}
      <SchreibenMoreDetails {...shared} className={`order-4 ${onlyIn('letter')}`} />
    </div>
  );
}
