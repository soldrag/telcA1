import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsFilterHeader() {
  const { isRussian } = useI18n();

  return (
    <div>
      <h3 className="text-xl font-bold text-content-primary">
        {isRussian ? 'Таблица результатов и разбор ответов' : 'Results Breakdown & Explanations'}
      </h3>
      <p className="text-xs sm:text-sm text-content-tertiary mt-0.5">
        {isRussian
          ? 'Нажмите на задание, чтобы прочитать подробное объяснение на русском языке с цитатой из текста.'
          : 'Click any task to inspect the detailed explanation and contextual quotation.'}
      </p>
    </div>
  );
}
