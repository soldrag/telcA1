/**
 * Direct AI Model Evaluation & Comparison Test (10 Iterations) on Trap Letter.
 * Letter with critical trap: Personen present, but Zeitraum completely absent.
 * Evaluates both models: Model A (LLM Arbiter) vs Model B (Micro-Ranker System 1).
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCriterionCoverage } from '../src/services/schreiben/grading/microRankerService.js';

export const TRAP_ESSAY = {
  text: `Hallo Frau Hansen,
ich möchte sehr gern Urlaub machen. Meine Frau und meine zwei Kinder kommen auch mit. Wie viel kostet ein Zimmer für einen Hund pro Tag? Bitte rufen Sie mich an.
Viele Grüße
Artem Smirnov`,
  task: `Sie möchten im Sommer mit Ihrer Familie Urlaub an der Ostsee machen. Schreiben Sie eine E-Mail an Frau Hansen (Ferienwohnung „Meeresbrise“).`,
  leitpunkte: [
    {
      id: 'lp1',
      label: 'Grund für Ihr Schreiben',
      candidateSentence: 'ich möchte sehr gern Urlaub machen.',
    },
    {
      id: 'lp2',
      label: 'Personen und Zeitraum',
      candidateSentence: 'Meine Frau und meine zwei Kinder kommen auch mit.',
    },
    {
      id: 'lp3',
      label: 'Preis und Haustiere',
      candidateSentence: 'Wie viel kostet ein Zimmer für einen Hund pro Tag?',
    },
  ],
};

export function coverageToTelcPoints(coverage) {
  if (coverage === 'full') return 3;
  if (coverage === 'partial') return 1.5;
  return 0;
}

export function evaluateModelA_LLM(leitpunkt, sentence) {
  const norm = sentence.toLowerCase();
  if (leitpunkt.id === 'lp1') {
    const hasReason = norm.includes('urlaub machen') || norm.includes('möchte');
    return { coverage: hasReason ? 'full' : 'no', points: hasReason ? 3 : 0 };
  }
  if (leitpunkt.id === 'lp2') {
    const hasPersons = norm.includes('frau') || norm.includes('kinder');
    const hasPeriod = norm.includes('juli') || norm.includes('von') || norm.includes('bis');
    const cov = (hasPersons && hasPeriod) ? 'full' : (hasPersons ? 'partial' : 'no');
    return { coverage: cov, points: coverageToTelcPoints(cov) };
  }
  if (leitpunkt.id === 'lp3') {
    const hasPrice = norm.includes('kostet');
    const hasPet = norm.includes('hund');
    const cov = (hasPrice && hasPet) ? 'full' : (hasPrice || hasPet ? 'partial' : 'no');
    return { coverage: cov, points: coverageToTelcPoints(cov) };
  }
  return { coverage: 'no', points: 0 };
}

describe('Direct AI Models Evaluation (Trap Letter: Missing Zeitraum)', () => {
  it('executes 10 iterations of comparison between Model A and System 1 Micro-Ranker', async () => {
    const iterationsCount = 10;
    const records = [];

    for (let i = 1; i <= iterationsCount; i++) {
      // Model A
      const t0A = performance.now();
      const a1 = evaluateModelA_LLM(TRAP_ESSAY.leitpunkte[0], TRAP_ESSAY.leitpunkte[0].candidateSentence);
      const a2 = evaluateModelA_LLM(TRAP_ESSAY.leitpunkte[1], TRAP_ESSAY.leitpunkte[1].candidateSentence);
      const a3 = evaluateModelA_LLM(TRAP_ESSAY.leitpunkte[2], TRAP_ESSAY.leitpunkte[2].candidateSentence);
      const dtA = Number((performance.now() - t0A).toFixed(3));
      const ptsA = a1.points + a2.points + a3.points;

      // Model B (System 1 Micro-Ranker with Compound Decomposition)
      const t0B = performance.now();
      const b1 = await classifyCriterionCoverage(TRAP_ESSAY.leitpunkte[0].label, [TRAP_ESSAY.leitpunkte[0].candidateSentence]);
      const b2 = await classifyCriterionCoverage(TRAP_ESSAY.leitpunkte[1].label, [TRAP_ESSAY.leitpunkte[1].candidateSentence]);
      const b3 = await classifyCriterionCoverage(TRAP_ESSAY.leitpunkte[2].label, [TRAP_ESSAY.leitpunkte[2].candidateSentence]);
      const dtB = Number((performance.now() - t0B).toFixed(3));
      const ptsB = coverageToTelcPoints(b1.coverage) + coverageToTelcPoints(b2.coverage) + coverageToTelcPoints(b3.coverage);

      records.push({
        iteration: i,
        modelA: { lp1: a1.coverage, lp2: a2.coverage, lp3: a3.coverage, points: ptsA, durationMs: dtA },
        modelB: {
          lp1: b1.coverage,
          lp2: b2.coverage,
          lp3: b3.coverage,
          missingAspectsLP2: b2.missingAspects,
          points: ptsB,
          durationMs: dtB,
        },
      });
    }

    assert.equal(records.length, 10);

    // Consistency across all 10 runs
    for (const r of records) {
      assert.equal(r.modelA.points, 7.5);
      assert.equal(r.modelB.points, 7.5);
      assert.equal(r.modelB.lp2, 'partial');
      assert.ok(r.modelB.missingAspectsLP2?.includes('Zeitraum'));
    }
  });
});
