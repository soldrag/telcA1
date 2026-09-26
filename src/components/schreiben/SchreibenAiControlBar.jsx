import React from 'react';
import { Cpu, Zap, GitCompare, Loader2 } from 'lucide-react';
import { isGenerativeLlmEnabled, isAbTestingUiEnabled } from '../../config/aiConfig.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenAiControlBar({
  aiLoading,
  handleRunRankerAi,
  handleRunAbComparison,
}) {
  const { t, isRussian } = useI18n();
  const showLlm = isGenerativeLlmEnabled();
  const showAb = isAbTestingUiEnabled();

  return (
    <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-1.5 text-xs text-content-secondary">
        {aiLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-action-primary animate-spin flex-shrink-0" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-action-primary flex-shrink-0" />
        )}
        <span className="font-semibold text-content-primary">
          {aiLoading ? t('results.aiCheckLoading') : t('results.aiRankerEvaluated')}
        </span>
      </div>

      {(showLlm || showAb) && (
        <div className="flex items-center gap-2">
          {showLlm && (
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleRunRankerAi}
              className="px-2.5 py-1.5 rounded-lg bg-surface-raised hover:bg-action-primary-subtle text-action-primary border border-action-primary-border font-bold text-xs flex items-center space-x-1 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title={isRussian ? 'Оценка через WebLLM (Qwen)' : 'Evaluation with WebLLM (Qwen)'}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{isRussian ? 'WebLLM (Qwen)' : 'WebLLM'}</span>
            </button>
          )}

          {showAb && (
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleRunAbComparison}
              className="px-2.5 py-1.5 rounded-lg bg-surface-inset hover:bg-surface-raised text-content-primary border border-border-default font-bold text-xs flex items-center space-x-1 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title={isRussian ? 'Сравнить оба метода оценки (A/B)' : 'Compare evaluation methods (A/B)'}
            >
              <GitCompare className="w-3.5 h-3.5 text-content-secondary" />
              <span>{isRussian ? 'A/B Сравнить' : 'A/B Test'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

