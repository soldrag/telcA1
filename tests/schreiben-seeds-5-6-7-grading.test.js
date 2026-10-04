import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { evaluateTeil1Answer } from '../src/services/schreiben/schreibenTeil1Evaluator.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { questions as s5Questions } from '../src/data/exams/seeds/schreiben-modellsatz-5.js';
import { questions as s6Questions } from '../src/data/exams/seeds/schreiben-modellsatz-6.js';
import { questions as s7Questions } from '../src/data/exams/seeds/schreiben-modellsatz-7.js';

describe('Schreiben Modellsatz 5, 6, 7 Verification', () => {
  const suites = [
    { label: 'Modellsatz 5', questions: s5Questions },
    { label: 'Modellsatz 6', questions: s6Questions },
    { label: 'Modellsatz 7', questions: s7Questions },
  ];

  for (const { label, questions } of suites) {
    describe(`${label} — Teil 1 Formular`, () => {
      const formQs = questions.filter((q) => q.teil === 1);

      it('declares exactly 5 Teil 1 form fields', () => {
        assert.equal(formQs.length, 5);
      });

      for (const q of formQs) {
        it(`Q${q.question_number} (${q.options_json.form_label}) accepts declared answers and rejects invalid input`, () => {
          for (const ans of q.options_json.accepted_answers) {
            assert.equal(evaluateTeil1Answer(ans, q), true, `should accept "${ans}"`);
            assert.equal(evaluateTeil1Answer(ans.toUpperCase(), q), true, `should accept uppercase "${ans.toUpperCase()}"`);
          }
          assert.equal(evaluateTeil1Answer('völligFalscheAntwortXYZ999', q), false, 'should reject invalid answer');
        });
      }
    });

    describe(`${label} — Teil 2 E-Mail / Brief`, () => {
      const essayQ = questions.find((q) => q.teil === 2);

      it('grades sample solution with 10/10 points and zero grammar errors', async () => {
        const res = await gradeSchreibenSubmission({
          userText: essayQ.options_json.sample_solution,
          question: essayQ,
          provider: new NoneProvider()
        });

        assert.equal(res.points_earned, 10, `${label} sample solution should score 10/10`);
        assert.equal(res.breakdown.leitpunkte, 9, 'All 3 Leitpunkte must score full points (9)');
        assert.equal(res.breakdown.kommunikative_gestaltung.points, 1, 'Kommunikative Gestaltung must score 1');
        assert.equal(res.breakdown.grammarErrors?.length || 0, 0, 'Sample solution must have zero grammar errors');
      });
    });
  }
});
