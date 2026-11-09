import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLeitpunktAssessor, LEITPUNKT_ENGINES } from '../src/services/schreiben/grading/assessors/index.js';
import { ILeitpunktAssessor } from '../src/services/schreiben/grading/assessors/leitpunktAssessorInterface.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { aiProviderRegistry } from '../src/services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';

const criteria = [
  { id: 'lp1', label: 'Grund', intent: 'GENERAL', keywords: ['zimmer', 'buchen'], requiredMatches: 1 },
  { id: 'lp2', label: 'Wann', intent: 'GENERAL', evidence: 'temporal', keywords: ['montag'], requiredMatches: 1 },
];
const bodySentences = ['Ich möchte ein Zimmer buchen.', 'Ich komme am Montag.'];

describe('ILeitpunktAssessor contract', () => {
  it('rejects an unknown engine instead of falling back', () => {
    assert.throws(() => resolveLeitpunktAssessor('no-such-engine'), RangeError);
  });

  for (const engine of Object.values(LEITPUNKT_ENGINES)) {
    it(`${engine}: one verdict per criterion with a level, a span and a diagnostic code`, async () => {
      const assessor = resolveLeitpunktAssessor(engine);
      assert.ok(assessor instanceof ILeitpunktAssessor);
      assert.equal(assessor.id, engine);
      const policy = resolveLevelContext('A1').policy;
      await policy.lexicon.load();
      const result = await assessor.assess({
        question: {
          id: 'contract',
          situation: 'Sie möchten ein Zimmer buchen.',
          options_json: {
            evidenceBank: {
              units: {
                lp1: { fulfils: ['Ich möchte ein Zimmer buchen.'], misses: ['Ich möchte kein Zimmer.'] },
                lp2: { fulfils: ['Ich komme am Montag.'], misses: ['Ich komme nicht.'] },
              },
              otherPurpose: ['Das Essen war kalt.'],
              purposeLetters: { onTask: ['Ich möchte ein Zimmer buchen.'], offTask: ['Das Essen war kalt.'] },
            },
          },
        },
        criteria, bodySentences, policy, customExtractor: false,
        provider: aiProviderRegistry.getProvider(PROVIDER_IDS.NONE),
      });
      assert.deepEqual(result.items.map((it) => it.id), ['lp1', 'lp2']);
      for (const item of result.items) {
        assert.ok([0, 1, 2].includes(item.score));
        assert.equal(typeof item.matchedSentence, 'string');
        assert.match(item.diagnosticCode, /^LP_/);
      }
      assert.equal(typeof result.modelUsed, 'boolean');
    });
  }
});
