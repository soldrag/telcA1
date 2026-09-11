import React from 'react';
import { RotateCcw, CheckCircle2, Award, Clock } from 'lucide-react';
import { calculateHistoryStats } from '../../utils/historyFormat.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function HistoryStatsGrid({ attempts = [] }) {
  const { t } = useI18n();
  const { count, passRate, avgScore, avgMinutes } = calculateHistoryStats(attempts);

  const stats = [
    { label: t('history.totalAttempts'), value: count, icon: RotateCcw, color: 'text-action-primary', bg: 'bg-action-primary-subtle' },
    { label: t('history.passRate'), value: `${passRate}%`, icon: CheckCircle2, color: 'text-state-success', bg: 'bg-state-success-subtle' },
    { label: t('history.averageScore'), value: `${avgScore}%`, icon: Award, color: 'text-state-info', bg: 'bg-state-info-subtle' },
    { label: t('history.avgTime'), value: `${avgMinutes} ${t('common.minutesShort')}`, icon: Clock, color: 'text-state-warning', bg: 'bg-state-warning-subtle' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-surface-card p-4 sm:p-5 rounded-2xl border border-border-default shadow-xs flex flex-col items-center text-center"
          >
            <div className={`p-2 sm:p-3 ${stat.bg} ${stat.color} rounded-xl mb-3`}>
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-content-primary">{stat.value}</div>
            <div className="text-xs text-content-tertiary mt-1">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
