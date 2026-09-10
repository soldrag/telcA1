import React from 'react';
import { FileSpreadsheet, Check, X } from 'lucide-react';

export default function Antwortbogen({
  questions = [],
  answers = {},
  onSelectQuestion,
  isSubmitted,
  results = null,
}) {
  const teil1Questions = questions.filter(q => q.teil === 1);
  const teil2Questions = questions.filter(q => q.teil === 2);
  const teil3Questions = questions.filter(q => q.teil === 3);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-md">
      {/* Header styled like official sheet */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Offizieller Prüfungsvordruck
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight">
            Antwortbogen S10 — Teil Lesen
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300">
          <FileSpreadsheet className="w-4 h-4 text-slate-700" />
          <span>S10-LESEN</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-4">
        Здесь отображаются ваши заполненные ответы в формате официального экзаменационного бланка:
      </p>

      {/* Grid of parts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Teil 1 Column */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
          <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2 flex justify-between">
            <span>Teil 1 (1–5)</span>
            <span className="text-xs text-slate-500 font-mono">[ + / - ]</span>
          </div>
          <div className="space-y-1.5">
            {teil1Questions.map((q) => {
              const ans = answers[q.id];
              const review = results?.reviewItems?.find(r => r.id === q.id);

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
                    <span
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${
                        ans === 'richtig'
                          ? review
                            ? review.is_correct
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-telc-700 text-white border-telc-800 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      +
                    </span>
                    <span
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${
                        ans === 'falsch'
                          ? review
                            ? review.is_correct
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-telc-700 text-white border-telc-800 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      -
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teil 2 Column */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
          <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2 flex justify-between">
            <span>Teil 2 (6–10)</span>
            <span className="text-xs text-slate-500 font-mono">[ a / b ]</span>
          </div>
          <div className="space-y-1.5">
            {teil2Questions.map((q) => {
              const ans = answers[q.id];
              const review = results?.reviewItems?.find(r => r.id === q.id);

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
                    <span
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${
                        ans === 'a'
                          ? review
                            ? review.is_correct
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-telc-700 text-white border-telc-800 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      a
                    </span>
                    <span
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${
                        ans === 'b'
                          ? review
                            ? review.is_correct
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-telc-700 text-white border-telc-800 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      b
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teil 3 Column */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
          <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2 flex justify-between">
            <span>Teil 3 (11–15)</span>
            <span className="text-xs text-slate-500 font-mono">[ + / - ]</span>
          </div>
          <div className="space-y-1.5">
            {teil3Questions.map((q) => {
              const ans = answers[q.id];
              const review = results?.reviewItems?.find(r => r.id === q.id);

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
                    <span
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${
                        ans === 'richtig'
                          ? review
                            ? review.is_correct
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-telc-700 text-white border-telc-800 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      +
                    </span>
                    <span
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${
                        ans === 'falsch'
                          ? review
                            ? review.is_correct
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-rose-600 text-white border-rose-700'
                            : 'bg-telc-700 text-white border-telc-800 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      -
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
