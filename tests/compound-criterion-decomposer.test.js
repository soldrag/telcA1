import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitCompoundCriterion,
  isCompoundCriterion,
  aggregateCompoundResults,
} from '../src/services/schreiben/grading/compoundCriterionDecomposer.js';
import { defaultA1RankerPolicy as policy } from '../src/services/schreiben/grading/policies/a1RankerPolicy.js';

describe('Compound Criterion Decomposer & Aggregator Tests', () => {
  it('correctly splits criteria on German conjunctions und, sowie, and slash', () => {
    assert.deepEqual(splitCompoundCriterion('Personen und Zeitraum'), ['Personen', 'Zeitraum']);
    assert.deepEqual(splitCompoundCriterion('Preis sowie Kaution'), ['Preis', 'Kaution']);
    assert.deepEqual(splitCompoundCriterion('Termin / Ort'), ['Termin', 'Ort']);
    assert.deepEqual(splitCompoundCriterion('Grund für Ihr Schreiben'), ['Grund für Ihr Schreiben']);
    assert.deepEqual(splitCompoundCriterion(''), []);
  });

  it('isCompoundCriterion accurately identifies composite vs atomic criteria', () => {
    assert.equal(isCompoundCriterion('Personen und Zeitraum'), true);
    assert.equal(isCompoundCriterion('Preis und Haustiere'), true);
    assert.equal(isCompoundCriterion('Grund für Ihr Schreiben'), false);
    assert.equal(isCompoundCriterion('Treffpunkt'), false);
  });

  it('aggregates full coverage only when all aspects pass threshold', () => {
    const aspectResults = [
      { aspect: 'Personen', score: 0.95, coverage: 'full', matchedSentence: 'Wir sind vier Personen.' },
      { aspect: 'Zeitraum', score: 0.90, coverage: 'full', matchedSentence: 'Wir kommen im Juli.' },
    ];
    const res = aggregateCompoundResults(aspectResults, policy);
    assert.equal(res.coverage, 'full');
    assert.equal(res.isCompound, true);
    assert.deepEqual(res.fulfilledAspects, ['Personen', 'Zeitraum']);
    assert.deepEqual(res.missingAspects, []);
  });

  it('enforces partial coverage when one aspect is missing (Constraint Satisfaction)', () => {
    const aspectResults = [
      { aspect: 'Personen', score: 0.95, coverage: 'full', matchedSentence: 'Meine Frau und Kinder kommen mit.' },
      { aspect: 'Zeitraum', score: 0.05, coverage: 'no', matchedSentence: '' },
    ];
    const res = aggregateCompoundResults(aspectResults, policy);
    assert.equal(res.coverage, 'partial');
    assert.equal(res.isCompound, true);
    assert.deepEqual(res.fulfilledAspects, ['Personen']);
    assert.deepEqual(res.missingAspects, ['Zeitraum']);
  });

  it('returns no coverage when all aspects are missing', () => {
    const aspectResults = [
      { aspect: 'Personen', score: 0.1, coverage: 'no', matchedSentence: '' },
      { aspect: 'Zeitraum', score: 0.0, coverage: 'no', matchedSentence: '' },
    ];
    const res = aggregateCompoundResults(aspectResults, policy);
    assert.equal(res.coverage, 'no');
    assert.deepEqual(res.missingAspects, ['Personen', 'Zeitraum']);
    assert.deepEqual(res.fulfilledAspects, []);
  });
});
