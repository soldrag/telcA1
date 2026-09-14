import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenTeil2 } from '../src/services/schreiben/grading/gradingFacade.js';
import { scoreSingleLeitpunkt } from '../src/services/schreiben/grading/stage2Leitpunkte.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { mergeCandidateGrammarErrors } from '../src/services/schreiben/linguistic/sentenceGrammarFilter.js';

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

  it('Contract (d): semantic frame inversion is penalized even when keyword match is 100%', async () => {
    const criterionWithFrame = {
      id: 'lp3',
      label: 'Preis und Haustiere',
      keywords: ['kosten', 'hund', 'erlaubt'],
      requiredMatches: 2,
      semantic_slots: [
        {
          predicateLemmas: ['kosten'],
          allowedCategories: ['rental_object'],
          incompatibleCategories: ['pet']
        }
      ]
    };

    // Both keywords "kosten" and "hund" match (2/2), but argument "der Hund" is incompatible with predicate "kosten"
    const result = await scoreSingleLeitpunkt({
      criterion: criterionWithFrame,
      bodySentences: ['Wie viel kostet der Hund?'],
      sentenceEmbeddings: [],
      embedder: null,
      qwenEngine: null
    });

    // Score must be capped to 0 due to semantic role inversion (buying a dog instead of paying for rent)
    assert.equal(result.score, 0);
  });

  it('Contract (e): AI provider cannot wipe out or pardon baseline grammar errors', async () => {
    const emptyMockEngine = {
      chat: {
        completions: {
          create: async () => ({
            choices: [{ message: { content: JSON.stringify({ coverage: 'full', errors: [] }) } }]
          })
        }
      }
    };

    const { ClientWebGpuProvider } = await import('../src/services/ai/index.js');
    const mockGpuProvider = new ClientWebGpuProvider(emptyMockEngine);

    const textWithVerblessQuestion = `Sehr geehrte Frau Hansen,\nich möchte Ihre Ferienwohnung mieten. Wir sind zwei Erwachsene und ein Kind. Wir bleiben vom 10. bis zum 17. Juli. Wie viel der Preis für die Wohnung? Darf mein Hund mitkommen?\nMit freundlichen Grüßen\nAlex Müller`;

    const questionWithBaseline = {
      ...sampleQuestion,
      grammar_errors: [
        {
          category: 'syntax',
          code: 'ERR_MISSING_PREDICATE_QUESTION',
          original: 'Wie viel der Preis für die Wohnung?',
          correction: 'Wie viel ist der Preis für die Wohnung?',
          explanation: 'Im Fragesatz fehlt das finite Verb'
        }
      ]
    };

    const result = await gradeSchreibenSubmission({
      userText: textWithVerblessQuestion,
      question: questionWithBaseline,
      provider: mockGpuProvider,
      options: { customExtractor: false }
    });

    // Invariant 1: Baseline grammar errors are NEVER wiped out by an empty LLM response
    assert.equal(result.grammar_errors.length >= 1, true);
    const hasMissingPredicate = result.grammar_errors.some(e => e.code === 'ERR_MISSING_PREDICATE_QUESTION');
    assert.equal(hasMissingPredicate, true);

    // Invariant 2: Grammar penalty is deducted
    assert.equal(result.grammar_penalty >= 1, true);

    // Invariant 3: Feedback acknowledges the grammar errors, not 'keine wesentlichen Grammatikfehler'
    assert.equal(result.feedback_summary.includes('keine wesentlichen Grammatikfehler gefunden'), false);
  });

  it('Contract (f): mergeCandidateGrammarErrors preserves immutability and deduplicates', () => {
    const baseline = [
      { code: 'ERR_1', original: 'Wie viel der Preis', correction: 'Wie viel ist der Preis' }
    ];
    const candidates = [
      { code: 'ERR_DUPLICATE', original: 'wie viel der preis', correction: 'other' },
      { code: 'ERR_NEW', original: 'mein Hund', correction: 'meinen Hund' }
    ];

    const merged = mergeCandidateGrammarErrors(baseline, candidates);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].code, 'ERR_1');
    assert.equal(merged[1].code, 'ERR_NEW');
    // Ensure original baseline array is untouched
    assert.equal(baseline.length, 1);
  });
});
