/**
 * Reference-phrase alignment without a model (experiment 1, run A): a span and a reference phrase become sets of
 * content tokens (lexicon lemma → Snowball stem, numbers as <NUM>, detector slots <TIME>/<PERS>/<JOB>, polarity and
 * mood markers <NEG>/<Q>/<PAST>), and a reference is scored by its IDF-weighted recall in the span. Tokens match
 * exactly (1) or by compound head or a small misspelling (0.8). Level-free: the lexicon and the IDF table are injected.
 */

import functionWords from '../../linguistic/data/functionWords.json' with { type: 'json' };
import numberWords from '../../linguistic/data/numberWords.json' with { type: 'json' };
import { stemByLemma } from '../../linguistic/lemmaStem.js';
import { parseSentencePropositions } from '../../linguistic/clauseStructureParser.js';
import { isAddresseeDirected } from '../../linguistic/sentenceMood.js';
import { calculateDamerauDistance } from '../../linguistic/editDistance.js';
import { hasTemporalExpression } from '../temporalRangeDetector.js';
import { hasPersonCount } from '../personCountDetector.js';
import { hasOccupation } from '../occupationDetector.js';

const STOP = new Set(functionWords.queryStopWords);
const CARDINALS = new Set(Object.keys(numberWords.cardinals).filter((w) => !numberWords.articleForms.includes(w)));
const CLOSED = new Set(['DET', 'PREP', 'PRON_SUBJ', 'PRON_OBJ', 'KONJ_COORD', 'KONJ_SUB', 'INTERROG']);
const PAST_FORMS = new Set(['war', 'waren', 'warst', 'hatte', 'hatten', 'hattest']);
const isNegationWord = (w) => w === 'nicht' || w === 'nie' || w.startsWith('kein');

const clean = (w) => String(w).toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const wordsOf = (s) => String(s).split(/[\s,.;:!?()«»"„“/]+/).map(clean).filter(Boolean);

function isClosedClass(word, lexicon) {
  if (STOP.has(word)) return true;
  const entries = lexicon.lookup(word) || [];
  return entries.length > 0 && entries.every((e) => CLOSED.has(e.pos));
}

function propositionsOf(span, lexicon) {
  try {
    return parseSentencePropositions(span, { lexicon });
  } catch {
    return [];
  }
}

function markers(span, words, lexicon) {
  const out = [];
  const props = propositionsOf(span, lexicon);
  const negated = props.some((p) => p.polarity?.isSentenceNegated || p.polarity?.negatedNouns?.length) || words.some(isNegationWord);
  if (negated) out.push('<NEG>');
  if (hasTemporalExpression(span)) out.push('<TIME>');
  if (hasPersonCount(span)) out.push('<PERS>');
  if (hasOccupation(span)) out.push('<JOB>');
  let directed;
  try { directed = isAddresseeDirected(span, { lexicon }); } catch { directed = String(span).trim().endsWith('?'); }
  if (directed) out.push('<Q>');
  const tags = lexicon.tag(String(span).split(/\s+/).filter(Boolean));
  if (tags.some((t) => t.pos === 'VERB_PART' || t.pos === 'PART_PAST') || words.some((w) => PAST_FORMS.has(w))) out.push('<PAST>');
  return { out, props };
}

/** @returns {Array<{ key: string, word: string|null }>} the span's tokens */
export function tokenizeSpan(span, lexicon) {
  const tokens = new Map();
  const add = (key, word = null) => { if (key && !tokens.has(key)) tokens.set(key, { key, word }); };
  const words = wordsOf(span);
  for (const w of words) {
    if (/^\d/.test(w) || CARDINALS.has(w)) add('<NUM>');
    else if (!isClosedClass(w, lexicon) && !isNegationWord(w)) add(stemByLemma(w, lexicon), w);
  }
  const { out, props } = markers(span, words, lexicon);
  for (const p of props) {
    const base = p.predicateCore?.baseAction;
    if (base && p.predicateCore?.verbPrefix) add(stemByLemma(base, lexicon), base);
  }
  out.forEach((m) => add(m));
  return [...tokens.values()];
}

function canHeadCompound(word, lexicon) {
  if (!word || word.length < 4) return false;
  const entries = lexicon.lookup(word) || [];
  return entries.length === 0 || entries.some((e) => e.pos === 'NOUN' || String(e.pos).startsWith('VERB'));
}

const formsOf = (w, lexicon) => [w, ...(lexicon.lookup(w) || []).map((e) => String(e.lemma || '').toLowerCase()).filter(Boolean)];

/** 1 same stem; 0.8 compound head or a small misspelling of a long word; else 0. */
export function matchTokens(a, b, lexicon) {
  if (a.key === b.key) return 1;
  if (!a.word || !b.word) return 0;
  const [short, long] = a.word.length <= b.word.length ? [a.word, b.word] : [b.word, a.word];
  if (canHeadCompound(short, lexicon) && formsOf(short, lexicon).some((f) => f.length >= 4 && f !== long && long.endsWith(f))) return 0.8;
  if (short.length >= 5 && calculateDamerauDistance(a.word, b.word) <= (short.length >= 8 ? 2 : 1)) return 0.8;
  return 0;
}

/** IDF of a token from a stored table { N, df }; a token no reference has gets ln N. */
export const idfFrom = (table) => (key) => Math.log(table.N / (table.df[key] || 1));

/** IDF-weighted recall of the reference's tokens in the span; null for a reference without tokens. */
export function alignReference(ref, span, { idf, lexicon }) {
  let num = 0;
  let den = 0;
  for (const t of ref) {
    const w = idf(t.key);
    den += w;
    let best = 0;
    for (const u of span) {
      best = Math.max(best, matchTokens(t, u, lexicon));
      if (best === 1) break;
    }
    num += w * best;
  }
  return den > 0 ? num / den : null;
}

export function bestAlignment(refs, span, context) {
  return refs.reduce((best, ref) => {
    const a = alignReference(ref, span, context);
    return a !== null && a > best ? a : best;
  }, 0);
}
