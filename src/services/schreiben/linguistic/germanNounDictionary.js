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

/** @returns {Map<string, object[]>} lower-case form → noun entries */
function indexNounDictionary(text = '') {
  const index = new Map();
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    for (const [form, entry] of toEntries(line)) {
      const key = form.toLowerCase();
      const entries = index.get(key);
      if (!entries) index.set(key, [entry]);
      else if (!entries.includes(entry)) entries.push(entry);
    }
  }
  return index;
}

/** Loads the dictionary once; later calls resolve immediately. */
export async function loadGermanNounDictionary(readText = readDictionaryText) {
  if (formIndex) return;
  formIndex = indexNounDictionary(await readText(DICTIONARY_URL));
}

/**
 * @param {string} word - any form, any case
 * @returns {object[]} noun entries in the lexicon entry format, marked `source: 'dictionary'`
 */
export function lookupDictionaryNoun(word = '') {
  if (!formIndex) throw new Error('German noun dictionary is not loaded: await loadGermanNounDictionary() first');
  return formIndex.get(String(word).toLowerCase()) || [];
}
