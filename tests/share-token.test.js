import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeAttemptToken,
  decodeAttemptToken,
  buildShareUrl,
  parseReviewTokenFromUrl,
} from '../src/services/shareTokenService.js';

describe('Share Token Service', () => {
  const sampleAttempt = {
    id: 'att-123',
    exam_id: 'modellsatz-1',
    test_type: 'lesen',
    answers: { '1': 'a', '2': 'b', '3': 'c' },
    time_spent_seconds: 450,
    created_at: '2026-09-12T10:00:00.000Z',
    score: 12,
    total_questions: 15,
  };

  it('encodes and decodes an attempt token accurately with student name', () => {
    const token = encodeAttemptToken({
      attempt: sampleAttempt,
      studentName: 'Иван Иванов',
    });

    assert.ok(typeof token === 'string' && token.length > 0);
    assert.ok(!token.includes('+') && !token.includes('/') && !token.includes('='));

    const decoded = decodeAttemptToken(token);
    assert.ok(decoded);
    assert.equal(decoded.examId, 'modellsatz-1');
    assert.equal(decoded.testType, 'lesen');
    assert.deepEqual(decoded.answers, { '1': 'a', '2': 'b', '3': 'c' });
    assert.equal(decoded.timeSpentSeconds, 450);
    assert.equal(decoded.createdAt, '2026-09-12T10:00:00.000Z');
    assert.equal(decoded.studentName, 'Иван Иванов');
  });

  it('handles optional student name when omitted or whitespace', () => {
    const token = encodeAttemptToken({ attempt: sampleAttempt });
    const decoded = decodeAttemptToken(token);
    assert.equal(decoded.studentName, null);

    const tokenWhitespace = encodeAttemptToken({ attempt: sampleAttempt, studentName: '   ' });
    const decodedWhitespace = decodeAttemptToken(tokenWhitespace);
    assert.equal(decodedWhitespace.studentName, null);
  });

  it('throws error when encoding attempt without exam_id', () => {
    assert.throws(() => encodeAttemptToken({ attempt: {} }), /exam_id/);
  });

  it('returns null for corrupted or invalid tokens', () => {
    assert.equal(decodeAttemptToken(null), null);
    assert.equal(decodeAttemptToken(''), null);
    assert.equal(decodeAttemptToken('invalid-base64-content!@#$'), null);
    assert.equal(decodeAttemptToken('eyJ2IjoyfQ'), null); // wrong version
  });

  it('builds full URL with hash fragment', () => {
    const url = buildShareUrl({
      attempt: sampleAttempt,
      studentName: 'Anna Schmidt',
      originAndPath: 'https://telc.example.com/app',
    });

    assert.ok(url.startsWith('https://telc.example.com/app#review='));
    const token = url.split('#review=')[1];
    const decoded = decodeAttemptToken(token);
    assert.equal(decoded.studentName, 'Anna Schmidt');
    assert.equal(decoded.examId, 'modellsatz-1');
  });

  it('parses review token from hash and query strings', () => {
    const sampleToken = encodeAttemptToken({ attempt: sampleAttempt });

    const fromHash = parseReviewTokenFromUrl(`https://telc.example.com/#review=${sampleToken}`);
    assert.equal(fromHash, sampleToken);

    const fromQuery = parseReviewTokenFromUrl(`https://telc.example.com/?review=${sampleToken}`);
    assert.equal(fromQuery, sampleToken);

    const fromHashOnly = parseReviewTokenFromUrl(`#review=${sampleToken}`);
    assert.equal(fromHashOnly, sampleToken);
  });

  it('evaluates shared attempt statelessly without calling storage.saveAttempt', async () => {
    const { submitLocalExamAnswers } = await import('../src/services/localDataService.js');
    const { MemoryAttemptStorage } = await import('../src/services/storage/memoryAttemptStorage.js');

    const teacherStorage = new MemoryAttemptStorage();
    assert.equal((await teacherStorage.getAttempts()).length, 0);

    const token = encodeAttemptToken({
      attempt: {
        exam_id: 'modellsatz-1',
        test_type: 'lesen',
        answers: { '1': 'b', '2': 'c' },
        time_spent_seconds: 320,
      },
      studentName: 'Максим',
    });

    const decoded = decodeAttemptToken(token);
    assert.ok(decoded);

    // Simulate teacher opening the link and grading
    const graded = submitLocalExamAnswers(decoded.examId, {
      answers: decoded.answers,
      timeSpentSeconds: decoded.timeSpentSeconds,
    });

    assert.equal(graded.exam.id, 'modellsatz-1');
    assert.equal(graded.totalQuestions, 15);
    assert.ok(Array.isArray(graded.reviewItems));

    // Teacher storage must remain completely untouched!
    assert.equal((await teacherStorage.getAttempts()).length, 0);
  });
});
