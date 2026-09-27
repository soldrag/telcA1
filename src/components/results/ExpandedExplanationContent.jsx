import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { seedData } from '../../../src/data/exams/seedData.js';
import SchreibenSelfCheck from '../schreiben/SchreibenSelfCheck.jsx';
import ReviewTaskPrompt from './ReviewTaskPrompt.jsx';
import VocabularyList from './VocabularyList.jsx';

const questionLookup = new Map((seedData?.questions || []).map(q => [q.id, q]));

function resolveExplanation(item, language, live) {
  if (language === 'ru') {
    return item.explanation_ru || live?.explanation_ru || item.explanation_en || live?.explanation_en || item.explanation_de;
  }
  return item.explanation_en || live?.explanation_en || item.explanation_de || live?.explanation_de || item.explanation_ru;
}

function PedagogicalFeedback({ item, explanation, vocabularyList, language, live, t }) {
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

      <VocabularyList entries={vocabularyList} liveNotes={live?.vocabulary_notes} language={language} title={t('results.usefulWords')} />
    </>
  );
}

export default function ExpandedExplanationContent({ item, onScoreChange }) {
  const { t, language } = useI18n();
  const live = questionLookup.get(item.id);
  const options = item.options_json || live?.options_json;
  const vocabularyList = item.vocabulary_notes || live?.vocabulary_notes;
  const explanation = resolveExplanation(item, language, live);

  const isEssay = options?.type === 'essay';

  return (
    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-border-default bg-surface-card rounded-b-2xl space-y-4">
      {isEssay ? (
        <SchreibenSelfCheck item={item} onScoreChange={onScoreChange} />
      ) : (
        <>
          <ReviewTaskPrompt item={item} />
          <PedagogicalFeedback
            item={item}
            explanation={explanation}
            vocabularyList={vocabularyList}
            language={language}
            live={live}
            t={t}
          />
        </>
      )}
    </div>
  );
}
