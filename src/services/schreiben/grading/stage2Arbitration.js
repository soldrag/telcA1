/**
 * Stage 2: Qwen3 Leitpunkt Arbiter prompt builder and execution.
 * Isolated from keyword matching to respect SRP and file length limits.
 */

import { LEITPUNKT_COVERAGE_SCHEMA } from './types.js';
import { executeQwen3Prompt } from './qwen3Service.js';
import { coverageToPoints } from './stage2Leitpunkte.js';

export function buildArbiterPrompt(lpLabel = '', relevantSentences = '') {
  return `You are checking a German A1 exam letter task point. Answer strictly in JSON.

Examples:
Task point: "Neuer Terminvorschlag (Dienstag oder Mittwoch)"
Student sentences: "Passt es Ihnen an Dienstag oder Mittwoch?"
JSON: {"coverage":"full"}

Task point: "Fragen Sie nach dem Termin."
Student sentences: "Wann beginnt der Kurs?"
JSON: {"coverage":"full"}

Task point: "Kosten"
Student sentences: "Ich habe keine Zeit."
JSON: {"coverage":"no"}

Task point: "${lpLabel}"
Student sentences: "${relevantSentences}"

Does the student address this task point?
- "full": fully addressed (including question proposals like "Passt es Ihnen...?", "Geht es am...?")
- "partial": partially addressed or one aspect mentioned
- "no": not addressed at all
Schema: {"coverage": "full" | "partial" | "no"}`;
}

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
    const finalScore = coverageToPoints(result?.coverage, baselineScore);
    return { score: finalScore, arbitrated: finalScore !== baselineScore, coverage: result?.coverage };
  } catch (err) {
    console.warn('[Stage2Arbitration] Fallback to algorithmic score:', err?.message || err);
    return { score: baselineScore, arbitrated: false };
  }
}
