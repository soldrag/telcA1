/**
 * Sentence attribution between Leitpunkte of one task.
 * Generic evidence (a date, a time) belongs to the Leitpunkt whose own keywords the sentence states:
 * "Ich muss meinen Termin am Montag absagen" names the cancelled appointment, not a new one.
 */

import { findMatchedKeywords } from '../linguistic/keywordStemMatcher.js';
import { countMatchedConcepts, groupKeywordConcepts } from '../linguistic/keywordConcepts.js';

/**
 * Distinct keyword concepts a criterion needs for full keyword coverage: `requiredMatches`, capped by
 * the number of concepts the rubric lists ("kosten"/"kostet" is one).
 * @param {{ lookup: Function }} lexicon - the level's lexicon port
 */
export function keywordThreshold(criterion = {}, lexicon) {
  const conceptCount = groupKeywordConcepts(criterion.keywords || [], lexicon).length;
  const required = criterion.requiredMatches !== undefined ? criterion.requiredMatches : 2;
  return Math.min(required, Math.max(1, conceptCount));
}

function isFullKeywordEvidence(criterion, words, lexicon) {
  const keywords = criterion.keywords || [];
  return keywords.length > 0 && countMatchedConcepts(keywords, words, lexicon) >= keywordThreshold(criterion, lexicon);
}

/**
 * A sentence is claimed by a rival when it fully states the rival's keywords and none of the criterion's own.
 * @param {string} text - the sentence (its affirmative part)
 * @param {{ criterion: object, rivalCriteria: object[], lexicon: object }} context
 */
export function isClaimedByRival(text = '', { criterion = {}, rivalCriteria = [], lexicon }) {
  const words = String(text).split(/\s+/);
  if (findMatchedKeywords(criterion.keywords || [], words, lexicon).length > 0) return false;
  return rivalCriteria.some((rival) => rival !== criterion && isFullKeywordEvidence(rival, words, lexicon));
}
