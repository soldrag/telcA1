import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSentenceTopology } from '../src/services/schreiben/linguistic/topologicalFieldParser.js';
import { detectSemanticInversion } from '../src/services/schreiben/linguistic/semanticPolarityValidator.js';
import { scorePipelineLeitpunkte } from '../src/services/schreiben/grading/pipelineStageScorers.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';

describe('Syntax Scope & Subordinate Clause Coordination', () => {
  it('does not fire ERR_V2_OVERCROWDED_VORFELD on coordinated subordinate clause with und', () => {
    const sentence = '..., weil meine Heizung perfekt funktioniert und die Wohnung sehr warm ist.';
    const res = parseSentenceTopology(sentence, A1_GRAMMAR_PROFILE);
    assert.equal(res.errors.length, 0);
  });

  it('still detects genuine V2 violations in main clauses', () => {
    const sentence = 'Am Montag ich komme.';
    const res = parseSentenceTopology(sentence, A1_GRAMMAR_PROFILE);
    assert.equal(res.errors.length, 1);
    assert.equal(res.errors[0].code, 'ERR_V2_OVERCROWDED_VORFELD');
  });
});

describe('Semantic Polarity & Inversion Detection', () => {
  const critHeating = { intent: 'DEFECT_REPORT', keywords: ['heizung', 'kaputt', 'funktioniert', 'geht', 'problem'] };
  const critCold = { intent: 'DEFECT_REPORT', keywords: ['kalt', 'kind', 'kinder', 'baby', 'wohnung', 'winter'] };
  const critRepair = { intent: 'ACTION_REQUEST', keywords: ['handwerker', 'techniker', 'reparieren', 'reparatur', 'kommen', 'wann', 'termin'] };

  it('detects inverted broken state (heating works perfectly)', () => {
    const res = detectSemanticInversion('meine Heizung perfekt funktioniert', critHeating, A1_GRAMMAR_PROFILE);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'inverted_problem');
  });

  it('detects inverted temperature state (apartment is very warm)', () => {
    const res = detectSemanticInversion('die Wohnung sehr warm ist', critCold, A1_GRAMMAR_PROFILE);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'inverted_problem');
  });

  it('detects negated target entity (keinen Handwerker)', () => {
    const res = detectSemanticInversion('Ich brauche keinen Handwerker.', critRepair, A1_GRAMMAR_PROFILE);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'negated_entity');
  });

  it('detects negated action (nicht vorbeikommen)', () => {
    const res = detectSemanticInversion('Bitte kommen Sie nicht vorbei.', critRepair, A1_GRAMMAR_PROFILE);
    assert.equal(res.isInverted, true);
    assert.equal(res.reason, 'negated_action');
  });

  it('does NOT flag legitimate problem or request sentences as inverted', () => {
    const s1 = detectSemanticInversion('in meiner Wohnung ist die Heizung kaputt und funktioniert nicht mehr.', critHeating, A1_GRAMMAR_PROFILE);
    const s2 = detectSemanticInversion('Es ist sehr kalt und ich habe ein kleines Kind.', critCold, A1_GRAMMAR_PROFILE);
    const s3 = detectSemanticInversion('Wann kann ein Handwerker kommen und die Heizung reparieren?', critRepair, A1_GRAMMAR_PROFILE);
    assert.equal(s1.isInverted, false);
    assert.equal(s2.isInverted, false);
    assert.equal(s3.isInverted, false);
  });
});

describe('Stage 2 Adversarial Semantic Inversion Protection', () => {
  it('penalizes completely inverted adversarial submission to 0 points across all Leitpunkte', async () => {
    const criteria = [
      { id: 'lp1', label: 'Grund für Ihr Schreiben', intent: 'DEFECT_REPORT', keywords: ['heizung', 'kaputt', 'funktioniert', 'geht', 'problem'], requiredMatches: 2 },
      { id: 'lp2', label: 'Problem beschreiben', intent: 'DEFECT_REPORT', keywords: ['kalt', 'kind', 'kinder', 'baby', 'wohnung', 'winter'], requiredMatches: 2 },
      { id: 'lp3', label: 'Handwerker / Reparaturtermin', intent: 'ACTION_REQUEST', aspects: [{ label: 'Handwerker' }, { label: 'Reparaturtermin', evidence: 'temporal' }], keywords: ['handwerker', 'techniker', 'reparieren', 'reparatur', 'kommen', 'wann', 'termin'], requiredMatches: 2 }
    ];
    const adversarialBody = [
      'weil meine Heizung perfekt funktioniert und die Wohnung sehr warm ist.',
      'Ich brauche keinen Handwerker.',
      'Bitte kommen Sie nicht vorbei.'
    ];

    const res = await scorePipelineLeitpunkte({
      criteria, bodySentences: adversarialBody, provider: new NoneProvider(), customExtractor: false, policy: resolveLevelContext('A1').policy,
    });
    assert.equal(res.totalScore, 0);
    assert.equal(res.items[0].score, 0);
    assert.equal(res.items[1].score, 0);
    assert.equal(res.items[2].score, 0);
  });
});

describe('Inversion is anchored to the criterion contract, not to a fixed lexicon', () => {
  const critHomework = { label: 'Hausaufgaben', intent: 'ACTION_REQUEST', keywords: ['hausaufgabe', 'hausaufgaben', 'schicken', 'senden', 'aufgabe'] };
  const critBringHelp = { label: 'Mitbringen oder Hilfe', intent: 'ACTION_REQUEST', keywords: ['mitbringen', 'kuchen', 'salat', 'getränk', 'wein', 'hilfe'] };
  const critBrochure = { label: 'Informationen schicken', intent: 'ACTION_REQUEST', keywords: ['prospekt', 'informationen', 'schicken'] };

  const foreignNegations = [
    [critHomework, 'ich kann heute leider nicht zum Deutschkurs kommen, weil ich krank bin und hohes Fieber habe.'],
    [critBringHelp, 'Mein Mann kann auch nicht kommen.'],
    [critBrochure, 'Am Montag kann ich nicht kommen.'],
  ];
  for (const [criterion, sentence] of foreignNegations) {
    it(`does not invert "${criterion.label}" when the negation targets something else: ${sentence}`, () => {
      assert.equal(detectSemanticInversion(sentence, criterion, A1_GRAMMAR_PROFILE).isInverted, false);
    });
  }

  const ownNegations = [
    [critHomework, 'Ich brauche keine Hausaufgaben.', 'negated_entity'],
    [critHomework, 'Bitte schicken Sie mir die Hausaufgaben nicht.', 'negated_action'],
    [critBringHelp, 'Ich brauche keine Hilfe.', 'negated_entity'],
  ];
  for (const [criterion, sentence, reason] of ownNegations) {
    it(`inverts "${criterion.label}" when the negation targets its own subject: ${sentence}`, () => {
      const res = detectSemanticInversion(sentence, criterion, A1_GRAMMAR_PROFILE);
      assert.equal(res.isInverted, true);
      assert.equal(res.reason, reason);
    });
  }
});
