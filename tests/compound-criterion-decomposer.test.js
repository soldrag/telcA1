import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  criterionAspectLabels,
  isCompoundCriterion,
  splitCriterionLabel,
  aggregateCompoundResults,
} from '../src/services/schreiben/grading/compoundCriterionDecomposer.js';
import { defaultA1RankerPolicy as policy } from '../src/services/schreiben/grading/policies/a1RankerPolicy.js';

describe('Compound Criterion Decomposer & Aggregator Tests', () => {
  it('scores a criterion in the aspects its rubric declares', () => {
    const criterion = { label: 'Personen und Zeitraum', aspects: [{ label: 'Personen' }, { label: 'Zeitraum' }] };
    assert.deepEqual(criterionAspectLabels(criterion), ['Personen', 'Zeitraum']);
    assert.equal(isCompoundCriterion(criterion), true);
  });

  it('never guesses parts from the label wording', () => {
    assert.deepEqual(criterionAspectLabels({ label: 'Handwerker / Reparaturtermin' }), ['Handwerker / Reparaturtermin']);
    assert.equal(isCompoundCriterion({ label: 'Personen und Zeitraum' }), false);
    assert.equal(isCompoundCriterion({ label: 'Grund', aspects: [{ label: 'Grund' }] }), false);
  });

  it('splits a label into parts only for the purpose review units', () => {
    assert.deepEqual(splitCriterionLabel('Personen und Zeitraum'), ['Personen', 'Zeitraum']);
    assert.deepEqual(splitCriterionLabel('Termin / Ort'), ['Termin', 'Ort']);
    assert.deepEqual(splitCriterionLabel(''), []);
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
