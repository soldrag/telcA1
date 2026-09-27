import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { needsPipelineGrading } from '../src/hooks/useSchreibenAiChecker.js';

const letter = 'Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs machen.\nMit freundlichen Grüßen\nAnna';

describe('needsPipelineGrading', () => {
  it('grades an attempt saved by the old rules-only grading, even though it carries examiner feedback', () => {
    const savedBeforeRanker = { user_answer: letter, examiner_feedback: { summary: 'x' }, provider_id: null };
    assert.equal(needsPipelineGrading(savedBeforeRanker), true);
  });

  it('skips an empty answer and a result that names its provider', () => {
    assert.equal(needsPipelineGrading({ user_answer: null }), false);
    assert.equal(needsPipelineGrading({ user_answer: letter, provider_id: 'micro_ranker' }), false);
    assert.equal(needsPipelineGrading({ user_answer: letter, provider_id: 'none' }), false);
  });
});
