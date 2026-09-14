import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCanonicalAssignmentMessage,
  generateTeacherKey,
  signAssignmentPayload,
  verifyAssignmentSignature,
} from '../src/services/security/teacherSecurityService.js';

describe('Teacher Security Service (HMAC-SHA256)', () => {
  const samplePayload = {
    aid: 'asg_9f82a1b0',
    eid: 'lesen_1',
    created: '2026-09-14T10:00:00.000Z',
    limit: 1500,
    student: 'Anna Schmidt',
  };

  test('builds canonical string deterministically', () => {
    const msg1 = buildCanonicalAssignmentMessage(samplePayload);
    const msg2 = buildCanonicalAssignmentMessage({
      ...samplePayload,
      student: '  anna schmidt  ', // case & trim insensitive
    });
    assert.equal(msg1, msg2);
    assert.equal(msg1, 'asg_9f82a1b0|lesen_1|2026-09-14T10:00:00.000Z|1500|anna schmidt');
  });

  test('generates structured human-readable teacher key', () => {
    const key = generateTeacherKey();
    assert.match(key, /^LEHRER-[A-Z0-9]{4}-\d{4}$/);
  });

  test('signs and verifies assignment signature successfully', async () => {
    const key = 'LEHRER-TEST-1234';
    const sig = await signAssignmentPayload(samplePayload, key);
    assert.ok(sig);
    assert.equal(typeof sig, 'string');

    const isValid = await verifyAssignmentSignature(samplePayload, sig, key);
    assert.equal(isValid, true);
  });

  test('fails verification if payload fields are modified (tamper resistance)', async () => {
    const key = 'LEHRER-TEST-1234';
    const sig = await signAssignmentPayload(samplePayload, key);

    // Tampered exam id
    const tamperedExam = { ...samplePayload, eid: 'lesen_2' };
    assert.equal(await verifyAssignmentSignature(tamperedExam, sig, key), false);

    // Tampered student
    const tamperedStudent = { ...samplePayload, student: 'Max' };
    assert.equal(await verifyAssignmentSignature(tamperedStudent, sig, key), false);

    // Tampered time limit
    const tamperedLimit = { ...samplePayload, limit: 9999 };
    assert.equal(await verifyAssignmentSignature(tamperedLimit, sig, key), false);
  });

  test('fails verification if checked with a different teacher key', async () => {
    const key1 = 'LEHRER-ALPHA-1111';
    const key2 = 'LEHRER-BETA-2222';
    const sig = await signAssignmentPayload(samplePayload, key1);

    assert.equal(await verifyAssignmentSignature(samplePayload, sig, key2), false);
  });
});
