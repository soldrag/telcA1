import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { GRADING_MODES } from '../src/services/ai/types.js';
import { clearEmbeddingCache } from '../src/services/embeddings/embeddingService.js';
import { createConceptEmbedder } from './helpers/mockRankerEmbedder.js';
import { findSeedQuestion } from './helpers/regressionFixtures.js';

// The result states how the letter was actually graded: a Micro-Ranker whose model gave no vectors
// (offline before the download, a WebGPU/WASM failure) is not reported as a model grade.

const letter = `Sehr geehrte Damen und Herren,
ich möchte im Juli einen Deutschkurs machen. Ich habe drei Wochen Zeit und lerne gern am Abend. Was kostet der Kurs?
Mit freundlichen Grüßen
Tomas Novak`;

const concepts = createConceptEmbedder({ kurs: ['kurs'], zeit: ['woche', 'abend'], preis: ['kost'] });
const workingExtractor = async (prompt) => ({ data: await concepts.embedText(prompt) });
const failingExtractor = async () => { throw new Error('model download failed: offline'); };
let failAfterFirst = 0;
const partlyFailingExtractor = async (prompt) => {
  failAfterFirst += 1;
  if (failAfterFirst > 1) throw new Error('WASM out of memory');
  return workingExtractor(prompt);
};

function gradeWith(options) {
  return findSeedQuestion('s1-q6').then((question) => gradeSchreibenSubmission({
    userText: letter, question, options,
    provider: options.forceLimitedMode ? null : new MicroRankerProvider({ embedder: null }),
  }));
}

describe('grading_mode: how the letter was actually graded', () => {
  beforeEach(() => {
    clearEmbeddingCache();
    failAfterFirst = 0;
  });

  it('the ranker with a working model reports a model grade', async () => {
    const res = await gradeWith({ customExtractor: workingExtractor });
    assert.equal(res.grading_mode, GRADING_MODES.RANKER);
    assert.equal(res.is_limited_mode, false);
  });

  it('the ranker whose model failed reports the rules fallback, not a model grade', async () => {
    const res = await gradeWith({ customExtractor: failingExtractor });
    assert.equal(res.provider_id, 'micro_ranker');
    assert.equal(res.grading_mode, GRADING_MODES.RANKER_WITHOUT_MODEL);
    assert.equal(res.is_limited_mode, true);
  });

  it('a model that embedded only part of the letter is a fallback too', async () => {
    const res = await gradeWith({ customExtractor: partlyFailingExtractor });
    assert.equal(res.grading_mode, GRADING_MODES.RANKER_WITHOUT_MODEL);
  });

  it('the limited mode reports itself', async () => {
    const res = await gradeWith({ forceLimitedMode: true });
    assert.equal(res.grading_mode, GRADING_MODES.LIMITED);
  });

  it('the fallback grades the letter like the limited mode', async () => {
    const [fallback, limited] = [await gradeWith({ customExtractor: failingExtractor }), await gradeWith({ forceLimitedMode: true })];
    assert.equal(fallback.points_earned, limited.points_earned);
  });
});
