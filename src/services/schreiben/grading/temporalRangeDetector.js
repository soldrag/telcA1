/**
 * A1 temporal expression detector (token-based, no ad-hoc regex chains).
 * Recognises what a telc A1 letter uses to state "when / how long":
 * - range:    boundary + connector (bis / - / bis zum) + boundary — "vom 15. bis 25. Juli", "15.07.-25.07."
 * - duration: numeral + time unit — "zwei Wochen", "10 Tage"
 * - point:    temporal preposition + calendar anchor — "im Juli", "ab 15. Juli", "am Montag";
 *             a clock time — "18 Uhr", "um 9.30 Uhr"; a relative day adverb — "morgen", "heute"
 * A boundary is a calendar token (day number, DD.MM date, month, ordinal word), so a route
 * like "von Hamburg bis Kiel" is not a time range.
 */

import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';

const MONTHS = new Set(['januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august',
  'september', 'oktober', 'november', 'dezember']);
const CALENDAR_ANCHORS = new Set([...MONTHS, 'sommer', 'winter', 'herbst', 'frühling', 'fruehling',
  'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'wochenende', 'ostern', 'weihnachten']);
const RELATIVE_DAYS = new Set(['heute', 'morgen', 'übermorgen', 'uebermorgen']);
const NUMERAL_WORDS = new Set(['ein', 'eine', 'einen', 'zwei', 'drei', 'vier', 'fünf', 'fuenf', 'sechs', 'sieben',
  'acht', 'neun', 'zehn', 'elf', 'zwölf', 'zwoelf', 'vierzehn', 'zwanzig', 'dreißig']);
const ORDINAL_ROOTS = ['erst', 'zweit', 'dritt', 'viert', 'fünf', 'fuenf', 'sechs', 'sieb', 'acht', 'neun',
  'zehn', 'elf', 'zwölf', 'zwoelf', 'zwanzig', 'dreißig', 'dreissig'];
const TIME_UNITS = new Set(['tag', 'tage', 'tagen', 'woche', 'wochen', 'monat', 'monate', 'monaten', 'nacht', 'nächte', 'naechte', 'stunde', 'stunden']);
const RANGE_CONNECTORS = new Set(['bis', '-', '–']);
const RANGE_FILLERS = new Set(['zum', 'zur', 'den', 'dem']);
const POINT_PREPOSITIONS = new Set(['ab', 'am', 'im', 'in', 'bis', 'seit', 'vom', 'von']);
const BOUNDARY_WINDOW = 3;

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/(\d\.?)\s*([-–])\s*(\d)/g, '$1 $2 $3')
    .split(/\s+/)
    .map((raw) => (/^\d/.test(raw) ? raw.replace(/[,;:!?]+$/, '') : raw.replace(/[.,;:!?()"„“]+$/g, '')))
    .filter(Boolean);
}

function isDayNumber(token) {
  const day = Number.parseInt(token, 10);
  return /^\d{1,2}\.?$/.test(token) && day >= 1 && day <= 31;
}

function isNumericDate(token) {
  return /^\d{1,2}\.\d{1,2}\.?(\d{2,4})?$/.test(token);
}

function isOrdinalWord(token) {
  if (!/(s?ten|s?tem|s?ter)$/.test(token)) return false;
  return ORDINAL_ROOTS.some((root) => token.startsWith(root) || token.includes(`und${root}`));
}

function isCalendarBoundary(token) {
  return isDayNumber(token) || isNumericDate(token) || MONTHS.has(token) || isOrdinalWord(token);
}

function hasBoundaryNear(tokens, from, step) {
  for (let i = from, seen = 0; i >= 0 && i < tokens.length && seen < BOUNDARY_WINDOW; i += step) {
    if (RANGE_FILLERS.has(tokens[i])) continue;
    if (isCalendarBoundary(tokens[i])) return true;
    seen += 1;
  }
  return false;
}

// Bare numbers on both sides ("4 bis 5 Personen") are quantities, not dates.
function hasCalendarAnchorAround(tokens, index) {
  return tokens.slice(Math.max(0, index - BOUNDARY_WINDOW - 1), index + BOUNDARY_WINDOW + 2)
    .some((t) => MONTHS.has(t) || isNumericDate(t) || /^\d{1,2}\.$/.test(t) || isOrdinalWord(t));
}

function hasRange(tokens) {
  return tokens.some((token, i) => RANGE_CONNECTORS.has(token)
    && hasBoundaryNear(tokens, i - 1, -1)
    && hasBoundaryNear(tokens, i + 1, 1)
    && hasCalendarAnchorAround(tokens, i));
}

function hasDuration(tokens) {
  return tokens.some((token, i) => TIME_UNITS.has(token)
    && i > 0 && (NUMERAL_WORDS.has(tokens[i - 1]) || /^\d+$/.test(tokens[i - 1])));
}

function isClockTime(tokens, index) {
  const prev = tokens[index - 1] || '';
  return tokens[index] === 'uhr' && (/^\d{1,2}([.:]\d{2})?$/.test(prev) || NUMERAL_WORDS.has(prev));
}

// German writes the adverb "morgen" in lower case and the noun "Morgen" ("Guten Morgen", "am Morgen")
// capitalised; only a sentence-initial capital is ambiguous and is read as the adverb.
function hasRelativeDayAdverb(text) {
  return splitGermanSentences(text).some((sentence) => sentence.split(/\s+/).some((raw, i) => {
    const word = raw.replace(/[.,;:!?()"„“]+/g, '');
    const lower = word.toLowerCase();
    return RELATIVE_DAYS.has(lower) && (word === lower || i === 0);
  }));
}

function hasCalendarPoint(tokens, text) {
  const hasPrepPoint = tokens.some((token, i) => POINT_PREPOSITIONS.has(token)
    && tokens.slice(i + 1, i + 1 + BOUNDARY_WINDOW).some((t) => CALENDAR_ANCHORS.has(t) || isNumericDate(t)));
  return hasPrepPoint || tokens.some((_, i) => isClockTime(tokens, i)) || hasRelativeDayAdverb(text);
}

/**
 * @param {string} text
 * @returns {'range'|'duration'|'point'|null}
 */
export function detectTemporalExpression(text = '') {
  const tokens = tokenize(text);
  if (hasRange(tokens)) return 'range';
  if (hasDuration(tokens)) return 'duration';
  if (hasCalendarPoint(tokens, text)) return 'point';
  return null;
}

export function hasTemporalExpression(text = '') {
  return detectTemporalExpression(text) !== null;
}
