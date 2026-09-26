import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Lists the grammar hints; the accuracy score derived from them lives in LinguisticAccuracyPanel.
 * @param {{ grammarErrors: Array, t: Function }} props
 */
export default function SchreibenGrammarNotice({ grammarErrors = [], t }) {
  if (grammarErrors.length === 0) {
    return (
      <div className="p-3.5 rounded-xl border border-state-success-border bg-state-success-subtle/20 flex items-center space-x-2 text-xs font-bold text-state-success-text">
        <CheckCircle2 className="w-4 h-4 text-state-success flex-shrink-0" />
        <span>{t('results.linguisticAccuracy.noErrors')}</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-state-warning-border bg-state-warning-subtle/20 space-y-3">
      <div className="flex items-center space-x-2 text-state-warning-text font-bold text-xs uppercase tracking-wider">
        <AlertCircle className="w-4 h-4 text-state-warning flex-shrink-0" />
        <span>{t('results.linguisticAccuracy.errorsTitle', { count: grammarErrors.length })}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {grammarErrors.map((err, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-surface-card border border-border-default space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <span className="text-state-error line-through">{err.original}</span>
              <span className="text-content-muted">➔</span>
              <span className="text-state-success">{err.correction}</span>
            </div>
            <p className="text-content-secondary text-[11px] leading-snug">{err.explanation}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-content-muted italic leading-tight">
        {t('results.linguisticAccuracy.hint')}
      </p>
    </div>
  );
}
