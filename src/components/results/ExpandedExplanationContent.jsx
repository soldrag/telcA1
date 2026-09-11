import React from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

function resolveExplanation(item, language) {
  if (language === 'ru') {
    return item.explanation_ru || item.explanation_en || item.explanation_de;
  }
  return item.explanation_en || item.explanation_de || item.explanation_ru;
}

export default function ExpandedExplanationContent({ item }) {
  const { t, language } = useI18n();
  const options = item.options_json;
  const vocabularyList = item.vocabulary_notes;
  const explanation = resolveExplanation(item, language);

  return (
    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-border-default bg-surface-card rounded-b-2xl space-y-4">
      <div className="bg-surface-inset p-4 rounded-xl border border-border-default text-xs sm:text-sm font-sans text-content-primary whitespace-pre-line leading-relaxed">
        <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-1">
          {t('results.originalText')}
        </div>
        {item.context_body || (
          options?.map((option) => (
            <div
              key={option.id}
              className={`p-2 rounded-lg mb-2 ${
                option.id === item.correct_answer
                  ? 'bg-state-success-subtle border border-state-success-border text-state-success-text'
                  : 'bg-surface-raised text-content-primary'
              }`}
            >
              <strong>[{option.id.toUpperCase()}] {option.title}</strong>
              <p className="text-xs text-content-secondary mt-0.5">{option.text}</p>
            </div>
          ))
        )}
      </div>

      {item.clue_quote && (
        <div className="bg-state-warning-subtle border-l-4 border-state-warning p-3 rounded-r-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-state-warning-text">
            {t('results.clueQuote')}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-state-warning-text mt-0.5 italic">
            «{item.clue_quote}»
          </div>
        </div>
      )}

      <div className="bg-state-info-subtle border border-state-info-border rounded-xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-state-info-text font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-state-info" />
          <span>{t('results.whyExplanation')}</span>
        </div>
        <p className="text-xs sm:text-sm text-content-primary leading-relaxed">
          {explanation}
        </p>
      </div>

      {vocabularyList && vocabularyList.length > 0 && (
        <div className="bg-surface-inset rounded-xl p-3 border border-border-default">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-content-secondary mb-2">
            <BookOpen className="w-4 h-4 text-action-primary" />
            <span>{t('results.usefulWords')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {vocabularyList.map((entry, index) => (
              <div key={index} className="bg-surface-card px-3 py-1.5 rounded-lg border border-border-subtle text-xs">
                <span className="font-bold text-content-primary">{entry.word}</span>
                <span className="text-content-muted mx-1">—</span>
                <span className="text-content-secondary">{entry.translation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
