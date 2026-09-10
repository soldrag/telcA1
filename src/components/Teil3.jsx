import React from 'react';
import { FileText, Check, X } from 'lucide-react';
import Teil3NoticeCard from './teil3/Teil3NoticeCard.jsx';

export default function Teil3({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  return (
    <div className="space-y-8">
      <Teil3Banner />

      <div className="space-y-8">
        {questions.map((q) => {
          const currentAnswer = answers[q.id];
          const isAnswered = Boolean(currentAnswer);

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className="bg-white rounded-3xl border-2 border-slate-300 overflow-hidden shadow-md"
            >
              {/* Header */}
              <div className="bg-slate-100/90 px-5 sm:px-6 py-4 border-b-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-telc-800 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {q.question_number}
                  </span>
                  <span className="text-sm font-black text-slate-950 uppercase tracking-wide">
                    {q.title || `Aufgabe ${q.question_number}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-slate-800 bg-white px-3 py-1 rounded-full border border-slate-300 shadow-xs">
                    Hinweisschild
                  </span>
                  {isAnswered && (
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs ${
                      currentAnswer === 'richtig'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}>
                      {currentAnswer === 'richtig' ? '✓ Richtig (+)' : '✕ Falsch (-)'}
                    </span>
                  )}
                </div>
              </div>

              <Teil3NoticeCard
                contextHeader={q.context_header}
                contextBody={q.context_body}
              />

              {/* Statement & Action buttons */}
              <div className="p-4 sm:p-6 border-t-2 border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-xs font-black uppercase tracking-wider text-telc-800 bg-telc-50 px-3 py-1 rounded border border-telc-200 mt-1 flex-shrink-0">
                    Aussage:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                    {q.statement}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onSelectAnswer(q.id, 'richtig')}
                    disabled={isSubmitted}
                    className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
                      currentAnswer === 'richtig'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50 scale-[1.01]'
                        : 'bg-white hover:bg-emerald-50/50 text-slate-900 hover:text-emerald-900 border-slate-300 hover:border-emerald-500 shadow-xs'
                    }`}
                  >
                    <Check className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'richtig' ? 'text-white' : 'text-emerald-600'}`} />
                    <span>Richtig (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectAnswer(q.id, 'falsch')}
                    disabled={isSubmitted}
                    className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
                      currentAnswer === 'falsch'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50 scale-[1.01]'
                        : 'bg-white hover:bg-rose-50/50 text-slate-900 hover:text-rose-900 border-slate-300 hover:border-rose-500 shadow-xs'
                    }`}
                  >
                    <X className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'falsch' ? 'text-white' : 'text-rose-600'}`} />
                    <span>Falsch (-)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Teil3Banner() {
  return (
    <div className="bg-white border-l-4 border-telc-600 rounded-r-2xl p-4 shadow-sm border-y border-r border-slate-200">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-telc-50 text-telc-700 rounded-xl mt-0.5 border border-telc-200 shadow-xs">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-telc-700 bg-telc-50 px-3 py-1 rounded border border-telc-200">
              Leseverstehen • Teil 3
            </span>
            <span className="text-xs text-slate-600 font-bold">Aufgaben 11–15</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-950 mt-1">
            Hinweisschilder, Notizen und Aushänge
          </h2>
          <p className="text-sm text-slate-700 mt-1 font-medium leading-normal">
            Lesen Sie die Schilder und Mitteilungen. Ist die Aussage{' '}
            <strong className="text-emerald-700 font-black">richtig (+)</strong> oder{' '}
            <strong className="text-rose-700 font-black">falsch (-)</strong>?
          </p>
        </div>
      </div>
    </div>
  );
}
