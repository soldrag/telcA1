/**
 * Every grading entry point loads the lexicon data itself. `npm test` preloads it (tests/support), which hid
 * v0.7.89's broken submit on static hosting: Schreiben answers threw "dictionary is not loaded" and the
 * confirm button did nothing. These checks run in a fresh process without the preload.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const ANSWERS = JSON.stringify({
  's4-q1': 'Müller', 's4-q2': 'Anna', 's4-q3': 'Berlin', 's4-q4': 'Hund', 's4-q5': 'Juli',
  's4-q6': 'Sehr geehrte Frau Hansen, ich komme im Juli mit meiner Familie. Viele Grüße Anna',
});

function runFresh(source) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', source], { cwd: ROOT, encoding: 'utf8' }).trim();
}

describe('Lexicon data is loaded by the grading entry points', () => {
  it('local (static hosting) submit grades Schreiben without a preload', () => {
    const out = runFresh(`
      import { submitLocalExamAnswers } from './src/services/localDataService.js';
      const r = await submitLocalExamAnswers('schreiben-modellsatz-4', { answers: ${ANSWERS}, timeSpentSeconds: 60 });
      console.log(r.reviewItems.length);
    `);
    assert.equal(out, '6');
  });

  it('server submit route grades Schreiben without a preload', () => {
    const out = runFresh(`
      import { createExamsRouter } from './server/routes/exams.js';
      import { ExamRepository } from './server/repositories/exam.repository.js';
      import { seedData } from './server/seed-data.js';
      const router = createExamsRouter(Object.assign(Object.create(ExamRepository.prototype), {
        findExamById: (id) => seedData.exams.find((e) => e.id === id),
        findQuestionsForGrading: (id) => seedData.questions.filter((q) => q.exam_id === id),
      }));
      const layer = router.stack.find((l) => l.route?.path === '/:id/submit' && l.route.methods.post);
      const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
      await layer.route.stack[0].handle({ params: { id: 'schreiben-modellsatz-4' }, body: { answers: ${ANSWERS}, timeSpentSeconds: 60 }, headers: {} }, res);
      console.log(res.statusCode, res.body?.reviewItems?.length);
    `);
    assert.equal(out, '200 6');
  });
});
