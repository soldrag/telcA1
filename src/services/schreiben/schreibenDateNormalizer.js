import calendarWords from './linguistic/data/calendarWords.json' with { type: 'json' };
import functionWords from './linguistic/data/functionWords.json' with { type: 'json' };

const MONTHS = { ...calendarWords.months, ...calendarWords.monthAbbreviations };
const FILLERS = new Set(functionWords.quantityFillers);
const YEAR = "'?(\\d{4}|\\d{2})";
// A year follows a comma or a space ("7. Mai, 1990", "5. August '96"), or a dot in a numeric date.
const YEAR_AFTER_WORD = `(?:\\s*[,\\s]\\s*${YEAR})?`;

// The date closes the answer ("am 18. Juli", "geb. 12.03.1994", "Juli 18"). A year needs its separator,
// so "1.500" is a number, not 1.5.(20)00.
const DATE_FORMS = [
  { pattern: new RegExp(`(\\d{1,2})\\s*\\.?\\s*([a-zäöüß]+)\\.?${YEAR_AFTER_WORD}\\.?$`), day: 1, month: 2, year: 3 },
  { pattern: new RegExp(`([a-zäöüß]+)\\.?,?\\s*(\\d{1,2})\\.?${YEAR_AFTER_WORD}\\.?$`), day: 2, month: 1, year: 3 },
  { pattern: new RegExp(`(\\d{1,2})\\s*[./-]\\s*(\\d{1,2})(?:\\s*[./-]\\s*(?:${YEAR}\\.?)?|\\s+${YEAR})?$`), day: 1, month: 2, year: [3, 4] },
];

function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function monthNumberOf(month) {
  if (/^\d+$/.test(month)) return parseInt(month, 10);
  return Object.hasOwn(MONTHS, month) ? MONTHS[month] : null;
}

// Words before the date ("Montag,", "am") must agree too, so "Montag, 18. Juli" is not "Freitag, 18. Juli".
const leadWordsOf = (text) => text.split(/[^\p{L}]+/u).filter((word) => word && !FILLERS.has(word));

function readDate(match, form) {
  const day = parseInt(match[form.day], 10);
  const month = monthNumberOf(match[form.month]);
  const lead = match.input.slice(0, match.index);
  if (!month || month > 12 || day < 1 || day > 31 || /\d/.test(lead)) return null;
  const year = [form.year].flat().map((group) => match[group]).find(Boolean) ?? null;
  return { dayMonth: `${padTwoDigits(day)}.${padTwoDigits(month)}`, year, leadWords: leadWordsOf(lead) };
}

function parseGermanDate(str = '') {
  const clean = str.trim().toLowerCase().replace(/[!?;]/g, '');
  for (const form of DATE_FORMS) {
    const match = clean.match(form.pattern);
    const date = match && readDate(match, form);
    if (date) return date;
  }
  return null;
}

// A year counts when both write it; "94" is "1994".
function sameYear(a, b) {
  if (!a || !b) return true;
  return a.length === b.length ? a === b : a.slice(-2) === b.slice(-2);
}

const includesAll = (words, others) => words.every((word) => others.includes(word));

const sameLeadWords = (a, b) => includesAll(a, b) || includesAll(b, a);

/** @returns {boolean} the text ends with a date ("18. Juli", "am 18.7.", "12.03.1994") */
export function writesDate(str = '') {
  return parseGermanDate(str) !== null;
}

/** @returns {boolean} the text ends with a date that writes its year ("12.03.1994") */
export function writesDateWithYear(str = '') {
  return Boolean(parseGermanDate(str)?.year);
}

export function areDatesEquivalent(first = '', second = '') {
  const a = parseGermanDate(first);
  const b = parseGermanDate(second);
  return Boolean(a && b) && a.dayMonth === b.dayMonth && sameYear(a.year, b.year) && sameLeadWords(a.leadWords, b.leadWords);
}
