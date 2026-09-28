/**
 * A word of the text that is the modifier of a compound rubric keyword: "Deutsch" in "Deutschkurs",
 * "Arzt" in "Arzttermin". The modifier names the topic, the head is only the kind of thing ("Kurs",
 * "Termin"), so this is a weaker evidence than a stem match: callers use it to tie a letter to a task,
 * not to count a keyword as covered.
 * General German word formation, no task vocabulary: the rest of the compound must be a noun the lexicon
 * knows, so "nach" is not "Nachmittag" (a preposition) and "Bar" is not "Barbara" (no known noun left).
 */

import { cleanGermanWord } from './germanStemmer.js';

// Shorter words ("Bar", "Ein") are too often the start of an unrelated word to name a topic.
const MIN_MODIFIER_LENGTH = 4;
const MIN_HEAD_LENGTH = 3;
const LINKING_ELEMENTS = ['', 's'];
const CONTENT_CLASSES = new Set(['NOUN', 'ADJ']);

function isContentWord(word, lexicon) {
  return word.length >= MIN_MODIFIER_LENGTH && (lexicon.lookup(word) || []).every((e) => CONTENT_CLASSES.has(e.pos));
}

// The general noun dictionary is case-sensitive and a compound is written in lower case here: its head is a noun, so it is looked up capitalised.
function isKnownNoun(word, lexicon) {
  if (word.length < MIN_HEAD_LENGTH) return false;
  const capitalised = word[0].toUpperCase() + word.slice(1);
  return (lexicon.lookup(capitalised) || []).some((e) => e.pos === 'NOUN');
}

function isModifierOf(modifier, compound, lexicon) {
  return LINKING_ELEMENTS.some((link) => {
    const start = modifier + link;
    return compound.startsWith(start) && isKnownNoun(compound.slice(start.length), lexicon);
  });
}

/**
 * @param {string[]} keywords - lower-case rubric keywords; phrases of several words are skipped
 * @param {string[]} words - words of the text
 * @param {{ lookup: Function }} lexicon - the level's lexicon port
 * @returns {string[]} the compound keywords whose modifier stands in the text
 */
export function findCompoundModifierMatches(keywords = [], words = [], lexicon) {
  if (!lexicon) throw new TypeError('findCompoundModifierMatches needs a lexicon port');
  const modifiers = [...new Set(words.map(cleanGermanWord))].filter((w) => isContentWord(w, lexicon));
  return keywords.filter((keyword) => {
    const compound = cleanGermanWord(keyword);
    return !compound.includes(' ') && modifiers.some((m) => isModifierOf(m, compound, lexicon));
  });
}
