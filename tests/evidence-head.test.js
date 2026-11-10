import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { letterUnits, collectBankUnits } from '../src/services/schreiben/grading/evidenceHead/unitReferences.js';
import { applySoftmaxHead, spanFeatures, unitLevel } from '../src/services/schreiben/grading/evidenceHead/spanEvidence.js';

const bank = {
  units: {
    lp1: { fulfils: ['Ich möchte ein Zimmer buchen.'], misses: { refusal: ['Ich möchte kein Zimmer.'] } },
    'lp2:Wann': { fulfils: ['Ich komme am Montag.'], misses: { vague: ['Bald.'] } },
    'lp2:wie lange': { fulfils: ['Ich bleibe drei Tage.'], misses: { vague: ['Nicht lange.'] } },
  },
  otherPurpose: ['Ich möchte mich beschweren.'],
};
const task = (aspects) => ({
  situation: 'Sie möchten ein Hotelzimmer buchen.',
  criteria: [
    { id: 'lp1', label: 'Grund für Ihr Schreiben' },
    { id: 'lp2', label: 'Wann und wie lange', ...(aspects ? { aspects } : {}) },
  ],
});

describe('evidence head units', () => {
  it('splits a Leitpunkt only into the aspects the rubric declares', () => {
    const groups = letterUnits({ task: task([{ label: 'Wann' }, { label: 'wie lange' }]), bank, neutral: ['Hallo.'] });
    assert.deepEqual(groups[1].units.map((u) => u.key), ['lp2:Wann', 'lp2:wie lange']);
  });

  it('reads an undeclared compound label as one unit with all its bank phrases', () => {
    const groups = letterUnits({ task: task(), bank, neutral: ['Hallo.'] });
    assert.deepEqual(groups[1].units.map((u) => u.key), ['lp2']);
    assert.deepEqual(groups[1].units[0].fulfils, ['Ich komme am Montag.', 'Ich bleibe drei Tage.']);
  });

  it('takes the other Leitpunkte as rivals and other purposes plus neutral phrases as irrelevant', () => {
    const [lp1] = letterUnits({ task: task(), bank, neutral: ['Hallo.'] });
    assert.deepEqual(lp1.units[0].rivals, ['Ich komme am Montag.', 'Ich bleibe drei Tage.']);
    assert.deepEqual(lp1.units[0].irr, ['Ich möchte mich beschweren.', 'Hallo.']);
  });

  it('adds example phrases to the bank unit they belong to', () => {
    const units = collectBankUnits(bank, { lp1: { fulfils: ['Ich buche ein Zimmer.'], misses: [] } });
    assert.deepEqual(units.lp1.fulfils, ['Ich möchte ein Zimmer buchen.', 'Ich buche ein Zimmer.']);
  });
});

describe('evidence head reading', () => {
  const unit = { fulfils: [[1, 0]], misses: [[0, 1]], rivals: [[0, 1]], irr: [[0, 1]], desc: [1, 0] };

  it('computes cosine margins against each reference group', () => {
    assert.deepEqual(spanFeatures([1, 0], unit), [1, 0, 0, 0, 1, 1, 1, 1, 1]);
  });

  it('turns head scores into class probabilities', () => {
    const head = { mean: [0, 0], scale: [1, 1], coef: [[1, 0], [0, 1], [0, 0]], intercept: [0, 0, 0], classes: ['F', 'C', 'I'] };
    const p = applySoftmaxHead([2, 0], head);
    assert.ok(Math.abs(p.F + p.C + p.I - 1) < 1e-12);
    assert.ok(p.F > p.C && p.F > p.I);
  });

  it('lets a whole-sentence contradiction override support, and reads a middle band as partial', () => {
    const th = { full: 0.6, partial: 0.3, contradiction: 0.8 };
    assert.equal(unitLevel({ support: 0.9, contradiction: 0.85 }, th), 0);
    assert.equal(unitLevel({ support: 0.9, contradiction: 0.1 }, th), 2);
    assert.equal(unitLevel({ support: 0.4, contradiction: 0.1 }, th), 1);
    assert.equal(unitLevel({ support: 0.2, contradiction: 0.1 }, th), 0);
  });
});
