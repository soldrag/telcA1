import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  ISchreibenRegulation,
  TelcA1Regulation,
  telcA1Regulation,
  getSchreibenRegulation,
  registerSchreibenRegulation,
  scoreCriteriaLevels,
} from '../src/services/schreiben/regulations/index.js';
import { loadRegressionSuites, leitpunktLevelForPoints } from './helpers/regressionFixtures.js';

const score = (evidence) => telcA1Regulation.scoreTeil2(evidence);

describe('telc A1 Schreiben Teil 2 regulation (reglament/telc-a1.md §6)', () => {
  it('maps Leitpunkt levels to 3 / 1.5 / 0 points', () => {
    const res = score({ leitpunktLevels: [2, 1, 0], anrede: 2, gruss: 2 });
    assert.deepEqual(res.leitpunkte.map((lp) => lp.points), [3, 1.5, 0]);
    assert.ok(res.leitpunkte.every((lp) => lp.maxPoints === 3));
    assert.equal(res.maxPoints, 10);
  });

  it('rates Kommunikative Gestaltung: 1 appropriate, 0.5 atypical or one missing, 0 both missing', () => {
    const kg = (anrede, gruss) => score({ leitpunktLevels: [], anrede, gruss }).kg.points;
    assert.equal(kg(2, 2), 1);
    assert.equal(kg(1, 2), 0.5, 'Hallo! to a stranger');
    assert.equal(kg(0, 2), 0.5, 'no Anrede');
    assert.equal(kg(2, 0), 0.5, 'no Gruß');
    assert.equal(kg(1, 0), 0.5, 'Hallo! + Tschüss');
    assert.equal(kg(0, 0), 0);
  });

  it('frame without content scores at most 1', () => {
    assert.equal(score({ leitpunktLevels: [0, 0, 0], anrede: 2, gruss: 2 }).total, 1);
  });

  it('an ideal frame with one covered point is 4, not 6 as on the old 5 × 2 scale', () => {
    assert.equal(score({ leitpunktLevels: [2, 0, 0], anrede: 2, gruss: 2 }).total, 4);
  });

  it('grammar errors and length never change the score', () => {
    const base = { leitpunktLevels: [2, 2, 1], anrede: 2, gruss: 1 };
    const clean = score(base).total;
    assert.equal(score({ ...base, grammarErrors: new Array(12).fill({}), wordCount: 9 }).total, clean);
    assert.equal(score({ ...base, wordCount: 120 }).total, clean);
  });

  it('an unratable text (gibberish or empty) scores 0', () => {
    assert.equal(score({ leitpunktLevels: [2, 2, 2], anrede: 2, gruss: 2, isUnratable: true }).total, 0);
  });

  it('scores stored criteria levels ({anrede, lp1..3, gruss}) the same way', () => {
    const res = scoreCriteriaLevels({ anrede: 2, lp1: 2, lp2: 2, lp3: 1, gruss: 2 });
    assert.equal(res.total, 8.5);
  });
});

describe('Schreiben regulation registry', () => {
  it('a task without level is a legacy telc A1 task; an unregistered level is an error', () => {
    assert.equal(getSchreibenRegulation().id, 'telc-a1');
    assert.throws(() => getSchreibenRegulation('C2'), RangeError);
  });

  it('accepts only ISchreibenRegulation implementations', () => {
    assert.throws(() => registerSchreibenRegulation('A2', { scoreTeil2() {} }), TypeError);
    class DummyA2 extends ISchreibenRegulation {
      get id() { return 'dummy-a2'; }
      get level() { return 'A2'; }
    }
    registerSchreibenRegulation('A2', new DummyA2());
    assert.equal(getSchreibenRegulation('a2').id, 'dummy-a2');
  });

  it('base interface enforces the contract', () => {
    const raw = new ISchreibenRegulation();
    assert.throws(() => raw.id, /id getter must be implemented/);
    assert.throws(() => raw.scoreTeil2({}), /scoreTeil2 must be implemented/);
    assert.throws(() => raw.acceptsTeil1Answer({}), /acceptsTeil1Answer must be implemented/);
    assert.ok(new TelcA1Regulation() instanceof ISchreibenRegulation);
  });
});

describe('telc A1 Schreiben Teil 1 regulation (reglament/telc-a1.md, Teil 1 — Formular)', () => {
  const facts = (overrides) => ({
    sameText: false, sameNumberOrDate: false, numberAnswer: false, rivalWords: false, singleWord: true,
    shorterLength: 6, editDistance: 5, sameSound: false, ...overrides,
  });
  const accepts = (overrides) => telcA1Regulation.acceptsTeil1Answer(facts(overrides));

  it('accepts the same text or the same number or date written another way', () => {
    assert.equal(accepts({ sameText: true }), true);
    assert.equal(accepts({ numberAnswer: true, sameNumberOrDate: true }), true);
  });

  it('accepts numbers only when unambiguously right: no typo, no sound tolerance', () => {
    assert.equal(accepts({ numberAnswer: true, editDistance: 1 }), false);
    assert.equal(accepts({ numberAnswer: true, sameSound: true }), false);
  });

  it('gives no tolerance between two valid words of one closed class, as Juni for Juli', () => {
    assert.equal(accepts({ rivalWords: true, editDistance: 1 }), false);
    assert.equal(accepts({ rivalWords: true, sameSound: true }), false);
  });

  it('allows one typo, two from 8 letters on, none below 4 letters', () => {
    assert.equal(accepts({ shorterLength: 6, editDistance: 1 }), true);
    assert.equal(accepts({ shorterLength: 6, editDistance: 2 }), false);
    assert.equal(accepts({ shorterLength: 8, editDistance: 2 }), true);
    assert.equal(accepts({ shorterLength: 3, editDistance: 1 }), false);
  });

  it('accepts a spelling that sounds like the expected word, as "donastag" for Donnerstag', () => {
    assert.equal(accepts({ sameSound: true }), true);
    assert.equal(accepts({ shorterLength: 3, sameSound: true }), false);
  });

  it('gives a phrase no typo or sound tolerance: its words are compared one by one', () => {
    assert.equal(accepts({ singleWord: false, shorterLength: 9, editDistance: 2 }), false);
    assert.equal(accepts({ singleWord: false, sameSound: true }), false);
    assert.equal(accepts({ singleWord: false, sameText: true }), true);
  });
});

describe('Regression fixtures are consistent with their regulation', () => {
  let suites = [];
  before(async () => { suites = await loadRegressionSuites(); });

  it('every expected total equals the regulation score of the expected levels', () => {
    for (const suite of suites) {
      for (const tc of suite.cases) {
        const levels = tc.expected.lp.map((points) => leitpunktLevelForPoints(suite.regulation, points));
        assert.ok(levels.every((l) => l !== undefined), `${tc.id}: Leitpunkt points off the regulation scale`);
        const lpSum = suite.regulation.scoreTeil2({ leitpunktLevels: levels }).leitpunkte.reduce((s, lp) => s + lp.points, 0);
        assert.equal(lpSum + tc.expected.kg, tc.expected.total, `${suite.file} ${tc.id}`);
      }
    }
  });
});
