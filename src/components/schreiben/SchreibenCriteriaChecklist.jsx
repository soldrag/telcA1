import React from 'react';
import { Award, AlertCircle } from 'lucide-react';

export const CRITERIA_DEFINITIONS = [
  { id: 'anrede', label: 'Passende Anrede (z. B. Sehr geehrte Damen und Herren / Liebe ...)' },
  { id: 'lp1', label: 'Inhaltspunkt 1 verständlich bearbeitet' },
  { id: 'lp2', label: 'Inhaltspunkt 2 verständlich bearbeitet' },
  { id: 'lp3', label: 'Inhaltspunkt 3 verständlich bearbeitet' },
  { id: 'gruss', label: 'Passende Grußformel und Name am Schluss' },
];

export const CRITERIA_KEYS = ['anrede', 'lp1', 'lp2', 'lp3', 'gruss'];

export default function SchreibenCriteriaChecklist({
  scores,
  onCycleScore,
  calculatedScore,
  grammarPenalty,
  currentErrorsCount,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold uppercase tracking-wider text-action-primary flex items-center space-x-2">
          <Award className="w-4 h-4" />
          <span>Kriterien-Checkliste (Selbstbewertung):</span>
        </div>
        <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-action-primary text-white">
          {calculatedScore} / 10 Punkte
        </span>
      </div>

      <div className="space-y-2">
        {CRITERIA_DEFINITIONS.map((crit) => {
          const sc = scores[crit.id] || 0;
          const badgeColor = sc === 2 
            ? 'bg-state-success text-white' 
            : (sc === 1 ? 'bg-state-warning text-white' : 'bg-surface-raised text-content-muted');
          return (
            <button
              key={crit.id}
              type="button"
              onClick={() => onCycleScore(crit.id)}
              className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border bg-surface-card hover:border-action-primary transition-all cursor-pointer text-xs font-bold"
            >
              <span className={sc > 0 ? 'text-content-primary' : 'text-content-muted'}>{crit.label}</span>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-black transition-colors ${badgeColor}`}>
                {sc} / 2 Pkt
              </span>
            </button>
          );
        })}

        {grammarPenalty > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-state-error-border bg-state-error-subtle/30 text-xs font-bold text-state-error">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-state-error flex-shrink-0" />
              <span>Abzug: Sprachliche Korrektheit ({currentErrorsCount} Grammatikfehler)</span>
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
