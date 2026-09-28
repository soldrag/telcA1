/**
 * Splits a form answer into words and numbers: "25€" → ['25', 'euro'], "18.07." → ['18', '07'],
 * "Hauptstraße 5a" → ['hauptstraße', '5a'], "1.500,00 €" → ['1500', 'euro'], "€25" → ['euro', '25'], "03" → '3'.
 */
import numberWords from './linguistic/data/numberWords.json' with { type: 'json' };

const NUMBER_WORDS = { ...numberWords.cardinals, ...numberWords.fractions };
const ARTICLE_FORMS = new Set(numberWords.articleForms);
const UNIT_SYMBOLS = numberWords.unitSymbols;
const SYMBOL_CHARS = Object.keys(UNIT_SYMBOLS).filter((symbol) => symbol.length === 1).join('');
// "1.500" (thousands) and "25,50" (decimal comma) are one number; a house number keeps its letter ("5a").
// A leading zero is dropped from a count, a day or an hour ("03", "09"), not from a postcode or an area code ("04109").
const ONE_NUMBER = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?$/;
const HOUSE_NUMBER = /^\d+\p{L}$/u;
// A dot before exactly two digits is a decimal point ("12.50" = "12,50"): a thousands dot has three.
const DECIMAL_DOT = /(\d)\.(\d{2})(?![\d.])/g;
const OUTER_PUNCTUATION = new RegExp(`^[^\\p{L}\\d${SYMBOL_CHARS}]+|[^\\p{L}\\d${SYMBOL_CHARS}]+$`, 'gu');

function valueOfNumber(token) {
  if (HOUSE_NUMBER.test(token)) return token;
  const match = token.match(ONE_NUMBER);
  if (!match) return null;
  const fraction = (match[2] ?? '').replace(/0+$/, '');
  const whole = match[1].replaceAll('.', '').replace(/^0(?=\d$)/, '');
  return whole + (fraction ? `,${fraction}` : '');
}

function splitToken(token) {
  const bare = token.replace(OUTER_PUNCTUATION, '');
  if (!bare) return [];
  if (valueOfNumber(bare)) return [bare];
  if (!/\d/.test(bare)) return bare.split('/').filter(Boolean);
  return bare.split(/[.,:/\-–]/).filter(Boolean);
}

/** @returns {string[]} the lower-case words and numbers of a text, a unit symbol written as its word */
export function splitNumberWords(str = '') {
  return String(str).toLowerCase().replace(DECIMAL_DOT, '$1,$2')
    .replace(new RegExp(`(\\d)(\\p{L}{2,}|[${SYMBOL_CHARS}])`, 'gu'), '$1 $2')
    .replace(new RegExp(`([${SYMBOL_CHARS}]|\\b(?:${Object.keys(UNIT_SYMBOLS).filter((unit) => unit.length > 1).join('|')}))(\\d)`, 'gu'), '$1 $2')
    .split(/\s+/)
    .flatMap(splitToken)
    .map((word) => UNIT_SYMBOLS[word] ?? word);
}

/** @returns {string|null} the value of a number or number word ("drei" → '3', "halbes" → '0,5'), else null */
export function numberOf(word) {
  if (Object.hasOwn(NUMBER_WORDS, word)) return String(NUMBER_WORDS[word]);
  return valueOfNumber(word);
}

/** @returns {boolean} the text writes a number: a digit or a number word that is not also the article ("eine") */
export function writesNumber(str = '') {
  return splitNumberWords(str).some((word) => /\d/.test(word) || (numberOf(word) && !ARTICLE_FORMS.has(word)));
}

/** @returns {boolean} the text writes a number, the article "ein" counted as one ("ein Jahr") */
export function writesAnyNumber(str = '') {
  return splitNumberWords(str).some((word) => numberOf(word));
}
