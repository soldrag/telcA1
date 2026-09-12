/**
 * Schreiben evaluation service: text normalization, form field matching, and essay scoring.
 * Delegates to modular analyzers in src/services/schreiben/.
 */
import { normalizeGermanText } from '../../src/services/schreiben/schreibenFuzzyMatcher.js';
import { evaluateTeil1Answer } from '../../src/services/schreiben/schreibenTeil1Evaluator.js';
import { evaluateTeil2Essay } from '../../src/services/schreiben/schreibenTeil2Evaluator.js';

export function normalizeAnswer(str = '') {
  return normalizeGermanText(str);
}

export function matchTextAnswer(userAnswer = '', question = {}) {
  return evaluateTeil1Answer(userAnswer, question);
}

export function evaluateEssay(userAnswer = '', question = {}) {
  return evaluateTeil2Essay(userAnswer, question);
}
