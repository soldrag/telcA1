import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLeitpunktInGrayZone,
  buildLeitpunktPrompt,
  coverageToScore,
  arbitrateSingleLeitpunkt
} from '../src/services/schreiben/analyzers/leitpunktArbitrator.js';

describe('Leitpunkt Micro-Arbitrator', () => {
  it('identifies gray zone cases accurately', () => {
    // Score 2 is already full, not gray zone
    assert.equal(isLeitpunktInGrayZone(2, 'Ich habe Zeit.'), false);
    // Score 0 with no candidate text is not gray zone
    assert.equal(isLeitpunktInGrayZone(0, ''), false);
    assert.equal(isLeitpunktInGrayZone(0, 'Kein Satz im Text gefunden'), false);

    // Score 1 with text is gray zone
    assert.equal(isLeitpunktInGrayZone(1, 'Ich habe vier Wochen Zeit.'), true);
    // Score 0 with non-empty candidate text is gray zone
    assert.equal(isLeitpunktInGrayZone(0, 'Wann kann ich anfangen?'), true);
  });

  it('builds concise micro-prompt with single LP context and enum schema', () => {
    const prompt = buildLeitpunktPrompt('Fragen Sie nach Kosten.', 'Was kostet der Kurs?');
    assert.match(prompt, /Fragen Sie nach Kosten/);
    assert.match(prompt, /Was kostet der Kurs\?/);
    assert.match(prompt, /"full"/);
    assert.match(prompt, /"partial"/);
    assert.match(prompt, /"no"/);
  });

  it('maps coverage enum strictly to scores (2 / 1 / 0)', () => {
    assert.equal(coverageToScore('full', 0), 2);
    assert.equal(coverageToScore('partial', 0), 1);
    assert.equal(coverageToScore('no', 1), 0);
    // Unknown falls back to baseline
    assert.equal(coverageToScore('invalid', 1), 1);
  });

  it('arbitrates single LP using mock LLM caller successfully', async () => {
    const mockLlmCaller = async ({ prompt }) => {
      assert.match(prompt, /Was kostet der Kurs\?/);
      return JSON.stringify({ coverage: 'full' });
    };

    const result = await arbitrateSingleLeitpunkt({
      taskPoint: 'Kosten und Anmeldung',
      candidateSentences: 'Was kostet der Kurs? Und wie kann ich mich anmelden?',
      baselineScore: 0,
      llmCaller: mockLlmCaller
    });

    assert.equal(result.score, 2);
    assert.equal(result.coverage, 'full');
    assert.equal(result.arbitrated, true);
  });

  it('safely falls back to baseline score on LLM failure or invalid response', async () => {
    const failingLlmCaller = async () => {
      throw new Error('LLM Timeout');
    };

    const result = await arbitrateSingleLeitpunkt({
      taskPoint: 'Kosten',
      candidateSentences: 'Was kostet das?',
      baselineScore: 1,
      llmCaller: failingLlmCaller
    });

    assert.equal(result.score, 1);
    assert.equal(result.arbitrated, false);
  });
});
