import React from 'react';
import { Clock } from 'lucide-react';

export default function HistoryEmptyState({ onStartExam }) {
  return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">История пуста</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Вы ещё не завершили ни одного экзамена. Пройдите свой первый тест, чтобы увидеть результаты здесь.
      </p>
      <button
        type="button"
        onClick={onStartExam}
        className="px-6 py-3 bg-telc-600 text-white font-bold rounded-xl hover:bg-telc-700 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px]"
      >
        Начать экзамен
      </button>
    </div>
  );
}
