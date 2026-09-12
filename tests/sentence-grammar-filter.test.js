import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isExactSubstring,
  isReasonableA1Correction,
  filterSentenceGrammarCandidates,
  mergeCandidateGrammarErrors
} from '../src/services/schreiben/linguistic/sentenceGrammarFilter.js';

describe('Sentence Grammar Filter & Anti-Hallucination Guard', () => {
  const sentence = 'Was kosten der Kurs? Ich möchte lernen vormittags.';

  it('rejects candidate if original is not an exact substring', () => {
    assert.equal(isExactSubstring(sentence, 'kosten'), true);
    assert.equal(isExactSubstring(sentence, 'kostet'), false);
    assert.equal(isExactSubstring(sentence, 'Ich will lernen'), false);
    assert.equal(isExactSubstring(sentence, 'Was kosten der Kurs?'), true);
  });

  it('validates reasonable A1 corrections and rejects complete rewrites', () => {
    // Valid small corrections
    assert.equal(isReasonableA1Correction('kosten', 'kostet'), true);
    assert.equal(isReasonableA1Correction('ein Kurs', 'einen Kurs'), true);
    assert.equal(isReasonableA1Correction('vier Woche', 'vier Wochen'), true);

    // Identical
    assert.equal(isReasonableA1Correction('kosten', 'kosten'), false);

    // Completely rewritten sentence
    assert.equal(
      isReasonableA1Correction('lernen vormittags', 'Ich würde gerne jeden Vormittag an Ihrem Unterricht teilnehmen'),
      false
    );
  });

  it('filters raw candidate list and eliminates hallucinated items', () => {
    const rawCandidates = [
      { original: 'kosten', correction: 'kostet', explanation: 'Subjekt-Verb-Kongruenz' },
      { original: 'hallucinated word', correction: 'something else', explanation: 'Fake error' },
      { original: 'vormittags', correction: 'vormittags', explanation: 'No change' },
      { original: 'Was', correction: 'Wie sehr viel länger rewrite text', explanation: 'Too long' }
    ];

    const filtered = filterSentenceGrammarCandidates(sentence, rawCandidates, 3);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].original, 'kosten');
    assert.equal(filtered[0].correction, 'kostet');
  });

  it('caps the number of errors per sentence', () => {
    const multiSentence = 'Ich haben ein Buch und ein Hund.';
    const candidates = [
      { original: 'haben', correction: 'habe', explanation: 'Konjugation' },
      { original: 'ein Buch', correction: 'eines Buch', explanation: 'Kasus' },
      { original: 'ein Hund', correction: 'einen Hund', explanation: 'Akkusativ' },
      { original: 'Ich', correction: 'ich', explanation: 'Klein' }
    ];

    const capped = filterSentenceGrammarCandidates(multiSentence, candidates, 2);
    assert.equal(capped.length, 2);
  });

  it('merges candidate errors with baseline and deduplicates', () => {
    const baseline = [
      { original: 'vier Woche', correction: 'vier Wochen', explanation: 'Plural' }
    ];
    const aiCandidates = [
      { original: 'vier woche', correction: 'vier Wochen', explanation: 'Duplicate' },
      { original: 'wie ich kann', correction: 'wie kann ich', explanation: 'W-Frage' }
    ];

    const merged = mergeCandidateGrammarErrors(baseline, aiCandidates);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].original, 'vier Woche');
    assert.equal(merged[1].original, 'wie ich kann');
  });
});
