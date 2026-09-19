import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { runSchreibenMicroPipeline } from '../src/services/schreiben/schreibenMicroPipeline.js';
import { segmentUserEssay } from '../src/services/schreiben/schreibenTextSegmenter.js';
import { questions as s3Questions } from '../server/seeds/schreiben-modellsatz-3.js';

describe('Schreiben Arbiter Guardrail & Macro-Segment Grounding', () => {
  const heatingQuestion = s3Questions.find(q => q.id === 's3-q6');

  const studentLetter = `Lieber Herr Meier,

ich habe ein Problem.
Meine Wohnung ist sehr kalt.
Können Sie bitte morgen kommen und mir helfen?
Ich bin ab 18 Uhr zu Hause.

Viele Grüße
Alex`;

  it('Macro-segmentation preserves continuation satellite "Ich bin ab 18 Uhr zu Hause" under LP3', () => {
    const criteria = [
      { id: 'lp1', label: 'Grund für Ihr Schreiben', keywords: ['problem', 'heizung'] },
      { id: 'lp2', label: 'Problem beschreiben', keywords: ['kalt', 'wohnung'] },
      { id: 'lp3', label: 'Handwerker / Reparaturtermin', keywords: ['handwerker', 'kommen', 'termin'] },
    ];

    const seg = segmentUserEssay(studentLetter, criteria);
    assert.equal(seg.anrede, 'Lieber Herr Meier,');
    assert.match(seg.leitpunkte[0].userSentence, /ich habe ein Problem/i);
    assert.match(seg.leitpunkte[1].userSentence, /Meine Wohnung ist sehr kalt/i);
    assert.match(seg.leitpunkte[2].userSentence, /Können Sie bitte morgen kommen/i);
    assert.match(seg.leitpunkte[2].userSentence, /Ich bin ab 18 Uhr zu Hause/i);
    assert.equal(seg.closing, 'Viele Grüße');
  });

  it('Deterministic baseline awards real student letter passing score (6/10) with partial LP1 and LP3', async () => {
    const res = await gradeSchreibenSubmission({
      userText: studentLetter,
      question: heatingQuestion,
      options: { forceLimitedMode: true },
    });

    assert.equal(res.breakdown.anrede, 1, 'Informal salutation Lieber Herr Meier gets 1/2');
    assert.equal(res.breakdown.items[0].score, 1, 'LP1 (problem mentioned) gets 1/2');
    assert.equal(res.breakdown.items[1].score, 2, 'LP2 (kalt + wohnung) gets 2/2');
    assert.equal(res.breakdown.items[2].score, 1, 'LP3 (kommen matched) gets 1/2');
    assert.equal(res.breakdown.gruss, 1, 'Informal closing Viele Grüße gets 1/2');
    assert.equal(res.points_earned, 6, 'Total must be 6/10 (Passed)');
    assert.equal(res.is_correct, true);
  });

  it('Confidence Floor Guardrail: Strict micro-LLM returning "no" CANNOT demote verified affirmative LP1 or LP3 to 0', async () => {
    // Mock an aggressive/strict micro-LLM that says "no" to everything
    const strictRejectingProvider = {
      id: 'mock-strict-llm',
      name: 'Mock Strict LLM',
      classifyCoverage: async () => ({ coverage: 'no' }),
      proposeGrammarCandidates: async () => [],
      polishFeedback: async () => 'Prüfer-Feedback',
    };

    const res = await gradeSchreibenSubmission({
      userText: studentLetter,
      question: heatingQuestion,
      provider: strictRejectingProvider,
    });

    // Guardrail must PREVENT demotion to 0: LP1 and LP3 baseline of 1 is preserved
    assert.equal(res.breakdown.items[0].score, 1, 'LP1 must NOT be demoted to 0 by LLM "no"');
    assert.equal(res.breakdown.items[1].score, 2, 'LP2 must remain 2');
    assert.equal(res.breakdown.items[2].score, 1, 'LP3 must NOT be demoted to 0 by LLM "no"');
    assert.equal(res.points_earned, 6, 'Total score must stay at 6/10 (Passed), never dropping to 4');
    assert.equal(res.is_correct, true);

    // Diff summary must record protection against zeroing
    const protectedLps = res.diff_summary.filter(d => d.change === 'protected');
    assert.ok(protectedLps.length >= 1, 'At least one LP must be recorded as protected from zeroing');
  });

  it('Upgrading / Rescuing: Generous micro-LLM can upgrade LP3 from 1 to 2 when full context is present', async () => {
    const generousProvider = {
      id: 'mock-generous-llm',
      name: 'Mock Generous LLM',
      classifyCoverage: async (crit) => {
        // Upgrade LP3 (Termin) because candidate has both appointment request and time availability
        if (crit.id === 'lp3') return { coverage: 'full' };
        return { coverage: 'partial' };
      },
      proposeGrammarCandidates: async () => [],
      polishFeedback: async () => 'Prüfer-Feedback',
    };

    const res = await gradeSchreibenSubmission({
      userText: studentLetter,
      question: heatingQuestion,
      provider: generousProvider,
    });

    assert.equal(res.breakdown.items[2].score, 2, 'LP3 is upgraded to 2/2');
    assert.equal(res.points_earned, 7, 'Total score upgraded to 7/10');
    assert.equal(res.is_correct, true);

    const rescued = res.diff_summary.find(d => d.id === 'lp3');
    assert.equal(rescued?.change, 'rescued');
    assert.equal(rescued?.from, 1);
    assert.equal(rescued?.to, 2);
  });

  it('Adversarial Inversion Resistance: Inverted letters remain strictly 0 even if LLM hallucinated "full"', async () => {
    const invertedText = `Lieber Herr Meier,

ich habe kein Problem und meine Heizung funktioniert perfekt.
Ich brauche keinen Handwerker und keinen Termin.

Viele Grüße
Alex`;

    const hallucinatingProvider = {
      id: 'mock-hallucinating-llm',
      name: 'Mock Hallucinating LLM',
      classifyCoverage: async () => ({ coverage: 'full' }),
      proposeGrammarCandidates: async () => [],
      polishFeedback: async () => 'Prüfer-Feedback',
    };

    const res = await gradeSchreibenSubmission({
      userText: invertedText,
      question: heatingQuestion,
      provider: hallucinatingProvider,
    });

    assert.equal(res.breakdown.items[0].score, 0, 'Inverted LP1 must remain 0');
    assert.equal(res.breakdown.items[2].score, 0, 'Inverted LP3 must remain 0');
    assert.ok(res.points_earned <= 3, 'Inverted adversarial essay must not pass');
  });

  it('SchreibenMicroPipeline: Enforces confidence floor when run with llmCaller', async () => {
    // llmCaller that always returns "no"
    const strictLlmCaller = async () => JSON.stringify({ coverage: 'no', errors: [] });

    const result = await runSchreibenMicroPipeline({
      userText: studentLetter,
      question: heatingQuestion,
      llmCaller: strictLlmCaller,
    });

    assert.equal(result.breakdown.items[0].score, 1, 'LP1 must remain 1');
    assert.equal(result.breakdown.items[1].score, 2, 'LP2 must remain 2');
    assert.equal(result.breakdown.items[2].score, 1, 'LP3 must remain 1');
    assert.equal(result.final_points, 6, 'Final points must be 6/10');
  });
});
