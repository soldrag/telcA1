/**
 * General German verb dictionary (de.wiktionary via german-verbs-database, CC BY-SA 4.0; built by
 * scripts/lexicon/buildGermanVerbs.mjs). Like the noun dictionary, the data is a separate static asset: it is
 * loaded once, asynchronously, before analysis; lookups afterwards are synchronous.
 *
 * The source lists ich/du/er forms, the first-person past and the participle; the plural and "ihr" forms follow
 * from the infinitive and the past stem by the regular endings. Entries carry no valency, so no case is required
 * of their objects.
 */

const DICTIONARY_URL = new URL('./data/germanVerbs.tsv', import.meta.url);

let formIndex = null;

async function readDictionaryText(url) {
  if (url.protocol !== 'file:') {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`German verb dictionary: HTTP ${response.status}`);
    return response.text();
  }
  const fsModule = 'node:fs/promises';
  const { readFile } = await import(/* @vite-ignore */ fsModule);
  return readFile(url, 'utf8');
}

const list = (cell) => (cell ? cell.split(',') : []);
const stemOf = (infinitive) => infinitive.replace(/e?n$/, '');
// "arbeit-et", "rechn-et": an e joins a stem ending in t/d or in a consonant before m/n.
const withEnding = (stem, ending) => (/(?:[td]|[^aeiouäöülrh][mn])$/.test(stem) ? `${stem}e${ending}` : `${stem}${ending}`);

// "ihr" takes the regular ending on the infinitive stem; the er-form is that form unless its vowel changes
// ("arbeitet", "rechnet" — but "fährt" → "fahrt").
function ihrForm(infinitive, erForms) {
  const stem = stemOf(infinitive);
  return erForms.find((form) => form === `${stem}t` || form === `${stem}et`) || withEnding(stem, 't');
}

function presentForms(infinitive, [ich, du, er]) {
  return [
    ...list(ich).map((form) => [form, { person: [1], number: 'sg' }]),
    ...list(du).map((form) => [form, { person: [2], number: 'sg' }]),
    ...list(er).map((form) => [form, { person: [3], number: 'sg' }]),
    [ihrForm(infinitive, list(er)), { person: [2], number: 'pl' }],
    [infinitive, { person: [1, 3], number: 'pl' }],
  ];
}

function pastForms(past) {
  // "machte": machtest, machtet, machten; "kam": kamst, kamt, kamen; "fand"/"tat": fandest, fandet;
  // "las"/"hieß": lasest, last — an e joins -st after a sibilant and -st/-t after t/d.
  return list(past).flatMap((form) => {
    const plural = form.endsWith('e') ? `${form}n` : `${form}en`;
    const second = form.endsWith('e') ? `${form}st` : withEnding(form, 'st').replace(/([sßzx])st$/, '$1est');
    const ihr = form.endsWith('e') ? `${form}t` : withEnding(form, 't');
    return [
      [form, { person: [1, 3], number: 'sg', tense: 'PAST' }],
      [second, { person: [2], number: 'sg', tense: 'PAST' }],
      [ihr, { person: [2], number: 'pl', tense: 'PAST' }],
      [plural, { person: [1, 3], number: 'pl', tense: 'PAST' }],
    ];
  });
}

function toEntries(line) {
  const [infinitive, prefix, ich, du, er, past, participle] = line.split('\t');
  const common = { lemma: infinitive, source: 'dictionary' };
  const infinitiveEntry = prefix
    ? { pos: 'VERB_INF', ...common, valency: 'SEP', baseVerb: infinitive.slice(prefix.length) }
    : { pos: 'VERB_INF', ...common };
  const finite = prefix ? [] : [...presentForms(infinitive, [ich, du, er]), ...pastForms(past)]
    .map(([form, features]) => [form, { pos: 'VERB_FIN', ...common, ...features }]);
  return [[infinitive, infinitiveEntry], ...finite, ...list(participle).map((form) => [form, { pos: 'VERB_PART', ...common }])];
}

/** @returns {Map<string, object[]>} lower-case form → verb entries */
function indexVerbDictionary(text = '') {
  const index = new Map();
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    for (const [form, entry] of toEntries(line)) {
      const key = form.toLowerCase();
      const entries = index.get(key);
      const frozen = Object.freeze(entry);
      if (!entries) index.set(key, [frozen]);
      else if (!entries.some((e) => JSON.stringify(e) === JSON.stringify(frozen))) entries.push(frozen);
    }
  }
  return index;
}

/** Loads the dictionary once; later calls resolve immediately. */
export async function loadGermanVerbDictionary(readText = readDictionaryText) {
  if (formIndex) return;
  formIndex = indexVerbDictionary(await readText(DICTIONARY_URL));
}

/**
 * @param {string} word - any form, any case
 * @returns {object[]} verb entries in the lexicon entry format, marked `source: 'dictionary'`
 */
export function lookupDictionaryVerb(word = '') {
  if (!formIndex) throw new Error('German verb dictionary is not loaded: await loadGermanVerbDictionary() first');
  return formIndex.get(String(word).toLowerCase()) || [];
}

/** @returns {string[]} verb forms with at least one dictionary entry matching the predicate */
export function findDictionaryVerbForms(predicate) {
  if (!formIndex) throw new Error('German verb dictionary is not loaded: await loadGermanVerbDictionary() first');
  return [...formIndex].filter(([, entries]) => entries.some(predicate)).map(([form]) => form);
}
