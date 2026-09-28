import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { clearEmbeddingCache } from '../src/services/embeddings/embeddingService.js';

// Every sentence is maximally similar to every Leitpunkt, so vector matching pulls
// all body sentences into each criterion's evidence — the browser-side worst case.
const uniformExtractor = async () => ({ data: Float32Array.from({ length: 8 }, () => 1) });

const homeworkQuestion = {
  max_points: 10,
  options_json: {
    rubric: {
      leitpunkte_criteria: [
        { id: 'lp1', label: 'Grund für Ihr Schreiben', keywords: ['krank', 'arzt', 'fieber', 'kopfschmerz', 'termin'], requiredMatches: 1 },
        { id: 'lp2', label: 'Wie lange Sie fehlen', keywords: ['tage', 'woche', 'freitag', 'montag', 'dauer'], requiredMatches: 1 },
        { id: 'lp3', label: 'Hausaufgaben', keywords: ['hausaufgabe', 'hausaufgaben', 'schicken', 'senden', 'aufgabe'], requiredMatches: 1 },
      ],
    },
  },
};

async function gradeWithVectors(body) {
  const userText = `Sehr geehrte Frau Müller,\n${body}\nMit freundlichen Grüßen\nAnna Schmidt`;
  return gradeSchreibenSubmission({
    userText, question: homeworkQuestion, provider: new NoneProvider(), options: { customExtractor: uniformExtractor },
  });
}

describe('Leitpunkt inversion with active sentence embeddings', () => {
  beforeEach(() => clearEmbeddingCache());

  it('keeps a fulfilled request when another sentence negates an unrelated action', async () => {
    const res = await gradeWithVectors('ich kann morgen nicht zum Unterricht kommen, weil ich Fieber habe. '
      + 'Der Arzt sagt, ich bleibe drei Tage zu Hause. Schicken Sie mir bitte die Aufgabe?');
    assert.equal(res.criteria_breakdown.lp3, 2);
  });

  it('does not let a partial refusal cancel an explicit request for the same Leitpunkt', async () => {
    const res = await gradeWithVectors('Ich bin krank und fehle zwei Tage. Ich brauche keine Hausaufgaben auf Papier. '
      + 'Bitte schicken Sie mir die Hausaufgaben per E-Mail.');
    assert.equal(res.criteria_breakdown.lp3, 2);
  });

  it('still zeroes a Leitpunkt that is only refused', async () => {
    const res = await gradeWithVectors('Ich bin krank und fehle zwei Tage. Ich brauche keine Hausaufgaben.');
    assert.equal(res.criteria_breakdown.lp3, 0);
  });
});
