/**
 * Calendar expressions after a preposition: an ordinal date always needs the article ("vom 15. Juli"),
 * and some prepositions need it with month, weekday or season names too ("im Juli", "am Montag").
 * Where the preposition contracts with the article the contracted form is the correction.
 */
import contractionData from '../data/prepositionContractions.json' with { type: 'json' };

const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');
const TAKES_ARTICLE_WITH_NAMES = new Set(contractionData.calendarNamesTakeArticle);
const DATIVE_CONTRACTION = new Map(Object.entries(contractionData.contractions)
  .filter(([, c]) => c.article === 'dem')
  .map(([form, c]) => [c.preposition, form]));

function needsArticle(phrase) {
  const isOrdinalDate = !phrase.head;
  return isOrdinalDate || TAKES_ARTICLE_WITH_NAMES.has(phrase.governor.preposition);
}

function checkPhrase(tokens, phrase) {
  if (!phrase.isCalendar || !phrase.governor || phrase.governor.article || phrase.determiner) return null;
  const contracted = DATIVE_CONTRACTION.get(phrase.governor.preposition);
  if (!contracted || !needsArticle(phrase)) return null;
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
