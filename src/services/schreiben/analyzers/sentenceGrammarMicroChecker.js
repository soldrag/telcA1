/**
 * Single-sentence grammar checking micro-task for small LLMs.
 * Produces candidate errors with structured prompt & few-shots,
 * then validates candidates algorithmically via sentenceGrammarFilter.
 */
import { extractAndParseLLMJson } from '../webLlmJsonRepair.js';
import { filterSentenceGrammarCandidates } from '../linguistic/sentenceGrammarFilter.js';

export const SENTENCE_GRAMMAR_SCHEMA = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          correction: { type: 'string' },
          explanation: { type: 'string' }
        },
        required: ['original', 'correction', 'explanation']
      }
    }
  },
  required: ['errors'],
  additionalProperties: false
};

export function buildSentenceGrammarPrompt(sentence = '') {
  return `You are a German grammar checker for level A1. Answer strictly in JSON.

Examples:
Sentence: "Ich möchte ein Deutschkurs machen."
JSON: {"errors":[{"original":"ein Deutschkurs","correction":"einen Deutschkurs","explanation":"Akkusativ maskulin"}]}

Sentence: "Ich habe vier Wochen Zeit."
JSON: {"errors":[]}

Sentence: "${sentence}"

List grammar errors in this sentence. For each error, "original" must be an EXACT substring of the sentence. If there are no errors, return an empty list. Do not invent errors.
Schema: {"errors": [{"original": "...", "correction": "...", "explanation": "..."}]}`;
}

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
