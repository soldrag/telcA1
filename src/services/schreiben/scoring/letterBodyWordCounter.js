/**
 * Counts the words of a letter body (salutation, closing and signature excluded).
 * One definition for the pipeline and the UI, so the accuracy density is the same everywhere.
 */

import { segmentMacroStructure } from '../linguistic/macroSegmenter.js';

/**
 * @param {string} text - the full submitted letter
 * @returns {number}
 */
export function countLetterBodyWords(text = '') {
  if (!String(text || '').trim()) return 0;
  const { bodyText } = segmentMacroStructure(text);
  return String(bodyText || text).split(/\s+/).filter(Boolean).length;
}
