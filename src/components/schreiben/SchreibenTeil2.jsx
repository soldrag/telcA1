import React from 'react';
import { Mail, CheckCircle, Lightbulb } from 'lucide-react';
import SchreibenWordCounter from './SchreibenWordCounter.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenTeil2({
  question = {},
  session = {},
  answers = session.answers || {},
  onSelectAnswer = session.selectAnswer,
  isSubmitted = session.isSubmitted || false,
}) {
  const { t } = useI18n();
  const textValue = answers[question.id] || '';
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});
  const leitpunkte = options.leitpunkte || [
    'Grund für Ihr Schreiben',
    'Termin und Details',
    'Frage oder Bitte um Antwort',
  ];

  const handleCharInsert = (char) => {
    if (isSubmitted) return;
    onSelectAnswer(question.id, textValue + char);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface-card p-4 sm:p-5 rounded-2xl border-2 border-border-default shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-action-primary-subtle text-action-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-content-primary">
              Teil 2 • E-Mail / Brief schreiben
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary font-medium">
              {t('exam.schreibenPart2Instruction') || 'Schreiben Sie eine E-Mail (ca. 30 Wörter) zu allen 3 Punkten.'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-action-primary-subtle text-action-primary border border-action-primary-border">
          10 Punkte
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-card rounded-2xl border-2 border-border-default p-5 sm:p-6 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-action-primary">
              Aufgabenstellung
            </div>
            <p className="text-sm sm:text-base font-bold text-content-primary leading-snug">
              {question.situation}
            </p>

            <div className="space-y-2 pt-2 border-t border-border-default">
              <div className="text-xs font-black uppercase tracking-wider text-content-secondary">
                Leitpunkte (schreiben Sie zu allen 3 Punkten):
              </div>
              <div className="space-y-2">
                {leitpunkte.map((lp, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-2.5 bg-surface-inset rounded-xl border border-border-default text-xs sm:text-sm font-medium text-content-primary">
                    <span className="w-5 h-5 rounded-full bg-action-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{lp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-state-info-subtle border border-state-info-border rounded-xl text-xs space-y-1 text-content-primary">
              <div className="flex items-center space-x-1.5 font-bold text-state-info-text uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-state-info" />
                <span>Wichtige Tipps</span>
              </div>
              <p className="text-content-secondary leading-relaxed">
                • Beginnen Sie mit der passenden Anrede (z. B. <em>Sehr geehrte Damen und Herren,</em>).<br />
                • Beenden Sie mit Grußformel und Name (z. B. <em>Mit freundlichen Grüßen, Ihr Name</em>).
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-surface-card rounded-2xl border-2 border-border-default p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor={`essay-${question.id}`} className="text-sm font-extrabold text-content-primary">
              Ihre E-Mail:
            </label>
            <div className="flex items-center space-x-1">
              {['ä', 'ö', 'ü', 'ß'].map((umlaut) => (
                <button
                  key={umlaut}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleCharInsert(umlaut)}
                  className="w-7 h-7 rounded-lg border border-border-default bg-surface-inset hover:bg-surface-raised font-bold text-xs text-content-primary transition-colors cursor-pointer"
                >
                  {umlaut}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id={`essay-${question.id}`}
            rows={10}
            disabled={isSubmitted}
            value={textValue}
            onChange={(e) => onSelectAnswer(question.id, e.target.value)}
            placeholder="Sehr geehrte Damen und Herren,&#10;&#10;ich schreibe Ihnen, weil...&#10;&#10;Mit freundlichen Grüßen&#10;[Ihr Name]"
            className="w-full p-4 rounded-xl border-2 border-border-default bg-surface-inset text-content-primary font-sans text-sm sm:text-base placeholder:text-content-muted leading-relaxed focus:outline-none focus:border-action-primary focus:bg-surface-card transition-colors disabled:opacity-75 resize-y min-h-[220px]"
          />

          <SchreibenWordCounter text={textValue} targetWords={30} />
        </div>
      </div>
    </div>
  );
}
