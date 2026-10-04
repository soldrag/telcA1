import React from 'react';
import { AlertCircle } from 'lucide-react';
import { GRADING_MODES, GRADING_FALLBACK_REASONS } from '../../services/ai/types.js';

const MESSAGE_KEY_BY_REASON = {
  [GRADING_FALLBACK_REASONS.WORKER_FAILED]: 'results.gradingFallbackWorkerFailed',
};

/**
 * Next to the score: the grade is rules-only because the AI model (or its worker) did not run, with the failure's own
 * message. Attempts saved before the reason was recorded still show the notice by their mode, without the message.
 */
export default function SchreibenGradingFallbackNotice({ gradingMode, gradingFallback, t }) {
  if (!gradingFallback && gradingMode !== GRADING_MODES.RANKER_WITHOUT_MODEL) return null;
  const messageKey = MESSAGE_KEY_BY_REASON[gradingFallback?.reason] || 'results.gradingFallbackModelFailed';

  return (
    <div role="status" className="p-3.5 rounded-xl border border-state-warning-border bg-state-warning-subtle/20 space-y-1 text-sm text-state-warning-text">
      <div className="flex items-start space-x-2 font-semibold">
        <AlertCircle className="w-4 h-4 text-state-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{t(messageKey)}</span>
      </div>
      {gradingFallback?.detail && (
        <p className="text-xs pl-6 break-words">{t('results.gradingFallbackDetail', { detail: gradingFallback.detail })}</p>
      )}
    </div>
  );
}
