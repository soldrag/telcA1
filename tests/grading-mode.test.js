import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { GRADING_MODES, GRADING_FALLBACK_REASONS } from '../src/services/ai/types.js';
import { findSeedQuestion } from './helpers/regressionFixtures.js';

// The result states how the letter was actually graded: a model-backed grading whose model gave no vectors
// (offline before the download, a WebGPU/WASM failure) is not reported as a model grade.

const letter = `Sehr geehrte Damen und Herren,
ich möchte im Juli einen Deutschkurs machen. Ich habe drei Wochen Zeit und lerne gern am Abend. Was kostet der Kurs?
Mit freundlichen Grüßen
Tomas Novak`;

// A stand-in for EmbeddingGemma's sentence_embedding: a fixed pseudo-random direction per word, at the stored
// reference vectors' length (768), so the evidence head reads it; the levels it gives mean nothing here.
function workingExtractor(prompt) {
  const v = new Float32Array(768);
  for (const word of prompt.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)) {
    let h = 2166136261;
    for (const ch of word) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
    for (let i = 0; i < v.length; i++) v[i] += ((h >>> (i % 24)) & 1) ? 1 : -1;
  }
  return Promise.resolve({ data: v });
}
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
    provider: options.forceLimitedMode ? null : new MicroRankerProvider(),
  }));
}

describe('grading_mode: how the letter was actually graded', () => {
  beforeEach(() => {
    failAfterFirst = 0;
  });

  it('the ranker with a working model reports a model grade', async () => {
    const res = await gradeWith({ evidenceExtractor: workingExtractor });
    assert.equal(res.grading_mode, GRADING_MODES.RANKER);
    assert.equal(res.is_limited_mode, false);
    assert.equal(res.grading_fallback, null);
  });

  it('the ranker whose model failed reports the rules fallback, not a model grade', async () => {
    const res = await gradeWith({ evidenceExtractor: failingExtractor });
    assert.equal(res.provider_id, 'micro_ranker');
    assert.equal(res.grading_mode, GRADING_MODES.RANKER_WITHOUT_MODEL);
    assert.equal(res.is_limited_mode, true);
  });

  it('the failed model is named in the result: the reason and the failure\'s own message', async () => {
    const res = await gradeWith({ evidenceExtractor: failingExtractor });
    assert.deepEqual(res.grading_fallback, { reason: GRADING_FALLBACK_REASONS.MODEL_FAILED, detail: 'model download failed: offline' });
  });

  it('a model that embedded only part of the letter is a fallback too', async () => {
    const res = await gradeWith({ evidenceExtractor: partlyFailingExtractor });
    assert.equal(res.grading_mode, GRADING_MODES.RANKER_WITHOUT_MODEL);
    assert.equal(res.grading_fallback.detail, 'WASM out of memory');
  });

  it('a model that returns no embedding is a failure with its message, not a model grade', async () => {
    const res = await gradeWith({ evidenceExtractor: async () => ({ data: [] }) });
    assert.equal(res.grading_mode, GRADING_MODES.RANKER_WITHOUT_MODEL);
    assert.equal(res.grading_fallback.reason, GRADING_FALLBACK_REASONS.MODEL_FAILED);
    assert.match(res.grading_fallback.detail, /0 dimensions/);
  });

  it('the limited mode reports itself and is not a fallback', async () => {
    const res = await gradeWith({ forceLimitedMode: true });
    assert.equal(res.grading_mode, GRADING_MODES.LIMITED);
    assert.equal(res.grading_fallback, null);
  });

  it('the fallback grades the letter like the limited mode', async () => {
    const [fallback, limited] = [await gradeWith({ evidenceExtractor: failingExtractor }), await gradeWith({ forceLimitedMode: true })];
    assert.equal(fallback.points_earned, limited.points_earned);
  });
});

describe('grading progress', () => {
  it('a grading with a ready model reports its stages and no model download', async () => {
    const stages = [];
    const question = await findSeedQuestion('s1-q6');
    await gradeSchreibenSubmission({
      userText: letter, question, options: { evidenceExtractor: workingExtractor },
      provider: new MicroRankerProvider(), onProgress: (event) => stages.push(event.stage),
    });
    assert.deepEqual(stages, ['preprocessing', 'leitpunkte', 'grammar', 'feedback', 'done']);
  });
});
