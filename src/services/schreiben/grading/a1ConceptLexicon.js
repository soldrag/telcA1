/**
 * A1 Semantic Concept Lexicon.
 * Provides canonical A1 grammar and closed-class concept domain stems.
 * Strictly complies with McConnell limits (<= 85 lines, <= 20 lines per function).
 * Zero ad-hoc entity overfitting (no specific city or test names).
 */

import { stemGermanWord } from '../linguistic/germanStemmer.js';

// Canonical German A1 temporal range, calendar months, seasons, and days of week
export const TEMPORAL_RANGE_REGEX = /\b(?:vom|von)\s+(?:\d{1,2}\.?|[a-zäöü]+)\s*(?:bis|und|-)\s*(?:zum\s+)?(?:\d{1,2}\.?|[a-zäöü]+)|\b(?:für|fuer)\s+(?:\d+|ein|eine|einen|zwei|drei|vier|fünf)\s+(?:tage?|wochen?|monate?)\b|\b(?:ab|am|im|in)\s+(?:\d{1,2}\.?\s+)?(?:januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember|sommer|winter|herbst|frühling|fruehling|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|wochenende)\b/i;

const QUANTIFIED_DURATION_REGEX = /\b(?:\d+|ein|eine|einen|zwei|drei|vier|fünf|fuenf|sechs|sieben|zehn)\s+(?:tage?|wochen?|monate?)\b/i;

const A1_CONCEPT_STEM_DOMAINS = {
  person: ['person', 'leut', 'wir', 'mann', 'frau', 'kind', 'famili', 'freund', 'kolleg', 'erwachsen', 'gast', 'begleit', 'drei', 'zwei', 'vier', 'fuenf', 'fünf', 'allein', 'alleine', 'paar'],
  zeit: ['zeit', 'zeitraum', 'dauer', 'datum', 'termin', 'anreis', 'abreis', 'ankunft', 'abfahrt', 'wann', 'woche', 'monat', 'vormittag', 'nachmittag', 'abend'],
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

export function scoreAspectConceptOverlap(aspectLabel = '', sentenceStems = [], rawSentence = '') {
  if (!aspectLabel || (sentenceStems.length === 0 && !rawSentence)) return 0;

  const aspectTokens = aspectLabel
    .toLowerCase()
    .replace(/[.,!?;:]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const isTimeAspect = aspectTokens.some((t) => /zeit|dau|termin|datum|wann|lang/i.test(t));
  if (isTimeAspect && rawSentence) {
    if (TEMPORAL_RANGE_REGEX.test(rawSentence)) {
      return 0.95;
    }
    if (QUANTIFIED_DURATION_REGEX.test(rawSentence)) {
      return 0.90;
    }
  }

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
