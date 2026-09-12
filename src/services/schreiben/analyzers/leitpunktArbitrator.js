/**
 * Leitpunkt arbitration micro-task for small LLMs.
 * Only called for borderline "gray zone" cases where algorithmic matching
 * is uncertain. LLM only outputs coverage enum: "full" | "partial" | "no".
 * Score mapping (2 / 1 / 0) is strictly executed algorithmically in code.
 */
import { extractAndParseLLMJson } from '../webLlmJsonRepair.js';

export const LEITPUNKT_COVERAGE_SCHEMA = {
  type: 'object',
  properties: {
    coverage: {
      type: 'string',
      enum: ['full', 'partial', 'no']
    }
  },
  required: ['coverage'],
  additionalProperties: false
};

export function isLeitpunktInGrayZone(baselineScore = 0, candidateSentence = '') {
  const text = (candidateSentence || '').trim();
  const hasText = Boolean(text) && text !== 'Kein Satz im Text gefunden';

  if (!hasText) return false;
  // Baseline partial (1) or baseline missed (0) with actual candidate sentences
  return baselineScore === 1 || baselineScore === 0;
}

export function buildLeitpunktPrompt(taskPoint = '', studentSentences = '') {
  return `You are checking a German A1 letter. Answer strictly in JSON.

Example:
Task point: "Fragen Sie nach dem Termin."
Student sentences: "Wann beginnt der Kurs?"
JSON: {"coverage":"full"}

Task point: "${taskPoint}"
Student sentences: "${studentSentences}"

Does the student address this task point?
- "full": both aspects or main intent are fully addressed
- "partial": only one aspect is addressed or partially unclear
- "no": the point is not addressed
Schema: {"coverage": "full" | "partial" | "no"}`;
}

export function coverageToScore(coverage = '', fallbackScore = 0) {
  const norm = String(coverage || '').toLowerCase().trim();
  if (norm === 'full') return 2;
  if (norm === 'partial') return 1;
  if (norm === 'no') return 0;
  return fallbackScore;
}

export async function arbitrateSingleLeitpunkt({
  taskPoint = '',
  candidateSentences = '',
  baselineScore = 0,
  llmCaller = null
}) {
  const text = (candidateSentences || '').trim();
  if (!isLeitpunktInGrayZone(baselineScore, text) || !llmCaller) {
    return { score: baselineScore, coverage: null, arbitrated: false };
  }

  const prompt = buildLeitpunktPrompt(taskPoint, text);
  try {
    const rawResult = await llmCaller({
      prompt,
      schema: LEITPUNKT_COVERAGE_SCHEMA,
      temperature: 0,
      maxTokens: 64
    });

    const parsed = extractAndParseLLMJson(rawResult);
    const coverage = parsed?.coverage || null;
    const finalScore = coverageToScore(coverage, baselineScore);

    return {
      score: finalScore,
      coverage,
      arbitrated: finalScore !== baselineScore
    };
  } catch (err) {
    console.warn('[LeitpunktArbitrator] Fallback for LP:', taskPoint, err?.message || err);
    return { score: baselineScore, coverage: null, arbitrated: false };
  }
}
