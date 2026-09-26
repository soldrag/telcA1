import React, { useState } from 'react';
import { buildLetterHighlights } from '../../utils/letterHighlights.js';
import { getCriterionColor } from './criterionColors.js';

const LEITPUNKT_IDS = ['lp1', 'lp2', 'lp3'];
const TEXT_CLASS = 'text-[17px] leading-[1.6] text-content-primary whitespace-pre-line';

// Only phrases that actually earned points are marked, so the colours explain the score.
function collectMarks(diagnosticData, scores) {
  const diagnostic = diagnosticData?.diagnostic || diagnosticData || {};
  const items = diagnostic.items || [];
  const leitpunktMarks = LEITPUNKT_IDS
    .map((key, idx) => ({ key, text: Number(scores[key]) > 0 ? items[idx]?.matchedSentence : '' }));
  const frameMarks = ['anrede', 'gruss'].map((key) => ({ key: 'frame', text: diagnostic[key]?.text }));
  return [...leitpunktMarks, ...frameMarks];
}

function HighlightedLetter({ text, marks }) {
  return buildLetterHighlights(text, marks).map((piece, idx) => (piece.key ? (
    <mark key={idx} className={`bg-transparent text-inherit underline decoration-2 underline-offset-4 rounded-sm ${getCriterionColor(piece.key).mark}`}>
      {piece.text}
    </mark>
  ) : <React.Fragment key={idx}>{piece.text}</React.Fragment>));
}

function ViewToggle({ view, onChange, labels }) {
  return (
    <div className="md:hidden grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-inset">
      {['user', 'sample'].map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={view === key}
          onClick={() => onChange(key)}
          className={`min-h-[44px] rounded-lg text-sm font-semibold cursor-pointer transition-colors ${view === key ? 'bg-surface-card text-content-primary shadow-xs' : 'text-content-secondary'}`}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}

/**
 * The candidate's letter and the telc sample: a toggle below 768 px, side by side from 768 px.
 * Credited phrases are marked in the candidate's text.
 */
export default function SchreibenLetterTexts({ item, selfCheck, t, className = '' }) {
  const [view, setView] = useState('user');
  const sample = item.options_json?.sample_solution || item.clue_quote;
  const labels = {
    user: t('results.schreibenResult.yourText', { count: item.word_count || 0 }),
    sample: t('results.schreibenResult.sampleText'),
  };
  const panelClass = (key) => `${view === key ? 'block' : 'hidden'} md:block min-w-0 rounded-2xl bg-surface-card border border-border-default p-4 sm:p-5 space-y-2`;

  return (
    <section className={`flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start ${className}`}>
      {sample && <ViewToggle view={view} onChange={setView} labels={labels} />}
      <div className={panelClass('user')}>
        <h4 className="hidden md:block text-sm font-semibold text-content-secondary">{labels.user}</h4>
        <div lang="de" className={TEXT_CLASS}>
          {item.user_answer
            ? <HighlightedLetter text={item.user_answer} marks={collectMarks(selfCheck.diagnosticData, selfCheck.scores)} />
            : <span className="text-content-muted">{t('results.noAnswer')}</span>}
        </div>
      </div>
      {sample && (
        <div className={panelClass('sample')}>
          <h4 className="hidden md:block text-sm font-semibold text-content-secondary">{labels.sample}</h4>
          <div lang="de" className={TEXT_CLASS}>{sample}</div>
        </div>
      )}
    </section>
  );
}
