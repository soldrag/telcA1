import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { splitByModule } from '../src/utils/moduleSplit.js';

describe('splitByModule', () => {
  it('keeps the open module and counts the others in first-seen order', () => {
    const items = [
      { id: 1, testType: 'lesen' },
      { id: 2, testType: 'schreiben' },
      { id: 3, testType: 'lesen' },
      { id: 4, testType: 'hoeren' },
    ];
    const { current, elsewhere } = splitByModule(items, 'schreiben');
    assert.deepEqual(current.map((item) => item.id), [2]);
    assert.deepEqual(elsewhere, [{ testType: 'lesen', count: 2 }, { testType: 'hoeren', count: 1 }]);
  });

  it('treats a missing testType as lesen', () => {
    const { current, elsewhere } = splitByModule([{ id: 1 }], 'lesen');
    assert.equal(current.length, 1);
    assert.deepEqual(elsewhere, []);
  });
});
