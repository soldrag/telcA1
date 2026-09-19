/**
 * Clause Structure & Proposition Parser for German A1.
 * Deconstructs clauses into predicate core, polarity scope, and semantic arguments.
 * Strictly adheres to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { parseSentenceTopology } from './topologicalFieldParser.js';

const WEEKDAYS = new Set(['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag']);
const TIME_NOUNS = new Set(['uhr', 'zeit', 'termin', 'woche', 'wochenende', 'morgen', 'vormittag', 'nachmittag', 'abend']);
const POSITIVE_STATES = new Set(['perfekt', 'einwandfrei', 'super', 'toll', 'gut', 'warm']);
const DEFECT_STATES = new Set(['kaputt', 'kalt', 'defekt', 'schlecht', 'dunkel']);

function extractPredicateCore(clause) {
  const allTokens = clause.tokens || [...(clause.vorfeld || []), clause.finVerb, ...(clause.mittelfeld || [])].filter(Boolean);
  const finVerb = clause.finVerb || allTokens.find(t => t.pos === 'VERB_FIN' || t.pos === 'VERB_MOD') || null;
  const nonFin = allTokens.find(t => t.pos === 'VERB_INF' || t.pos === 'PART_PAST') || null;
  const pfx = allTokens.find(t => t.pos === 'VERB_PREFIX') || null;

  let baseAction = null;
  if (nonFin?.lemma) {
    baseAction = nonFin.lemma.toLowerCase();
  } else if (pfx && finVerb?.baseVerb) {
    baseAction = `${pfx.lower}${finVerb.baseVerb}`.toLowerCase();
  } else if (finVerb?.lemma) {
    baseAction = finVerb.lemma.toLowerCase();
  }

  return { finVerb, nonFinVerb: nonFin, verbPrefix: pfx, baseAction, isModal: finVerb?.valency === 'MODAL' };
}

function extractPolarity(tokens = [], predicateCore = {}) {
  const isSentenceNegated = tokens.some(t => t.pos === 'PART_NEG' || t.lower === 'nicht' || t.lower === 'nie');
  const negatedNouns = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.lemma === 'kein' || (t.pos === 'DET' && t.lower?.startsWith('kein'))) {
      const nextNoun = tokens.slice(i + 1, i + 4).find(n => n.pos === 'NOUN');
      if (nextNoun) {
        negatedNouns.push((nextNoun.lemma || nextNoun.lower).toLowerCase());
      }
    }
  }

  const negatedActions = [];
  if (isSentenceNegated && predicateCore.baseAction) {
    negatedActions.push(predicateCore.baseAction);
  }

  return { isSentenceNegated, negatedNouns, negatedActions };
}

function extractClauseArguments(tokens = []) {
  const objects = [];
  const temporalMarkers = [];
  const stateMarkers = [];

  for (const t of tokens) {
    const lower = (t.lower || t.raw || '').toLowerCase();
    if (t.pos === 'NOUN' && !WEEKDAYS.has(lower) && !TIME_NOUNS.has(lower)) {
      objects.push((t.lemma || lower).toLowerCase());
    }
    if (WEEKDAYS.has(lower) || TIME_NOUNS.has(lower) || /^\d{1,2}(:\d{2})?$/.test(lower)) {
      temporalMarkers.push(lower);
    }
    if (POSITIVE_STATES.has(lower) || DEFECT_STATES.has(lower)) {
      stateMarkers.push({ word: lower, isPositive: POSITIVE_STATES.has(lower), isDefect: DEFECT_STATES.has(lower) });
    }
  }

  const subjectToken = tokens.find(t => t.pos === 'PRON_SUBJ') || tokens.find(t => t.pos === 'NOUN') || null;
  return { subject: subjectToken?.lower || null, objects, temporalMarkers, stateMarkers };
}

export function parseClauseStructure(clause) {
  const allTokens = clause.tokens || [...(clause.vorfeld || []), clause.finVerb, ...(clause.mittelfeld || [])].filter(Boolean);
  const predicateCore = extractPredicateCore(clause);
  const polarity = extractPolarity(allTokens, predicateCore);
  const args = extractClauseArguments(allTokens);

  return {
    type: clause.type,
    predicateCore,
    polarity,
    arguments: args,
    rawText: allTokens.map(t => t.raw).join(' ')
  };
}

export function parseSentencePropositions(sentenceStr = '') {
  if (!sentenceStr || typeof sentenceStr !== 'string') return [];
  const topology = parseSentenceTopology(sentenceStr);
  return (topology.clauses || []).map(clause => parseClauseStructure(clause));
}
