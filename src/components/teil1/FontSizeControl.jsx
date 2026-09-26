import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useExamFontSize } from '../../hooks/useExamFontSize.js';

export default function FontSizeControl() {
  const { t } = useI18n();
  const { fontSizeLevel, selectFontSizeLevel } = useExamFontSize();
  const options = [
    { level: 'normal', label: 'A', title: t('exam.fontSizeNormal') },
    { level: 'large', label: 'A+', title: t('exam.fontSizeLarge') },
    { level: 'xlarge', label: 'A++', title: t('exam.fontSizeExtraLarge') },
  ];

  return (
    <div role="radiogroup" aria-label={t('exam.fontSizeLabel')} className="flex items-center gap-1 shrink-0">
      {options.map((option) => (
        <button
          key={option.level}
          type="button"
          role="radio"
          aria-checked={fontSizeLevel === option.level}
          onClick={() => selectFontSizeLevel(option.level)}
          title={option.title}
          className={`min-w-[44px] min-h-[44px] px-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
            fontSizeLevel === option.level
              ? 'bg-surface-inset text-content-primary'
              : 'text-content-tertiary hover:text-content-primary hover:bg-surface-raised'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
