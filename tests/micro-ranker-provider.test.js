import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';
import {
  scoreSentencePair,
  classifyCriterionCoverage,
  computeDeterministicFallbackScore,
} from '../src/services/schreiben/grading/microRankerService.js';
import { createFixedSimilarityEmbedder } from './helpers/mockRankerEmbedder.js';
import { defaultA1RankerPolicy } from '../src/services/schreiben/grading/policies/a1RankerPolicy.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const A1 = resolveLevelContext('A1');

const calibrated = (sim) => defaultA1RankerPolicy.calibrateNeuralScore(sim);

describe('MicroRankerProvider & MicroRankerService Tests', () => {
  it('MicroRankerProvider enforces AIProvider contract and default ID', () => {
    const provider = new MicroRankerProvider({ embedder: null });
    assert.equal(provider.id, PROVIDER_IDS.MICRO_RANKER);
    assert.ok(provider.name.includes('Micro-Ranker'));
  });

  it('computeDeterministicFallbackScore computes token overlap correctly', () => {
    const scoreHigh = computeDeterministicFallbackScore('Grund des Schreibens', 'Der Grund für mein Schreiben ist ein Termin', { policy: A1.policy });
    assert.ok(scoreHigh > 0.5, `Expected score > 0.5, got ${scoreHigh}`);

    const scoreZero = computeDeterministicFallbackScore('Grund des Schreibens', '', { policy: A1.policy });
    assert.equal(scoreZero, 0);
  });

  it('classifyCriterionCoverage correctly categorizes full, partial, and no coverage', async () => {
    const mockEmbedderHigh = createFixedSimilarityEmbedder(0.85);
    const resHigh = await classifyCriterionCoverage('Termin vereinbaren', ['Können wir einen Termin machen?'], { embedder: mockEmbedderHigh, policy: A1.policy });
    assert.equal(resHigh.coverage, 'full');
    assert.ok(Math.abs(resHigh.score - calibrated(0.85)) < 1e-6);

    const mockEmbedderMid = createFixedSimilarityEmbedder(0.55);
    const resMid = await classifyCriterionCoverage('Termin vereinbaren', ['Können wir morgen sehen?'], { embedder: mockEmbedderMid, policy: A1.policy });
    assert.equal(resMid.coverage, 'partial');
    assert.ok(Math.abs(resMid.score - calibrated(0.55)) < 1e-6);

    const mockEmbedderLow = createFixedSimilarityEmbedder(0.2);
    const resLow = await classifyCriterionCoverage('Termin vereinbaren', ['Das Wetter ist schön.'], { embedder: mockEmbedderLow, policy: A1.policy });
    assert.equal(resLow.coverage, 'no');
    assert.ok(Math.abs(resLow.score - calibrated(0.2)) < 1e-6);
  });

  it('MicroRankerProvider classifyCoverage integrates pipeline correctly', async () => {
    const provider = new MicroRankerProvider({ embedder: createFixedSimilarityEmbedder(0.92) });

    const result = await provider.classifyCoverage({ label: 'Treffpunkt vorschlagen' }, 'Treffen wir uns am Bahnhof?');
    assert.equal(result.coverage, 'full');
    assert.ok(Math.abs(result.score - calibrated(0.92)) < 1e-6);
  });

  it('MicroRankerProvider falls back to deterministic scoring when embedder fails', async () => {
    const failing = { embedQuery: async () => { throw new Error('offline'); }, embedText: async () => [] };
    const provider = new MicroRankerProvider({ embedder: failing });
    const result = await provider.classifyCoverage('Grund des Schreibens', ['Der Grund für mein Schreiben ist ein Termin.']);
    assert.ok(['full', 'partial'].includes(result.coverage));
  });

  it('scoreSentencePair handles empty input gracefully', async () => {
    const scoreEmpty = await scoreSentencePair('', 'Some sentence', { policy: A1.policy });
    assert.equal(scoreEmpty, 0);

    const scoreEmptySent = await scoreSentencePair('Some criterion', '', { policy: A1.policy });
    assert.equal(scoreEmptySent, 0);
  });
});
