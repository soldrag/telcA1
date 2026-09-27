import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalExamDetails } from '../src/services/localDataService.js';
import {
  compressStringToBase64Url,
  decompressBase64UrlToString,
} from '../src/services/share/streamCompressor.js';

describe('Security Audit Fixes Verification', () => {
  describe('Exam Questions Sanitization (Anti-Cheat)', () => {
    it('localDataService.getLocalExamDetails strips correct answers', () => {
      const details = getLocalExamDetails('modellsatz-1');
      assert.ok(details.questions.length > 0);
      for (const q of details.questions) {
        assert.equal(q.correct_answer, undefined);
        assert.equal(q.clue_quote, undefined);
        assert.equal(q.explanation_ru, undefined);
      }
    });
  });

  describe('Decompression Bomb Protection', () => {
    it('decompressBase64UrlToString halts when payload exceeds maximum size limit', async () => {
      const largeText = 'A'.repeat(50 * 1024);
      const token = await compressStringToBase64Url(largeText);

      const restored = await decompressBase64UrlToString(token, 256 * 1024);
      assert.equal(restored.length, 50 * 1024);

      await assert.rejects(
        async () => {
          await decompressBase64UrlToString(token, 10 * 1024);
        },
        /exceeds maximum limit/
      );
    });
  });
});
