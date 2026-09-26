import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

function resolveRowClass(isActive, isAvailable) {
  if (!isAvailable) return 'text-content-muted cursor-not-allowed';
  if (isActive) return 'bg-surface-card text-content-primary font-semibold shadow-xs cursor-pointer';
  return 'text-content-secondary hover:text-content-primary cursor-pointer';
}

function resolveTabClass(isActive, isAvailable) {
  if (!isAvailable) return 'text-content-muted cursor-not-allowed';
  if (isActive) return 'bg-surface-inset text-content-primary font-semibold cursor-pointer';
  return 'text-content-secondary hover:text-content-primary hover:bg-surface-raised cursor-pointer';
}

function RowLabel({ type, isAvailable, t }) {
  return (
    <>
      <span className="text-sm sm:text-base">{type.title}</span>
      <span className="text-xs text-content-muted">
        {isAvailable ? t(`welcome.moduleSubtitle_${type.id}`) : t('welcome.types.comingSoonBadge')}
      </span>
    </>
  );
}

function TabLabel({ type, isAvailable, t }) {
  return (
    <span className="whitespace-nowrap">
      {type.title}{!isAvailable && <span className="font-normal"> {t('welcome.types.soonSuffix')}</span>}
    </span>
  );
}

/**
 * Module switch: a row of four under the header below 1024 px ("row"), tabs inside the header from 1024 px ("tabs").
 * Modules that are not released yet stay visible but disabled.
 */
export default function TestTypeSelector({ testTypes = [], activeTypeId = 'lesen', onSelectType, variant = 'row' }) {
  const { t } = useI18n();
  const isTabs = variant === 'tabs';
  const Label = isTabs ? TabLabel : RowLabel;
  const containerClass = isTabs
    ? 'flex items-center gap-1'
    : 'grid grid-cols-4 gap-1 p-1 rounded-2xl bg-surface-inset border border-border-default';
  const buttonClass = isTabs
    ? 'min-h-[2.75rem] px-3 rounded-lg text-sm transition-colors'
    : 'min-h-[3.25rem] px-1 rounded-xl flex flex-col items-center justify-center transition-colors';

  return (
    <div role="group" aria-label={t('welcome.types.selectModule')} className={containerClass}>
      {testTypes.map((type) => {
        const isActive = activeTypeId === type.id;
        const isAvailable = type.status === 'active';
        return (
          <button
            key={type.id}
            type="button"
            disabled={!isAvailable}
            aria-pressed={isActive}
            onClick={() => onSelectType?.(type.id)}
            className={`${buttonClass} ${FOCUS_RING} ${(isTabs ? resolveTabClass : resolveRowClass)(isActive, isAvailable)}`}
          >
            <Label type={type} isAvailable={isAvailable} t={t} />
          </button>
        );
      })}
    </div>
  );
}
