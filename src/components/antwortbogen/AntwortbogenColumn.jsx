import React from 'react';

export default function AntwortbogenColumn({
  title,
  subtitle,
  questions = [],
  answers = {},
  results = null,
  options = ['richtig', 'falsch'],
  labels = ['+', '-'],
  onSelectQuestion,
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
      <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2 flex justify-between">
        <span>{title}</span>
        <span className="text-xs text-slate-500 font-mono">{subtitle}</span>
      </div>

      <div className="space-y-1.5">
        {questions.map((q) => {
          const ans = answers[q.id];
          const review = results?.reviewItems?.find((r) => r.id === q.id);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(q.question_number - 1, q.id)}
              className="flex items-center justify-between w-full py-1 px-2 rounded hover:bg-white transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px]"
            >
              <span className="font-mono font-bold text-slate-700 w-5 text-left">
                {q.question_number}.
              </span>
              <div className="flex space-x-2">
                {options.map((optVal, optIdx) => {
                  const isSelected = ans === optVal;
                  const pillClass = getChoicePillClass(isSelected, review);

                  return (
                    <span
                      key={optVal}
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${pillClass}`}
                    >
                      {labels[optIdx]}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getChoicePillClass(isSelected, review) {
  if (!isSelected) {
    return 'bg-white text-slate-400 border-slate-300';
  }
  if (!review) {
    return 'bg-telc-700 text-white border-telc-800 shadow-sm';
  }
  return review.is_correct
    ? 'bg-emerald-600 text-white border-emerald-700'
    : 'bg-rose-600 text-white border-rose-700';
}
