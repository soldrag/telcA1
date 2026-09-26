import React from 'react';
import SchreibenCriterionRow from './SchreibenCriterionRow.jsx';
import { formatPoints } from '../../utils/formatPoints.js';

export const CRITERIA_DEFINITIONS = [
  { id: 'anrede', label: 'Passende Anrede (z. B. Sehr geehrte Damen und Herren / Liebe ...)' },
  { id: 'lp1', label: 'Inhaltspunkt 1 verständlich bearbeitet' },
  { id: 'lp2', label: 'Inhaltspunkt 2 verständlich bearbeitet' },
  { id: 'lp3', label: 'Inhaltspunkt 3 verständlich bearbeitet' },
  { id: 'gruss', label: 'Passende Grußformel und Name am Schluss' },
];

export const CRITERIA_KEYS = ['anrede', 'lp1', 'lp2', 'lp3', 'gruss'];

const LEITPUNKT_IDS = ['lp1', 'lp2', 'lp3'];
const FRAMING_IDS = ['anrede', 'gruss'];
const FRAMING_LEVEL_MARK = { 2: '✓', 1: '~', 0: '✗' };

function extractCriterionDiagnostic(critId, diagnosticData) {
  if (!diagnosticData) return {};
  if (FRAMING_IDS.includes(critId)) {
    return diagnosticData.diagnostic?.[critId] || diagnosticData[critId] || {};
  }
  const idx = LEITPUNKT_IDS.indexOf(critId);
  const items = diagnosticData.diagnostic?.items || diagnosticData.items || [];
  return items[idx] || diagnosticData[critId] || {};
}

function resolveLpTitle(idx, diag, titles) {
  const raw = titles?.[idx] || diag?.label || diag?.title || '';
  return typeof raw === 'string' ? raw.replace(/^\d+[\.\)]\s*/, '').trim() : '';
}

function resolveCriterionLabel(id, idx, diag, titles, t) {
  const title = LEITPUNKT_IDS.includes(id) ? resolveLpTitle(idx, diag, titles) : '';
  if (title) return t('results.schreibenCriteria.lpTemplate', { index: idx + 1, title });
  return t(`results.schreibenCriteria.${id}`);
}

/**
 * The single criteria table of the letter: three Leitpunkte plus Anrede/Gruß, on the official telc scale.
 */
export default function SchreibenCriteriaChecklist({
  scores = {},
  onCycleScore,
  teil2Score,
  diagnosticData = null,
  leitpunkteTitles = [],
  language = 'de',
  t,
}) {
  const fmt = (value) => formatPoints(value, language);
  const rowProps = (id, idx) => {
    const diag = extractCriterionDiagnostic(id, diagnosticData);
    return {
      criterionId: id,
      label: resolveCriterionLabel(id, idx, diag, leitpunkteTitles, t),
      level: Number(scores[id]) || 0,
      diagnostic: diag,
      onCycle: onCycleScore,
      language,
      cycleHint: t('results.schreibenCriteria.cycleHint'),
    };
  };
  const { leitpunkte = [], kg = { points: 0, maxPoints: 1 } } = teil2Score || {};

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-content-secondary">{t('results.schreibenCriteria.title')}</h4>
      <ul className="divide-y divide-border-subtle">
        {LEITPUNKT_IDS.map((id, idx) => (
          <SchreibenCriterionRow
            key={id}
            {...rowProps(id, idx)}
            badgeText={`${fmt(leitpunkte[idx]?.points ?? 0)}/${fmt(leitpunkte[idx]?.maxPoints ?? 3)}`}
          />
        ))}
        <li className="pt-2">
          <div className="flex items-center justify-between gap-3 px-2 text-sm font-medium text-content-primary">
            <span>{t('results.schreibenCriteria.kg')}</span>
            <span className="font-semibold tabular-nums">{fmt(kg.points)}/{fmt(kg.maxPoints)}</span>
          </div>
          <ul className="pl-3">
            {FRAMING_IDS.map((id) => (
              <SchreibenCriterionRow key={id} {...rowProps(id, -1)} badgeText={FRAMING_LEVEL_MARK[Number(scores[id]) || 0]} />
            ))}
          </ul>
        </li>
      </ul>
      <p className="px-2 text-sm text-content-muted">{t('results.schreibenCriteria.grammarNotScored')}</p>
    </div>
  );
}
