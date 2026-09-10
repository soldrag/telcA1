import React from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';

export default function ExpandedExplanationContent({ item }) {
  const options = item.options_json;
  const vocabularyList = item.vocabulary_notes;

  return (
    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-200/80 bg-white rounded-b-2xl space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans text-slate-800 whitespace-pre-line leading-relaxed">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          Исходный фрагмент текста:
        </div>
        {item.context_body || (
          options?.map((option) => (
            <div
              key={option.id}
              className={`p-2 rounded mb-2 ${
                option.id === item.correct_answer ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100'
              }`}
            >
              <strong>[{option.id.toUpperCase()}] {option.title}</strong>
              <p className="text-xs text-slate-600 mt-0.5">{option.text}</p>
            </div>
          ))
        )}
      </div>

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

      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-sky-700" />
          <span>Почему именно такой ответ? (Разбор на русском)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          {item.explanation_ru}
        </p>
      </div>

      {vocabularyList && vocabularyList.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Полезные слова уровня A1 из этого задания:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {vocabularyList.map((entry, index) => (
              <div key={index} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-900">{entry.word}</span>
                <span className="text-slate-500 mx-1">—</span>
                <span className="text-slate-700">{entry.translation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
