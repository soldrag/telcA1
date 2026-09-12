import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractAndParseLLMJson } from '../src/services/schreiben/webLlmJsonRepair.js';

describe('WebLLM JSON Repair and Extractor', () => {
  it('parses pristine JSON properly', () => {
    const jsonStr = `{"criteria_breakdown":{"anrede":1,"lp1":2,"lp2":2,"lp3":2,"gruss":2},"grammar_errors":[{"original":"in August","correction":"im August","explanation":"Präposition"}],"feedback_summary":"Gut"}`;
    const res = extractAndParseLLMJson(jsonStr);
    assert.equal(res.criteria_breakdown.anrede, 1);
    assert.equal(res.grammar_errors.length, 1);
    assert.equal(res.feedback_summary, 'Gut');
  });

  it('handles markdown code fences and conversational wrappers', () => {
    const raw = `Hier ist Ihre Bewertung:\n\`\`\`json\n{"criteria_breakdown":{"anrede":2,"lp1":2,"lp2":2,"lp3":2,"gruss":1},"grammar_errors":[],"feedback_summary":"Sehr gut gemacht!"}\n\`\`\`\nViel Erfolg!`;
    const res = extractAndParseLLMJson(raw);
    assert.equal(res.criteria_breakdown.gruss, 1);
    assert.equal(res.feedback_summary, 'Sehr gut gemacht!');
  });

  it('repairs trailing commas and unclosed brackets', () => {
    const broken = `{"criteria_breakdown":{"anrede":1,"lp1":2,"lp2":2,"lp3":2,"gruss":2,},"grammar_errors":[{"original":"test","correction":"Test","explanation":"Nomen",},],}`;
    const res = extractAndParseLLMJson(broken);
    assert.equal(res.criteria_breakdown.anrede, 1);
    assert.equal(res.grammar_errors.length, 1);
  });

  it('falls back to heuristic extraction if JSON is cut off mid-stream', () => {
    const truncated = `{"criteria_breakdown":{"anrede":1,"lp1":2,"lp2":2,"lp3":2,"gruss":1},"grammar_errors":[{"original":"wochen"`;
    const res = extractAndParseLLMJson(truncated);
    assert.equal(res.criteria_breakdown.anrede, 1);
    assert.equal(res.criteria_breakdown.gruss, 1);
  });
});
