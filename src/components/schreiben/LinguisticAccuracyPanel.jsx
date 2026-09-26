import React from 'react';
import { GraduationCap, Info } from 'lucide-react';
import {
  calculateLinguisticAccuracy,
  ACCURACY_BAND_THRESHOLDS,
  ACCURACY_REFERENCE_WORD_COUNT,
} from '../../services/schreiben/scoring/linguisticAccuracyScorer.js';
import { getGrammarProfile } from '../../services/schreiben/profiles/index.js';

const BAND_TONES = {
  excellent: 'bg-state-success',
  good: 'bg-action-primary',
  satisfactory: 'bg-state-warning',
  needs_practice: 'bg-state-error',
  unreadable: 'bg-state-error',
};
const MAX_SCORE = 10;
const LABELLED_CATEGORIES = new Set(['syntax', 'rektion', 'agreement', 'grammar', 'lexik', 'orthography', 'semantik']);

function ScaleBar({ score, t }) {
  const segments = ACCURACY_BAND_THRESHOLDS.map((b, i) => ({
    ...b,
    max: i === 0 ? MAX_SCORE : ACCURACY_BAND_THRESHOLDS[i - 1].min,
  })).concat({ band: 'needs_practice', min: 0, max: ACCURACY_BAND_THRESHOLDS.at(-1).min }).reverse();

  return (
    <div className="space-y-1">
      <div className="relative flex h-2 rounded-full overflow-hidden">
        {segments.map((s) => (
          <div key={s.band} className={`${BAND_TONES[s.band]} opacity-60`} style={{ width: `${((s.max - s.min) / MAX_SCORE) * 100}%` }} />
        ))}
        <div className="absolute top-[-3px] h-[14px] w-[3px] rounded bg-content-primary" style={{ left: `calc(${(score / MAX_SCORE) * 100}% - 1.5px)` }} />
      </div>
      <div className="flex text-[10px] text-content-muted">
        {segments.map((s) => (
          <span key={s.band} className="truncate" style={{ width: `${((s.max - s.min) / MAX_SCORE) * 100}%` }}>
            {s.min > 0 ? t('results.linguisticAccuracy.bandRange', { min: s.min }) : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryBreakdown({ byCategory, t }) {
  if (byCategory.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {byCategory.map(({ category, count, weight }) => (
        <span key={category} className="px-2 py-0.5 rounded-md bg-surface-inset border border-border-subtle text-[11px] text-content-secondary">
          {t('results.linguisticAccuracy.categoryItem', {
            label: t(`results.linguisticAccuracy.categories.${LABELLED_CATEGORIES.has(category) ? category : 'other'}`),
            count,
            weight,
          })}
        </span>
      ))}
    </div>
  );
}

/**
 * Pedagogical accuracy scale, kept visibly apart from the telc exam score it does not affect.
 * @param {{ grammarErrors: Array, wordCount: number, level?: string, t: Function }} props - wordCount: words of the letter body
 */
export default function LinguisticAccuracyPanel({ grammarErrors = [], wordCount = 0, level, t }) {
  const accuracy = calculateLinguisticAccuracy({ grammarErrors, wordCount, weights: getGrammarProfile(level).accuracyWeights });

  return (
    <div className="p-4 rounded-xl border border-border-default bg-surface-card space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-content-secondary">
            <GraduationCap className="w-4 h-4 text-action-primary flex-shrink-0" />
            <span>{t('results.linguisticAccuracy.title')}</span>
          </div>
          <p className="text-[11px] text-content-muted">{t('results.linguisticAccuracy.notExamScore')}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-black text-content-primary leading-none">
            {accuracy.score} <span className="text-xs text-content-muted">/ {accuracy.maxScore}</span>
          </div>
          <div className="text-[11px] font-semibold text-content-secondary">
            {t(`results.linguisticAccuracy.bands.${accuracy.band}`)}
          </div>
        </div>
      </div>

      <ScaleBar score={accuracy.score} t={t} />

      <p className="text-[11px] text-content-secondary">
        {t('results.linguisticAccuracy.summary', { errors: accuracy.errorCount, words: accuracy.wordCount })}
      </p>
      <CategoryBreakdown byCategory={accuracy.byCategory} t={t} />

      <details className="text-[11px] text-content-muted">
        <summary className="cursor-pointer inline-flex items-center space-x-1 font-semibold text-content-secondary">
          <Info className="w-3.5 h-3.5" />
          <span>{t('results.linguisticAccuracy.howComputed')}</span>
        </summary>
        <p className="mt-1.5 leading-snug">
          {t('results.linguisticAccuracy.formula', { reference: ACCURACY_REFERENCE_WORD_COUNT })}
        </p>
      </details>
    </div>
  );
}
