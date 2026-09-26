/**
 * Splits a letter into plain and marked pieces, so the phrases the grader counted
 * for a criterion can be shown in place. Marks are matched as literal substrings.
 * @param {string} text
 * @param {Array<{ text: string, key: string }>} marks
 * @returns {Array<{ text: string, key: string|null }>}
 */
export function buildLetterHighlights(text = '', marks = []) {
  const ranges = locateMarks(text, marks);
  const pieces = [];
  let cursor = 0;
  ranges.forEach(({ start, end, key }) => {
    if (start > cursor) pieces.push({ text: text.slice(cursor, start), key: null });
    pieces.push({ text: text.slice(start, end), key });
    cursor = end;
  });
  if (cursor < text.length) pieces.push({ text: text.slice(cursor), key: null });
  return pieces;
}

function locateMarks(text, marks) {
  const found = marks
    .filter((mark) => mark?.text?.trim())
    .map((mark) => ({ start: text.indexOf(mark.text.trim()), length: mark.text.trim().length, key: mark.key }))
    .filter((range) => range.start >= 0)
    .map((range) => ({ start: range.start, end: range.start + range.length, key: range.key }))
    .sort((a, b) => a.start - b.start);
  return dropOverlaps(found);
}

function dropOverlaps(ranges) {
  const kept = [];
  ranges.forEach((range) => {
    const previous = kept.at(-1);
    if (!previous || range.start >= previous.end) kept.push(range);
  });
  return kept;
}
