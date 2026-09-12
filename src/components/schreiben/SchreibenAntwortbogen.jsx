import React from 'react';
import { FileSpreadsheet, Edit3, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenAntwortbogen({
  questions = [],
  answers = {},
  onSelectQuestion,
  isSubmitted = false,
}) {
  const { t } = useI18n();
  const teil1Questions = questions.filter((q) => q.teil === 1);
  const teil2Question = questions.find((q) => q.teil === 2) || questions[questions.length - 1];
  const essayText = teil2Question ? (answers[teil2Question.id] || '') : '';
  const essayWords = essayText.trim() ? essayText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="bg-surface-card rounded-2xl border-2 border-border-default p-4 sm:p-6 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b-2 border-border-strong pb-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-content-tertiary">
            Offizieller Prüfungsvordruck
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-content-primary uppercase tracking-tight">
            Antwortbogen S10 — Teil Schreiben
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold bg-surface-inset px-3 py-1 rounded border border-border-default">
          <FileSpreadsheet className="w-4 h-4 text-content-secondary" />
          <span className="text-content-primary">S10-SCHREIBEN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-action-primary flex items-center justify-between">
            <span>Teil 1 • Formular (1–5)</span>
            <span className="text-content-tertiary font-mono">5 Pkt</span>
          </div>

          <div className="space-y-2">
            {teil1Questions.map((q, idx) => {
              const val = answers[q.id] || '';
              const isFilled = Boolean(val.trim());
              const options = typeof q.options_json === 'string' ? JSON.parse(q.options_json || '{}') : (q.options_json || {});
              const label = options.form_label || `Feld ${q.question_number}`;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onSelectQuestion && onSelectQuestion(idx, q.id)}
                  className="w-full text-left p-2.5 rounded-xl border border-border-default bg-surface-inset hover:border-action-primary hover:bg-surface-card transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-action-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                      {q.question_number}
                    </span>
                    <span className="text-xs font-bold text-content-secondary truncate">
                      {label}:
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded truncate max-w-[140px] sm:max-w-[200px] ${
                    isFilled ? 'bg-action-primary-subtle text-action-primary' : 'text-content-muted italic'
                  }`}>
                    {val || '—'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-action-primary flex items-center justify-between">
            <span>Teil 2 • Brief / E-Mail (6)</span>
            <span className="text-content-tertiary font-mono">10 Pkt</span>
          </div>

          <div
            onClick={() => teil2Question && onSelectQuestion && onSelectQuestion(5, teil2Question.id)}
            className="p-3.5 rounded-xl border border-border-default bg-surface-inset hover:border-action-primary transition-all cursor-pointer space-y-2 min-h-[190px] flex flex-col justify-between"
          >
            <div className="text-xs font-mono text-content-primary whitespace-pre-line line-clamp-6 leading-relaxed">
              {essayText || (
                <span className="text-content-muted italic">
                  Noch kein Text eingegeben. Klicken Sie hier, um das Schreiben zu verfassen.
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs font-bold text-content-secondary">
              <span className="flex items-center space-x-1">
                <Edit3 className="w-3.5 h-3.5 text-action-primary" />
                <span>{essayWords} Wörter</span>
              </span>
              <span className="text-content-tertiary">Klicken zum Bearbeiten</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
