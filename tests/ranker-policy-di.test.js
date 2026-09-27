import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  IRankerPolicy,
  A1RankerPolicy,
  defaultA1RankerPolicy,
  getRankerPolicy,
  registerRankerPolicy,
} from '../src/services/schreiben/grading/policies/index.js';
import { classifyCriterionCoverage } from '../src/services/schreiben/grading/microRankerService.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { createFixedSimilarityEmbedder } from './helpers/mockRankerEmbedder.js';

describe('CEFR Ranker Policy & Dependency Injection (DIP) Tests', () => {
  it('IRankerPolicy base class enforces interface contract', () => {
    const rawPolicy = new IRankerPolicy();
    assert.throws(() => rawPolicy.level, /level getter must be implemented/);
    assert.throws(() => rawPolicy.thresholds, /thresholds getter must be implemented/);
    assert.throws(() => rawPolicy.classifyScore(0.5), /classifyScore must be implemented/);
    assert.throws(() => rawPolicy.aggregateCompound([]), /aggregateCompound must be implemented/);
  });

  it('A1RankerPolicy satisfies telc A1 specification and boundary thresholds', () => {
    const policy = new A1RankerPolicy();
    assert.equal(policy.level, 'A1');
    assert.equal(policy.thresholds.full, 0.65);
    assert.equal(policy.thresholds.partial, 0.40);

    // Boundary classification checks
    assert.equal(policy.classifyScore(0.65), 'full');
    assert.equal(policy.classifyScore(0.6499), 'partial');
    assert.equal(policy.classifyScore(0.40), 'partial');
    assert.equal(policy.classifyScore(0.3999), 'no');
    assert.equal(policy.classifyScore(0.0), 'no');
  });

  it('A1RankerPolicy aggregateCompound handles single, dual, and missing aspects', () => {
    const policy = new A1RankerPolicy();

    // Single aspect pass-through
    const single = policy.aggregateCompound([{ aspect: 'Grund', score: 0.8, coverage: 'full' }]);
    assert.equal(single.isCompound, false);
    assert.equal(single.coverage, 'full');

    // Dual aspect: both satisfied
    const dualFull = policy.aggregateCompound([
      { aspect: 'Personen', score: 0.9, coverage: 'full', matchedSentence: 'Wir sind zwei.' },
      { aspect: 'Zeitraum', score: 0.7, coverage: 'full', matchedSentence: 'Im Juli.' },
    ]);
    assert.equal(dualFull.isCompound, true);
    assert.equal(dualFull.coverage, 'full');
    assert.equal(dualFull.missingAspects.length, 0);
    assert.equal(dualFull.fulfilledAspects.length, 2);

    // Dual aspect: one missing (Trap letter scenario)
    const dualPartial = policy.aggregateCompound([
      { aspect: 'Personen', score: 0.9, coverage: 'full', matchedSentence: 'Wir sind zwei.' },
      { aspect: 'Zeitraum', score: 0.1, coverage: 'no', matchedSentence: '' },
    ]);
    assert.equal(dualPartial.isCompound, true);
    assert.equal(dualPartial.coverage, 'partial');
    assert.deepEqual(dualPartial.missingAspects, ['Zeitraum']);
    assert.deepEqual(dualPartial.fulfilledAspects, ['Personen']);
  });

  it('allows injecting a custom MockStrictPolicy without changing engine code', async () => {
    // Custom strict policy (simulating higher level / strict examiner)
    class MockStrictPolicy extends IRankerPolicy {
      get level() { return 'Strict_Mock'; }
      get thresholds() { return { full: 0.90, partial: 0.70 }; }
      get lexicon() { return defaultA1RankerPolicy.lexicon; }
      classifyScore(score) {
        if (score >= 0.90) return 'full';
        if (score >= 0.70) return 'partial';
        return 'no';
      }
      aggregateCompound(results) {
        return { coverage: 'no', isCompound: true, mockStrict: true };
      }
    }

    const mockStrict = new MockStrictPolicy();
    const mockEmbedder = createFixedSimilarityEmbedder(0.8); // In A1 this is 'full', but in Strict (identity calibration) only 'partial'

    // With default A1 policy
    const resA1 = await classifyCriterionCoverage('Termin vereinbaren', ['Morgen um 10'], { embedder: mockEmbedder, policy: defaultA1RankerPolicy });
    assert.equal(resA1.coverage, 'full');

    // With injected MockStrictPolicy (DIP proof)
    const resStrict = await classifyCriterionCoverage('Termin vereinbaren', ['Morgen um 10'], { embedder: mockEmbedder, policy: mockStrict });
    assert.equal(resStrict.coverage, 'partial');

    // Via MicroRankerProvider DI
    const providerStrict = new MicroRankerProvider({ embedder: mockEmbedder, policy: mockStrict });
    const providerRes = await providerStrict.classifyCoverage('Termin vereinbaren', 'Morgen um 10');
    assert.equal(providerRes.coverage, 'partial');
  });

  it('Policy registry resolves a missing level as a legacy A1 task and rejects an unregistered one', () => {
    const defaultPol = getRankerPolicy('A1');
    assert.equal(defaultPol.level, 'A1');
    assert.equal(getRankerPolicy().level, 'A1');
    assert.throws(() => getRankerPolicy('UNKNOWN_LEVEL'), RangeError);

    class DummyA2Policy extends IRankerPolicy {
      get level() { return 'A2'; }
      get thresholds() { return { full: 0.72, partial: 0.50 }; }
      classifyScore(s) { return s >= 0.72 ? 'full' : (s >= 0.5 ? 'partial' : 'no'); }
      aggregateCompound() { return { coverage: 'partial' }; }
    }

    registerRankerPolicy('A2', new DummyA2Policy());
    assert.equal(getRankerPolicy('A2').level, 'A2');
  });
});

describe('A1RankerPolicy neural calibration', () => {
  it('maps raw EmbeddingGemma cosine cutoffs onto policy thresholds monotonically', () => {
    const p = defaultA1RankerPolicy;
    assert.ok(Math.abs(p.calibrateNeuralScore(0.70) - p.thresholds.full) < 1e-9);
    assert.ok(Math.abs(p.calibrateNeuralScore(0.55) - p.thresholds.partial) < 1e-9);
    assert.equal(p.classifyScore(p.calibrateNeuralScore(0.60)), 'partial');
    assert.equal(p.classifyScore(p.calibrateNeuralScore(0.50)), 'no');
    assert.ok(p.calibrateNeuralScore(1) <= 1);
    assert.equal(new IRankerPolicy().calibrateNeuralScore(0.42), 0.42);
  });
});
