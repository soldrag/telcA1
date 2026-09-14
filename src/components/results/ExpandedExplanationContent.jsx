import React from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import SchreibenSelfCheck from '../schreiben/SchreibenSelfCheck.jsx';
import ReviewTaskPrompt from './ReviewTaskPrompt.jsx';

function resolveExplanation(item, language) {
  if (language === 'ru') {
    return item.explanation_ru || item.explanation_en || item.explanation_de;
  }
  return item.explanation_en || item.explanation_de || item.explanation_ru;
}

function resolveWordTranslation(entry, language) {
  if (!entry) return '';
  const en = entry.translation_en;
  const ru = entry.translation_ru || entry.translation;
  return language === 'ru' ? (ru || en || '') : (en || ru || '');
}

function PedagogicalFeedback({ item, explanation, vocabularyList, language, t }) {
  return (
    <>
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

      {explanation && (
        <div className="bg-state-info-subtle border border-state-info-border rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-state-info-text font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-state-info" />
            <span>{t('results.whyExplanation')}</span>
          </div>
          <p className="text-xs sm:text-sm text-content-primary leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

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
                <span className="text-content-secondary">{resolveWordTranslation(entry, language)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ExpandedExplanationContent({ item, onScoreChange }) {
  const { t, language } = useI18n();
  const options = item.options_json;
  const vocabularyList = item.vocabulary_notes;
  const explanation = resolveExplanation(item, language);

  return (
    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-border-default bg-surface-card rounded-b-2xl space-y-4">
      {options?.type === 'essay' ? (
        <SchreibenSelfCheck item={item} onScoreChange={onScoreChange} />
      ) : (
        <ReviewTaskPrompt item={item} />
      )}

      <PedagogicalFeedback
        item={item}
        explanation={explanation}
        vocabularyList={vocabularyList}
        language={language}
        t={t}
      />
    </div>
  );
}
