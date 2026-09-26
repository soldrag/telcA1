import React from 'react';
import { Award, Info } from 'lucide-react';
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
  if (critId === 'anrede') {
    return diagnosticData.diagnostic?.anrede || diagnosticData.anrede || {};
  }
  if (critId === 'gruss') {
    return diagnosticData.diagnostic?.gruss || diagnosticData.gruss || {};
  }
  const idx = LEITPUNKT_IDS.indexOf(critId);
  const items = diagnosticData.diagnostic?.items || diagnosticData.items || [];
  return items[idx] || diagnosticData[critId] || {};
}

function translate(t, key, fallback, params) {
  return t ? (t(`results.schreibenCriteria.${key}`, params) || fallback) : fallback;
}

function resolveLpTitle(idx, diag, titles) {
  const raw = titles?.[idx] || diag?.label || diag?.title || '';
  return typeof raw === 'string' ? raw.replace(/^\d+[\.\)]\s*/, '').trim() : '';
}

function resolveCriterionLabel(id, idx, diag, titles, t, language) {
  if (LEITPUNKT_IDS.includes(id)) {
    const title = resolveLpTitle(idx, diag, titles);
    if (title) {
      if (t) {
        return t('results.schreibenCriteria.lpTemplate', { index: idx + 1, title });
      }
      const prefix = language === 'ru' ? 'Пункт' : (language === 'en' ? 'Point' : 'Punkt');
      return `${prefix} ${idx + 1}: ${title}`;
    }
  }
  return translate(t, id, CRITERIA_DEFINITIONS.find((c) => c.id === id)?.label);
}

export default function SchreibenCriteriaChecklist({
  scores = {},
  onCycleScore,
  teil2Score,
  diagnosticData = null,
  leitpunkteTitles = [],
  language = 'de',
  t = null,
}) {
  const fmt = (value) => formatPoints(value, language);
  const rowProps = (id, idx) => {
    const diag = extractCriterionDiagnostic(id, diagnosticData);
    return {
      criterionId: id,
      label: resolveCriterionLabel(id, idx, diag, leitpunkteTitles, t, language),
      level: Number(scores[id]) || 0,
      diagnostic: diag,
      onCycle: onCycleScore,
      language,
    };
  };
  const { leitpunkte = [], kg = { points: 0, maxPoints: 1 }, total = 0, maxPoints = 10 } = teil2Score || {};
  const scoreDisplay = translate(t, 'scoreOutOf', `${fmt(total)} / ${fmt(maxPoints)} Punkte`, { score: fmt(total), max: fmt(maxPoints) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold uppercase tracking-wider text-action-primary flex items-center space-x-2">
          <Award className="w-4 h-4" />
          <span>{translate(t, 'title', 'Kriterien-Checkliste (Selbstbewertung):')}</span>
        </div>
        <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-action-primary text-white">
          {scoreDisplay}
        </span>
      </div>

      <div className="space-y-2">
        {LEITPUNKT_IDS.map((id, idx) => (
          <SchreibenCriterionRow
            key={id}
            {...rowProps(id, idx)}
            badgeText={`${fmt(leitpunkte[idx]?.points ?? 0)} / ${fmt(leitpunkte[idx]?.maxPoints ?? 3)} Pkt`}
          />
        ))}

        <div className="p-2.5 rounded-lg border border-border-default bg-surface-inset space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-content-primary">
            <span>{translate(t, 'kg', 'Kommunikative Gestaltung (Anrede + Gruß)')}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-action-primary text-white font-black">
              {fmt(kg.points)} / {fmt(kg.maxPoints)} Pkt
            </span>
          </div>
          {FRAMING_IDS.map((id) => (
            <SchreibenCriterionRow key={id} {...rowProps(id, -1)} badgeText={FRAMING_LEVEL_MARK[Number(scores[id]) || 0]} />
          ))}
        </div>

        <div className="flex items-start space-x-2 text-[11px] text-content-secondary px-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{translate(t, 'grammarNotScored', 'Grammatik wird nicht separat bewertet: Fehler zählen nur, wenn sie das Verständnis stören.')}</span>
        </div>
      </div>
    </div>
  );
}
