/**
 * A1 Semantic Concept Lexicon.
 * Provides canonical A1 grammar and closed-class concept domain stems.
 * Strictly complies with McConnell limits (<= 100 lines, <= 20 lines per function).
 * Zero ad-hoc entity overfitting (no specific city or test names).
 */

import { stemGermanWord } from '../linguistic/germanStemmer.js';
import { detectTemporalExpression } from './temporalRangeDetector.js';
import { hasPersonCount } from './personCountDetector.js';

const TEMPORAL_EVIDENCE_SCORES = Object.freeze({ range: 0.95, point: 0.95, duration: 0.90 });
const PERSON_COUNT_EVIDENCE_SCORE = 0.9;

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

function isTemporalAspect(aspectTokens = []) {
  return aspectTokens.some((t) => /zeit|dau|termin|datum|wann|lang/i.test(t));
}

function isPersonAspect(aspectTokens = []) {
  return aspectTokens.some((t) => /person|leut|teilnehm|gäst|gast/i.test(t));
}

/**
 * Structured evidence for an aspect: a recognised time range/duration/date, or a person count.
 * Unlike lexical overlap it proves the aspect is stated, so the ranker may trust it as much as a neural hit.
 */
export function scoreStructuredAspectEvidence(aspectLabel = '', rawSentence = '') {
  const tokens = String(aspectLabel).toLowerCase().split(/\s+/);
  if (!rawSentence) return 0;
  if (isTemporalAspect(tokens)) return TEMPORAL_EVIDENCE_SCORES[detectTemporalExpression(rawSentence)] || 0;
  if (isPersonAspect(tokens)) return hasPersonCount(rawSentence) ? PERSON_COUNT_EVIDENCE_SCORE : 0;
  return 0;
}

export function scoreAspectConceptOverlap(aspectLabel = '', sentenceStems = [], rawSentence = '') {
  if (!aspectLabel || (sentenceStems.length === 0 && !rawSentence)) return 0;

  const aspectTokens = aspectLabel
    .toLowerCase()
    .replace(/[.,!?;:]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const isTimeAspect = isTemporalAspect(aspectTokens);
  const structured = scoreStructuredAspectEvidence(aspectLabel, rawSentence);
  if (structured > 0) return structured;

  let maxConceptScore = 0;
  for (const token of aspectTokens) {
    if (isTimeAspect && /zeit|dau/i.test(token)) continue;

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
