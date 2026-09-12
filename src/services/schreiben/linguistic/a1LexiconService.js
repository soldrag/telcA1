/**
 * A1 Lexicon Service: Fast dictionary lookup & contextual POS disambiguation.
 * Adheres strictly to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import rawLexicon from './a1Lexicon.json' with { type: 'json' };

const LEXICON = rawLexicon || {};

export function lookupWord(word = '') {
  if (!word) return [];
  const clean = String(word).toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '').trim();
  return LEXICON[clean] || [];
}

export function isKnownWord(word = '') {
  return lookupWord(word).length > 0;
}

function resolveVerbHomonymy(candidates = [], prevToken = null, nextToken = null, hasFiniteVerb = false) {
  const hasInf = candidates.some(c => c.pos === 'VERB_INF');
  const hasFin = candidates.some(c => c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD');
  if (!hasInf || !hasFin) return null;

  if (hasFiniteVerb) {
    return candidates.find(c => c.pos === 'VERB_INF') || null;
  }

  if (prevToken && (prevToken.pos === 'PRON_SUBJ' || prevToken.pos === 'NOUN')) {
    return candidates.find(c => c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD') || null;
  }
  // Inverted questions, imperatives, or V2 after fronted adverbs/particles: "Können wir...", "Bitte rufen Sie...", "Leider kann ich..."
  const prevLower = (prevToken?.raw || prevToken?.lemma || '').toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
  const isPoliteIntro = prevToken && ['bitte', 'leider', 'vielleicht', 'jetzt', 'dann', 'zuerst', 'heute', 'morgen'].includes(prevLower);
  const isFrontedAdverbOrPart = prevToken && (prevToken.pos === 'ADV' || prevToken.pos === 'PART' || isPoliteIntro);

  if ((!prevToken || isFrontedAdverbOrPart) && nextToken && nextToken.pos === 'PRON_SUBJ') {
    return candidates.find(c => c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD') || null;
  }
  return candidates.find(c => c.pos === 'VERB_INF') || null;
}

function resolveSpecialParticles(lower = '', prevToken = null, nextToken = null) {
  if (lower === 'bitte') {
    if (prevToken && prevToken.raw?.toLowerCase() === 'ich') {
      return { pos: 'VERB_FIN', lemma: 'bitten', person: [1], number: 'sg', valency: 'TRANS' };
    }
    return { pos: 'ADV', lemma: 'bitte' };
  }
  if (lower === 'nach') {
    if (nextToken && (nextToken.pos === 'NOUN' || nextToken.pos === 'DET')) {
      return { pos: 'PREP', lemma: 'nach', prepCase: 'DAT' };
    }
    return { pos: 'VERB_PREFIX', lemma: 'nach' };
  }
  return null;
}

export function disambiguateToken(rawWord = '', prevToken = null, nextToken = null, hasFiniteVerb = false) {
  const raw = String(rawWord || '').trim();
  const lower = raw.toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
  const candidates = lookupWord(lower);

  const fallback = {
    raw,
    lower,
    pos: /^[A-ZÄÖÜ]/.test(raw) ? 'NOUN' : 'UNKNOWN',
    lemma: raw
  };

  if (candidates.length === 0) return fallback;
  if (candidates.length === 1) return { raw, lower, ...candidates[0] };

  const special = resolveSpecialParticles(lower, prevToken, nextToken);
  if (special) return { raw, lower, ...special };

  const verbChoice = resolveVerbHomonymy(candidates, prevToken, nextToken, hasFiniteVerb);
  if (verbChoice) return { raw, lower, ...verbChoice };

  return { raw, lower, ...candidates[0] };
}

export function tagTokens(words = []) {
  const result = [];
  let hasFiniteVerb = false;
  for (let i = 0; i < words.length; i++) {
    const prev = result[i - 1] || null;
    const nextRaw = words[i + 1] || '';
    const nextCandidates = lookupWord(nextRaw);
    const next = nextCandidates.length > 0 ? { raw: nextRaw, ...nextCandidates[0] } : null;
    const tagged = disambiguateToken(words[i], prev, next, hasFiniteVerb);
    if (tagged.pos === 'VERB_FIN' || tagged.pos === 'VERB_MOD') {
      hasFiniteVerb = true;
    }
    result.push(tagged);
  }
  return result;
}
