import React from 'react';
import { Type } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function FontSizeControl({ fontSizeLevel, onSelectLevel }) {
  const { t } = useI18n();
  const options = [
    { level: 'normal', label: 'A', title: t('exam.fontSizeNormal') },
    { level: 'large', label: 'A+', title: t('exam.fontSizeLarge') },
    { level: 'xlarge', label: 'A++', title: t('exam.fontSizeExtraLarge') },
  ];

  return (
    <div className="flex items-center space-x-1 bg-surface-card p-1 rounded-xl border border-border-default shadow-xs">
      <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary pl-1 flex items-center pr-1">
        <Type className="w-3 h-3 mr-0.5" />
        {t('exam.fontSizeLabel')}
      </span>
      {options.map((option) => (
        <button
          key={option.level}
          type="button"
          onClick={() => onSelectLevel(option.level)}
          title={option.title}
          className={`min-w-[44px] min-h-[44px] px-3 py-2 text-xs font-black rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
            fontSizeLevel === option.level
              ? 'bg-action-primary text-white shadow-xs'
              : 'text-content-secondary hover:text-content-primary hover:bg-surface-raised'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
