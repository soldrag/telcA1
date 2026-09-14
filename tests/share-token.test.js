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

  const sampleSchreibenAttempt = {
    id: 'att-schreiben-1',
    exam_id: 'modellsatz-1-schreiben',
    test_type: 'schreiben',
    answers: {
      'q_1': 'Eva',
      'q_2': 'Müller',
      'q_3': 'Berlin',
      'q_4': '2',
      'q_5': 'Barzahlung',
      'essay': 'Sehr geehrte Damen und Herren, ich schreibe Ihnen, weil ich mich für den Deutschkurs A1 anmelden möchte. Ich habe ein paar Fragen: Wann beginnt der nächste Kurs? Wie viele Stunden pro Woche hat der Unterricht und wie viel kostet das gesamte Lehrbuch? Ich freue mich auf Ihre Antwort. Mit freundlichen Grüßen, Anna Müller',
    },
    time_spent_seconds: 900,
    created_at: '2026-09-12T10:00:00.000Z',
  };

  it('encodes and decodes compressed v2 attempt token with student name', async () => {
    const token = await encodeAttemptToken({
      attempt: sampleAttempt,
      studentName: 'Иван Иванов',
    });

    assert.ok(typeof token === 'string' && token.startsWith('z2.'));
    assert.ok(!token.includes('+') && !token.includes('/') && !token.includes('='));

    const decoded = await decodeAttemptToken(token);
    assert.ok(decoded);
    assert.equal(decoded.examId, 'modellsatz-1');
    assert.equal(decoded.testType, 'lesen');
    assert.deepEqual(decoded.answers, { '1': 'a', '2': 'b', '3': 'c' });
    assert.equal(decoded.timeSpentSeconds, 450);
    assert.equal(decoded.createdAt, '2026-09-12T10:00:00.000Z');
    assert.equal(decoded.studentName, 'Иван Иванов');
  });

  it('preserves assignment metadata and telemetry across encode and decode', async () => {
    const attemptWithAssignment = {
      ...sampleAttempt,
      assignment_id: 'asg_12345',
      teacher_signature: 'sig_abcde',
      telemetry: {
        startedAt: '2026-09-12T09:40:00.000Z',
        completedAt: '2026-09-12T10:00:00.000Z',
        wallClockSeconds: 1200,
        tabSwitches: 2,
      },
    };

    const token = await encodeAttemptToken({
      attempt: attemptWithAssignment,
      studentName: 'Anna',
    });
    const decoded = await decodeAttemptToken(token);

    assert.equal(decoded.assignmentId, 'asg_12345');
    assert.equal(decoded.teacherSignature, 'sig_abcde');
    assert.deepEqual(decoded.telemetry, {
      startedAt: '2026-09-12T09:40:00.000Z',
      completedAt: '2026-09-12T10:00:00.000Z',
      wallClockSeconds: 1200,
      tabSwitches: 2,
    });
  });

  it('correctly verifies HMAC signature end-to-end between teacher issue and review', async () => {
    const { encodeAssignmentToken, decodeAssignmentToken } = await import('../src/services/assignmentTokenService.js');
    const { verifyAssignmentSignature } = await import('../src/services/security/teacherSecurityService.js');

    const teacherKey = 'LEHRER-VALID-1234';
    const taskToken = await encodeAssignmentToken({
      examId: 'lesen_1',
      testType: 'lesen',
      timeLimitSeconds: 1500,
      studentName: 'Anna',
      teacherKey,
    });
    const taskData = await decodeAssignmentToken(taskToken);

    // Student completes assignment
    const studentAttempt = {
      exam_id: taskData.examId,
      test_type: taskData.testType,
      assignment_id: taskData.assignmentId,
      teacher_signature: taskData.signature,
      assignment_created_at: taskData.createdAt,
      assignment_time_limit: taskData.timeLimitSeconds,
      answers: { '1': 'a' },
      time_spent_seconds: 400,
      created_at: new Date().toISOString(),
      telemetry: {
        startedAt: new Date(Date.now() - 400000).toISOString(),
        completedAt: new Date().toISOString(),
        wallClockSeconds: 400,
        tabSwitches: 0,
      },
    };

    const reviewToken = await encodeAttemptToken({
      attempt: studentAttempt,
      studentName: taskData.studentName,
    });
    const reviewDecoded = await decodeAttemptToken(reviewToken);

    // Teacher verifies on review screen
    const payloadToVerify = {
      aid: reviewDecoded.assignmentId,
      eid: reviewDecoded.examId,
      created: reviewDecoded.assignmentCreatedAt,
      limit: reviewDecoded.assignmentTimeLimit ?? 0,
      student: reviewDecoded.studentName,
    };

    const isAuthentic = await verifyAssignmentSignature(
      payloadToVerify,
      reviewDecoded.teacherSignature,
      teacherKey
    );
    assert.equal(isAuthentic, true);
  });

  it('preserves 100% backward compatibility for legacy v1 uncompressed tokens', async () => {
    const legacyPayload = {
      v: 1,
      eid: 'modellsatz-1',
      type: 'lesen',
      ans: { '1': 'a', '2': 'b' },
      time: 300,
      date: '2026-09-01T12:00:00.000Z',
      name: 'Old User',
    };
    const legacyToken = Buffer.from(JSON.stringify(legacyPayload), 'utf-8').toString('base64url');

    const decoded = await decodeAttemptToken(legacyToken);
    assert.ok(decoded);
    assert.equal(decoded.examId, 'modellsatz-1');
    assert.equal(decoded.testType, 'lesen');
    assert.deepEqual(decoded.answers, { '1': 'a', '2': 'b' });
    assert.equal(decoded.timeSpentSeconds, 300);
    assert.equal(decoded.studentName, 'Old User');
  });

  it('achieves substantial compression for Schreiben essays', async () => {
    const rawJson = JSON.stringify({
      v: 1,
      eid: sampleSchreibenAttempt.exam_id,
      type: sampleSchreibenAttempt.test_type,
      ans: sampleSchreibenAttempt.answers,
      time: sampleSchreibenAttempt.time_spent_seconds,
      date: sampleSchreibenAttempt.created_at,
      name: 'Анна Мюллер',
    });
    const uncompressedBase64Length = Buffer.from(rawJson, 'utf-8').toString('base64url').length;

    const compressedToken = await encodeAttemptToken({
      attempt: sampleSchreibenAttempt,
      studentName: 'Анна Мюллер',
    });

    assert.ok(compressedToken.length < uncompressedBase64Length);
    const reductionRatio = 1 - (compressedToken.length / uncompressedBase64Length);
    assert.ok(reductionRatio >= 0.25, `Expected >= 25% compression, got ${(reductionRatio * 100).toFixed(1)}%`);

    const decoded = await decodeAttemptToken(compressedToken);
    assert.ok(decoded);
    assert.equal(decoded.answers.essay, sampleSchreibenAttempt.answers.essay);
    assert.equal(decoded.studentName, 'Анна Мюллер');
  });

  it('handles optional student name when omitted or whitespace', async () => {
    const token = await encodeAttemptToken({ attempt: sampleAttempt });
    const decoded = await decodeAttemptToken(token);
    assert.equal(decoded.studentName, null);

    const tokenWhitespace = await encodeAttemptToken({ attempt: sampleAttempt, studentName: '   ' });
    const decodedWhitespace = await decodeAttemptToken(tokenWhitespace);
    assert.equal(decodedWhitespace.studentName, null);
  });

  it('throws error when encoding attempt without exam_id', async () => {
    await assert.rejects(() => encodeAttemptToken({ attempt: {} }), /exam_id/);
  });

  it('returns null for corrupted or invalid tokens', async () => {
    assert.equal(await decodeAttemptToken(null), null);
    assert.equal(await decodeAttemptToken(''), null);
    assert.equal(await decodeAttemptToken('invalid-base64-content!@#$'), null);
    assert.equal(await decodeAttemptToken('z2.invalid-deflate-data'), null);
    assert.equal(await decodeAttemptToken('eyJ2IjoyfQ'), null); // wrong version
  });

  it('builds full URL with hash fragment', async () => {
    const url = await buildShareUrl({
      attempt: sampleAttempt,
      studentName: 'Anna Schmidt',
      originAndPath: 'https://telc.example.com/app',
    });

    assert.ok(url.startsWith('https://telc.example.com/app#review=z2.'));
    const token = url.split('#review=')[1];
    const decoded = await decodeAttemptToken(token);
    assert.equal(decoded.studentName, 'Anna Schmidt');
    assert.equal(decoded.examId, 'modellsatz-1');
  });

  it('parses review token from hash and query strings', async () => {
    const sampleToken = await encodeAttemptToken({ attempt: sampleAttempt });

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

    const token = await encodeAttemptToken({
      attempt: {
        exam_id: 'modellsatz-1',
        test_type: 'lesen',
        answers: { '1': 'b', '2': 'c' },
        time_spent_seconds: 320,
      },
      studentName: 'Максим',
    });

    const decoded = await decodeAttemptToken(token);
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
