import React from 'react';
import { Award, AlertCircle } from 'lucide-react';
import { resolveTutorCriterionFeedback } from '../../services/schreiben/feedback/tutorFeedbackResolver.js';

export const CRITERIA_DEFINITIONS = [
  { id: 'anrede', label: 'Passende Anrede (z. B. Sehr geehrte Damen und Herren / Liebe ...)' },
  { id: 'lp1', label: 'Inhaltspunkt 1 verständlich bearbeitet' },
  { id: 'lp2', label: 'Inhaltspunkt 2 verständlich bearbeitet' },
  { id: 'lp3', label: 'Inhaltspunkt 3 verständlich bearbeitet' },
  { id: 'gruss', label: 'Passende Grußformel und Name am Schluss' },
];

export const CRITERIA_KEYS = ['anrede', 'lp1', 'lp2', 'lp3', 'gruss'];

function extractCriterionDiagnostic(critId, diagnosticData) {
  if (!diagnosticData) return {};
  if (critId === 'anrede') {
    return diagnosticData.diagnostic?.anrede || diagnosticData.anrede || {};
  }
  if (critId === 'gruss') {
    return diagnosticData.diagnostic?.gruss || diagnosticData.gruss || {};
  }
  const idx = critId === 'lp1' ? 0 : (critId === 'lp2' ? 1 : 2);
  const items = diagnosticData.diagnostic?.items || diagnosticData.items || [];
  return items[idx] || diagnosticData[critId] || {};
}

export default function SchreibenCriteriaChecklist({
  scores = {},
  onCycleScore,
  calculatedScore = 0,
  grammarPenalty = 0,
  currentErrorsCount = 0,
  diagnosticData = null,
  language = 'de',
  t = null,
}) {
  const headerTitle = t ? t('results.schreibenCriteria.title') : 'Kriterien-Checkliste (Selbstbewertung):';
  const scoreDisplay = t
    ? t('results.schreibenCriteria.scoreOutOf', { score: calculatedScore })
    : `${calculatedScore} / 10 Punkte`;
  const penaltyLabel = t
    ? t('results.schreibenCriteria.grammarPenalty', { count: currentErrorsCount })
    : `Abzug: Sprachliche Korrektheit (${currentErrorsCount} Grammatikfehler)`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold uppercase tracking-wider text-action-primary flex items-center space-x-2">
          <Award className="w-4 h-4" />
          <span>{headerTitle}</span>
        </div>
        <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-action-primary text-white">
          {scoreDisplay}
        </span>
      </div>

      <div className="space-y-2">
        {CRITERIA_DEFINITIONS.map((crit) => {
          const sc = scores[crit.id] || 0;
          const badgeColor = sc === 2
            ? 'bg-state-success text-white'
            : (sc === 1 ? 'bg-state-warning text-white' : 'bg-surface-raised text-content-muted');
          const critLabel = t ? (t(`results.schreibenCriteria.${crit.id}`) || crit.label) : crit.label;

          const diag = extractCriterionDiagnostic(crit.id, diagnosticData);
          const tutorNote = resolveTutorCriterionFeedback({
            criterionId: crit.id,
            score: sc,
            diagnosticCode: diag.diagnosticCode,
            matchedSentence: diag.matchedSentence || diag.text,
            language,
          });

          return (
            <div
              key={crit.id}
              className="w-full text-left p-3 rounded-lg border border-border-default bg-surface-card hover:border-action-primary transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onCycleScore?.(crit.id)}
                  className="flex-1 text-left cursor-pointer text-xs font-bold hover:text-action-primary transition-colors"
                >
                  <span className={sc > 0 ? 'text-content-primary' : 'text-content-muted'}>{critLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onCycleScore?.(crit.id)}
                  className={`font-mono text-[11px] px-2 py-0.5 rounded font-black transition-colors cursor-pointer flex-shrink-0 ${badgeColor}`}
                >
                  {sc} / 2 Pkt
                </button>
              </div>

              {tutorNote && (
                <div className="text-[11px] leading-relaxed text-content-secondary border-t border-border-subtle/50 pt-1.5 flex items-start space-x-1.5">
                  <span className="text-action-primary font-bold flex-shrink-0">💡</span>
                  <span>{tutorNote}</span>
                </div>
              )}
            </div>
          );
        })}

        {grammarPenalty > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-state-error-border bg-state-error-subtle/30 text-xs font-bold text-state-error">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-state-error flex-shrink-0" />
              <span>{penaltyLabel}</span>
            </div>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-state-error text-white font-black">
              -{grammarPenalty} Pkt
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
