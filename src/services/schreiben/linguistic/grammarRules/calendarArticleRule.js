/**
 * Calendar expressions after a preposition: an ordinal date always needs the article ("vom 15. Juli"),
 * and some prepositions need it with month, weekday or season names too ("im Juli", "am Montag").
 * Where the preposition contracts with the article the contracted form is the correction.
 */
import contractionData from '../data/prepositionContractions.json' with { type: 'json' };

const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');
const TAKES_ARTICLE_WITH_NAMES = new Set(contractionData.calendarNamesTakeArticle);
// "an"/"in" with a time word is not free: days, times of day and dates take "am", months and seasons "im".
const TEMPORAL_PREPOSITION = contractionData.calendarPrepositionByCategory;
const DATIVE_CONTRACTION = new Map(Object.entries(contractionData.contractions)
  .filter(([, c]) => c.article === 'dem')
  .map(([form, c]) => [c.preposition, form]));

function needsArticle(phrase) {
  const isOrdinalDate = !phrase.head;
  return isOrdinalDate || TAKES_ARTICLE_WITH_NAMES.has(phrase.governor.preposition);
}

/** The preposition the time word takes when the learner used "an" or "in"; otherwise the one written. */
function expectedPreposition(phrase) {
  const written = phrase.governor.preposition;
  if (!TAKES_ARTICLE_WITH_NAMES.has(written)) return written;
  const category = phrase.head ? phrase.head.analysis.entry.category : 'date';
  return TEMPORAL_PREPOSITION[category] || written;
}

function checkPhrase(tokens, phrase) {
  if (!phrase.isCalendar || !phrase.governor || (phrase.determiner && !phrase.determiner.implicit)) return null;
  const preposition = expectedPreposition(phrase);
  const wrongPreposition = preposition !== phrase.governor.preposition;
  if (phrase.governor.article && !wrongPreposition) return null;
  const contracted = DATIVE_CONTRACTION.get(preposition);
  if (!contracted || (!wrongPreposition && !needsArticle(phrase))) return null;
  const words = tokens.slice(phrase.start, phrase.end + 1).map((t) => t.raw.replace(/[,;:!?]+$/, '')).join(' ');
  const prep = clean(phrase.governor.token.raw);
  const correction = `${/^[A-ZÄÖÜ]/.test(prep) ? contracted[0].toUpperCase() + contracted.slice(1) : contracted} ${words}`;
  return {
    category: 'rektion',
    code: 'ERR_CALENDAR_ARTICLE',
    original: `${prep} ${words}`,
    correction,
    explanation: `Bei Datum und Zeitangaben steht der Artikel: „${correction}“ (nicht „${prep} ${words}“).`,
  };
}

export const calendarArticleRule = {
  id: 'calendarArticle',
  check(analysis) {
    return analysis.phrases.map((phrase) => checkPhrase(analysis.tokens, phrase)).filter(Boolean);
  },
};
