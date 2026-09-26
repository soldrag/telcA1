/**
 * Replaces the selected range of `text` with `insertion`.
 * Returns the new text and the caret position right after the insertion.
 */
export function insertAtSelection(text, insertion, selection = {}) {
  const source = String(text ?? '');
  const start = clampIndex(selection.start ?? source.length, source.length);
  const end = clampIndex(selection.end ?? start, source.length);
  const [from, to] = start <= end ? [start, end] : [end, start];
  return {
    text: source.slice(0, from) + insertion + source.slice(to),
    caret: from + insertion.length,
  };
}

function clampIndex(value, max) {
  return Math.min(Math.max(Number(value) || 0, 0), max);
}
