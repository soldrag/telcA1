import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runSchreibenMicroPipeline } from '../src/services/schreiben/schreibenMicroPipeline.js';

describe('Schreiben Micro-Pipeline (Stages 0-4)', () => {
  const sampleQuestion = {
    situation: 'Schreiben Sie eine E-Mail an die Sprachschule.',
    options_json: {
      leitpunkte: [
        'Warum schreiben Sie?',
        'Informationen über Sie (Zeit)',
        'Kosten und Anmeldung'
      ]
    }
  };

  const sampleEssay = `Sehr geehrte Damen und Herren,

Ich möchte im August Deutsch lernen.
Ich habe vier Wochen Zeit.
Was kosten der Kurs und wie kann ich mich anmelden?

Mit freundlichen Grüßen,
Artem Smirnov`;

  it('runs cleanly in rules-only baseline mode (without LLM)', async () => {
    const result = await runSchreibenMicroPipeline({
      userText: sampleEssay,
      question: sampleQuestion,
      llmCaller: null
    });

    assert.equal(result.criteria_breakdown.anrede, 2);
    assert.equal(result.criteria_breakdown.gruss, 2);
    assert.equal(result.word_count > 20, true);
    assert.equal(typeof result.final_points, 'number');
    assert.match(result.feedback_summary, /Vielen Dank/);
  });

  it('executes micro-tasks with LLM caller and applies single-entity guardrails', async () => {
    const mockLlm = async ({ prompt, schema }) => {
      // If single LP arbitration prompt
      if (schema?.properties?.coverage) {
        return JSON.stringify({ coverage: 'full' });
      }
      // If single sentence grammar prompt
      if (schema?.properties?.errors) {
        if (prompt.includes('Was kosten der Kurs')) {
          return JSON.stringify({
            errors: [
              { original: 'kosten', correction: 'kostet', explanation: 'Kongruenz' }
            ]
          });
        }
        return JSON.stringify({ errors: [] });
      }
      // If feedback verbalizer prompt
      return 'Gute Arbeit! Ihr Brief ist höflich und gut strukturiert.';
    };

    const result = await runSchreibenMicroPipeline({
      userText: sampleEssay,
      question: sampleQuestion,
      llmCaller: mockLlm
    });

    assert.equal(result.criteria_breakdown.anrede, 2);
    assert.equal(result.criteria_breakdown.gruss, 2);
    assert.equal(result.grammar_errors.some(e => e.original === 'kosten' && e.correction === 'kostet'), true);
    assert.equal(result.feedback_summary, 'Gute Arbeit! Ihr Brief ist höflich und gut strukturiert.');
  });

  it('degrades gracefully to rules-only baseline when LLM throws errors', async () => {
    const brokenLlm = async () => {
      throw new Error('GPU memory exhausted');
    };

    const result = await runSchreibenMicroPipeline({
      userText: sampleEssay,
      question: sampleQuestion,
      llmCaller: brokenLlm
    });

    // Scoring must not fail or crash
    assert.equal(result.criteria_breakdown.anrede, 2);
    assert.equal(result.criteria_breakdown.gruss, 2);
    assert.equal(result.arbitration_applied, false);
    assert.match(result.feedback_summary, /Vielen Dank/);
  });
});
