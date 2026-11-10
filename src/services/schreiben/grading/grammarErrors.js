/**
 * The letter's grammar hints: the level's grammar checker, the task's stored errors and the meaning distortions
 * found on the way, merged without duplicates. Feedback only: grammar costs no telc A1 points (reglament).
 */

import { mergeCandidateGrammarErrors } from '../linguistic/grammarErrorDeduper.js';
import { requireLevelPort } from './levelPorts.js';

/** grammar: the level's grammar checker (resolveLevelContext) */
export function collectPipelineGrammarErrors({ rawText, semanticErrors = [], baselineErrors = [], grammar }) {
  const ruleErrors = requireLevelPort(grammar, 'collectPipelineGrammarErrors: grammar').checkLetter(rawText) || [];
  const baseMerged = mergeCandidateGrammarErrors(baselineErrors, ruleErrors);
  return mergeCandidateGrammarErrors(baseMerged, semanticErrors);
}
