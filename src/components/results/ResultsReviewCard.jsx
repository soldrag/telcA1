import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronUp, HelpCircle, BookOpen } from 'lucide-react';

export default function ResultsReviewCard({ item, isExpanded, onToggleExpand }) {
  const cardBorderClass = item.is_correct
    ? 'border-emerald-200 bg-emerald-50/20'
    : 'border-rose-200 bg-rose-50/20';

  return (
    <div className={`rounded-2xl border transition-all ${cardBorderClass}`}>
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
      >
        <div className="flex items-start sm:items-center space-x-3">
          <div className="mt-0.5 sm:mt-0 flex-shrink-0">
            {item.is_correct ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-extrabold text-sm text-slate-800">
                Aufgabe {item.question_number}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Teil {item.teil}
              </span>
              {!item.is_correct && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Ошибка
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium line-clamp-1 sm:line-clamp-none">
              {item.statement || item.situation}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            <span className="text-slate-500 hidden md:inline">Ваш ответ:</span>
            <span className={`px-2 py-1 rounded border uppercase ${
              item.is_correct
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300 line-through'
            }`}>
              {item.user_answer || 'Нет ответа'}
            </span>

            {!item.is_correct && (
              <>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="px-2 py-1 rounded border bg-emerald-600 text-white border-emerald-700 uppercase">
                  {item.correct_answer}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors font-semibold text-xs">
            <span>Разбор</span>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {isExpanded && <ExpandedExplanationContent item={item} />}
    </div>
  );
}

function ExpandedExplanationContent({ item }) {
  return (
    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-200/80 bg-white rounded-b-2xl space-y-4">
      {/* Excerpt */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans text-slate-800 whitespace-pre-line leading-relaxed">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          Исходный фрагмент текста:
        </div>
        {item.context_body || (
          item.options_json?.map((opt) => (
            <div
              key={opt.id}
              className={`p-2 rounded mb-2 ${
                opt.id === item.correct_answer ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100'
              }`}
            >
              <strong>[{opt.id.toUpperCase()}] {opt.title}</strong>
              <p className="text-xs text-slate-600 mt-0.5">{opt.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Clue quote */}
      {item.clue_quote && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Ключевая фраза в тексте (Подсказка):
          </div>
          <div className="text-xs sm:text-sm font-semibold text-amber-950 mt-0.5 italic">
            «{item.clue_quote}»
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-sky-700" />
          <span>Почему именно такой ответ? (Разбор на русском)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          {item.explanation_ru}
        </p>
      </div>

      {/* Vocabulary */}
      {item.vocabulary_notes?.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Полезные слова уровня A1 из этого задания:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {item.vocabulary_notes.map((voc, idx) => (
              <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-900">{voc.word}</span>
                <span className="text-slate-500 mx-1">—</span>
                <span className="text-slate-700">{voc.translation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
