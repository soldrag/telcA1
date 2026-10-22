import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { purposeMargin } from '../src/services/schreiben/grading/unitEvidence.js';
import { purposeFeatures, isAnotherPurpose, PURPOSE_FEATURE_NAMES } from '../src/services/schreiben/grading/purposeReview.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';

const unit = (x, y) => { const n = Math.hypot(x, y); return Float32Array.from([x / n, y / n]); };

// Fulfilling phrases spread around x, other-purpose phrases around y; banks differ in how widely they spread.
function bankOf(spreadAngle) {
  const around = (base, k) => unit(Math.cos(base + k * spreadAngle), Math.sin(base + k * spreadAngle));
  const otherPurpose = [-1, 0, 1].map((k) => around(Math.PI / 2, k));
  return { units: { lp1: { fulfils: [-1, 0, 1].map((k) => around(0, k)) } }, otherPurpose, foreignPurpose: otherPurpose };
}

describe('Another-purpose review', () => {
  it('puts sentence margins on the task bank\'s own scale: on purpose > 0, other purpose < 0, halfway 0', () => {
    for (const bank of [bankOf(0.5), bankOf(0.6)]) {
      assert.ok(purposeMargin(unit(1, 0.05), bank) > 0.3);
      assert.ok(purposeMargin(unit(0.05, 1), bank) < -0.3);
      assert.ok(Math.abs(purposeMargin(unit(1, 1), bank)) < 1e-9);
    }
  });

  it('reads a bank without foreign purposes by its own other-purpose phrases', () => {
    const { foreignPurpose, ...ownOnly } = bankOf(0.5);
    assert.equal(purposeMargin(unit(1, 0.05), ownOnly), purposeMargin(unit(1, 0.05), { ...ownOnly, foreignPurpose }));
  });

  it('reads the letter with the features the head was trained on, in order', () => {
    const criteria = [{ id: 'lp1', label: 'Grund' }, { id: 'lp2', label: 'Termin' }];
    const units = { lp1: { support: 0.2 }, lp2: { support: 0.9 } };
    const features = purposeFeatures({ criteria, units, sentencePurposeMargins: [0.4, -0.2], keywordLevels: [1, 2] });
    assert.equal(features.length, PURPOSE_FEATURE_NAMES.length);
    assert.deepEqual(features.map((f) => Number(f.toFixed(2))), [0.1, -0.2, 0.4, 0.2, 0.55, 0.9, 3]);
  });

  it('voids only above its threshold', () => {
    const review = { head: { weights: [-1], bias: 0, mean: [0], scale: [1] }, threshold: 0.9 };
    assert.equal(isAnotherPurpose([-3], review), true);
    assert.equal(isAnotherPurpose([0], review), false);
  });

  it('does not run when the keyword stage graded without the model', async () => {
    const question = { id: 's1-q6', level: 'A1', options_json: { rubric: { leitpunkte_criteria: [] } } };
    let calls = 0;
    await gradeSchreibenSubmission({
      userText: 'Hallo, ich arbeite jetzt in Berlin.', question, provider: new MicroRankerProvider({ embedder: null }),
      options: { customExtractor: false, evidenceExtractor: async () => { calls += 1; return { data: new Float32Array(256) }; } },
    });
    assert.equal(calls, 0);
  });
});
