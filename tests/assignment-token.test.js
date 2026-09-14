import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeAssignmentToken,
  decodeAssignmentToken,
  buildAssignmentUrl,
  parseAssignmentTokenFromUrl,
} from '../src/services/assignmentTokenService.js';
import { verifyAssignmentSignature } from '../src/services/security/teacherSecurityService.js';

describe('Assignment Token Service', () => {
  const teacherKey = 'LEHRER-TEST-9999';
  const config = {
    examId: 'lesen_1',
    testType: 'lesen',
    timeLimitSeconds: 1500,
    teacherName: 'Frau Weber',
    studentName: 'Max Mustermann',
    note: 'Bitte bis morgen lösen',
    teacherKey,
  };

  test('encodes and decodes assignment token with zt1 prefix', async () => {
    const token = await encodeAssignmentToken(config);
    assert.ok(token.startsWith('zt1.'));

    const decoded = await decodeAssignmentToken(token);
    assert.ok(decoded);
    assert.equal(decoded.examId, 'lesen_1');
    assert.equal(decoded.testType, 'lesen');
    assert.equal(decoded.timeLimitSeconds, 1500);
    assert.equal(decoded.teacherName, 'Frau Weber');
    assert.equal(decoded.studentName, 'Max Mustermann');
    assert.equal(decoded.note, 'Bitte bis morgen lösen');
    assert.ok(decoded.assignmentId.startsWith('asg_'));
    assert.ok(decoded.signature);

    // Verify cryptographic signature directly from decoded token
    const isValid = await verifyAssignmentSignature(
      {
        aid: decoded.assignmentId,
        eid: decoded.examId,
        created: decoded.createdAt,
        limit: decoded.timeLimitSeconds,
        student: decoded.studentName,
      },
      decoded.signature,
      teacherKey
    );
    assert.equal(isValid, true);
  });

  test('builds full URL with #task= fragment and parses it', async () => {
    const url = await buildAssignmentUrl({
      assignmentConfig: config,
      originAndPath: 'https://telc.example.com/a1',
    });

    assert.ok(url.startsWith('https://telc.example.com/a1#task=zt1.'));
    const parsedToken = parseAssignmentTokenFromUrl(url);
    assert.ok(parsedToken);

    const decoded = await decodeAssignmentToken(parsedToken);
    assert.equal(decoded?.examId, 'lesen_1');
  });

  test('handles corrupted or invalid task tokens gracefully', async () => {
    assert.equal(await decodeAssignmentToken('invalid_garbage'), null);
    assert.equal(await decodeAssignmentToken('zt1.corrupted_base64_!@#'), null);
    assert.equal(await decodeAssignmentToken(''), null);
    assert.equal(await decodeAssignmentToken(null), null);
  });
});
