import React, { useState } from 'react';
import { CheckSquare, Square, Award, BookCheck, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const DEFAULT_CRITERIA = [
  { id: 'anrede', label: 'Passende Anrede (z. B. Sehr geehrte Damen und Herren, / Liebe ...)', points: 2 },
  { id: 'lp1', label: 'Inhaltspunkt 1 verständlich bearbeitet', points: 2 },
  { id: 'lp2', label: 'Inhaltspunkt 2 verständlich bearbeitet', points: 2 },
  { id: 'lp3', label: 'Inhaltspunkt 3 verständlich bearbeitet', points: 2 },
  { id: 'gruss', label: 'Passende Grußformel und Name am Schluss', points: 2 },
];

export default function SchreibenSelfCheck({ item = {} }) {
  const { t } = useI18n();
  const options = item.options_json || {};
  const sampleSolution = options.sample_solution || item.clue_quote;
  const breakdown = options.breakdown || [];

  const initialChecked = {
    anrede: (item.word_count || 0) >= 15,
    lp1: (item.word_count || 0) >= 15,
    lp2: (item.word_count || 0) >= 20,
    lp3: (item.word_count || 0) >= 25,
    gruss: (item.word_count || 0) >= 15,
  };

  const [checkedState, setCheckedState] = useState(initialChecked);

  const toggleCheck = (id) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculatedScore = DEFAULT_CRITERIA.reduce((acc, c) => acc + (checkedState[c.id] ? c.points : 0), 0);

  return (
    <div className="space-y-5 pt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border-default bg-surface-inset space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-action-primary flex items-center justify-between">
            <span>Ihr eingereichter Text</span>
            <span className="text-content-secondary font-mono">{item.word_count || 0} Wörter</span>
          </div>
          <div className="text-sm font-sans text-content-primary whitespace-pre-line leading-relaxed">
            {item.user_answer || <span className="italic text-content-muted">Kein Text eingereicht</span>}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-state-success-border bg-state-success-subtle/30 space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-state-success-text flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>telc A1 Musterlösung (Beispiel)</span>
          </div>
          <div className="text-sm font-sans text-content-primary whitespace-pre-line leading-relaxed font-medium">
            {sampleSolution}
          </div>
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="p-3.5 rounded-xl border border-border-default bg-surface-card space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-content-secondary flex items-center space-x-1.5">
            <BookCheck className="w-3.5 h-3.5 text-action-primary" />
            <span>Struktur-Aufbau nach telc Kriterien:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {breakdown.map((b, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-surface-inset border border-border-subtle">
                <span className="font-extrabold text-action-primary">{b.label}: </span>
                <span className="text-content-primary">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border-2 border-action-primary-border bg-action-primary-subtle/30 space-y-3">
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
          {DEFAULT_CRITERIA.map((criterion) => {
            const isChecked = checkedState[criterion.id];
            return (
              <button
                key={criterion.id}
                type="button"
                onClick={() => toggleCheck(criterion.id)}
                className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border bg-surface-card hover:border-action-primary transition-all cursor-pointer text-xs font-bold"
              >
                <div className="flex items-center space-x-2.5">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-state-success flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-content-muted flex-shrink-0" />
                  )}
                  <span className={isChecked ? 'text-content-primary' : 'text-content-muted'}>
                    {criterion.label}
                  </span>
                </div>
                <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${isChecked ? 'bg-state-success-subtle text-state-success-text' : 'text-content-muted'}`}>
                  +{criterion.points} Pkt
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
