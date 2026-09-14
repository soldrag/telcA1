import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createDebugAuthMiddleware } from '../server/middleware/debug-auth.js';
import { createDebugRouter } from '../server/routes/debug.js';
import { createExamsRouter } from '../server/routes/exams.js';
import { createAttemptsRouter } from '../server/routes/attempts.js';
import { createSecurityHeadersMiddleware } from '../server/middleware/security-headers.js';
import { createRateLimiter } from '../server/middleware/rate-limiter.js';
import { createPrecompressedMiddleware } from '../server/middleware/static-compression.js';
import { getLocalExamDetails } from '../src/services/localDataService.js';
import {
  compressStringToBase64Url,
  decompressBase64UrlToString,
} from '../src/services/share/streamCompressor.js';

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
    type() {
      return this;
    }
  };
}

describe('Security Audit Fixes Verification', () => {
  describe('Debug API Authentication & Sanitization', () => {
    it('blocks debug access in production if DEBUG_ADMIN_KEY is absent', () => {
      const middleware = createDebugAuthMiddleware({ nodeEnv: 'production', adminKey: undefined });
      const req = { headers: {} };
      const res = createMockRes();
      let nextCalled = false;

      middleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'Debug API disabled in production');
    });

    it('rejects access if DEBUG_ADMIN_KEY is set but request has wrong key', () => {
      const middleware = createDebugAuthMiddleware({ nodeEnv: 'production', adminKey: 'super-secret-123' });
      const req = { headers: { 'x-debug-key': 'wrong-key' } };
      const res = createMockRes();
      let nextCalled = false;

      middleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.error, 'Unauthorized debug access');
    });

    it('allows access in production if valid DEBUG_ADMIN_KEY is provided', () => {
      const middleware = createDebugAuthMiddleware({ nodeEnv: 'production', adminKey: 'super-secret-123' });
      const req = { headers: { 'x-debug-key': 'super-secret-123' } };
      const res = createMockRes();
      let nextCalled = false;

      middleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
    });
  });

  describe('Exam Questions Sanitization (Anti-Cheat)', () => {
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
        clue_quote TEXT, explanation_ru TEXT, explanation_en TEXT, explanation_de TEXT, vocabulary_notes TEXT
      );
      INSERT INTO exams VALUES ('exam-1', 'Exam 1', 'Sub', 'Desc', 'lesen', 25, 1, 1, 1);
      INSERT INTO questions VALUES ('q1', 'exam-1', 1, 1, 'Q1', NULL, NULL, 'Body', '["a","b"]', 'St', 'a', 'Secret Clue', 'Ru Exp', 'En Exp', 'De Exp', NULL);
    `);

    it('GET /api/exams/:id strips correct_answer, clue_quote, and explanations', () => {
      const router = createExamsRouter(db);
      const layer = router.stack.find(s => s.route && s.route.path === '/:id' && s.route.methods.get);
      const handler = layer.route.stack[0].handle;

      const req = { params: { id: 'exam-1' } };
      const res = createMockRes();

      handler(req, res);

      assert.equal(res.statusCode, 200);
      assert.ok(res.body.questions);
      const q = res.body.questions[0];
      assert.equal(q.id, 'q1');
      assert.equal(q.correct_answer, undefined);
      assert.equal(q.clue_quote, undefined);
      assert.equal(q.explanation_ru, undefined);
      assert.equal(q.explanation_en, undefined);
    });

    it('localDataService.getLocalExamDetails strips correct answers in client static mode', () => {
      const details = getLocalExamDetails('modellsatz-1');
      assert.ok(details.questions.length > 0);
      for (const q of details.questions) {
        assert.equal(q.correct_answer, undefined);
        assert.equal(q.clue_quote, undefined);
        assert.equal(q.explanation_ru, undefined);
      }
    });
  });

  describe('IDOR Protection on Attempts', () => {
    const db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE attempts (
        id TEXT PRIMARY KEY, exam_id TEXT, user_id TEXT, score INT,
        total_questions INT, percentage REAL, passed INT, time_spent_seconds INT,
        answers_json TEXT, results_json TEXT, created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO attempts VALUES ('att-student-a', 'exam-1', 'student-a-uuid', 10, 15, 66.7, 1, 300, '{}', '{}', datetime('now'));
    `);

    it('blocks access if requester x-user-id does not match attempt owner', () => {
      const router = createAttemptsRouter(db);
      const layer = router.stack.find(s => s.route && s.route.path === '/:id' && s.route.methods.get);
      const handler = layer.route.stack[0].handle;

      const req = { params: { id: 'att-student-a' }, headers: { 'x-user-id': 'student-attacker-uuid' } };
      const res = createMockRes();

      handler(req, res);

      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'Access denied to this attempt');
    });

    it('grants access if requester x-user-id matches attempt owner', () => {
      const router = createAttemptsRouter(db);
      const layer = router.stack.find(s => s.route && s.route.path === '/:id' && s.route.methods.get);
      const handler = layer.route.stack[0].handle;

      const req = { params: { id: 'att-student-a' }, headers: { 'x-user-id': 'student-a-uuid' } };
      const res = createMockRes();

      handler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.id, 'att-student-a');
    });
  });

  describe('Security Headers & Rate Limiting Middleware', () => {
    it('sets standard defensive security headers including CSP and HSTS', () => {
      const middleware = createSecurityHeadersMiddleware();
      const req = {};
      const res = createMockRes();
      let nextCalled = false;

      middleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.ok(res.headers['content-security-policy']);
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
      assert.equal(res.headers['x-frame-options'], 'DENY');
      assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
      assert.ok(res.headers['strict-transport-security'].includes('max-age=31536000'));
    });

    it('enforces rate limit threshold and returns 429 when exceeded', () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2, keyGenerator: () => 'test-ip' });
      const req = {};
      const res1 = createMockRes();
      const res2 = createMockRes();
      const res3 = createMockRes();

      limiter(req, res1, () => {});
      limiter(req, res2, () => {});
      limiter(req, res3, () => {});

      assert.equal(res1.statusCode, 200);
      assert.equal(res2.statusCode, 200);
      assert.equal(res3.statusCode, 429);
      assert.ok(res3.body.error.includes('Too many requests'));
    });
  });

  describe('Path Traversal & Decompression Bomb Protection', () => {
    it('static compression middleware prevents path traversal outside root', () => {
      const middleware = createPrecompressedMiddleware('/safe/root');
      const req = {
        method: 'GET',
        path: '/../../etc/passwd',
        url: '/../../etc/passwd',
        headers: { 'accept-encoding': 'br' },
      };
      const res = createMockRes();
      let nextCalled = false;

      middleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.equal(req.url, '/../../etc/passwd'); // must not be rewritten or checked
    });

    it('decompressBase64UrlToString halts when payload exceeds maximum size limit', async () => {
      // 100KB repeating text compressed expands above a 5KB limit
      const largeText = 'A'.repeat(50 * 1024);
      const token = await compressStringToBase64Url(largeText);

      // Should succeed within standard 256KB limit
      const restored = await decompressBase64UrlToString(token, 256 * 1024);
      assert.equal(restored.length, 50 * 1024);

      // Should abort with error when size limit is smaller than payload
      await assert.rejects(
        async () => {
          await decompressBase64UrlToString(token, 10 * 1024);
        },
        /exceeds maximum limit/
      );
    });
  });
});
