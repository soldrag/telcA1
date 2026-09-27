import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { segmentMacroStructure } from '../src/services/schreiben/linguistic/macroSegmenter.js';

const closingOf = (text) => segmentMacroStructure(text).closing;

describe('one-word closings open a sentence', () => {
  it('"Grüße" alone before the name is a closing', () => {
    const closing = closingOf('Liebe Olga,\nich komme am Montag.\nGrüße\nAnna');
    assert.equal(closing.recognized, true);
    assert.equal(closing.senderName, 'Anna');
  });

  it('"Grüße" after a sentence in a one-line letter is a closing', () => {
    const result = segmentMacroStructure('Liebe Olga, ich komme am Montag. Grüße Anna');
    assert.equal(result.closing.recognized, true);
    assert.deepEqual(result.bodySentences, ['ich komme am Montag.']);
  });

  it('"Grüße" inside a sentence is content, not a closing', () => {
    const result = segmentMacroStructure('Liebe Olga,\nich komme am Montag. Ich sende Grüße an Ihre Familie.\nAnna');
    assert.equal(result.closing.recognized, false);
    assert.ok(result.bodySentences.includes('Ich sende Grüße an Ihre Familie.'));
  });
});
