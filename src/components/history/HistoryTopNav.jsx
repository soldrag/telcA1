import React from 'react';
import { ArrowLeft, Award } from 'lucide-react';

export default function HistoryTopNav({ onBack }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium text-sm sm:text-base">Назад</span>
      </button>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <h1 className="text-sm font-bold text-slate-900">Моя статистика</h1>
          <p className="text-xs text-slate-500">Результаты экзаменов</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-telc-100 flex items-center justify-center text-telc-700 hidden sm:flex">
          <Award className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
