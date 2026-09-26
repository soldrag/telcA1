/**
 * Concept domain scorer: recognises a rubric aspect in a sentence through the level's concept domains
 * (stem clusters injected as `domains`, see IRankerPolicy.conceptDomains) and proves declared evidence
 * kinds with the structured detectors (time expressions, person counts).
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

const MIN_COMPOUND_HEAD_LENGTH = 4;
// Numerals and function words are never the head of a compound ("Klavier", "reservieren").
const CLOSED_CLASS_STEMS = new Set(['zwei', 'drei', 'vier', 'fuenf', 'fünf', 'paar', 'allein', 'alleine',
  'wann', 'warum', 'weil', 'denn', 'viel']);

// German compounds are right-headed ("Kurskosten" is a kind of Kosten, "Haustiere" of Tier), so a
// domain stem proves the concept when it is the whole word or its head, never a mere substring ("Steuer").
function isDomainHead(word, domainStem) {
  if (word === domainStem) return true;
  if (CLOSED_CLASS_STEMS.has(domainStem)) return false;
  return domainStem.length >= MIN_COMPOUND_HEAD_LENGTH && word.endsWith(domainStem);
}

/** @param {Record<string, string[]>} domains - the level's concept domains */
export function resolveConceptDomain(token = '', domains = {}) {
  const clean = String(token || '').toLowerCase();
  const forms = [clean, stemGermanWord(clean)];
  for (const stems of Object.values(domains)) {
    if (stems.some((s) => forms.some((form) => isDomainHead(form, s)))) return stems;
  }
  return null;
}

export function getDomainStemsForToken(token = '', domains = {}) {
  return resolveConceptDomain(token, domains) || [stemGermanWord(String(token || '').toLowerCase())];
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

/**
 * @param {{ label: string, evidence?: string|null }} aspect
 * @param {{ sentenceStems: string[], rawSentence: string, domains: Record<string, string[]> }} sentence
 */
export function scoreAspectConceptOverlap({ label: aspectLabel = '', evidence = null } = {}, { sentenceStems = [], rawSentence = '', domains = {} } = {}) {
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
    const domainStems = resolveConceptDomain(token, domains);
    if (!domainStems) continue;
    const matches = domainStems.filter((s) => sentenceStems.includes(s));
    if (matches.length > 0) {
      maxConceptScore = Math.max(maxConceptScore, Math.min(1, 0.6 + matches.length * 0.2));
    }
  }

  return maxConceptScore;
}
