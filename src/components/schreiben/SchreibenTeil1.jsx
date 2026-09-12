import React from 'react';
import { ClipboardList, Building2 } from 'lucide-react';
import SchreibenSituationCard from './SchreibenSituationCard.jsx';
import SchreibenFormField from './SchreibenFormField.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenTeil1({
  questions = [],
  session = {},
  answers = session.answers || {},
  onSelectAnswer = session.selectAnswer,
  isSubmitted = session.isSubmitted || false,
}) {
  const { t } = useI18n();
  const primaryQuestion = questions[0] || {};

  return (
    <div className="space-y-6">
      <div className="bg-surface-card p-4 sm:p-5 rounded-2xl border-2 border-border-default shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-action-primary-subtle text-action-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-content-primary">
              Teil 1 • Formular ausfüllen
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary font-medium">
              {t('exam.schreibenPart1Instruction') || 'Lesen Sie den Text und füllen Sie die fünf Informationen im Formular aus.'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-action-primary-subtle text-action-primary border border-action-primary-border">
          5 Punkte (1–5)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 sticky lg:top-4">
          <SchreibenSituationCard question={primaryQuestion} />
        </div>

        <div className="lg:col-span-6 bg-surface-card rounded-2xl border-2 border-border-default p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b-2 border-border-strong pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-action-primary" />
              <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-content-primary">
                {primaryQuestion.title?.split('•')[0]?.trim() || 'Offizielles Formular'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-content-tertiary bg-surface-inset px-2.5 py-1 rounded border border-border-default">
              FORM-A1
            </span>
          </div>

          <div className="space-y-3.5">
            {questions.map((question) => {
              const options = typeof question.options_json === 'string'
                ? JSON.parse(question.options_json || '{}')
                : (question.options_json || {});
              const label = options.form_label || question.statement?.replace(/Feld \(\d+\)\s*—\s*/, '') || `Feld ${question.question_number}`;
              const value = answers[question.id] || '';

              return (
                <SchreibenFormField
                  key={question.id}
                  questionNumber={question.question_number}
                  questionId={question.id}
                  label={label}
                  value={value}
                  onChange={onSelectAnswer}
                  disabled={isSubmitted}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
