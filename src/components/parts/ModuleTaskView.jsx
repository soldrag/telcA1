import React from 'react';
import { Volume2, Check, X } from 'lucide-react';

function TaskOptionList({ options, selectedAnswer, isSubmitted, onSelectAnswer, questionId }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      {options.map((option) => {
        const isChecked = selectedAnswer.toLowerCase() === option.id.toLowerCase();
        return (
          <button
            key={option.id}
            type="button"
            disabled={isSubmitted}
            onClick={() => onSelectAnswer(questionId, option.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center space-x-3 min-h-[44px] cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              isChecked
                ? 'border-telc-600 bg-telc-50/80 text-telc-950 font-black shadow-sm ring-2 ring-telc-500/30'
                : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-900 font-bold shadow-xs'
            }`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black uppercase flex-shrink-0 ${
              isChecked ? 'bg-telc-700 text-white shadow-xs' : 'bg-slate-100 text-slate-800 border border-slate-300'
            }`}>
              {option.id}
            </span>
            <span className="text-sm sm:text-base leading-snug">{option.title || option.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function TaskBinaryOptions({ selectedAnswer, isSubmitted, onSelectAnswer, questionId }) {
  const binaryChoices = ['richtig', 'falsch'];

  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {binaryChoices.map((choiceValue) => {
        const isChecked = selectedAnswer.toLowerCase() === choiceValue;
        const isRichtig = choiceValue === 'richtig';
        const checkedStyle = isRichtig
          ? 'border-emerald-700 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
          : 'border-rose-700 bg-rose-600 text-white shadow-md ring-2 ring-rose-400/50';

        return (
          <button
            key={choiceValue}
            type="button"
            disabled={isSubmitted}
            onClick={() => onSelectAnswer(questionId, choiceValue)}
            className={`py-3 px-4 rounded-xl border-2 text-sm sm:text-base font-extrabold transition-all flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              isChecked ? checkedStyle : 'border-slate-300 bg-white hover:border-slate-400 text-slate-900 shadow-xs'
            }`}
          >
            {isRichtig ? (
              <Check className={`w-5 h-5 stroke-[2.5] ${isChecked ? 'text-white' : 'text-emerald-600'}`} />
            ) : (
              <X className={`w-5 h-5 stroke-[2.5] ${isChecked ? 'text-white' : 'text-rose-600'}`} />
            )}
            <span>{isRichtig ? 'Richtig (+)' : 'Falsch (-)'}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ModuleTaskView({
  questions = [],
  sessionState = {},
  activeTeil = 1,
  answers = sessionState.answers || {},
  onSelectAnswer = sessionState.onSelectAnswer || sessionState.selectAnswer,
  isSubmitted = sessionState.isSubmitted || false,
}) {
  const teilQuestions = questions.filter(question => question.teil === activeTeil);
  const displayQuestions = teilQuestions.length > 0 ? teilQuestions : questions;

  return (
    <div className="space-y-6">
      {displayQuestions.map((question) => {
        const selected = answers[question.id] || '';
        const hasOptions = Array.isArray(question.options_json) && question.options_json.length > 0;
        const isAnswered = Boolean(selected);

        return (
          <div
            key={question.id}
            id={`question-${question.id}`}
            className={`bg-white rounded-3xl border-2 transition-all p-4 sm:p-8 shadow-md space-y-5 ${
              isAnswered ? 'border-telc-400 bg-sky-50/20' : 'border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-telc-800 bg-telc-50 px-3 py-1 rounded border border-telc-200">
                  Aufgabe {question.question_number}
                </span>
                {question.title && <h3 className="text-xl font-black text-slate-950 mt-2">{question.title}</h3>}
                {question.situation && <p className="text-sm sm:text-base font-semibold text-slate-800 mt-1 leading-snug">{question.situation}</p>}
              </div>
            </div>

            {question.context_body && (
              <div className="p-5 bg-slate-50/90 rounded-2xl border-2 border-slate-200 text-base sm:text-xl text-slate-950 space-y-2 font-sans font-medium">
                {question.context_header && (
                  <div className="text-xs font-black uppercase tracking-wider text-telc-800 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-telc-700" />
                    <span>{question.context_header}</span>
                  </div>
                )}
                <p className="whitespace-pre-line leading-relaxed">{question.context_body}</p>
              </div>
            )}

            {question.statement && (
              <div className="text-base sm:text-xl font-bold text-slate-950 bg-sky-50/70 p-4 rounded-xl border-2 border-sky-200 leading-snug">
                {question.statement}
              </div>
            )}

            {hasOptions ? (
              <TaskOptionList
                options={question.options_json}
                selectedAnswer={selected}
                isSubmitted={isSubmitted}
                onSelectAnswer={onSelectAnswer}
                questionId={question.id}
              />
            ) : (
              <TaskBinaryOptions
                selectedAnswer={selected}
                isSubmitted={isSubmitted}
                onSelectAnswer={onSelectAnswer}
                questionId={question.id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
