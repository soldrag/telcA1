import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NoneProvider, WindowAiProvider, ClientWebGpuProvider } from '../src/services/ai/index.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';

describe('Cross-Provider Invariants & Algorithmic Determinism', () => {
  const modellsatz1Question = {
    max_points: 10,
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Grund für das Schreiben (Deutschkurs)', keywords: ['deutschkurs', 'kurs', 'a1', 'machen', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit und Dauer (Vormittag, 4 Wochen)', keywords: ['wochen', 'zeit', 'vormittag', 'lernen', 'stunden'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten und Anmeldung', keywords: ['kosten', 'kostet', 'anmelden', 'anmeldung', 'informationen', 'wie viel'], requiredMatches: 2 }
        ]
      }
    }
  };

  const createMockWindowAi = () => {
    const provider = new WindowAiProvider();
    provider.executePrompt = async (prompt) => {
      if (prompt.includes('errors')) {
        return { errors: [{ original: 'ein Deutschkurs', correction: 'einen Deutschkurs', explanation: 'Akkusativ' }] };
      }
      return { coverage: 'full' };
    };
    return provider;
  };

  const createMockGpu = () => {
    return new ClientWebGpuProvider({
      chat: {
        completions: {
          create: async () => ({
            choices: [{ message: { content: JSON.stringify({ coverage: 'full', errors: [] }) } }]
          })
        }
      }
    });
  };

  const testCases = [
    {
      title: 'Perfect Submission',
      text: `Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule besuchen. Ich habe vier Wochen Zeit und möchte gern am Vormittag lernen. Wie viel kostet der Kurs und wie kann ich mich anmelden?\nMit freundlichen Grüßen\nMaximilian Becker`,
      expectedAnrede: 2,
      expectedLP: 6,
      expectedGruss: 2
    },
    {
      title: 'Missing Anrede',
      text: `Ich möchte Deutschkurs im August machen. Ich habe vier Wochen Zeit am Vormittag. Was kostet der Kurs und wie melde ich an?\nMit freundlichen Grüßen\nAnna Müller`,
      expectedAnrede: 0,
      expectedLP: 6,
      expectedGruss: 2
    },
    {
      title: 'Missing LP3 (Kosten und Anmeldung)',
      text: `Sehr geehrte Damen und Herren,\nich will im August Deutschkurs lernen. Ich habe vier Wochen Zeit vormittags.\nViele Grüße\nJan Schmidt`,
      expectedAnrede: 2,
      expectedLP: 4,
      expectedGruss: 2
    }
  ];

  for (const tc of testCases) {
    it(`CROSS-PROVIDER INVARIANT: stages 0-2 identical for ${tc.title}`, async () => {
      const noneProvider = new NoneProvider();
      const windowProvider = createMockWindowAi();
      const gpuProvider = createMockGpu();

      const resNone = await gradeSchreibenSubmission({
        userText: tc.text,
        question: modellsatz1Question,
        provider: noneProvider,
        options: { forceLimitedMode: true }
      });

      const resWindow = await gradeSchreibenSubmission({
        userText: tc.text,
        question: modellsatz1Question,
        provider: windowProvider,
        options: { forceLimitedMode: true }
      });

      const resGpu = await gradeSchreibenSubmission({
        userText: tc.text,
        question: modellsatz1Question,
        provider: gpuProvider,
        options: { forceLimitedMode: true }
      });

      // Stages 0-2 invariant: Anrede, Leitpunkte and Gruß scores must be 100% IDENTICAL across all providers
      assert.equal(resNone.breakdown.anrede, tc.expectedAnrede);
      assert.equal(resWindow.breakdown.anrede, resNone.breakdown.anrede);
      assert.equal(resGpu.breakdown.anrede, resNone.breakdown.anrede);

      assert.equal(resNone.breakdown.leitpunkte, tc.expectedLP);
      assert.equal(resWindow.breakdown.leitpunkte, resNone.breakdown.leitpunkte);
      assert.equal(resGpu.breakdown.leitpunkte, resNone.breakdown.leitpunkte);

      assert.equal(resNone.breakdown.gruss, tc.expectedGruss);
      assert.equal(resWindow.breakdown.gruss, resNone.breakdown.gruss);
      assert.equal(resGpu.breakdown.gruss, resNone.breakdown.gruss);
    });
  }

  it('Algorithmic determinism: two consecutive runs produce 100% identical results', async () => {
    const text = `Sehr geehrte Damen und Herren,\nich möchte einen Deutschkurs im August besuchen. Ich habe vier Wochen Zeit am Vormittag. Wie viel kostet die Anmeldung?\nMit freundlichen Grüßen\nMax Mustermann`;
    const provider = new NoneProvider();

    const run1 = await gradeSchreibenSubmission({ userText: text, question: modellsatz1Question, provider, options: { forceLimitedMode: true } });
    const run2 = await gradeSchreibenSubmission({ userText: text, question: modellsatz1Question, provider, options: { forceLimitedMode: true } });

    assert.equal(run1.points_earned, run2.points_earned);
    assert.deepEqual(run1.breakdown, run2.breakdown);
    assert.deepEqual(run1.criteria_breakdown, run2.criteria_breakdown);
    assert.equal(run1.feedback_summary, run2.feedback_summary);
  });
});
