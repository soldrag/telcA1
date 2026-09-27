/**
 * Stage 2: Leitpunkte keyword evidence and the coverage-to-points helpers shared by arbitration.
 * Counts rubric keyword concepts in affirmative body sentences (negated statements are not evidence).
 */

import { findMatchedKeywords } from '../linguistic/keywordStemMatcher.js';
import { countMatchedConcepts } from '../linguistic/keywordConcepts.js';
import { extractAffirmativeText } from '../linguistic/semanticPolarityValidator.js';
import { hasTemporalExpression } from './temporalRangeDetector.js';
import { hasTemporalEvidence } from '../linguistic/criterionIntents.js';
import { requireLevelPort } from './levelPorts.js';
import { isClaimedByRival, keywordThreshold } from './rivalEvidence.js';

export function coverageToPoints(coverage = '', fallback = 0) {
  const c = String(coverage || '').toLowerCase().trim();
  if (c === 'full') return 2;
  if (c === 'partial') return 1;
  if (c === 'no') return 0;
  return fallback;
}

export function applyConfidenceFloor(baselineScore = 0, rawScore = 0) {
  const guardedScore = baselineScore >= 1 ? Math.max(baselineScore, rawScore) : rawScore;
  const isProtected = baselineScore >= 1 && rawScore < baselineScore;
  return { score: guardedScore, isProtected };
}

function collectAffirmativeEvidence(sentences, criterion, lexicon) {
  return sentences
    .map(sentence => ({ sentence, text: extractAffirmativeText(sentence, criterion, { lexicon }) }))
    .filter(evidence => evidence.text);
}

function isTemporalEvidence(text, criterion, context) {
  return hasTemporalExpression(text) && !isClaimedByRival(text, { criterion, ...context });
}

/**
 * @param {{ lexicon: object, rivalCriteria?: object[] }} context - the level's lexicon port (ranker policy
 *   `lexicon`) and the task's other Leitpunkte, which claim the dates they name
 */
export function evaluateCriterionKeywords(sentences = [], criterion = {}, { lexicon, rivalCriteria = [] } = {}) {
  requireLevelPort(lexicon, 'evaluateCriterionKeywords: lexicon');
  const rawKeywords = criterion.keywords || [];
  if (rawKeywords.length === 0) return { matchedCount: 0, score: 0, relevantSentences: [] };

  const affirmative = collectAffirmativeEvidence(sentences, criterion, lexicon);
  const allWords = affirmative.map(a => a.text).join(' ').split(/\s+/);
  let matchedCount = countMatchedConcepts(rawKeywords, allWords, lexicon);

  const isTemporalCrit = hasTemporalEvidence(criterion);
  const hasTemp = (text) => isTemporalCrit && isTemporalEvidence(text, criterion, { rivalCriteria, lexicon });
  if (affirmative.some(({ text }) => hasTemp(text))) matchedCount += 1;

  const relevantSentences = affirmative
    .filter(({ text }) => findMatchedKeywords(rawKeywords, text.split(/\s+/), lexicon).length > 0 || hasTemp(text))
    .map(a => a.sentence);

  const threshold = keywordThreshold(criterion, lexicon);
  const kwScore = matchedCount >= threshold ? 2 : (matchedCount > 0 ? 1 : 0);
  return { matchedCount, score: kwScore, relevantSentences };
}
