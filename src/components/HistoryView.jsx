import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, ShieldCheck } from 'lucide-react';
import HistoryStatsGrid from './history/HistoryStatsGrid.jsx';
import HistoryClearConfirm from './history/HistoryClearConfirm.jsx';
import HistoryListContainer from './history/HistoryListContainer.jsx';
import Section from './layout/Section.jsx';
import { PAGE_STACK } from './layout/pageLayout.js';
import { PAGE_TITLE, PAGE_LEAD } from './layout/typography.js';
import { useI18n } from '../i18n/I18nContext.jsx';

const QUIET_BUTTON = 'flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl transition-colors min-h-[2.75rem] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

export default function HistoryView({
  navigation = {},
  actions = {},
  state = {},
  onBack = navigation.onBack,
  onLoadAttempt = actions.onLoadAttempt,
  onStartExam = actions.onStartExam,
  onClearHistory = actions.onClearHistory,
  onRefresh = actions.onRefresh,
  onShareAttempt = actions.onShareAttempt,
  attempts = state.attempts || [],
  loading = state.loading || false,
}) {
  const { t } = useI18n();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleConfirmClear = () => {
    onClearHistory?.();
    setShowClearConfirm(false);
  };

  const listActions = (
    <div className="flex items-center gap-2">
      {attempts.length > 0 && (showClearConfirm ? (
        <HistoryClearConfirm onConfirm={handleConfirmClear} onCancel={() => setShowClearConfirm(false)} />
      ) : (
        <button type="button" onClick={() => setShowClearConfirm(true)} className={`${QUIET_BUTTON} text-content-secondary hover:text-state-error hover:bg-state-error-subtle`}>
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span>{t('history.clearHistory')}</span>
        </button>
      ))}
      <button type="button" onClick={onRefresh} className={`${QUIET_BUTTON} text-action-primary hover:text-action-primary-hover hover:bg-action-primary-subtle`}>
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>{t('history.refreshBtn')}</span>
      </button>
    </div>
  );

  return (
    <div className={`${PAGE_STACK} lg:pt-4 text-content-primary`}>
      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          <h1 className={PAGE_TITLE}>{t('history.title')}</h1>
          {/* Where the data lives is part of what the page is, so it reads as the lead, not as an alert. */}
          <p className={`${PAGE_LEAD} flex items-center gap-2`}>
            <ShieldCheck className="w-4 h-4 shrink-0 text-state-success" aria-hidden="true" />
            <span>{t('history.storageDisclaimer')}</span>
          </p>
        </div>
        <HistoryStatsGrid attempts={attempts} />
      </div>

      <Section id="history-list-title" title={t('history.testsHistoryTitle')} action={listActions} padding="flush" bodyClassName="overflow-hidden">
        <HistoryListContainer
          loading={loading}
          attempts={attempts}
          onLoadAttempt={onLoadAttempt}
          onStartExam={onStartExam}
          onShareAttempt={onShareAttempt}
        />
      </Section>
    </div>
  );
}
