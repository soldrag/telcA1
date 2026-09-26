import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { insertAtSelection } from '../src/utils/insertAtSelection.js';

describe('insertAtSelection', () => {
  it('inserts at the caret in the middle of a word', () => {
    assert.deepEqual(insertAtSelection('Mdchen', 'ä', { start: 1, end: 1 }), { text: 'Mädchen', caret: 2 });
  });

  it('replaces a selected range', () => {
    assert.deepEqual(insertAtSelection('Gruss', 'ß', { start: 3, end: 5 }), { text: 'Gruß', caret: 4 });
  });

  it('appends when the selection is unknown', () => {
    assert.deepEqual(insertAtSelection('Tsch', 'ü'), { text: 'Tschü', caret: 5 });
  });

  it('normalizes a reversed or out-of-range selection', () => {
    assert.deepEqual(insertAtSelection('ab', 'ö', { start: 9, end: 1 }), { text: 'aö', caret: 2 });
  });
});
