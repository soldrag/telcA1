import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useSchreibenSelfCheck } from '../../hooks/useSchreibenSelfCheck.js';
import SchreibenLetterVerdict from './SchreibenLetterVerdict.jsx';
import SchreibenLetterTexts from './SchreibenLetterTexts.jsx';
import SchreibenMoreDetails from './SchreibenMoreDetails.jsx';
import Band from '../layout/Band.jsx';
import { SPAN } from '../layout/pageLayout.js';

/**
 * Letter review: conclusion and criteria, the texts, the Teil 1 form and secondary details.
 * Below 1024 px one stream (optionally only the section picked in the Form / Letter switch).
 * From 1024 px the Teil 1 form comes first (exam order), then the letter as one band of the page
 * grid, criteria (5 columns) beside the sticky texts (7), and the details full width below it.
 */
export default function SchreibenSelfCheck({ item = {}, onScoreChange, formReview = null, visibleSection = null }) {
  const { t, language } = useI18n();
  const selfCheck = useSchreibenSelfCheck({ item, onScoreChange, t, language });
  const shared = { item, selfCheck, t, language };
  const onlyIn = (section) => (visibleSection && visibleSection !== section ? 'max-lg:hidden' : '');

  return (
    <div className="flex flex-col gap-4 lg:gap-10">
      {/* The sticky texts stay inside the letter row and never slide over the form below. */}
      <Band align="start">
        <SchreibenLetterVerdict {...shared} className={`order-1 min-w-0 ${SPAN.narrow} ${onlyIn('letter')}`} />
        <div className={`order-2 lg:sticky lg:top-20 min-w-0 ${SPAN.wide} ${onlyIn('letter')}`}>
          <SchreibenLetterTexts {...shared} />
        </div>
      </Band>
      {/* Teil 1 is read first on desktop: the parts keep the exam order. */}
      {formReview && <div className={`order-3 lg:-order-1 min-w-0 ${onlyIn('form')}`}>{formReview}</div>}
      <SchreibenMoreDetails {...shared} className={`order-4 ${onlyIn('letter')}`} />
    </div>
  );
}
