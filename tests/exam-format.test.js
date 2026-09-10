import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getExamNumber, formatExamName, sortExamsNumerically } from '../src/utils/examFormat.js';

describe('Exam Format and Sorting Utility', () => {
  it('extracts correct integer number from exam ID', () => {
    assert.equal(getExamNumber('modellsatz-1'), 1);
    assert.equal(getExamNumber('modellsatz-10'), 10);
    assert.equal(getExamNumber('modellsatz-2'), 2);
    assert.equal(getExamNumber(''), 0);
  });

  it('formats exam name cleanly without external text', () => {
    assert.equal(formatExamName('modellsatz-1'), 'Modellsatz 1');
    assert.equal(formatExamName('modellsatz-10'), 'Modellsatz 10');
  });

  it('sorts exams numerically in natural order 1 through 10', () => {
    const unsorted = [
      { id: 'modellsatz-1' },
      { id: 'modellsatz-10' },
      { id: 'modellsatz-2' },
      { id: 'modellsatz-3' },
      { id: 'modellsatz-4' },
      { id: 'modellsatz-5' },
      { id: 'modellsatz-6' },
      { id: 'modellsatz-7' },
      { id: 'modellsatz-8' },
      { id: 'modellsatz-9' },
    ];

    const sorted = sortExamsNumerically(unsorted);
    assert.deepEqual(
      sorted.map(e => e.id),
      [
        'modellsatz-1',
        'modellsatz-2',
        'modellsatz-3',
        'modellsatz-4',
        'modellsatz-5',
        'modellsatz-6',
        'modellsatz-7',
        'modellsatz-8',
        'modellsatz-9',
        'modellsatz-10'
      ]
    );
  });
});
