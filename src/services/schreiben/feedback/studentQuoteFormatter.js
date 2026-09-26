/**
 * Formats a fragment of the student's letter for citation inside localized feedback.
 * Keeps the German text verbatim; only trims, shortens on a word boundary and adds locale quotes.
 */

const MAX_QUOTE_LENGTH = 70;
const TRAILING_PUNCTUATION = '.,!?;:';
const QUOTE_MARKS = Object.freeze({ ru: ['«', '»'], en: ['"', '"'] });

function stripTrailingPunctuation(text) {
  let end = text.length;
  while (end > 0 && TRAILING_PUNCTUATION.includes(text[end - 1])) end -= 1;
  return text.slice(0, end).trimEnd();
}

function shortenOnWordBoundary(text, maxLength) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const head = lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut;
  return `${stripTrailingPunctuation(head)}…`;
}

/**
 * @param {string} text - Verbatim fragment of the student's text
 * @param {'ru'|'en'} language
 * @returns {string} Quoted fragment, or '' when there is nothing to cite
 */
export function formatStudentQuote(text, language = 'en') {
  const clean = stripTrailingPunctuation(String(text || '').replace(/\s+/g, ' ').trim());
  if (!clean) return '';
  const [open, close] = QUOTE_MARKS[language] || QUOTE_MARKS.en;
  return `${open}${shortenOnWordBoundary(clean, MAX_QUOTE_LENGTH)}${close}`;
}
