import React, { useState, useEffect, useCallback } from 'react';
import { BookCheck, Sparkles, Cpu, ArrowUpCircle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import SchreibenGrammarNotice from './SchreibenGrammarNotice.jsx';
import SchreibenCriteriaChecklist, { CRITERIA_KEYS } from './SchreibenCriteriaChecklist.jsx';
import SchreibenAiStatusBadge from './SchreibenAiStatusBadge.jsx';
import SchreibenAiDisclaimer from './SchreibenAiDisclaimer.jsx';
import { useSchreibenAiChecker, formatDiffEntry } from '../../hooks/useSchreibenAiChecker.js';
import { computeGrammarPenalty } from '../../services/schreiben/grading/stage3Grammar.js';
import { mergeCandidateGrammarErrors } from '../../services/schreiben/linguistic/sentenceGrammarFilter.js';

function deriveInitialScores(item = {}) {
  const cb = item.criteria_breakdown;
  if (!cb) return { anrede: 2, lp1: 2, lp2: 2, lp3: 2, gruss: 2 };
  return {
    anrede: Number(cb.anrede) || 0,
    lp1: Number(cb.lp1 ?? cb.items?.[0]?.score) || 0,
    lp2: Number(cb.lp2 ?? cb.items?.[1]?.score) || 0,
    lp3: Number(cb.lp3 ?? cb.items?.[2]?.score) || 0,
    gruss: Number(cb.gruss) || 0,
  };
}

export default function SchreibenSelfCheck({ item = {}, onScoreChange }) {
  const { t, language } = useI18n();
  const options = item.options_json || {};
  const sampleSolution = options.sample_solution || item.clue_quote;
  const grammarErrors = item.grammar_errors || [];
  const segments = item.user_segments;

  const [scores, setScores] = useState(() => deriveInitialScores(item));
  const [liveGrammarErrors, setLiveGrammarErrors] = useState(grammarErrors);

  const cb = item.criteria_breakdown;
  const currentErrorsCount = liveGrammarErrors.length;
  const rawPenalty = liveGrammarErrors !== grammarErrors
    ? computeGrammarPenalty(currentErrorsCount)
    : (cb?.grammar_penalty ?? computeGrammarPenalty(currentErrorsCount));
  const grammarPenalty = Number(rawPenalty) || 0;

  const cycleScore = (id) => {
    setScores((prev) => {
      const current = Number(prev[id]) || 0;
      const next = current === 2 ? 1 : (current === 1 ? 0 : 2);
      return { ...prev, [id]: next };
    });
  };

  const handleApplyScores = useCallback((nextScores) => setScores(nextScores), []);
  const handleApplyErrors = useCallback((nextErrors) => {
    setLiveGrammarErrors((prev) => mergeCandidateGrammarErrors(grammarErrors, nextErrors));
  }, [grammarErrors]);

  const {
    aiLoading,
    aiStatus,
    aiDiffSummary,
    feedbackSummary,
    handleRunAi,
    providerId,
    isLimitedMode,
  } = useSchreibenAiChecker({
    item,
    scores,
    onApplyScores: handleApplyScores,
    onApplyErrors: handleApplyErrors,
    t,
    language,
  });

  const rawSum = CRITERIA_KEYS.reduce((acc, k) => acc + (Number(scores[k]) || 0), 0);
  const calculatedScore = Math.max(0, rawSum - grammarPenalty);

  useEffect(() => {
    onScoreChange?.(calculatedScore, scores);
  }, [calculatedScore, scores, onScoreChange]);

  const aiButtonLabel = aiLoading
    ? t('results.aiCheckLoading')
    : t('results.aiCheckButton');

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

      <SchreibenGrammarNotice grammarErrors={liveGrammarErrors} />

      {segments && (
        <div className="p-3.5 rounded-xl border border-border-default bg-surface-card space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-content-secondary flex items-center space-x-1.5">
            <BookCheck className="w-3.5 h-3.5 text-action-primary" />
            <span>Ihr Text aufgeteilt nach telc Kriterien:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-surface-inset border border-border-subtle">
              <span className="font-extrabold text-action-primary">Anrede: </span>
              <span className="text-content-primary">{segments.anrede || <span className="text-content-muted italic">Keine</span>}</span>
            </div>
            {segments.leitpunkte.map((lp, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-surface-inset border border-border-subtle">
                <span className="font-extrabold text-action-primary">Punkt {lp.index}: </span>
                <span className="text-content-primary">{lp.userSentence}</span>
              </div>
            ))}
            <div className="p-2 rounded-lg bg-surface-inset border border-border-subtle">
              <span className="font-extrabold text-action-primary">Grußformel & Name: </span>
              <span className="text-content-primary">{segments.closing} {segments.senderName}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border-2 border-action-primary-border bg-action-primary-subtle/30 space-y-3">
        <SchreibenCriteriaChecklist
          scores={scores}
          onCycleScore={cycleScore}
          calculatedScore={calculatedScore}
          grammarPenalty={grammarPenalty}
          currentErrorsCount={currentErrorsCount}
        />

        {/* Adaptive Client AI Assistant - Available on all devices */}
        <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleRunAi}
              className="px-3.5 py-2 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[40px]"
            >
              <Cpu className="w-4 h-4" />
              <span>{aiButtonLabel}</span>
            </button>
            <SchreibenAiStatusBadge providerId={providerId} language={language} />
          </div>
          {aiStatus && (
            <span className="text-[11px] font-semibold text-content-primary px-3 py-1.5 rounded-lg bg-surface-card border border-border-default leading-tight">
              {aiStatus}
            </span>
          )}
        </div>

        {aiDiffSummary.length > 0 && (
          <div className="mt-2 space-y-1">
            {aiDiffSummary.map((d, i) => (
              <div key={i} className="flex items-center space-x-2 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-action-primary-border bg-action-primary-subtle/20">
                <ArrowUpCircle className="w-3.5 h-3.5 text-action-primary flex-shrink-0" />
                <span className="text-content-primary">
                  {formatDiffEntry(d, language)}
                </span>
              </div>
            ))}
          </div>
        )}

        {feedbackSummary && (
          <div className="mt-2.5 p-3 rounded-lg border border-state-success-border bg-state-success-subtle/20 space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-state-success-text flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Отзыв экзаменатора (ИИ)' : 'Prüfer-Feedback'}</span>
            </div>
            <p className="text-xs text-content-primary leading-relaxed">
              {feedbackSummary}
            </p>
          </div>
        )}

        <SchreibenAiDisclaimer />
      </div>
    </div>
  );
}
