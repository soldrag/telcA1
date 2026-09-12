import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterCandidateErrors,
  isValidCorrectionDistance
} from '../src/services/schreiben/grading/stage3Grammar.js';

describe('Stage 3 Candidate Grammar Filters (Pure Functions, Zero Hallucinations)', () => {
  const sentence = 'Ich möchte ein Deutschkurs machen.';

  it('Filter a: discards candidate if original is NOT an exact substring of the sentence', () => {
    const raw = [
      { original: 'ein Kurs', correction: 'einen Kurs', explanation: 'Akkusativ' }, // not exact substring
      { original: 'ein Deutschkurs', correction: 'einen Deutschkurs', explanation: 'Akkusativ' } // valid
    ];
    const filtered = filterCandidateErrors(sentence, raw, 3);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].original, 'ein Deutschkurs');
    assert.equal(filtered[0].correction, 'einen Deutschkurs');
  });

  it('Filter b: discards candidate if correction === original (identity/no-op fix)', () => {
    const raw = [
      { original: 'Deutschkurs', correction: 'Deutschkurs', explanation: 'No change' },
      { original: 'ein Deutschkurs', correction: 'einen Deutschkurs', explanation: 'Akkusativ' }
    ];
    const filtered = filterCandidateErrors(sentence, raw, 3);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].original, 'ein Deutschkurs');
  });

  it('Filter c: enforces edit-distance cap and rejects full-sentence rewrites', () => {
    // Valid 1-2 words fix
    assert.equal(isValidCorrectionDistance('ein Deutschkurs', 'einen Deutschkurs'), true);
    assert.equal(isValidCorrectionDistance('möchte machen', 'will machen'), true);

    // Invalid full rewrite touching > 3 words or too long
    assert.equal(
      isValidCorrectionDistance('Ich möchte ein Deutschkurs machen', 'Ich habe die Absicht, an einem Kurs teilzunehmen'),
      false
    );
    assert.equal(
      isValidCorrectionDistance('Ich möchte ein Deutschkurs', 'Ich will besuchen'),
      false
    );

    const raw = [
      {
        original: 'Ich möchte ein Deutschkurs machen',
        correction: 'Ich habe vor an dem Sprachkurs teilzunehmen',
        explanation: 'Stylistic rewrite'
      }
    ];
    const filtered = filterCandidateErrors(sentence, raw, 3);
    assert.equal(filtered.length, 0);
  });

  it('Filter d: deduplicates identical originals and caps errors per sentence', () => {
    const s = 'Ich gehe in Schule und ich lerne Deutsch und ich sprechen gut.';
    const raw = [
      { original: 'in Schule', correction: 'in die Schule', explanation: 'Artikel' },
      { original: 'in Schule', correction: 'zur Schule', explanation: 'Alternative' }, // duplicate
      { original: 'sprechen', correction: 'spreche', explanation: 'Konjugation' },
      { original: 'lerne', correction: 'studiere', explanation: 'Synonym' },
      { original: 'Deutsch', correction: 'die deutsche Sprache', explanation: 'Excess candidate' }
    ];
    // Max capped at 3
    const filtered = filterCandidateErrors(s, raw, 3);
    assert.equal(filtered.length, 3);
    const originals = filtered.map(f => f.original);
    assert.deepEqual(originals, ['in Schule', 'sprechen', 'lerne']);
  });

  it('returns empty array when candidates are empty or null', () => {
    assert.deepEqual(filterCandidateErrors(sentence, []), []);
    assert.deepEqual(filterCandidateErrors(sentence, null), []);
    assert.deepEqual(filterCandidateErrors('', [{ original: 'x', correction: 'y' }]), []);
  });
});
