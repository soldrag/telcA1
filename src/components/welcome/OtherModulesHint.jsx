import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { getTestTypeById } from '../../../shared/testTypes.js';

const CHIP = 'min-h-[2.75rem] px-3 rounded-full border border-border-default bg-surface-raised hover:bg-surface-inset text-sm font-semibold text-content-primary tabular-nums cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

/**
 * «In other modules: [Lesen · 1]»: assignments of the modules not open now, each chip switching to its module.
 */
export default function OtherModulesHint({ elsewhere = [], onSelectTestType, className = '' }) {
  const { t } = useI18n();
  if (elsewhere.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content-secondary ${className}`}>
      <span>{t('welcome.assignments.otherModules')}</span>
      {elsewhere.map(({ testType, count }) => (
        <button key={testType} type="button" onClick={() => onSelectTestType?.(testType)} className={CHIP}>
          {getTestTypeById(testType).title} · {count}
        </button>
      ))}
    </div>
  );
}
