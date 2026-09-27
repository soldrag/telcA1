import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { needsPipelineGrading } from '../src/hooks/useSchreibenAiChecker.js';
import { gradeQuestion } from '../src/services/evaluation/examEvaluator.js';

const essay = {
  id: 7,
  teil: 2,
  question_type: 'essay',
  max_points: 10,
  options_json: { type: 'essay', rubric: { leitpunkte_criteria: [
    { id: 'lp1', label: 'Deutschkurs im August', keywords: ['kurs', 'deutsch', 'august'], requiredMatches: 2 },
  ] } },
};
const letter = 'Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs machen.\nMit freundlichen Grüßen\nAnna';

describe('needsPipelineGrading', () => {
  it('grades a letter scored at submission by the rules-only path, even though it carries examiner feedback', () => {
    const item = gradeQuestion(essay, { 7: letter });
    assert.ok(item.examiner_feedback);
    assert.equal(needsPipelineGrading(item), true);
  });

  it('skips an empty answer and a result that already names its provider', () => {
    assert.equal(needsPipelineGrading({ user_answer: null }), false);
    assert.equal(needsPipelineGrading({ user_answer: letter, provider_id: 'micro_ranker' }), false);
  });
});
