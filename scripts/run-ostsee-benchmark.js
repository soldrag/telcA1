/**
 * Standalone Benchmark Runner: 10 Iterations of Pure AI Evaluation
 * Compares Model A (Generative LLM Arbiter) vs Model B (Micro-Ranker / Decision Model)
 * on the Ostsee Ferienwohnung prompt.
 */

import {
  TEST_ESSAY,
  evaluateWithModelA_LLM,
  evaluateWithModelB_MicroRanker,
} from '../tests/ostsee-direct-ai-comparison.test.js';

async function runBenchmark() {
  console.log('='.repeat(70));
  console.log('10-ITERATION BENCHMARK: PURE AI EVALUATION (NO ALGORITHMIC BASELINE)');
  console.log('Task: Urlaub an der Ostsee (Ferienwohnung „Meeresbrise“)');
  console.log('='.repeat(70));

  const results = [];

  for (let i = 1; i <= 10; i++) {
    // Model A: LLM
    const t0 = performance.now();
    const a1 = await evaluateWithModelA_LLM(TEST_ESSAY.leitpunkte[0], TEST_ESSAY.leitpunkte[0].candidateSentence);
    const a2 = await evaluateWithModelA_LLM(TEST_ESSAY.leitpunkte[1], TEST_ESSAY.leitpunkte[1].candidateSentence);
    const a3 = await evaluateWithModelA_LLM(TEST_ESSAY.leitpunkte[2], TEST_ESSAY.leitpunkte[2].candidateSentence);
    const durA = Number((performance.now() - t0).toFixed(2));
    const ptsA = a1.points + a2.points + a3.points;

    // Model B: Micro-Ranker
    const t1 = performance.now();
    const b1 = await evaluateWithModelB_MicroRanker(TEST_ESSAY.leitpunkte[0], TEST_ESSAY.leitpunkte[0].candidateSentence);
    const b2 = await evaluateWithModelB_MicroRanker(TEST_ESSAY.leitpunkte[1], TEST_ESSAY.leitpunkte[1].candidateSentence);
    const b3 = await evaluateWithModelB_MicroRanker(TEST_ESSAY.leitpunkte[2], TEST_ESSAY.leitpunkte[2].candidateSentence);
    const durB = Number((performance.now() - t1).toFixed(2));
    const ptsB = b1.points + b2.points + b3.points;

    results.push({
      iteration: i,
      modelA: { lp1: a1.coverage, lp2: a2.coverage, lp3: a3.coverage, points: ptsA, latencyMs: durA },
      modelB: { lp1: b1.coverage, lp2: b2.coverage, lp3: b3.coverage, points: ptsB, latencyMs: durB, scores: [b1.score, b2.score, b3.score] },
    });
  }

  console.log('\n| Iteration | Model A (LLM Arbiter) | Points A | Time A (ms) | Model B (Micro-Ranker) | Points B | Time B (ms) | Agreement |');
  console.log('| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |');

  for (const r of results) {
    const covA = `LP1:${r.modelA.lp1} / LP2:${r.modelA.lp2} / LP3:${r.modelA.lp3}`;
    const covB = `LP1:${r.modelB.lp1} / LP2:${r.modelB.lp2} / LP3:${r.modelB.lp3}`;
    const isAgree = r.modelA.points === r.modelB.points ? '✅ 100%' : '⚠️ Divergence';
    console.log(`| #${r.iteration} | ${covA} | **${r.modelA.points}** / 9 | ${r.modelA.latencyMs} | ${covB} | **${r.modelB.points}** / 9 | ${r.modelB.latencyMs} | ${isAgree} |`);
  }

  const avgDurA = (results.reduce((s, r) => s + r.modelA.latencyMs, 0) / 10).toFixed(2);
  const avgDurB = (results.reduce((s, r) => s + r.modelB.latencyMs, 0) / 10).toFixed(2);
  const speedup = (avgDurA / avgDurB).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log(`COMPARISON SUMMARY:`);
  console.log(`- Model A (LLM Arbiter): Consistent ${results[0].modelA.points}/9 points (avg time: ${avgDurA} ms)`);
  console.log(`- Model B (Micro-Ranker): Consistent ${results[0].modelB.points}/9 points (avg time: ${avgDurB} ms)`);
  console.log(`- System 1 Speedup: ~${speedup}x`);
  console.log('='.repeat(70));
}

runBenchmark();
