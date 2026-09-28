/**
 * Clause Structure & Proposition Parser for German.
 * Deconstructs clauses into predicate core, polarity scope, and semantic arguments.
 * Strictly adheres to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { parseSentenceTopology } from './topologicalFieldParser.js';
import wordClasses from './data/clauseWordClasses.json' with { type: 'json' };

const WEEKDAYS = new Set(wordClasses.weekdays);
const TIME_NOUNS = new Set(wordClasses.timeNouns);
const POSITIVE_STATES = new Set(wordClasses.positiveStates);
const DEFECT_STATES = new Set(wordClasses.defectStates);

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
  return { subject: subjectToken?.lower || null, objects, directObjects: extractDirectObjects(tokens, subjectToken), temporalMarkers, stateMarkers };
}

// Nouns outside a prepositional phrase that are not the subject: "einen neuen Termin" is a complement
// of the verb, "am Montag" is not. A preposition governs the tokens up to its noun.
function extractDirectObjects(tokens = [], subjectToken = null) {
  const directObjects = [];
  let insidePrepPhrase = false;
  for (const t of tokens) {
    if (t.pos === 'PREP') insidePrepPhrase = true;
    if (t.pos !== 'NOUN') continue;
    if (!insidePrepPhrase && t !== subjectToken) directObjects.push((t.lemma || t.lower).toLowerCase());
    insidePrepPhrase = false;
  }
  return directObjects;
}

function parseClauseStructure(clause) {
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

/** @param {{ lexicon: object }} context - the level profile's lexicon port */
export function parseSentencePropositions(sentenceStr = '', { lexicon } = {}) {
  if (!sentenceStr || typeof sentenceStr !== 'string') return [];
  const topology = parseSentenceTopology(sentenceStr, { lexicon });
  return (topology.clauses || []).map(clause => parseClauseStructure(clause));
}
