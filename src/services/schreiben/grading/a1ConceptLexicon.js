/**
 * A1 Semantic Concept Lexicon.
 * Provides canonical A1 grammar and closed-class concept domain stems.
 * Strictly complies with McConnell limits (<= 100 lines, <= 20 lines per function).
 * Zero ad-hoc entity overfitting (no specific city or test names).
 */

import { stemGermanWord } from '../linguistic/germanStemmer.js';
import { detectTemporalExpression } from './temporalRangeDetector.js';
import { hasPersonCount } from './personCountDetector.js';
import { EVIDENCE_KINDS } from '../linguistic/criterionIntents.js';

const TEMPORAL_EVIDENCE_SCORES = Object.freeze({ range: 0.95, point: 0.95, duration: 0.90 });
const PERSON_COUNT_EVIDENCE_SCORE = 0.9;
// Words that name the time dimension itself: they say a time is asked for, not which one, so on a
// temporal aspect they must be proven by a time expression, not by time vocabulary.
const TIME_DIMENSION_WORDS = new Set(['zeit', 'zeitraum', 'dauer', 'dauert']);

const A1_CONCEPT_STEM_DOMAINS = {
  person: ['person', 'leut', 'mann', 'frau', 'kind', 'famili', 'freund', 'kolleg', 'erwachsen', 'gast', 'begleit', 'drei', 'zwei', 'vier', 'fuenf', 'fünf', 'allein', 'alleine', 'paar'],
  zeit: ['zeit', 'zeitraum', 'dauer', 'datum', 'termin', 'anreis', 'abreis', 'ankunft', 'abfahrt', 'wann', 'woche', 'monat', 'vormittag', 'nachmittag', 'abend', 'tag', 'januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember', 'sommer', 'winter', 'herbst', 'frühling', 'fruehling', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'wochenende'],
  preis: ['preis', 'kost', 'kosten', 'euro', 'bezahl', 'zahl', 'teu', 'billig', 'guenst', 'günst', 'gebühr', 'gebuehr', 'miet', 'kaut', 'viel'],
  tier: ['hausti', 'ti', 'hund', 'katz', 'vogel', 'mitbring', 'mitkomm'],
  grund: ['grund', 'warum', 'weil', 'denn', 'moecht', 'woll', 'interess', 'urlaub', 'reis', 'besuch', 'einlad', 'feie', 'krank', 'absag', 'anmeld', 'buch'],
  ort: ['ort', 'wo', 'adress', 'stadt', 'strass', 'wohn', 'hotel', 'bahn', 'flughaf', 'zimm', 'haus'],
};

export function resolveConceptDomain(token = '') {
  const clean = String(token || '').toLowerCase();
  const stem = stemGermanWord(clean);
  for (const [domainKey, stems] of Object.entries(A1_CONCEPT_STEM_DOMAINS)) {
    if (clean.includes(domainKey) || stem.includes(domainKey) || stems.includes(clean) || stems.includes(stem)) {
      return stems;
    }
  }
  return null;
}

export function getDomainStemsForToken(token = '') {
  return resolveConceptDomain(token) || [stemGermanWord(String(token || '').toLowerCase())];
}

/**
 * Structured evidence for an aspect: a recognised time range/duration/date, or a person count.
 * Unlike lexical overlap it proves the aspect is stated, so the ranker may trust it as much as a neural hit.
 * @param {'temporal'|'personCount'|null} evidence - the kind the rubric declares for the aspect
 */
export function scoreStructuredAspectEvidence(evidence, rawSentence = '') {
  if (!rawSentence) return 0;
  if (evidence === EVIDENCE_KINDS.TEMPORAL) return TEMPORAL_EVIDENCE_SCORES[detectTemporalExpression(rawSentence)] || 0;
  if (evidence === EVIDENCE_KINDS.PERSON_COUNT) return hasPersonCount(rawSentence) ? PERSON_COUNT_EVIDENCE_SCORE : 0;
  return 0;
}

/** @param {{ label: string, evidence?: string|null }} aspect */
export function scoreAspectConceptOverlap({ label: aspectLabel = '', evidence = null } = {}, sentenceStems = [], rawSentence = '') {
  if (!aspectLabel || (sentenceStems.length === 0 && !rawSentence)) return 0;

  const aspectTokens = aspectLabel
    .toLowerCase()
    .replace(/[.,!?;:]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const structured = scoreStructuredAspectEvidence(evidence, rawSentence);
  if (structured > 0) return structured;

  let maxConceptScore = 0;
  for (const token of aspectTokens) {
    if (evidence === EVIDENCE_KINDS.TEMPORAL && TIME_DIMENSION_WORDS.has(token)) continue;

    // Plain lexical overlap (incl. function words like "Sie"/"für") is scored elsewhere;
    // only genuine concept-domain hits earn the concept bonus.
    const domainStems = resolveConceptDomain(token);
    if (!domainStems) continue;
    const matches = domainStems.filter((s) => sentenceStems.includes(s));
    if (matches.length > 0) {
      maxConceptScore = Math.max(maxConceptScore, Math.min(1, 0.6 + matches.length * 0.2));
    }
  }

  return maxConceptScore;
}
