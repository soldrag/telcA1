/**
 * Stage 2: Qwen3 Leitpunkt Arbiter prompt builder and execution.
 * Isolated from keyword matching to respect SRP and file length limits.
 */

import { buildArbiterPrompt } from './prompts.js';
import { LEITPUNKT_COVERAGE_SCHEMA } from './types.js';
import { coverageToPoints, applyConfidenceFloor } from './stage2Leitpunkte.js';
import { extractAndParseLLMJson } from '../webLlmJsonRepair.js';

export { buildArbiterPrompt };

export async function arbitrateGrayZone({ lpLabel, relevantSentences, baselineScore, qwenEngine }) {
  if (!relevantSentences || !qwenEngine?.chat?.completions?.create) {
    return { score: baselineScore, arbitrated: false };
  }
  const prompt = buildArbiterPrompt(lpLabel, relevantSentences);
  try {
    const requestOptions = {
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 64,
      response_format: {
        type: 'json_object',
        schema: typeof LEITPUNKT_COVERAGE_SCHEMA === 'string'
          ? LEITPUNKT_COVERAGE_SCHEMA
          : JSON.stringify(LEITPUNKT_COVERAGE_SCHEMA)
      }
    };
    const response = await qwenEngine.chat.completions.create(requestOptions);
    const content = response?.choices?.[0]?.message?.content || '';
    const result = extractAndParseLLMJson(content);
    const rawScore = coverageToPoints(result?.coverage, baselineScore);
    const { score: finalScore, isProtected } = applyConfidenceFloor(baselineScore, rawScore);
    return { score: finalScore, arbitrated: finalScore !== baselineScore || isProtected };
  } catch (err) {
    console.warn('[Stage2Arbitration] Fallback to algorithmic score:', err?.message || err);
    return { score: baselineScore, arbitrated: false };
  }
}
