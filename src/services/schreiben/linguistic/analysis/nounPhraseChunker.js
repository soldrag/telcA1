/**
 * Noun phrase chunker over tagged tokens: [preposition] [determiner] [cardinal] adjective* noun,
 * pronouns as one-token phrases, and calendar dates ("15. Juli"). Morphology comes from the paradigm
 * modules, so the chunker knows no individual words.
 */
import paradigms from '../data/declensionParadigms.json' with { type: 'json' };
import contractions from '../data/prepositionContractions.json' with { type: 'json' };
import { analyzeDeterminer } from '../morphology/determinerMorphology.js';
import { analyzeAdjective } from '../morphology/adjectiveMorphology.js';
import { analyzeNoun, withReadings } from '../morphology/nounMorphology.js';
import { agreeingNounReadings } from './nounPhraseFeatures.js';

const CARDINALS = new Set(paradigms.cardinals);
const PRONOUN_POS = new Set(['PRON_SUBJ', 'PRON_OBJ']);
const CALENDAR_CATEGORIES = new Set(['month', 'weekday', 'season', 'daytime']);
const DEGREE_PARTICLES = new Set(paradigms.degreeParticles);
const MASS_QUANTIFIERS = new Set(paradigms.massQuantifierStems);

export const endsPhrase = (token = {}) => /[,;:]$/.test(token.raw || '');
export const isOrdinalDay = (token = {}) => /^\d{1,2}\.$/.test(token.raw || '');
const isCardinal = (token = {}) => CARDINALS.has(token.lower) || /^\d+$/.test(token.raw || '');
const isNounToken = (token = {}) => token.pos === 'NOUN' || /^[A-ZÄÖÜ]/.test(token.raw || '');

/** "zu viel(e)" is a degree phrase, not the preposition "zu". */
function isDegreeParticle(token, next, lexicon) {
  return DEGREE_PARTICLES.has(token.lower) && MASS_QUANTIFIERS.has(analyzeAdjective(next?.lower || '', lexicon)?.stem);
}

function readPreposition(token = {}) {
  const contraction = contractions.contractions[token.lower];
  if (contraction) return { token, preposition: contraction.preposition, article: contraction.article };
  return token.pos === 'PREP' ? { token, preposition: token.lower, article: null } : null;
}

function readDate(tokens, start, lexicon) {
  if (!isOrdinalDay(tokens[start])) return null;
  const month = analyzeNoun(tokens[start + 1]?.raw, lexicon);
  const end = month?.entry.category === 'month' ? start + 1 : start;
  return { start, end, isCalendar: true };
}

function readDeterminer(tokens, index, governor) {
  if (governor?.article) return { token: governor.token, readings: analyzeDeterminer(governor.article), implicit: true, next: index };
  const token = tokens[index];
  const readings = token && !endsPhrase(token) ? analyzeDeterminer(token.lower) : [];
  return readings.length ? { token, readings, implicit: false, next: index + 1 } : { token: null, readings: [], next: index };
}

function readNounPhrase(tokens, start, governor, lexicon) {
  const determiner = readDeterminer(tokens, start, governor);
  let i = determiner.next;
  const quantifier = isCardinal(tokens[i]) && !endsPhrase(tokens[i]) ? tokens[i++] : null;
  const adjectives = [];
  while (tokens[i]?.pos === 'ADJ' && !endsPhrase(tokens[i]) && !isCardinal(tokens[i])) {
    const analysis = analyzeAdjective(tokens[i].lower, lexicon);
    if (!analysis) return null;
    adjectives.push({ token: tokens[i++], analysis });
  }
  // A mass quantifier before the noun ("viel Spaß", "wenig Zeit") rules out a name just as an article does.
  const afterMassQuantifier = MASS_QUANTIFIERS.has(analyzeAdjective(tokens[start - 1]?.lower || '', lexicon)?.stem || tokens[start - 1]?.lower);
  const bare = !determiner.token && !quantifier && adjectives.length === 0 && !afterMassQuantifier;
  const noun = tokens[i] && isNounToken(tokens[i]) ? analyzeNoun(tokens[i].raw, lexicon, { bare }) : null;
  if (!noun) return null;
  const phrase = { start, end: i, determiner: determiner.token ? determiner : null, quantifier, adjectives, head: { token: tokens[i], analysis: noun } };
  const analysis = withReadings(agreeingNounReadings(phrase));
  return { ...phrase, head: { token: tokens[i], analysis }, isCalendar: CALENDAR_CATEGORIES.has(analysis.entry.category) };
}

function readPhraseAt(tokens, index, governor, lexicon) {
  const token = tokens[index];
  if (!token) return null;
  if (PRONOUN_POS.has(token.pos)) return { start: index, end: index, pronoun: token };
  return readDate(tokens, index, lexicon) || readNounPhrase(tokens, index, governor, lexicon);
}

/**
 * @param {Array} tokens - tagged tokens of one sentence
 * @param {{ lookup: Function }} lexicon - level vocabulary port
 * @returns {Array<object>} phrases in text order; `governor` is the preposition directly before the phrase
 */
export function chunkNounPhrases(tokens, lexicon) {
  const phrases = [];
  for (let i = 0; i < tokens.length; i++) {
    const governor = isDegreeParticle(tokens[i], tokens[i + 1], lexicon) ? null : readPreposition(tokens[i]);
    const start = governor && !endsPhrase(tokens[i]) ? i + 1 : i;
    const phrase = readPhraseAt(tokens, start, governor && start === i + 1 ? governor : null, lexicon);
    if (!phrase) continue;
    phrases.push({ ...phrase, governor: start === i + 1 ? governor : null });
    i = phrase.end;
  }
  return phrases;
}
