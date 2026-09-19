import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSentenceTopology } from '../src/services/schreiben/linguistic/topologicalFieldParser.js';
import { detectSemanticInversion } from '../src/services/schreiben/linguistic/semanticPolarityValidator.js';
import { runStage2Leitpunkte } from '../src/services/schreiben/grading/stage2Leitpunkte.js';

describe('Syntax Scope & Subordinate Clause Coordination', () => {
  it('does not fire ERR_V2_OVERCROWDED_VORFELD on coordinated subordinate clause with und', () => {
    const sentence = '..., weil meine Heizung perfekt funktioniert und die Wohnung sehr warm ist.';
    const res = parseSentenceTopology(sentence);
    assert.equal(res.errors.length, 0);
  });

  it('still detects genuine V2 violations in main clauses', () => {
    const sentence = 'Am Montag ich komme.';
    const res = parseSentenceTopology(sentence);
    assert.equal(res.errors.length, 1);
    assert.equal(res.errors[0].code, 'ERR_V2_OVERCROWDED_VORFELD');
  });
});

describe('Semantic Polarity & Inversion Detection', () => {
  const critHeating = { keywords: ['heizung', 'kaputt', 'funktioniert', 'geht', 'problem'] };
  const critCold = { keywords: ['kalt', 'kind', 'kinder', 'baby', 'wohnung', 'winter'] };
  const critRepair = { keywords: ['handwerker', 'techniker', 'reparieren', 'reparatur', 'kommen', 'wann', 'termin'] };

  it('detects inverted broken state (heating works perfectly)', () => {
    const res = detectSemanticInversion('meine Heizung perfekt funktioniert', critHeating);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'inverted_problem');
  });

  it('detects inverted temperature state (apartment is very warm)', () => {
    const res = detectSemanticInversion('die Wohnung sehr warm ist', critCold);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'inverted_problem');
  });

  it('detects negated target entity (keinen Handwerker)', () => {
    const res = detectSemanticInversion('Ich brauche keinen Handwerker.', critRepair);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'negated_entity');
  });

  it('detects negated action (nicht vorbeikommen)', () => {
    const res = detectSemanticInversion('Bitte kommen Sie nicht vorbei.', critRepair);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'negated_action');
  });

  it('does NOT flag legitimate problem or request sentences as inverted', () => {
    const s1 = detectSemanticInversion('in meiner Wohnung ist die Heizung kaputt und funktioniert nicht mehr.', critHeating);
    const s2 = detectSemanticInversion('Es ist sehr kalt und ich habe ein kleines Kind.', critCold);
    const s3 = detectSemanticInversion('Wann kann ein Handwerker kommen und die Heizung reparieren?', critRepair);
    assert.equal(s1.isInverted, false);
    assert.equal(s2.isInverted, false);
    assert.equal(s3.isInverted, false);
  });
});

describe('Stage 2 Adversarial Semantic Inversion Protection', () => {
  it('penalizes completely inverted adversarial submission to 0 points across all Leitpunkte', async () => {
    const criteria = [
      { id: 'lp1', label: 'Grund für Ihr Schreiben', keywords: ['heizung', 'kaputt', 'funktioniert', 'geht', 'problem'], requiredMatches: 2 },
      { id: 'lp2', label: 'Problem beschreiben', keywords: ['kalt', 'kind', 'kinder', 'baby', 'wohnung', 'winter'], requiredMatches: 2 },
      { id: 'lp3', label: 'Handwerker / Reparaturtermin', keywords: ['handwerker', 'techniker', 'reparieren', 'reparatur', 'kommen', 'wann', 'termin'], requiredMatches: 2 }
    ];
    const adversarialBody = [
      'weil meine Heizung perfekt funktioniert und die Wohnung sehr warm ist.',
      'Ich brauche keinen Handwerker.',
      'Bitte kommen Sie nicht vorbei.'
    ];

    const res = await runStage2Leitpunkte({ criteria, bodySentences: adversarialBody });
    assert.equal(res.totalScore, 0);
    assert.equal(res.items[0].score, 0);
    assert.equal(res.items[1].score, 0);
    assert.equal(res.items[2].score, 0);
  });
});
