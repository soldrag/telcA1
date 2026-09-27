import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';
import { segmentUserEssay } from '../src/services/schreiben/schreibenTextSegmenter.js';
import { questions as s3Questions } from '../src/data/exams/seeds/schreiben-modellsatz-3.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';

const A1 = resolveLevelContext('A1');

// A Micro-Ranker whose verdict the level policy does not trust on these sentences: its verdict is floored by the baseline.
function untrustedRanker(classifyCoverage) {
  return {
    id: PROVIDER_IDS.MICRO_RANKER,
    name: 'Mock untrusted ranker',
    canOverruleBaseline: () => false,
    classifyCoverage,
  };
}

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

    const seg = segmentUserEssay(studentLetter, criteria, A1);
    assert.match(seg.leitpunkte[0].userSentence, /ich habe ein Problem/i);
    assert.match(seg.leitpunkte[1].userSentence, /Meine Wohnung ist sehr kalt/i);
    assert.match(seg.leitpunkte[2].userSentence, /Können Sie bitte morgen kommen/i);
    assert.match(seg.leitpunkte[2].userSentence, /Ich bin ab 18 Uhr zu Hause/i);
  });

  it('Deterministic baseline awards real student letter passing score (6.5/10) with partial LP1 and LP3', async () => {
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
    assert.equal(res.points_earned, 6.5, 'Total must be 1.5 + 3 + 1.5 + KG 0.5 = 6.5/10 (Passed)');
    assert.equal(res.is_correct, true);
  });

  it('Confidence Floor Guardrail: an untrusted ranker "no" CANNOT demote verified affirmative LP1 or LP3 to 0', async () => {
    const strictRejectingProvider = untrustedRanker(async () => ({ coverage: 'no' }));

    const res = await gradeSchreibenSubmission({
      userText: studentLetter,
      question: heatingQuestion,
      provider: strictRejectingProvider,
    });

    // Guardrail must PREVENT demotion to 0: LP1 and LP3 baseline of 1 is preserved
    assert.equal(res.breakdown.items[0].score, 1, 'LP1 must NOT be demoted to 0 by a ranker "no"');
    assert.equal(res.breakdown.items[1].score, 2, 'LP2 must remain 2');
    assert.equal(res.breakdown.items[2].score, 1, 'LP3 must NOT be demoted to 0 by a ranker "no"');
    assert.equal(res.points_earned, 6.5, 'Total score must stay at 6.5/10 (Passed), never dropping to 3.5');
    assert.equal(res.is_correct, true);

    // Diff summary must record protection against zeroing
    const protectedLps = res.diff_summary.filter(d => d.change === 'protected');
    assert.ok(protectedLps.length >= 1, 'At least one LP must be recorded as protected from zeroing');
  });

  it('Upgrading / Rescuing: a ranker "full" can upgrade LP3 from 1 to 2 when full context is present', async () => {
    // Upgrade LP3 (Termin) because candidate has both appointment request and time availability
    const generousProvider = untrustedRanker(async (crit) => ({ coverage: crit.id === 'lp3' ? 'full' : 'partial' }));

    const res = await gradeSchreibenSubmission({
      userText: studentLetter,
      question: heatingQuestion,
      provider: generousProvider,
    });

    assert.equal(res.breakdown.items[2].score, 2, 'LP3 is upgraded to 2/2');
    assert.equal(res.points_earned, 8, 'Total score upgraded to 8/10');
    assert.equal(res.is_correct, true);

    const rescued = res.diff_summary.find(d => d.id === 'lp3');
    assert.equal(rescued?.change, 'rescued');
    assert.equal(rescued?.from, 1);
    assert.equal(rescued?.to, 2);
  });

  it('Adversarial Inversion Resistance: Inverted letters remain strictly 0 even if the ranker said "full"', async () => {
    const invertedText = `Lieber Herr Meier,

ich habe kein Problem und meine Heizung funktioniert perfekt.
Ich brauche keinen Handwerker und keinen Termin.

Viele Grüße
Alex`;

    const hallucinatingProvider = untrustedRanker(async () => ({ coverage: 'full' }));

    const res = await gradeSchreibenSubmission({
      userText: invertedText,
      question: heatingQuestion,
      provider: hallucinatingProvider,
    });

    assert.equal(res.breakdown.items[0].score, 0, 'Inverted LP1 must remain 0');
    assert.equal(res.breakdown.items[2].score, 0, 'Inverted LP3 must remain 0');
  });

  // Known limit (todo.md, P1 «Пределы точности»): LP2 has no rubric keyword in the letter, so the polarity gate
  // has no evidence sentence to check and the ranker credits «Heizung funktioniert perfekt» as «Problem beschreiben».
  it('an inverted letter without keyword evidence for LP2 does not pass', { todo: 'similarity-only evidence skips the polarity gate' }, async () => {
    const invertedText = `Lieber Herr Meier,

ich habe kein Problem und meine Heizung funktioniert perfekt.
Ich brauche keinen Handwerker und keinen Termin.

Viele Grüße
Alex`;
    const res = await gradeSchreibenSubmission({
      userText: invertedText,
      question: heatingQuestion,
      provider: untrustedRanker(async () => ({ coverage: 'full' })),
    });
    assert.ok(res.points_earned <= 3, 'Inverted adversarial essay must not pass');
  });
});
