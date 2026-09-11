import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsFilterHeader() {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="text-xl font-bold text-content-primary">
        {t('results.breakdownTitle')}
      </h3>
      <p className="text-xs sm:text-sm text-content-tertiary mt-0.5">
        {t('results.breakdownSubtitle')}
      </p>
    </div>
  );
}
