import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useExamFontSize } from '../../hooks/useExamFontSize.js';

const LEVELS = [
  { level: 'normal', label: 'A', titleKey: 'exam.fontSizeNormal' },
  { level: 'large', label: 'A+', titleKey: 'exam.fontSizeLarge' },
  { level: 'xlarge', label: 'A++', titleKey: 'exam.fontSizeExtraLarge' },
];
const BUTTON = 'min-w-[44px] min-h-[44px] px-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

// One button that steps through the sizes: fits the single-row desktop exam header.
function FontSizeCycleButton({ fontSizeLevel, selectFontSizeLevel, t }) {
  const index = Math.max(0, LEVELS.findIndex((option) => option.level === fontSizeLevel));
  const current = LEVELS[index];
  const next = LEVELS[(index + 1) % LEVELS.length];
  return (
    <button
      type="button"
      onClick={() => selectFontSizeLevel(next.level)}
      title={`${t('exam.fontSizeLabel')}: ${t(current.titleKey)}`}
      aria-label={`${t('exam.fontSizeLabel')}: ${t(current.titleKey)}`}
      className={`${BUTTON} border border-border-default text-content-primary hover:bg-surface-raised`}
    >
      {current.label}
    </button>
  );
}

export default function FontSizeControl({ variant = 'group' }) {
  const { t } = useI18n();
  const { fontSizeLevel, selectFontSizeLevel } = useExamFontSize();
  if (variant === 'cycle') {
    return <FontSizeCycleButton fontSizeLevel={fontSizeLevel} selectFontSizeLevel={selectFontSizeLevel} t={t} />;
  }

  return (
    <div role="radiogroup" aria-label={t('exam.fontSizeLabel')} className="flex items-center gap-1 shrink-0">
      {LEVELS.map((option) => (
        <button
          key={option.level}
          type="button"
          role="radio"
          aria-checked={fontSizeLevel === option.level}
          onClick={() => selectFontSizeLevel(option.level)}
          title={t(option.titleKey)}
          className={`${BUTTON} ${
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
