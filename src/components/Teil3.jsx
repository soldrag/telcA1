import React from 'react';
import { FileText } from 'lucide-react';
import Teil3QuestionCard from './teil3/Teil3QuestionCard.jsx';

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
        {questions.map((question) => (
          <Teil3QuestionCard
            key={question.id}
            question={question}
            currentAnswer={answers[question.id]}
            isSubmitted={isSubmitted}
            onSelectAnswer={onSelectAnswer}
          />
        ))}
      </div>
    </div>
  );
}
