import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSchreibenAiChecker } from './useSchreibenAiChecker.js';
import { scoreCriteriaLevels } from '../services/schreiben/regulations/index.js';
import { mergeCandidateGrammarErrors } from '../services/schreiben/linguistic/sentenceGrammarFilter.js';
import { dedupeGrammarErrors } from '../services/schreiben/linguistic/grammarErrorDeduper.js';

const NEXT_LEVEL = { 2: 1, 1: 0, 0: 2 };
const NO_ERRORS = [];

function deriveInitialScores(item = {}) {
  const cb = item.criteria_breakdown;
  if (!cb) return { anrede: 2, lp1: 2, lp2: 2, lp3: 2, gruss: 2 };
  const getScore = (key, idx) => Number(cb[key] ?? cb.items?.[idx]?.score) || 0;
  return { anrede: Number(cb.anrede) || 0, lp1: getScore('lp1', 0), lp2: getScore('lp2', 1), lp3: getScore('lp3', 2), gruss: Number(cb.gruss) || 0 };
}

// The parent re-creates onScoreChange on every render; reading it through a ref keeps the
// score effect tied to real score changes instead of re-firing (and looping) on each render.
function useReportScore(total, scores, onScoreChange) {
  const callbackRef = useRef(onScoreChange);
  callbackRef.current = onScoreChange;
  useEffect(() => {
    callbackRef.current?.(total, scores);
  }, [total, scores]);
}

/**
 * Criterion levels, grammar hints and AI re-check state for one Schreiben letter.
 */
export function useSchreibenSelfCheck({ item = {}, onScoreChange, t, language }) {
  const grammarErrors = item.grammar_errors || NO_ERRORS;
  const [scores, setScores] = useState(() => deriveInitialScores(item));
  const [liveGrammarErrors, setLiveGrammarErrors] = useState(() => dedupeGrammarErrors(grammarErrors));

  const cycleScore = useCallback((id) => {
    setScores((prev) => ({ ...prev, [id]: NEXT_LEVEL[Number(prev[id]) || 0] }));
  }, []);
  const handleApplyScores = useCallback((nextScores) => setScores(nextScores), []);
  const handleApplyErrors = useCallback((nextErrors) => {
    setLiveGrammarErrors(() => mergeCandidateGrammarErrors(grammarErrors, nextErrors));
  }, [grammarErrors]);

  const ai = useSchreibenAiChecker({
    item, scores, onApplyScores: handleApplyScores, onApplyErrors: handleApplyErrors, t, language,
  });
  const teil2Score = useMemo(() => scoreCriteriaLevels(scores, item.level), [scores, item.level]);
  useReportScore(teil2Score.total, scores, onScoreChange);

  return {
    scores,
    cycleScore,
    teil2Score,
    liveGrammarErrors,
    diagnosticData: ai.liveCriteriaBreakdown || item.criteria_breakdown || item.breakdown,
    ai,
  };
}
