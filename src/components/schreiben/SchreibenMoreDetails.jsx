import React from 'react';
import { ChevronDown } from 'lucide-react';
import LinguisticAccuracyPanel from './LinguisticAccuracyPanel.jsx';
import SchreibenGrammarNotice from './SchreibenGrammarNotice.jsx';
import SchreibenAiControlBar from './SchreibenAiControlBar.jsx';
import SchreibenAiDisclaimer from './SchreibenAiDisclaimer.jsx';
import SchreibenRankerDetailsCard from './SchreibenRankerDetailsCard.jsx';
import VocabularyList from '../results/VocabularyList.jsx';
import { countLetterBodyWords } from '../../services/schreiben/scoring/letterBodyWordCounter.js';
import { isDebugView } from '../../utils/debugFlag.js';
import { getTestTypeById } from '../../../shared/testTypes.js';

function DebugPanels({ diagnosticData, language }) {
  return <SchreibenRankerDetailsCard diagnosticData={diagnosticData} language={language} />;
}

/**
 * Everything secondary to the exam score: grammar hints, the learning accuracy scale,
 * how the score is computed and, with ?debug, how each task point was read.
 */
export default function SchreibenMoreDetails({ item, selfCheck, t, language, className = '' }) {
  const { liveGrammarErrors, teil2Score, diagnosticData, ai } = selfCheck;
  const contentMissing = teil2Score.leitpunkte.every((lp) => !lp.points);
  const module = getTestTypeById('schreiben');

  return (
    <details className={`group rounded-2xl bg-surface-card border border-border-default ${className}`}>
      <summary className="list-none cursor-pointer min-h-[3.25rem] px-4 sm:px-5 flex items-center justify-between gap-3 text-sm font-semibold text-content-primary [&::-webkit-details-marker]:hidden">
        {t('results.schreibenResult.moreDetails')}
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
        <p className="text-sm text-content-secondary leading-relaxed">
          {t('results.schreibenResult.howScored', { pass: module.passScore, max: module.maxScore })}
        </p>
        <SchreibenGrammarNotice grammarErrors={liveGrammarErrors} t={t} />
        <LinguisticAccuracyPanel
          grammarErrors={liveGrammarErrors}
          wordCount={countLetterBodyWords(item.user_answer)}
          level={item.level}
          contentMissing={contentMissing}
          t={t}
        />
        <VocabularyList entries={item.vocabulary_notes} language={language} title={t('results.usefulWords')} />
        <SchreibenAiControlBar aiLoading={ai.aiLoading} gradingMode={ai.gradingMode} />
        {isDebugView() && <DebugPanels diagnosticData={diagnosticData} language={language} />}
        <SchreibenAiDisclaimer />
      </div>
    </details>
  );
}
