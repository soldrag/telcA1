/**
 * Stage 2: Qwen3 Leitpunkt Arbiter prompt builder and execution.
 * Isolated from keyword matching to respect SRP and file length limits.
 */

import { LEITPUNKT_COVERAGE_SCHEMA } from './types.js';
import { executeQwen3Prompt } from './qwen3Service.js';
import { coverageToPoints, applyConfidenceFloor } from './stage2Leitpunkte.js';
import { buildArbiterPrompt } from './prompts.js';

export { buildArbiterPrompt };

export async function arbitrateGrayZone({ lpLabel, relevantSentences, baselineScore, qwenEngine }) {
  if (!relevantSentences || !qwenEngine) return { score: baselineScore, arbitrated: false };
  const prompt = buildArbiterPrompt(lpLabel, relevantSentences);
  try {
    const result = await executeQwen3Prompt({
      prompt,
      schema: LEITPUNKT_COVERAGE_SCHEMA,
      maxTokens: 64,
      engine: qwenEngine
    });
    const rawScore = coverageToPoints(result?.coverage, baselineScore);
    const { score: finalScore, isProtected } = applyConfidenceFloor(baselineScore, rawScore);
    return { score: finalScore, arbitrated: finalScore !== baselineScore || isProtected };
  } catch (err) {
    console.warn('[Stage2Arbitration] Fallback to algorithmic score:', err?.message || err);
    return { score: baselineScore, arbitrated: false };
  }
}
