/**
 * General German noun dictionary (de.wiktionary via german-nouns, CC BY-SA 4.0; built by
 * scripts/lexicon/buildGermanNouns.mjs). The data is a separate static asset: it is loaded once,
 * asynchronously, before analysis; lookups afterwards are synchronous.
 */

const DICTIONARY_URL = new URL('./data/germanNouns.tsv', import.meta.url);

let formIndex = null;

async function readDictionaryText(url) {
  if (url.protocol !== 'file:') {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`German noun dictionary: HTTP ${response.status}`);
    return response.text();
  }
  const fsModule = 'node:fs/promises';
  const { readFile } = await import(/* @vite-ignore */ fsModule);
  return readFile(url, 'utf8');
}

const expand = (lemma, list) => (list ? list.split(',').map((f) => (f.startsWith('~') ? lemma + f.slice(1) : f)) : []);

function parseFlags(lemma, flags) {
  const parsed = {};
  for (const flag of flags ? flags.split(',') : []) {
    if (flag === 'a') parsed.adjectivalDeclension = true;
    if (flag.startsWith('w=')) Object.assign(parsed, { weakMasculine: true, obliqueForm: expand(lemma, flag.slice(2))[0] });
  }
  return parsed;
}

function toEntries(line) {
  const [lemma, genders, flags, singular, plural] = line.split('\t');
  const genderList = genders ? genders.split(',') : [];
  const gender = genderList.length === 1 ? { gender: genderList[0] } : genderList.length > 1 ? { genders: genderList } : {};
  const pluralForms = expand(lemma, plural);
  const { adjectivalDeclension, ...weak } = parseFlags(lemma, flags);
  const common = { pos: 'NOUN', lemma, source: 'dictionary', ...gender, ...(adjectivalDeclension && { adjectivalDeclension }) };
  const sg = Object.freeze({ ...common, number: 'sg', ...(pluralForms[0] && { plural: pluralForms[0] }), ...weak });
  const pl = Object.freeze({ ...common, number: 'pl' });
  return [...expand(lemma, singular).map((form) => [form, sg]), ...pluralForms.map((form) => [form, pl])];
}

const UMLAUT_PAIRS = {
  A: ['A', 'Ä'], Ä: ['A', 'Ä'],
  O: ['O', 'Ö'], Ö: ['O', 'Ö'],
  U: ['U', 'Ü'], Ü: ['U', 'Ü'],
};

function scanLetterBoundaries(lines) {
  const ranges = new Map();
  let currentLetter = '';
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line[0] === '#') continue;
    const first = line[0].toUpperCase();
    if (first !== currentLetter) {
      if (currentLetter) ranges.set(currentLetter, [start, i]);
      currentLetter = first;
      start = i;
    }
  }
  if (currentLetter) ranges.set(currentLetter, [start, lines.length]);
  return ranges;
}

class NounDictionaryStore {
  constructor(text = '') {
    this.lines = text.split('\n');
    this.letterRanges = scanLetterBoundaries(this.lines);
    this.loadedLetters = new Set();
    this.cache = new Map();
  }

  loadLetterBlock(letter) {
    const range = this.letterRanges.get(letter);
    if (!range) return;
    for (let i = range[0]; i < range[1]; i++) {
      const line = this.lines[i];
      if (!line || line[0] === '#') continue;
      for (const [form, entry] of toEntries(line)) {
        const key = form.toLowerCase();
        const entries = this.cache.get(key);
        if (!entries) this.cache.set(key, [entry]);
        else if (!entries.includes(entry)) entries.push(entry);
      }
    }
  }

  ensureLetter(letter) {
    const lettersToLoad = UMLAUT_PAIRS[letter] || [letter];
    for (const l of lettersToLoad) {
      if (this.loadedLetters.has(l)) continue;
      this.loadedLetters.add(l);
      this.loadLetterBlock(l);
    }
  }

  lookup(word = '') {
    const key = String(word || '').toLowerCase();
    const first = key[0]?.toUpperCase();
    if (first) this.ensureLetter(first);
    return this.cache.get(key) || [];
  }
}

let nounStore = null;

/** Loads the dictionary once; later calls resolve immediately. */
export async function loadGermanNounDictionary(readText = readDictionaryText) {
  if (nounStore) return;
  nounStore = new NounDictionaryStore(await readText(DICTIONARY_URL));
}

/**
 * @param {string} word - any form, any case
 * @returns {object[]} noun entries in the lexicon entry format, marked `source: 'dictionary'`
 */
export function lookupDictionaryNoun(word = '') {
  if (!nounStore) throw new Error('German noun dictionary is not loaded: await loadGermanNounDictionary() first');
  return nounStore.lookup(word);
}
