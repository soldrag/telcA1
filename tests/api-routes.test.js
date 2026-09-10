import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createExamsRouter } from '../server/routes/exams.js';
import { createAttemptsRouter } from '../server/routes/attempts.js';
import { createTestTypesRouter } from '../server/routes/test-types.js';

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

function findRouteHandler(router, path, method = 'get') {
  const layer = router.stack.find(
    s => s.route && s.route.path === path && s.route.methods[method.toLowerCase()]
  );
  if (!layer) throw new Error(`Route handler not found for ${method.toUpperCase()} ${path}`);
  return layer.route.stack[0].handle;
}

describe('Server Route Handlers (Offline Unit Test)', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE exams (
      id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, description TEXT,
      test_type TEXT DEFAULT 'lesen', time_limit_minutes INT, total_questions INT, pass_score INT,
      sort_order INT DEFAULT 1
    );
    CREATE TABLE questions (
      id TEXT PRIMARY KEY, exam_id TEXT, teil INT, question_number INT,
      title TEXT, situation TEXT, context_header TEXT, context_body TEXT,
      options_json TEXT, statement TEXT, correct_answer TEXT,
      clue_quote TEXT, explanation_ru TEXT, explanation_de TEXT, vocabulary_notes TEXT
    );
    CREATE TABLE attempts (
      id TEXT PRIMARY KEY, exam_id TEXT, user_id TEXT, score INT,
      total_questions INT, percentage REAL, passed INT, time_spent_seconds INT,
      answers_json TEXT, results_json TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    INSERT INTO exams VALUES 
      ('modellsatz-1', 'Exam 1', 'Sub', 'Desc', 'lesen', 25, 1, 1, 1),
      ('modellsatz-2', 'Exam 2', 'Sub', 'Desc', 'lesen', 25, 1, 1, 2);
    INSERT INTO questions VALUES 
      ('q1', 'modellsatz-1', 1, 1, 'Q1', NULL, NULL, 'Body', NULL, 'St', 'richtig', 'Clue', 'Ru', 'De', NULL);
  `);

  it('GET /api/test-types handler returns active and upcoming test modules', () => {
    const router = createTestTypesRouter();
    const handler = findRouteHandler(router, '/', 'get');
    const req = {};
    const res = createMockRes();

    handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.testTypes.length >= 4);
    assert.equal(res.body.testTypes.find(t => t.id === 'lesen').status, 'active');
    assert.equal(res.body.testTypes.find(t => t.id === 'schreiben').status, 'upcoming');
  });

  it('GET /api/exams/next-random handler picks least attempted exam', () => {
    const router = createExamsRouter(db);
    const handler = findRouteHandler(router, '/next-random', 'get');
    const req = { headers: { 'x-user-id': 'student-offline-1' }, query: {} };
    const res = createMockRes();

    handler(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.exam);
    assert.equal(res.body.totalAvailable, 2);
  });

  it('POST /api/exams/:id/submit evaluates submission statelessly without storing user attempts on server', () => {
    const router = createExamsRouter(db);
    const submitHandler = findRouteHandler(router, '/:id/submit', 'post');
    const req = {
      params: { id: 'modellsatz-1' },
      headers: { 'x-user-id': 'student-offline-1' },
      body: { answers: { q1: 'richtig' }, timeSpentSeconds: 30 }
    };
    const res = createMockRes();

    submitHandler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.score, 1);
    assert.equal(res.body.passed, true);
    assert.ok(res.body.attemptId);

    // Verify no attempts written to SQLite attempts table
    const storedCount = db.prepare('SELECT COUNT(*) as cnt FROM attempts').get().cnt;
    assert.equal(storedCount, 0, 'Server database attempts table must remain empty');
  });
});
