import React from 'react';
import { RotateCcw, CheckCircle2, Award, Clock } from 'lucide-react';
import { calculateHistoryStats } from '../../utils/historyFormat.js';

export default function HistoryStatsGrid({ attempts = [] }) {
  const { count, passRate, avgScore, avgMinutes } = calculateHistoryStats(attempts);

  const stats = [
    { label: 'Всего попыток', value: count, icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Успешность', value: `${passRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Средний балл', value: `${avgScore}%`, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ср. время', value: `${avgMinutes} мин`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
          >
            <div className={`p-2 sm:p-3 ${stat.bg} ${stat.color} rounded-xl mb-3`}>
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
