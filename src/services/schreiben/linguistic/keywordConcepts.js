/**
 * Rubric keywords grouped into concepts: forms of one word ("kosten"/"kostet", "Hund"/"Hunde") are one
 * piece of evidence, so a threshold of two matches needs two different concepts, not two spellings.
 * Two keywords are one concept when they share a lemma in the lexicon port or a stem.
 */

import { stemGermanWord } from './germanStemmer.js';
import { findMatchedKeywords } from './keywordStemMatcher.js';

function splitWords(keyword) {
  return String(keyword || '').toLowerCase().split(/\s+/).filter(Boolean);
}

function conceptKeys(keyword, lexicon) {
  const parts = splitWords(keyword);
  const keys = new Set([`stem:${parts.map((w) => stemGermanWord(w)).join(' ')}`]);
  if (parts.length !== 1) return keys;
  for (const entry of lexicon.lookup(parts[0]) || []) {
    if (entry.lemma) keys.add(`lemma:${String(entry.lemma).toLowerCase()}`);
  }
  return keys;
}

function sharesKey(a, b) {
  return [...a].some((key) => b.has(key));
}

/**
 * @param {string[]} keywords - rubric keywords or phrases
 * @param {{ lookup: Function }} lexicon - the level's lexicon port
 * @returns {string[][]} keywords grouped by concept, in rubric order
 */
export function groupKeywordConcepts(keywords = [], lexicon) {
  const groups = [];
  for (const keyword of keywords) {
    const keys = conceptKeys(keyword, lexicon);
    const merged = groups.filter((g) => sharesKey(g.keys, keys));
    const target = { keys, members: [keyword] };
    for (const group of merged) {
      group.keys.forEach((key) => target.keys.add(key));
      target.members.unshift(...group.members);
      groups.splice(groups.indexOf(group), 1);
    }
    groups.push(target);
  }
  return groups.map((g) => g.members);
}

/** Number of distinct rubric concepts found in the given words. */
export function countMatchedConcepts(keywords = [], words = [], lexicon) {
  const matched = new Set(findMatchedKeywords(keywords, words, lexicon));
  return groupKeywordConcepts(keywords, lexicon).filter((group) => group.some((k) => matched.has(k))).length;
}
