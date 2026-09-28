/**
 * A1 person-count detector (token-based).
 * "Personen" in a booking/registration Leitpunkt means how many people: a numeral next to a person noun
 * ("vier Personen", "2 Erwachsene", "mit zwei Kindern") or an explicit "allein". A bare "wir" names
 * participants but no count, so it is not evidence here.
 */

import numberWords from '../linguistic/data/numberWords.json' with { type: 'json' };
import roleWords from '../linguistic/data/roleWords.json' with { type: 'json' };

const NUMERALS = new Set(Object.keys(numberWords.cardinals));
const PERSON_NOUNS = new Set(roleWords.personCountNouns);
const SOLO_MARKERS = new Set(['allein', 'alleine']);
const NOUN_WINDOW = 2;

function tokenize(text = '') {
  return String(text).toLowerCase().split(/[\s,.;:!?()]+/).filter(Boolean);
}

function isNumeral(token) {
  return NUMERALS.has(token) || /^\d{1,2}$/.test(token);
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasPersonCount(text = '') {
  const tokens = tokenize(text);
  if (tokens.some((t) => SOLO_MARKERS.has(t))) return true;
  return tokens.some((token, i) => isNumeral(token)
    && tokens.slice(i + 1, i + 1 + NOUN_WINDOW).some((t) => PERSON_NOUNS.has(t)));
}
