/**
 * Case government: which cases a phrase must take. A preposition governs its phrase (lexicon `prepCase`);
 * a verb governs the objects after it (clause frame). Subjects, adverbial time phrases and phrases
 * before the finite verb of a main clause are not governed by the verb.
 */
import { findClauseOf } from './clauseContext.js';
import { realizedFeatures } from './nounPhraseFeatures.js';

const PREPOSITION_CASES = { AKK: ['AKK'], DAT: ['DAT'], GEN: ['GEN'], WECHSEL: ['AKK', 'DAT'] };
const ADVERBIAL_CATEGORIES = new Set(['duration', 'month', 'weekday', 'season', 'daytime']);

/** A level policy may accept extra cases (e.g. the everyday dative after genitive prepositions). */
function prepositionCases(governor, { lexicon, policy }) {
  const entry = lexicon.lookup(governor.preposition).find((e) => e.pos === 'PREP');
  const cases = entry ? PREPOSITION_CASES[entry.prepCase] : null;
  if (!cases) return null;
  return [...cases, ...(policy.acceptedPrepositionCases?.[entry.prepCase] || [])];
}

function canBeNominative(phrase) {
  if (phrase.pronoun) return phrase.pronoun.pos === 'PRON_SUBJ';
  return phrase.head?.analysis.cases.includes('NOM') ?? false;
}

function isAfterFiniteVerb(phrase, clause) {
  return clause.isVerbFinal || (clause.finiteIndex !== -1 && phrase.start > clause.finiteIndex);
}

/** The subject is a pronoun subject, or else the first nominative-capable phrase of the clause. */
function isClauseSubject(phrase, clause, phrases) {
  if (phrase.pronoun?.pos === 'PRON_SUBJ') return true;
  if (clause.hasPronounSubject) return false;
  const ungoverned = phrases.filter((p) => !p.governor && p.start >= clause.start && p.end <= clause.end && !p.isCalendar);
  return ungoverned.find(canBeNominative) === phrase;
}

const canBeAccusative = (phrase) => (phrase.pronoun
  ? Boolean(phrase.pronoun.case?.includes('AKK'))
  : phrase.head && realizedFeatures(phrase).some((f) => f.case === 'AKK'));

/** The accusative object comes after a dative one: "macht mir viel Spaß", "gebe dir das Buch". */
function hasLaterAccusativeObject(phrase, clause, phrases) {
  // Time phrases in the accusative ("jeden Tag", "diesen Monat") are adverbials, not objects.
  return phrases.some((p) => p.start > phrase.end && p.end <= clause.end && !p.governor && !p.isCalendar
    && !ADVERBIAL_CATEGORIES.has(p.head?.analysis.entry.category) && canBeAccusative(p));
}

function verbObjectCases(phrase, context) {
  const clause = findClauseOf(context.clauses, phrase.start);
  if (!clause?.objectCases || !isAfterFiniteVerb(phrase, clause)) return null;
  if (phrase.isCalendar || ADVERBIAL_CATEGORIES.has(phrase.head?.analysis.entry.category)) return null;
  if (isClauseSubject(phrase, clause, context.phrases)) return null;
  const takesDative = clause.objectCases.includes('AKK') && hasLaterAccusativeObject(phrase, clause, context.phrases);
  // The earlier of two objects is the dative one, so a correction puts it in the dative ("gebe meinem Freund das Buch").
  return { cases: takesDative ? ['DAT', ...clause.objectCases.filter((c) => c !== 'DAT')] : clause.objectCases, governor: clause.lexicalVerb };
}

/**
 * @param {object} phrase - from chunkNounPhrases
 * @param {{ clauses: Array, phrases: Array, lexicon: { lookup: Function }, policy: object }} context
 * @returns {{ cases: string[], kind: 'preposition'|'verb', governor: object } | null}
 */
export function resolveRequiredCases(phrase, context) {
  if (phrase.governor) {
    const cases = prepositionCases(phrase.governor, context);
    return cases ? { cases, kind: 'preposition', governor: phrase.governor } : null;
  }
  const verbCases = verbObjectCases(phrase, context);
  return verbCases ? { ...verbCases, kind: 'verb' } : null;
}
