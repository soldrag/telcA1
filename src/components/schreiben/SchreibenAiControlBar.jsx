import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { GRADING_MODES } from '../../services/ai/types.js';

const LABEL_BY_MODE = {
  [GRADING_MODES.RANKER]: 'results.aiRankerEvaluated',
  [GRADING_MODES.RANKER_WITHOUT_MODEL]: 'results.aiModelUnavailableNotice',
  [GRADING_MODES.LIMITED]: 'results.aiLimitedNotice',
};

/**
 * How the letter was graded: by the Micro-Ranker with its model, by rules because the model did not load,
 * in the limited (rules-only) mode, or grading still running. Attempts saved before the mode was recorded show nothing.
 */
export default function SchreibenAiControlBar({ aiLoading, gradingMode }) {
  const { t } = useI18n();
  const labelKey = aiLoading ? 'results.aiCheckLoading' : LABEL_BY_MODE[gradingMode];
  if (!labelKey) return null;

  return (
    <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-1.5 text-xs text-content-secondary">
        {aiLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-action-primary animate-spin flex-shrink-0" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-action-primary flex-shrink-0" />
        )}
        <span className="font-semibold text-content-primary">{t(labelKey)}</span>
      </div>
    </div>
  );
}
