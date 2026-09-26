import React from 'react';
import { Cpu, Zap, GitCompare } from 'lucide-react';
import SchreibenAiStatusBadge from './SchreibenAiStatusBadge.jsx';
import { isGenerativeLlmEnabled, isAbTestingUiEnabled } from '../../config/aiConfig.js';

export default function SchreibenAiControlBar({
  aiLoading,
  aiButtonLabel,
  handleRunAi,
  handleRunRankerAi,
  handleRunAbComparison,
  providerId,
  aiStatus,
  language = 'de',
}) {
  const isRu = language === 'ru';
  const showLlm = isGenerativeLlmEnabled();
  const showAb = isAbTestingUiEnabled();

  return (
    <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={aiLoading}
          onClick={handleRunAi}
          className="px-3.5 py-2 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[40px]"
          title={isRu ? 'Мгновенная оценка через Micro-Ranker (System 1)' : 'Schnelle Bewertung mit Micro-Ranker'}
        >
          <Zap className="w-4 h-4 text-white" />
          <span>{aiButtonLabel}</span>
        </button>

        {showLlm && (
          <button
            type="button"
            disabled={aiLoading}
            onClick={handleRunRankerAi}
            className="px-3.5 py-2 rounded-xl bg-surface-raised hover:bg-action-primary-subtle text-action-primary border border-action-primary-border font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[40px]"
            title={isRu ? 'Оценка через WebLLM (Qwen)' : 'Bewertung mit WebLLM (Qwen)'}
          >
            <Cpu className="w-4 h-4" />
            <span>{isRu ? 'WebLLM (Qwen)' : 'WebLLM'}</span>
          </button>
        )}

        {showAb && (
          <button
            type="button"
            disabled={aiLoading}
            onClick={handleRunAbComparison}
            className="px-3 py-2 rounded-xl bg-surface-inset hover:bg-surface-raised text-content-primary border border-border-default font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[40px]"
            title={isRu ? 'Сравнить оба метода оценки (A/B)' : 'Beide Bewertungsmethoden vergleichen (A/B)'}
          >
            <GitCompare className="w-4 h-4 text-content-secondary" />
            <span>{isRu ? 'A/B Сравнить' : 'A/B-Vergleich'}</span>
          </button>
        )}

        <SchreibenAiStatusBadge providerId={providerId} language={language} />
      </div>

      {aiStatus && (
        <span className="text-[11px] font-semibold text-content-primary px-3 py-1.5 rounded-lg bg-surface-card border border-border-default leading-tight">
          {aiStatus}
        </span>
      )}
    </div>
  );
}
