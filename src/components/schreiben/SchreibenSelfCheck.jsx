import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useSchreibenSelfCheck } from '../../hooks/useSchreibenSelfCheck.js';
import SchreibenLetterVerdict from './SchreibenLetterVerdict.jsx';
import SchreibenLetterTexts from './SchreibenLetterTexts.jsx';
import SchreibenMoreDetails from './SchreibenMoreDetails.jsx';

/**
 * Letter review: conclusion and criteria, the texts, then secondary details.
 * Below 1024 px one stream (optionally only the section picked in the Form / Letter switch);
 * from 1024 px a 380 px column (form, criteria, details) next to the two texts.
 */
export default function SchreibenSelfCheck({ item = {}, onScoreChange, formReview = null, visibleSection = null }) {
  const { t, language } = useI18n();
  const selfCheck = useSchreibenSelfCheck({ item, onScoreChange, t, language });
  const shared = { item, selfCheck, t, language };
  const onlyIn = (section) => (visibleSection && visibleSection !== section ? 'max-lg:hidden' : '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
      <div className="contents lg:flex lg:flex-col lg:gap-6 lg:min-w-0">
        {formReview && <div className={`order-3 lg:order-none min-w-0 ${onlyIn('form')}`}>{formReview}</div>}
        <SchreibenLetterVerdict {...shared} className={`order-1 lg:order-none ${onlyIn('letter')}`} />
        <SchreibenMoreDetails {...shared} className={`order-4 lg:order-none ${onlyIn('letter')}`} />
      </div>
      <div className={`order-2 lg:order-none lg:sticky lg:top-20 min-w-0 ${onlyIn('letter')}`}>
        <SchreibenLetterTexts {...shared} />
      </div>
    </div>
  );
}
