/**
 * Schreiben Teil 1 evaluation: text normalization and form field matching.
 * The Teil 2 letter is graded by the pipeline (schreiben/grading/essayGrader.js), injected into the exam evaluator.
 */
import { normalizeGermanText } from '../schreiben/schreibenFuzzyMatcher.js';
import { evaluateTeil1Answer } from '../schreiben/schreibenTeil1Evaluator.js';

export function normalizeAnswer(str = '') {
  return normalizeGermanText(str);
}

export function matchTextAnswer(userAnswer = '', question = {}) {
  return evaluateTeil1Answer(userAnswer, question);
}
