/**
 * German sentence tokenizer aware of abbreviations like Dr., z. B., etc.
 */

const PROTECTED_ABBRS = [
  { regex: /\bDr\./g, placeholder: '___DR___' },
  { regex: /\bz\.\s*B\./g, placeholder: '___ZB___' },
  { regex: /\bca\./g, placeholder: '___CA___' },
  { regex: /\busw\./g, placeholder: '___USW___' },
  { regex: /\bNr\./g, placeholder: '___NR___' },
];

const ORDINAL_DATE_REGEX = /\b(\d{1,2})\.(?=\s*(?:bis|und|[a-zäöü]|Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b)/gi;
const ORDINAL_PLACEHOLDER = '___ORDDOT___';

export function splitGermanSentences(rawText = '') {
  if (!rawText || !rawText.trim()) return [];

  let text = rawText.trim();
  for (const abbr of PROTECTED_ABBRS) {
    text = text.replace(abbr.regex, abbr.placeholder);
  }
  text = text.replace(ORDINAL_DATE_REGEX, `$1${ORDINAL_PLACEHOLDER}`);

  // Split on punctuation followed by whitespace or line break
  const rawSegments = text
    .split(/(?<=[.?!])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  const restored = rawSegments.map(segment => {
    let s = segment;
    for (const abbr of PROTECTED_ABBRS) {
      const orig = abbr.placeholder === '___DR___' ? 'Dr.' :
                   abbr.placeholder === '___ZB___' ? 'z. B.' :
                   abbr.placeholder === '___CA___' ? 'ca.' :
                   abbr.placeholder === '___USW___' ? 'usw.' : 'Nr.';
      s = s.replaceAll(abbr.placeholder, orig);
    }
    s = s.replaceAll(ORDINAL_PLACEHOLDER, '.');
    return s;
  });

  return restored;
}
