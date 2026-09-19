/**
 * Single-sentence grammar checking micro-task for small LLMs.
 * Produces candidate errors with structured prompt & few-shots,
 * then validates candidates algorithmically via sentenceGrammarFilter.
 */
import { extractAndParseLLMJson } from '../webLlmJsonRepair.js';
import { filterSentenceGrammarCandidates } from '../linguistic/sentenceGrammarFilter.js';
import { SENTENCE_GRAMMAR_SCHEMA } from '../grading/types.js';
import { buildSentenceGrammarPrompt } from '../grading/prompts.js';

export { SENTENCE_GRAMMAR_SCHEMA, buildSentenceGrammarPrompt };

export function parseGrammarResponse(rawOutput = '') {
  if (!rawOutput) return [];
  const parsed = extractAndParseLLMJson(rawOutput);
  if (Array.isArray(parsed?.errors)) {
    return parsed.errors;
  }
  if (Array.isArray(parsed)) {
    return parsed;
  }
  return [];
}

export async function checkSentenceGrammarMicro({ sentence = '', llmCaller = null }) {
  const trimmed = (sentence || '').trim();
  if (!trimmed || !llmCaller) return [];

  const prompt = buildSentenceGrammarPrompt(trimmed);
  try {
    const rawResult = await llmCaller({
      prompt,
      schema: SENTENCE_GRAMMAR_SCHEMA,
      temperature: 0,
      maxTokens: 128
    });

    const candidates = parseGrammarResponse(rawResult);
    return filterSentenceGrammarCandidates(trimmed, candidates, 3);
  } catch (err) {
    console.warn('[SentenceGrammarMicro] Failed to check sentence:', trimmed, err?.message || err);
    return [];
  }
}
