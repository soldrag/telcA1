import React from 'react';
import { AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { calculateLinguisticAccuracy } from '../../services/schreiben/scoring/linguisticAccuracyScorer.js';

function AccuracyBadge({ accuracy, t }) {
  return (
    <div className="flex items-center space-x-2 bg-surface-card px-2.5 py-1 rounded-lg border border-border-default">
      <Award className="w-3.5 h-3.5 text-action-primary flex-shrink-0" />
      <span className="text-[11px] font-semibold text-content-secondary">{t('results.linguisticAccuracy.title')}:</span>
      <span className="font-mono text-xs font-bold text-content-primary">
        {accuracy.score} / {accuracy.maxScore}
      </span>
      <span className="text-[10px] text-content-muted">({t(`results.linguisticAccuracy.bands.${accuracy.band}`)})</span>
    </div>
  );
}

/**
 * The accuracy badge is computed from the same error list it sits above, so edits and AI-added errors stay consistent.
 * @param {{ grammarErrors: Array, wordCount: number, t: Function }} props - wordCount: words of the letter body
 */
export default function SchreibenGrammarNotice({ grammarErrors = [], wordCount = 0, t }) {
  const accuracy = calculateLinguisticAccuracy({ grammarErrors, wordCount });

  if (grammarErrors.length === 0) {
    return (
      <div className="p-3.5 rounded-xl border border-state-success-border bg-state-success-subtle/20 flex items-center justify-between gap-2 flex-wrap text-xs font-bold text-state-success-text">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-state-success flex-shrink-0" />
          <span>{t('results.linguisticAccuracy.noErrors')}</span>
        </div>
        <AccuracyBadge accuracy={accuracy} t={t} />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-state-warning-border bg-state-warning-subtle/20 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center space-x-2 text-state-warning-text font-bold text-xs uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 text-state-warning flex-shrink-0" />
          <span>Sprachliche Korrektheit & Grammatik-Hinweise ({grammarErrors.length}):</span>
        </div>
        <AccuracyBadge accuracy={accuracy} t={t} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {grammarErrors.map((err, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-surface-card border border-border-default space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <span className="text-state-error line-through">{err.original}</span>
              <span className="text-content-muted">➔</span>
              <span className="text-state-success">{err.correction}</span>
            </div>
            <p className="text-content-secondary text-[11px] leading-snug">{err.explanation}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-content-muted italic leading-tight">
        {t('results.linguisticAccuracy.hint')}
      </p>
    </div>
  );
}
