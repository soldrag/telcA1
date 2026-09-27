/**
 * Concept domain scorer: recognises a rubric aspect in a sentence through the level's concept domains
 * (word clusters injected as `domains`, see IRankerPolicy.conceptDomains) and proves declared evidence
 * kinds with the structured detectors (time expressions, person counts, occupations).
 */

import { stemByLemma } from '../linguistic/lemmaStem.js';
import { detectTemporalExpression } from './temporalRangeDetector.js';
import { hasPersonCount } from './personCountDetector.js';
import { hasOccupation } from './occupationDetector.js';
import { EVIDENCE_KINDS } from '../linguistic/criterionIntents.js';

const TEMPORAL_EVIDENCE_SCORES = Object.freeze({ range: 0.95, point: 0.95, duration: 0.90 });
const PERSON_COUNT_EVIDENCE_SCORE = 0.9;
const OCCUPATION_EVIDENCE_SCORE = 0.9;
// Words that name the time dimension itself: they say a time is asked for, not which one, so on a
// temporal aspect they must be proven by a time expression, not by time vocabulary.
const TIME_DIMENSION_WORDS = new Set(['zeit', 'zeitraum', 'dauer', 'dauert']);

const MIN_COMPOUND_HEAD_LENGTH = 4;
const indexCache = new WeakMap();

// A compound's head is a noun or a nominalised verb ("Kurskosten" is a kind of Kosten); a word the
// lexicon knows only in other classes (numerals, adverbs, conjunctions) never heads one ("Klavier").
function canHeadCompound(word, lexicon) {
  if (word.length < MIN_COMPOUND_HEAD_LENGTH) return false;
  const entries = lexicon.lookup(word) || [];
  return entries.length === 0 || entries.some((e) => e.pos === 'NOUN' || String(e.pos).startsWith('VERB'));
}

function indexDomainWords(domains, lexicon) {
  return Object.values(domains).map((words) => {
    const entries = words.map((word) => ({ word, stem: stemByLemma(word, lexicon), isHead: canHeadCompound(word, lexicon) }));
    return { entries, stems: [...new Set(entries.map((e) => e.stem))] };
  });
}

// Domains are level data written as words; they are stemmed by the same lexicon as the text, once per pair.
function domainIndex(domains, lexicon) {
  if (!indexCache.has(domains)) indexCache.set(domains, new WeakMap());
  const byLexicon = indexCache.get(domains);
  if (!byLexicon.has(lexicon)) byLexicon.set(lexicon, indexDomainWords(domains, lexicon));
  return byLexicon.get(lexicon);
}

function lemmasOf(word, lexicon) {
  return (lexicon.lookup(word) || []).map((e) => String(e.lemma || '').toLowerCase()).filter(Boolean);
}

// German compounds are right-headed ("Haustiere" is a kind of Tier), so a domain word proves the concept
// when it is the whole word or its head, never a mere substring ("Steuer").
function isDomainHit(token, entry) {
  if (token.stem === entry.stem) return true;
  return entry.isHead && token.forms.some((form) => form.endsWith(entry.word));
}

/**
 * @param {string} token - a word of an aspect label
 * @param {Record<string, string[]>} domains - the level's concept domains (words)
 * @param {{ lookup: Function }} lexicon - the level's lexicon port
 * @returns {string[]|null} the stems of the token's domain
 */
export function resolveConceptDomain(token, domains, lexicon) {
  const clean = String(token || '').toLowerCase();
  if (!clean) return null;
  const probe = { stem: stemByLemma(clean, lexicon), forms: [clean, ...lemmasOf(clean, lexicon)] };
  const domain = domainIndex(domains, lexicon).find((d) => d.entries.some((entry) => isDomainHit(probe, entry)));
  return domain ? domain.stems : null;
}

export function getDomainStemsForToken(token, domains, lexicon) {
  return resolveConceptDomain(token, domains, lexicon) || [stemByLemma(token, lexicon)];
}

/**
 * Structured evidence for an aspect: a recognised time range/duration/date, a person count or an occupation.
 * Unlike lexical overlap it proves the aspect is stated, so the ranker may trust it as much as a neural hit.
 * @param {'temporal'|'personCount'|'occupation'|null} evidence - the kind the rubric declares for the aspect
 */
export function scoreStructuredAspectEvidence(evidence, rawSentence = '') {
  if (!rawSentence) return 0;
  if (evidence === EVIDENCE_KINDS.TEMPORAL) return TEMPORAL_EVIDENCE_SCORES[detectTemporalExpression(rawSentence)] || 0;
  if (evidence === EVIDENCE_KINDS.PERSON_COUNT) return hasPersonCount(rawSentence) ? PERSON_COUNT_EVIDENCE_SCORE : 0;
  if (evidence === EVIDENCE_KINDS.OCCUPATION) return hasOccupation(rawSentence) ? OCCUPATION_EVIDENCE_SCORE : 0;
  return 0;
}

/**
 * @param {{ label: string, evidence?: string|null }} aspect
 * @param {{ sentenceStems: string[], rawSentence: string, domains: Record<string, string[]>, lexicon: object }} sentence
 *   - sentence stems by stemByLemma with the same lexicon
 */
export function scoreAspectConceptOverlap({ label: aspectLabel = '', evidence = null } = {}, { sentenceStems = [], rawSentence = '', domains = {}, lexicon } = {}) {
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
    const domainStems = resolveConceptDomain(token, domains, lexicon);
    if (!domainStems) continue;
    const matches = domainStems.filter((s) => sentenceStems.includes(s));
    if (matches.length > 0) {
      maxConceptScore = Math.max(maxConceptScore, Math.min(1, 0.6 + matches.length * 0.2));
    }
  }

  return maxConceptScore;
}
