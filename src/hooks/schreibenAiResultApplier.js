/**
 * Applies a pipeline grading result to the results screen's state in useSchreibenAiChecker.
 */

function readCriterionScores(criteriaBreakdown) {
  return {
    anrede: Number(criteriaBreakdown.anrede) || 0,
    lp1: Number(criteriaBreakdown.lp1) || 0,
    lp2: Number(criteriaBreakdown.lp2) || 0,
    lp3: Number(criteriaBreakdown.lp3) || 0,
    gruss: Number(criteriaBreakdown.gruss) || 0,
  };
}

export function applyAiGradingResult({ aiResult, onApplyScores, onApplyErrors, setters }) {
  if (!aiResult?.criteria_breakdown) return;
  onApplyScores?.(readCriterionScores(aiResult.criteria_breakdown));
  if (Array.isArray(aiResult.grammar_errors)) onApplyErrors?.(aiResult.grammar_errors);
  if (Array.isArray(aiResult.diff_summary) && aiResult.diff_summary.length > 0) {
    setters.setAiDiffSummary(aiResult.diff_summary);
  }
  setters.setExaminerFeedback(aiResult.examiner_feedback || null);
  setters.setLiveCriteriaBreakdown(aiResult.criteria_breakdown);
  setters.setGradingMode(aiResult.grading_mode || null);
}
