import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildLetterHighlights } from '../src/utils/letterHighlights.js';

describe('buildLetterHighlights', () => {
  const letter = 'Liebe Anna,\nich kann am Montag nicht kommen. Hast du Dienstag Zeit?\nViele Grüße\nTom';

  it('marks credited phrases in reading order and keeps the rest as plain text', () => {
    const pieces = buildLetterHighlights(letter, [
      { key: 'lp2', text: 'Hast du Dienstag Zeit?' },
      { key: 'lp1', text: 'ich kann am Montag nicht kommen.' },
    ]);
    assert.equal(pieces.map((piece) => piece.text).join(''), letter);
    assert.deepEqual(pieces.filter((piece) => piece.key).map((piece) => piece.key), ['lp1', 'lp2']);
  });

  it('ignores empty or missing phrases and overlapping repeats', () => {
    const pieces = buildLetterHighlights(letter, [
      { key: 'lp1', text: 'ich kann am Montag nicht kommen.' },
      { key: 'lp3', text: 'am Montag' },
      { key: 'lp2', text: '' },
      { key: 'frame', text: 'Sehr geehrte Damen und Herren' },
    ]);
    assert.deepEqual(pieces.filter((piece) => piece.key).map((piece) => piece.key), ['lp1']);
  });
});
