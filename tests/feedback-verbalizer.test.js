import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compileFeedbackFacts,
  buildFeedbackPrompt,
  generateFeedbackSummary,
  sanitizeFeedbackText,
  isConsistentWithFacts
} from '../src/services/schreiben/analyzers/feedbackVerbalizer.js';

describe('Feedback Verbalizer', () => {
  const sampleFacts = {
    salutationScore: 2,
    lpResults: [
      { id: 'lp1', label: 'Grund', score: 2 },
      { id: 'lp2', label: 'Zeit', score: 2 },
      { id: 'lp3', label: 'Kosten', score: 0 }
    ],
    closingScore: 1,
    grammarErrors: [
      { original: 'kosten', correction: 'kostet' }
    ]
  };

  it('compiles locked facts into clean bulleted facts text', () => {
    const text = compileFeedbackFacts(sampleFacts);
    assert.match(text, /Greeting: 2\/2/);
    assert.match(text, /Point 1 \(Grund\): 2\/2 \(fully addressed\)/);
    assert.match(text, /Point 3 \(Kosten\): 0\/2 \(missing\)/);
    assert.match(text, /Closing & Name: 1\/2/);
    assert.match(text, /"kosten" -> "kostet"/);
  });

  it('builds prompt instructing model to write strictly from facts', () => {
    const prompt = buildFeedbackPrompt('Facts:\nGreeting: 2/2');
    assert.match(prompt, /Write exactly 2 short sentences/);
    assert.match(prompt, /based ONLY on these facts/);
    assert.match(prompt, /Answer strictly in JSON/);
  });

  it('generates feedback summary via mock LLM', async () => {
    const mockLlm = async ({ prompt }) => {
      assert.match(prompt, /Greeting: 2\/2/);
      return JSON.stringify({
        feedback: 'Sehr geehrter Teilnehmer, Ihr Brief ist gut verständlich. Achten Sie auf die Frage nach den Kosten.'
      });
    };

    const summary = await generateFeedbackSummary({
      facts: sampleFacts,
      llmCaller: mockLlm
    });

    assert.match(summary, /Sehr geehrter Teilnehmer/);
  });

  it('discards hallucinated phrases and trims cut-off sentences', () => {
    const fallback = 'Fallback text.';
    // Hallucination discard
    assert.equal(
      sanitizeFeedbackText('Sie sind eine Einkaufs-Opfer und lügen nicht an.', fallback),
      fallback
    );

    // Cut-off sentence repair
    const cutOff = 'Gute Arbeit! Die Aufgaben wurden verständlich bearbeitet und Ihr Kurs zu bet';
    const cleaned = sanitizeFeedbackText(cutOff, fallback);
    assert.equal(cleaned, 'Gute Arbeit!');
  });

  it('flags feedback that contradicts the locked facts', () => {
    const allCovered = { lpResults: [{ score: 2 }, { score: 2 }, { score: 2 }], grammarErrors: [] };

    // Parrot of the old few-shot example: claims point 3 is unanswered although facts show 2/2
    assert.equal(isConsistentWithFacts(
      'Gute Arbeit! Die ersten beiden Punkte sind verständlich, aber beantworten Sie auch den dritten Punkt.',
      allCovered
    ), false);
    assert.equal(
      isConsistentWithFacts('Sehr gut gemacht! Sie haben alle Punkte verständlich bearbeitet.', allCovered),
      true
    );
    // Mentions a grammar problem although facts say none
    assert.equal(isConsistentWithFacts('Achten Sie bitte auf die Verbform.', allCovered), false);
    // Missing point mentioned as missing — consistent
    assert.equal(isConsistentWithFacts(
      'Bitte beantworten Sie auch den dritten Punkt.',
      { lpResults: [{ score: 2 }, { score: 2 }, { score: 0 }], grammarErrors: [] }
    ), true);
  });

  it('returns default fallback feedback if LLM caller is absent or fails', async () => {
    const fallbackSummary = await generateFeedbackSummary({
      facts: sampleFacts,
      llmCaller: null
    });

    assert.match(fallbackSummary, /Vielen Dank für Ihren Brief/);
  });
});
