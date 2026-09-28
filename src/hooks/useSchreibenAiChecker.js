import { useState, useEffect, useCallback, useRef } from 'react';
import { gradeEssayWithActiveProvider } from '../services/schreiben/grading/essayGrader.js';
import { applyAiGradingResult } from './schreibenAiResultApplier.js';
export { formatDiffEntry } from './schreibenDiffFormatter.js';


/**
 * Whether the results screen should grade the letter: a result graded at submission names its provider;
 * attempts saved before that (rules-only grading) do not.
 */
export function needsPipelineGrading(item = {}) {
  return Boolean(item.user_answer) && !item.provider_id;
}

/** `gradingMode` is how the letter was graded (GRADING_MODES), null while ungraded or saved before it was recorded. */
export function useSchreibenAiChecker({ item, onApplyScores, onApplyErrors }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [gradingMode, setGradingMode] = useState(() => item.grading_mode || null);
  const [aiDiffSummary, setAiDiffSummary] = useState(() => item.diff_summary || []);
  const [examinerFeedback, setExaminerFeedback] = useState(() => item.examiner_feedback || null);
  const [liveCriteriaBreakdown, setLiveCriteriaBreakdown] = useState(() => item.criteria_breakdown || null);

  const runGrading = useCallback(async () => {
    setAiLoading(true);
    setAiDiffSummary([]);
    setExaminerFeedback(null);
    try {
      const aiResult = await gradeEssayWithActiveProvider({ userText: item.user_answer, question: item });
      applyAiGradingResult({
        aiResult, onApplyScores, onApplyErrors,
        setters: { setAiDiffSummary, setExaminerFeedback, setLiveCriteriaBreakdown, setGradingMode },
      });
    } catch (err) {
      console.warn('[useSchreibenAiChecker] Grading failed:', err?.message || err);
    } finally {
      setAiLoading(false);
    }
  }, [item, onApplyScores, onApplyErrors]);

  // Once per answer: applying the result changes the scores and with them runGrading's identity.
  const gradedAnswerRef = useRef(null);
  useEffect(() => {
    const answerKey = `${item?.id}:${item?.user_answer}`;
    if (!needsPipelineGrading(item) || gradedAnswerRef.current === answerKey) return;
    gradedAnswerRef.current = answerKey;
    runGrading();
  }, [item, runGrading]);

  return { aiLoading, gradingMode, aiDiffSummary, examinerFeedback, liveCriteriaBreakdown };
}
