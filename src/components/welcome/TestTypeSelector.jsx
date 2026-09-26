import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

function resolveTypeClass(isActive, isAvailable) {
  if (!isAvailable) return 'text-content-muted cursor-not-allowed';
  if (isActive) return 'bg-surface-card text-content-primary font-semibold shadow-xs cursor-pointer';
  return 'text-content-secondary hover:text-content-primary cursor-pointer';
}

export default function TestTypeSelector({ testTypes = [], activeTypeId = 'lesen', onSelectType }) {
  const { t } = useI18n();

  return (
    <div role="group" aria-label={t('welcome.types.selectModule')} className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-surface-inset border border-border-default">
      {testTypes.map((type) => {
        const isActive = activeTypeId === type.id;
        const isAvailable = type.status === 'active';
        return (
          <button
            key={type.id}
            type="button"
            disabled={!isAvailable}
            aria-pressed={isActive}
            onClick={() => onSelectType(type.id)}
            className={`min-h-[52px] px-1 rounded-xl flex flex-col items-center justify-center transition-colors ${FOCUS_RING} ${resolveTypeClass(isActive, isAvailable)}`}
          >
            <span className="text-sm sm:text-base">{type.title}</span>
            <span className="text-xs text-content-muted">
              {isAvailable ? t(`welcome.moduleSubtitle_${type.id}`) : t('welcome.types.comingSoonBadge')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
