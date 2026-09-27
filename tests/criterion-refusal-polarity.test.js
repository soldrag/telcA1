import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSemanticInversion } from '../src/services/schreiben/linguistic/semanticPolarityValidator.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { clearEmbeddingCache } from '../src/services/embeddings/embeddingService.js';
import { A1_GRAMMAR_PROFILE } from '../src/services/schreiben/profiles/a1GrammarProfile.js';
import { DIAGNOSTIC_CODES } from '../src/services/schreiben/feedback/feedbackContracts.js';
import { questions as s2Questions } from '../server/seeds/schreiben-modellsatz-2.js';
import { questions as s3Questions } from '../server/seeds/schreiben-modellsatz-3.js';
import { questions as s4Questions } from '../server/seeds/schreiben-modellsatz-4.js';

const criteriaOf = (qs, id) => qs.find((q) => q.id === id).options_json.rubric.leitpunkte_criteria;
const [cancelReason, cancelWhy, newAppointment] = criteriaOf(s2Questions, 's2-q6');
const [defectReason, , craftsman] = criteriaOf(s3Questions, 's3-q6');
const [, , priceAndPets] = criteriaOf(s4Questions, 's4-q6');
const companion = { id: 'lp2', label: 'Begleitperson', intent: 'GENERAL', evidence: 'personCount', keywords: ['bruder', 'schwester', 'freundin', 'mann', 'kinder'] };

// Every sentence is maximally similar to every Leitpunkt: vector matching pulls all of them into the evidence.
const uniformExtractor = async () => ({ data: Float32Array.from({ length: 8 }, () => 1) });

describe('Refusal of a rubric target, independent of the Leitpunkt intent', () => {
  const refusals = [
    [newAppointment, 'Ich brauche keinen neuen Termin.', 'negated_entity'],
    [craftsman, 'Wir brauchen keinen Techniker.', 'negated_entity'],
    [companion, 'Meine Schwester kommt nicht.', 'negated_participant'],
    [priceAndPets, 'Wir haben keinen Hund.', 'negated_entity'],
    [defectReason, 'Ich habe kein Problem.', 'negated_entity'],
  ];
  for (const [criterion, sentence, reason] of refusals) {
    it(`"${sentence}" refuses "${criterion.label}"`, () => {
      const res = detectSemanticInversion(sentence, criterion, A1_GRAMMAR_PROFILE);
      assert.equal(res.isInverted, true);
      assert.equal(res.reason, reason);
    });
  }

  const contentNegations = [
    [cancelReason, 'Ich habe leider keine Zeit.'],
    [cancelWhy, 'Ich kann nicht kommen, weil ich keine Zeit habe.'],
    [defectReason, 'Das Licht geht nicht.'],
    [defectReason, 'Die Heizung funktioniert nicht.'],
    [newAppointment, 'Am Mittwoch kann ich nicht, aber am Donnerstag habe ich Zeit.'],
    [companion, 'Mein Bruder kommt auch mit.'],
  ];
  for (const [criterion, sentence] of contentNegations) {
    it(`"${sentence}" does not refuse "${criterion.label}"`, () => {
      assert.equal(detectSemanticInversion(sentence, criterion, A1_GRAMMAR_PROFILE).isInverted, false);
    });
  }
});

describe('Refusal weighed the same across a comma and a full stop', () => {
  const question = s2Questions.find((q) => q.id === 's2-q6');

  async function gradeLetter(opening, body) {
    clearEmbeddingCache();
    const userText = `Sehr geehrte Damen und Herren,\n${opening}\n${body}\nMit freundlichen Grüßen\nMaria Klein`;
    const res = await gradeSchreibenSubmission({ userText, question, provider: new NoneProvider(), options: { customExtractor: uniformExtractor } });
    return res.breakdown.items[2];
  }
  const gradeBody = (body) => gradeLetter('ich muss meinen Arzttermin absagen. Ich muss lange arbeiten.', body);

  it('an alternative in the same sentence protects the Leitpunkt like one in the next sentence', async () => {
    const joined = await gradeBody('Am Mittwoch habe ich keine Zeit, aber am Donnerstag passt es mir.');
    const split = await gradeBody('Am Mittwoch habe ich keine Zeit. Aber am Donnerstag passt es mir.');
    assert.equal(joined.score, split.score);
    assert.ok(joined.score > 0, 'the alternative day fulfils the Leitpunkt');
  });

  it('a refusal without alternative zeroes the Leitpunkt with a general inversion code', async () => {
    const item = await gradeBody('Ich brauche keinen neuen Termin.');
    assert.equal(item.score, 0);
    assert.equal(item.diagnosticCode, DIAGNOSTIC_CODES.LP_INVERTED_GENERAL);
  });

  it('a refusal is not outweighed by the date of the cancelled appointment', async () => {
    const item = await gradeLetter('ich muss meinen Termin am Montag absagen. Ich muss lange arbeiten.', 'Ich brauche keinen neuen Termin.');
    assert.equal(item.score, 0);
  });
});
