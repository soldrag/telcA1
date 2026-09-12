import React from 'react';
import { FileText, Info } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenSituationCard({ question, className = '' }) {
  const { t } = useI18n();
  if (!question) return null;

  return (
    <div className={`bg-surface-card rounded-2xl border-2 border-border-default p-5 sm:p-6 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 text-action-primary font-black text-xs uppercase tracking-wider">
        <FileText className="w-4 h-4" />
        <span>{question.context_header || 'Ausgangssituation'}</span>
      </div>

      {question.situation && (
        <p className="text-sm sm:text-base font-semibold text-content-secondary leading-snug">
          {question.situation}
        </p>
      )}

      {question.context_body && (
        <div className="p-4 sm:p-5 bg-surface-inset rounded-xl border border-border-default text-base font-medium text-content-primary leading-relaxed whitespace-pre-line">
          {question.context_body}
        </div>
      )}

      <div className="flex items-start space-x-2 p-3 bg-action-primary-subtle/50 rounded-xl border border-action-primary-border/60 text-xs text-content-secondary">
        <Info className="w-4 h-4 text-action-primary flex-shrink-0 mt-0.5" />
        <span>{t('exam.schreibenPart1Tip') || 'Lesen Sie den Text genau durch. Alle gesuchten Informationen für das Formular stehen direkt im Text.'}</span>
      </div>
    </div>
  );
}
