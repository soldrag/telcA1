import React from 'react';
import { RotateCcw, CheckCircle2, Award, Clock } from 'lucide-react';
import { calculateHistoryStats } from '../../utils/historyFormat.js';
import { NUMERIC } from '../layout/typography.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

/**
 * The four history figures as one strip, like the module briefing on the home:
 * 2 × 2 on phones, one row from 768 px; the hairlines are the strip's background showing through the gaps.
 */
export default function HistoryStatsGrid({ attempts = [] }) {
  const { t } = useI18n();
  const { count, passRate, avgScore, avgMinutes } = calculateHistoryStats(attempts);

  const stats = [
    { label: t('history.totalAttempts'), value: count, icon: RotateCcw, color: 'text-action-primary' },
    { label: t('history.passRate'), value: `${passRate}%`, icon: CheckCircle2, color: 'text-state-success' },
    { label: t('history.averageScore'), value: `${avgScore}%`, icon: Award, color: 'text-state-info' },
    { label: t('history.avgTime'), value: `${avgMinutes} ${t('common.minutesShort')}`, icon: Clock, color: 'text-state-warning' },
  ];

  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-border-default bg-border-default overflow-hidden">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <li key={label} className="bg-surface-card px-4 py-3 lg:px-6 lg:py-4 flex flex-col gap-1 min-w-0">
          <span className="flex items-center gap-2 text-xs sm:text-sm text-content-secondary">
            <Icon className={`w-4 h-4 shrink-0 ${color}`} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </span>
          <span className={`text-xl sm:text-2xl font-bold text-content-primary ${NUMERIC}`}>{value}</span>
        </li>
      ))}
    </ul>
  );
}
