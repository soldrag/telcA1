/**
 * Person-count detector (token-based, level-independent).
 * "Personen" in a booking/registration Leitpunkt means who comes and how many: a numeral next to a person noun
 * ("vier Personen", "2 Erwachsene", "mit zwei Kindern"), a group adverb ("zu dritt"), "allein", or relatives named
 * after "mit" in the same clause as a verb of coming or travelling
 * ("Ich komme mit meiner Frau und meinem Sohn"). A bare "wir" names participants but no count, so it is not evidence.
 */

import numberWords from '../linguistic/data/numberWords.json' with { type: 'json' };
import { foldUmlauts } from '../linguistic/letter/umlautSpelling.js';
import roleWords from '../linguistic/data/roleWords.json' with { type: 'json' };

const foldedSet = (words) => new Set(words.map(foldUmlauts));
const NUMERALS = foldedSet(Object.keys(numberWords.cardinals));
const GROUP_SIZE_WORDS = foldedSet(numberWords.groupSizeWords);
const PERSON_NOUNS = foldedSet(roleWords.personCountNouns);
const COMPANION_NOUNS = foldedSet([...roleWords.companionNouns, ...roleWords.personCountNouns]);
const TRAVEL_VERBS = foldedSet(roleWords.travelVerbForms);
const POSSESSIVES = foldedSet(roleWords.possessiveStems
  .flatMap((stem) => roleWords.possessiveEndings.map((ending) => stem + ending)));
const SOLO_MARKERS = new Set(['allein', 'alleine']);
const NOUN_WINDOW = 2;
// a full stop after a digit ends an ordinal or a date ("am 3. Juli"), not a clause
const CLAUSE_BOUNDARY = /[,;:!?()\n]+|(?<!\d)\./;
const COMITATIVE = 'mit';

function tokenize(text = '') {
  return String(text).split(/[\s,.;:!?()]+/).filter(Boolean).map(foldUmlauts);
}

function splitClauses(text = '') {
  return String(text).split(CLAUSE_BOUNDARY).map(tokenize).filter((clause) => clause.length > 0);
}

function isNumeral(token) {
  return NUMERALS.has(token) || /^\d{1,2}$/.test(token);
}

function isNumeralBeforePersonNoun(tokens, index) {
  return isNumeral(tokens[index])
    && tokens.slice(index + 1, index + 1 + NOUN_WINDOW).some((t) => PERSON_NOUNS.has(t));
}

function isGroupAdverb(tokens, index) {
  return tokens[index] === 'zu' && GROUP_SIZE_WORDS.has(tokens[index + 1]);
}

function isNamedCompanion(tokens, index) {
  return tokens[index] === COMITATIVE
    && POSSESSIVES.has(tokens[index + 1])
    && COMPANION_NOUNS.has(tokens[index + 2]);
}

function hasCountInClause(tokens) {
  const namesTravel = tokens.some((t) => TRAVEL_VERBS.has(t));
  return tokens.some((token, i) => SOLO_MARKERS.has(token)
    || isNumeralBeforePersonNoun(tokens, i)
    || isGroupAdverb(tokens, i)
    || (namesTravel && isNamedCompanion(tokens, i)));
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasPersonCount(text = '') {
  return splitClauses(text).some((tokens) => hasCountInClause(tokens));
}
