import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useSchreibenSelfCheck } from '../../hooks/useSchreibenSelfCheck.js';
import SchreibenLetterVerdict from './SchreibenLetterVerdict.jsx';
import SchreibenLetterTexts from './SchreibenLetterTexts.jsx';
import SchreibenMoreDetails from './SchreibenMoreDetails.jsx';

/**
 * Letter review: conclusion and criteria, the texts, then secondary details.
 * Phones read it in that order (with the optional form review before the details);
 * desktops keep the texts in a sticky right column.
 */
export default function SchreibenSelfCheck({ item = {}, onScoreChange, formReview = null }) {
  const { t, language } = useI18n();
  const selfCheck = useSchreibenSelfCheck({ item, onScoreChange, t, language });
  const shared = { item, selfCheck, t, language };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
      <div className="contents lg:flex lg:flex-col lg:gap-6 lg:min-w-0">
        {formReview && <div className="order-3 lg:order-none min-w-0">{formReview}</div>}
        <SchreibenLetterVerdict {...shared} className="order-1 lg:order-none" />
        <SchreibenMoreDetails {...shared} className="order-4 lg:order-none" />
      </div>
      <SchreibenLetterTexts {...shared} className="order-2 lg:order-none lg:sticky lg:top-20 min-w-0" />
    </div>
  );
}
