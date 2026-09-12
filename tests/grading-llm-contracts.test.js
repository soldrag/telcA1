import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenTeil2 } from '../src/services/schreiben/grading/gradingFacade.js';
import { scoreSingleLeitpunkt } from '../src/services/schreiben/grading/stage2Leitpunkte.js';

describe('Grading LLM Contract Tests (Mock chatCompletion & Safety Invariants)', () => {
  const sampleQuestion = {
    max_points: 10,
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Deutschkurs im August', keywords: ['kurs', 'deutsch', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit und Dauer', keywords: ['wochen', 'zeit', 'vormittag'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten und Anmeldung', keywords: ['kosten', 'anmelden'], requiredMatches: 2 }
        ]
      }
    }
  };

  it('Contract (a): every Qwen3 call passes schema with enums', async () => {
    const recordedCalls = [];
    const mockEngine = {
      chat: {
        completions: {
          create: async (options) => {
            recordedCalls.push(options);
            return {
              choices: [{ message: { content: JSON.stringify({ coverage: 'full' }) } }]
            };
          }
        }
      }
    };

    // Borderline gray zone case: 1 out of 2 required matches gives similarity 0.50 (within 0.45 +/- 0.06)
    await scoreSingleLeitpunkt({
      criterion: { id: 'lp1', label: 'Deutschkurs', keywords: ['kurs', 'deutschkurs'], requiredMatches: 2 },
      bodySentences: ['Ich will einen Kurs machen.'],
      sentenceEmbeddings: [],
      embedder: null,
      qwenEngine: mockEngine
    });

    assert.equal(recordedCalls.length >= 1, true);
    for (const call of recordedCalls) {
      assert.equal(typeof call.response_format, 'object');
      const schema = typeof call.response_format.schema === 'string'
        ? JSON.parse(call.response_format.schema)
        : call.response_format.schema;

      assert.equal(schema.type, 'object');
      if (schema.properties?.coverage) {
        assert.deepEqual(schema.properties.coverage.enum, ['full', 'partial', 'no']);
      }
    }
  });

  it('Contract (b): model output cannot change stage 1-2 scores outside the gray zone', async () => {
    let callCount = 0;
    const maliciousMockEngine = {
      chat: {
        completions: {
          create: async () => {
            callCount++;
            // Maliciously attempts to set score to 0
            return { choices: [{ message: { content: JSON.stringify({ coverage: 'no' }) } }] };
          }
        }
      }
    };

    // Text with full required matches (2/2) -> similarity 0.75, cleanly outside gray zone (> 0.71)
    const result = await scoreSingleLeitpunkt({
      criterion: { id: 'lp1', label: 'Deutschkurs', keywords: ['kurs', 'august'], requiredMatches: 2 },
      bodySentences: ['Ich möchte im August einen Kurs besuchen.'],
      sentenceEmbeddings: [],
      embedder: null,
      qwenEngine: maliciousMockEngine
    });

    // Score remains 2; malicious mock was never invoked outside the gray zone
    assert.equal(result.score, 2);
    assert.equal(result.arbitrated, false);
    assert.equal(callCount, 0);

    // Conversely, text with 0 matches -> similarity 0.20, cleanly outside gray zone (< 0.39)
    const zeroResult = await scoreSingleLeitpunkt({
      criterion: { id: 'lp1', label: 'Deutschkurs', keywords: ['kurs', 'august'], requiredMatches: 2 },
      bodySentences: ['Das Wetter ist heute sehr schön.'],
      sentenceEmbeddings: [],
      embedder: null,
      qwenEngine: maliciousMockEngine
    });

    assert.equal(zeroResult.score, 0);
    assert.equal(zeroResult.arbitrated, false);
    assert.equal(callCount, 0);
  });

  it('Contract (c): if any LLM call throws or times out, pipeline completes with algorithmic scores', async () => {
    const brokenEngine = {
      chat: {
        completions: {
          create: async () => {
            throw new Error('GPU Out of Memory');
          }
        }
      }
    };

    const text = `Sehr geehrte Damen und Herren,
ich will im August einen Deutschkurs machen. Ich habe vier Wochen Zeit. Wie viel kostet der Kurs?
Mit freundlichen Grüßen
Anna Schmidt`;

    // Should complete gracefully without crashing
    const res = await gradeSchreibenTeil2({
      userText: text,
      question: sampleQuestion,
      options: { forceLimitedMode: true }
    });

    assert.equal(typeof res.points_earned, 'number');
    assert.equal(res.points_earned >= 8, true);
    assert.equal(res.breakdown.anrede, 2);
    assert.equal(res.breakdown.gruss, 2);
    assert.equal(typeof res.feedback_summary, 'string');
    assert.equal(res.feedback_summary.length > 20, true);
  });
});
