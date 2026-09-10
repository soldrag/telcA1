import React from 'react';
import { Globe, Check, ExternalLink } from 'lucide-react';

export default function Teil2({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  return (
    <div className="space-y-8">
      {/* Official Section Banner */}
      <div className="bg-white border-l-4 border-telc-600 rounded-r-2xl p-4 shadow-sm border-y border-r border-slate-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-telc-50 text-telc-700 rounded-xl mt-0.5 border border-telc-200 shadow-xs">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-telc-700 bg-telc-50 px-3 py-1 rounded border border-telc-200">
                Leseverstehen • Teil 2
              </span>
              <span className="text-xs text-slate-600 font-bold">Aufgaben 6–10</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-950 mt-1">
              Informationen im Internet und Kleinanzeigen
            </h2>
            <p className="text-sm text-slate-700 mt-1 font-medium leading-normal">
              Lesen Sie die Situation und die beiden Webseiten. Welche Webseite passt am besten?
              Wählen Sie <strong className="text-telc-800 font-black">a</strong> oder{' '}
              <strong className="text-telc-800 font-black">b</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Questions 6 - 10 */}
      <div className="space-y-8">
        {questions.map((q) => {
          const currentAnswer = answers[q.id];
          const options = q.options_json || [];
          const isAnswered = Boolean(currentAnswer);

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className="bg-white rounded-3xl border-2 border-slate-300 overflow-hidden shadow-md"
            >
              {/* Situation Header */}
              <div className="bg-slate-100/90 border-b-2 border-slate-200 p-4 sm:p-6">
                <div className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-telc-800 text-white font-black text-sm flex items-center justify-center shadow-sm mt-0.5">
                    {q.question_number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-telc-800 bg-white px-3 py-1 rounded border border-slate-300 shadow-xs">
                        Situation {q.question_number}
                      </span>
                      {isAnswered && (
                        <span className="text-xs font-extrabold text-telc-800 bg-telc-100 px-3 py-1 rounded-full border border-telc-300 shadow-xs">
                          Выбрано: {String(currentAnswer).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-base sm:text-lg font-bold text-slate-950 mt-2 leading-snug">
                      {q.situation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Webpage Options */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {options.map((opt) => {
                  const isSelected = currentAnswer === opt.id;

                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => !isSubmitted && onSelectAnswer(q.id, opt.id)}
                      className={`text-left w-full min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 relative flex flex-col justify-between rounded-2xl border-2 p-4 sm:p-6 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-telc-600 bg-telc-50/70 shadow-lg ring-2 ring-telc-500/30 scale-[1.01]'
                          : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/70 shadow-xs'
                      }`}
                    >
                      {/* Browser mockup header */}
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-200">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                              {opt.id.toUpperCase()}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700 truncate max-w-[200px] sm:max-w-xs bg-slate-100 px-3 py-1 rounded border border-slate-200">
                              {opt.badge}
                            </span>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                          </div>
                        </div>

                        {/* Title and content */}
                        <h4 className="text-base sm:text-lg font-black text-slate-950 hover:text-telc-800 transition-colors">
                          {opt.title}
                        </h4>

                        <p className="mt-2 text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
                          {opt.text}
                        </p>

                        {opt.details && (
                          <div className="mt-4 inline-block text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 shadow-xs">
                            {opt.details}
                          </div>
                        )}
                      </div>

                      {/* Select button footer */}
                      <div className="mt-5 pt-4 border-t-2 border-slate-100">
                        <div
                          className={`w-full py-3 px-4 rounded-xl flex items-center justify-between text-sm font-black transition-all border-2 min-h-[48px] ${
                            isSelected
                              ? 'bg-telc-600 border-telc-700 text-white shadow-md'
                              : 'bg-slate-100 hover:bg-telc-50 text-slate-900 border-slate-300 hover:border-telc-400 shadow-xs'
                          }`}
                        >
                          <span>
                            {isSelected
                              ? `✓ Выбрана веб-страница [${opt.id.toUpperCase()}]`
                              : `Выбрать веб-страницу [${opt.id.toUpperCase()}]`}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                              isSelected
                                ? 'bg-white text-telc-700 shadow-xs'
                                : 'border-2 border-slate-400 text-transparent'
                            }`}
                          >
                            ✓
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
