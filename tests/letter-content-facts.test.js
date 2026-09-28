import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectLetterContentFacts } from '../src/services/schreiben/grading/letterContentFacts.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { telcA1Regulation } from '../src/services/schreiben/regulations/telcA1Regulation.js';
import { LEITPUNKTE_VOID_REASONS } from '../src/services/schreiben/regulations/schreibenRegulationInterface.js';

const { lexicon } = resolveLevelContext('A1');
const criteria = [
  { id: 'lp1', label: 'Grund', keywords: ['fahrrad', 'leihen'] },
  { id: 'lp2', label: 'Dauer', evidence: 'temporal', keywords: ['tage', 'woche', 'montag'] },
  { id: 'lp3', label: 'Helm und Schloss', aspects: [
    { label: 'Helm', keywords: ['helm'] },
    { label: 'Uhrzeit', evidence: 'temporal', keywords: ['uhr', 'abend'] },
  ], keywords: ['helm', 'uhr', 'abend'] },
];
const facts = (sentences) => detectLetterContentFacts({ bodySentences: sentences, criteria, lexicon });

describe('letter content facts: predication', () => {
  it('a list of nouns or noun phrases states nothing', () => {
    assert.equal(facts(['Fahrrad.', 'Helm.', 'Montag.']).hasPredication, false);
    assert.equal(facts(['Zwei Fahrräder.', 'Drei Tage.']).hasPredication, false);
  });

  it('a clause with a finite verb, a subject pronoun or a question states something', () => {
    assert.equal(facts(['Ich brauche ein Fahrrad.']).hasPredication, true);
    assert.equal(facts(['Wir drei Tage.']).hasPredication, true);
    assert.equal(facts(['Helm auch?']).hasPredication, true);
  });

  it('an elliptical predicate without copula states something', () => {
    assert.equal(facts(['Leider krank.']).hasPredication, true);
    assert.equal(facts(['Morgen nicht.']).hasPredication, true);
  });
});

describe('letter content facts: task anchor', () => {
  it('a task-specific keyword ties the letter to the task', () => {
    assert.equal(facts(['Ich möchte ein Fahrrad leihen.']).hasTaskAnchor, true);
    assert.equal(facts(['Haben Sie einen Helm?']).hasTaskAnchor, true);
  });

  it('the modifier of a compound task keyword ties the letter to the task, a head noun of another task does not', () => {
    const compoundCriteria = [{ id: 'lp1', label: 'Grund', keywords: ['deutschkurs'] }];
    const anchored = (sentence) => detectLetterContentFacts({ bodySentences: [sentence], criteria: compoundCriteria, lexicon }).hasTaskAnchor;
    assert.equal(anchored('Ich möchte Deutsch lernen.'), true);
    assert.equal(anchored('Ich möchte nach Berlin fahren.'), false);
  });

  it('keywords of a declared time dimension do not: every letter can name a time', () => {
    assert.equal(facts(['Die Party ist am Montag um 18 Uhr.', 'Kommen Sie drei Tage?']).hasTaskAnchor, false);
  });
});

describe('ISchreibenRegulation contract: content facts (telc A1 §6)', () => {
  const levels = [2, 1, 2];
  const score = (content) => telcA1Regulation.scoreTeil2({ leitpunktLevels: levels, anrede: 2, gruss: 2, content });

  it('keeps coverage levels when the body states something about the task', () => {
    const s = score({ hasPredication: true, hasTaskAnchor: true });
    assert.deepEqual(s.leitpunkte.map((lp) => lp.points), [3, 1.5, 3]);
    assert.equal(s.leitpunkteVoidReason, null);
  });

  it('voids Leitpunkte for keywords without sentences, keeps Kommunikative Gestaltung', () => {
    const s = score({ hasPredication: false, hasTaskAnchor: true });
    assert.deepEqual(s.leitpunkte.map((lp) => lp.points), [0, 0, 0]);
    assert.equal(s.kg.points, 1);
    assert.equal(s.leitpunkteVoidReason, LEITPUNKTE_VOID_REASONS.NO_PREDICATION);
  });

  it('voids Leitpunkte for a letter on another task', () => {
    const s = score({ hasPredication: true, hasTaskAnchor: false });
    assert.equal(s.total, 1);
    assert.equal(s.leitpunkteVoidReason, LEITPUNKTE_VOID_REASONS.OFF_TOPIC);
  });

  it('without content facts the coverage levels stand', () => {
    assert.equal(score(undefined).total, 8.5);
  });
});

describe('grading pipeline: a voided letter is explained, not quoted', async () => {
  const { gradeSchreibenSubmission } = await import('../src/services/schreiben/gradingPipeline.js');
  const question = { options_json: { rubric: { leitpunkte_criteria: criteria } } };
  const letter = 'Sehr geehrte Damen und Herren,\n\nFahrrad. Helm. Drei Tage. Montag.\n\nMit freundlichen Grüßen\nOlga Berg';

  it('gives Leitpunkte 0, keeps Kommunikative Gestaltung and names the reason once', async () => {
    const res = await gradeSchreibenSubmission({ userText: letter, question, options: { forceLimitedMode: true } });
    assert.deepEqual(res.breakdown.items.map((it) => it.points), [0, 0, 0]);
    assert.equal(res.breakdown.leitpunkte_void_reason, LEITPUNKTE_VOID_REASONS.NO_PREDICATION);
    assert.equal(res.points_earned, 1);
    const codes = res.examiner_feedback.summary.map((s) => s.code);
    assert.ok(codes.includes('SUMMARY_LP_VOID_NO_PREDICATION'));
    assert.equal(res.examiner_feedback.bullets.filter((b) => b.category === 'leitpunkt').length, 0);
  });
});
