import React from 'react';
import { Check, Mail, Globe, FileText } from 'lucide-react';

export default function QuestionNav({
  questions = [],
  answers = {},
  activeTeil,
  setActiveTeil,
  activeQuestionIndex,
  onSelectQuestion,
  results = null,
}) {
  const teilGroups = [
    { teil: 1, label: 'Teil 1 (1–5)', sublabel: 'E-Mails & Briefe', icon: Mail, questions: questions.filter(q => q.teil === 1) },
    { teil: 2, label: 'Teil 2 (6–10)', sublabel: 'Webseiten / Anzeigen', icon: Globe, questions: questions.filter(q => q.teil === 2) },
    { teil: 3, label: 'Teil 3 (11–15)', sublabel: 'Schilder & Zettel', icon: FileText, questions: questions.filter(q => q.teil === 3) },
  ];

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-4 shadow-sm space-y-4">
      {/* Teil Switcher */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {teilGroups.map((g) => {
          const Icon = g.icon;
          const isSelected = activeTeil === g.teil;
          const answeredInTeil = g.questions.filter(q => answers[q.id]).length;
          const totalInTeil = g.questions.length;

          return (
            <button
              key={g.teil}
              type="button"
              onClick={() => setActiveTeil(g.teil)}
              aria-current={isSelected ? 'step' : undefined}
              className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] ${
                isSelected
                  ? 'bg-telc-50 border-telc-600 text-telc-950 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 mb-0.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-telc-700 stroke-[2.5]' : 'text-slate-600'}`} />
                <span className="text-xs sm:text-sm font-extrabold leading-tight">{g.label}</span>
              </div>
              <span className="text-xs text-slate-600 font-semibold">{g.sublabel}</span>
              <div className="mt-1 flex items-center space-x-1">
                <span className={`text-xs px-2 py-1 rounded-full font-black ${
                  answeredInTeil === totalInTeil && totalInTeil > 0
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : isSelected
                      ? 'bg-telc-200/80 text-telc-900'
                      : 'bg-slate-200 text-slate-800'
                }`}>
                  {answeredInTeil}/{totalInTeil}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 1-15 Quick Question Circles */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto px-2 py-2 scrollbar-thin">
        {questions.map((q, idx) => {
          const isAnswered = Boolean(answers[q.id]);
          const isCurrent = activeQuestionIndex === idx;

          let badgeClass = 'bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-500 font-bold';
          if (results) {
            const item = results.reviewItems?.find(r => r.id === q.id);
            if (item?.is_correct) {
              badgeClass = 'bg-emerald-600 text-white border-2 border-emerald-700 font-black shadow-xs';
            } else {
              badgeClass = 'bg-rose-600 text-white border-2 border-rose-700 font-black shadow-xs';
            }
          } else if (isAnswered) {
            badgeClass = 'bg-telc-800 text-white border-2 border-telc-900 font-black shadow-xs';
          }

          if (isCurrent && !results) {
            badgeClass += ' ring-2 ring-telc-600 ring-offset-2 scale-105 z-10 shadow-sm';
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setActiveTeil(q.teil);
                onSelectQuestion(idx, q.id);
              }}
              className={`flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${badgeClass}`}
              title={`Aufgabe ${q.question_number} (${isAnswered ? `Ответ: ${answers[q.id].toUpperCase()}` : 'Без ответа'})`}
            >
              {q.question_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
