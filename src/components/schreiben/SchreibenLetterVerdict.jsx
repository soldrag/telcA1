import React from 'react';
import SchreibenExaminerFeedbackCard from './SchreibenExaminerFeedbackCard.jsx';
import SchreibenCriteriaChecklist from './SchreibenCriteriaChecklist.jsx';
import { CARD_TITLE } from '../layout/typography.js';
import { formatPoints } from '../../utils/formatPoints.js';

function resolveLeitpunktTitles(item) {
  const options = item.options_json || {};
  return options.leitpunkte
    || item.leitpunkte
    || options.rubric?.leitpunkte_criteria?.map((c) => c.label)
    || item.criteria?.map((c) => c.label)
    || [];
}

/**
 * Teil 2 conclusion first, then the one criteria table (Leitpunkte + Anrede/Gruß).
 */
export default function SchreibenLetterVerdict({ item, selfCheck, t, language, className = '' }) {
  const { scores, cycleScore, teil2Score, diagnosticData, ai } = selfCheck;
  const fmt = (value) => formatPoints(value, language);

  return (
    <section aria-labelledby="letter-verdict-title" className={`rounded-2xl bg-surface-card border border-border-default p-4 sm:p-5 lg:p-6 space-y-4 max-lg:[&>h3+*]:!mt-0 ${className}`}>
      <h3 id="letter-verdict-title" className={`max-lg:sr-only ${CARD_TITLE}`}>
        {t('results.schreibenResult.letterTitle', { score: fmt(teil2Score.total), max: fmt(teil2Score.maxPoints) })}
      </h3>
      <SchreibenExaminerFeedbackCard
        examinerFeedback={ai.examinerFeedback}
        language={language}
        title={t('results.schreibenResult.verdictTitle')}
        findingsLabel={t('results.schreibenResult.findings')}
      />
      <SchreibenCriteriaChecklist
        scores={scores}
        onCycleScore={cycleScore}
        teil2Score={teil2Score}
        diagnosticData={diagnosticData}
        leitpunkteTitles={resolveLeitpunktTitles(item)}
        language={language}
        t={t}
      />
    </section>
  );
}
