/**
 * Verbalizes already computed and verified facts into friendly A1 examiner feedback.
 * The model does NOT score or evaluate anything; it strictly writes 2 short sentences
 * based on deterministic facts.
 */
import { extractAndParseLLMJson } from '../webLlmJsonRepair.js';
import { FEEDBACK_SCHEMA } from '../grading/types.js';
import { buildFeedbackPolishPrompt as buildFeedbackPrompt } from '../grading/prompts.js';

export { FEEDBACK_SCHEMA, buildFeedbackPrompt };

export function compileFeedbackFacts({
  salutationScore = 2,
  lpResults = [],
  closingScore = 2,
  grammarErrors = []
}) {
  const lpSummary = lpResults.map((lp, i) => {
    const scoreStr = `${lp.score ?? 0}/2`;
    const status = lp.score === 2 ? 'fully addressed' : (lp.score === 1 ? 'partially addressed' : 'missing');
    return `Point ${i + 1} (${lp.label || `LP ${i + 1}`}): ${scoreStr} (${status})`;
  }).join(', ');

  const errList = grammarErrors.slice(0, 2).map(e => `"${e.original}" -> "${e.correction}"`).join('; ');
  const grammarSummary = grammarErrors.length === 0
    ? 'No grammar errors found'
    : `${grammarErrors.length} error(s) found${errList ? ` (e.g. ${errList})` : ''}`;

  return [
    `Greeting: ${salutationScore}/2`,
    `Task points: ${lpSummary}`,
    `Closing & Name: ${closingScore}/2`,
    `Grammar: ${grammarSummary}`
  ].join('\n');
}

const BANNED_HALLUCINATIONS = ['opfer', 'lügen', 'betrügen', 'einkauf', 'beichten', 'teufel', 'polizei'];

export function sanitizeFeedbackText(rawText = '', fallback = '') {
  if (!rawText || typeof rawText !== 'string') return fallback;
  const lower = rawText.toLowerCase();

  for (const banned of BANNED_HALLUCINATIONS) {
    if (lower.includes(banned)) return fallback;
  }

  let cleaned = rawText.replace(/^```[a-z]*\s*|\s*```$/gi, '').replace(/^"|"$/g, '').trim();

  // If text is cut off mid-sentence, trim to the last complete sentence
  if (!/[.!?]$/.test(cleaned)) {
    const lastPunct = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf('!'), cleaned.lastIndexOf('?'));
    if (lastPunct >= 10) {
      cleaned = cleaned.slice(0, lastPunct + 1).trim();
    } else {
      return fallback;
    }
  }

  return cleaned.length >= 10 ? cleaned : fallback;
}

/**
 * Rejects LLM feedback that contradicts the locked facts (e.g. telling the
 * student to answer a point the facts mark as fully addressed).
 */
export function isConsistentWithFacts(text = '', facts = {}) {
  const lower = String(text || '').toLowerCase();
  const lpResults = facts.lpResults || [];
  const allCovered = lpResults.length > 0 && lpResults.every(lp => (lp.score ?? 0) === 2);
  const hasGrammarErrors = (facts.grammarErrors?.length || 0) > 0;

  if (allCovered && /beantworten\s+(sie\s+)?(auch|noch|bitte)|fehl(t|en)|nicht\s+bearbeitet|noch\s+nicht/i.test(lower)) {
    return false;
  }
  if (!hasGrammarErrors && /grammatikfehler|verbform|kasusfehler|satzbaufehler/i.test(lower)) {
    return false;
  }
  return true;
}

export function buildDefaultFallbackFeedback(facts = {}) {
  const lpAllOk = (facts.lpResults || []).every(lp => (lp.score ?? 0) === 2);
  const hasErrors = (facts.grammarErrors?.length || 0) > 0;

  if (lpAllOk && !hasErrors) {
    return 'Sehr gut gemacht! Sie haben alle Aufgaben verständlich bearbeitet und die Höflichkeitsformeln stimmen. Weiter so!';
  }
  if (!hasErrors) {
    return 'Vielen Dank für Ihren Brief! Sie haben die Aufgaben verständlich bearbeitet. Gute Arbeit!';
  }
  return 'Vielen Dank für Ihren Brief! Sie haben die Aufgaben bearbeitet. Achten Sie bitte noch auf die Grammatik-Hinweise, um Ihre Punktzahl zu verbessern.';
}

export async function generateFeedbackSummary({ facts = {}, llmCaller = null }) {
  const fallback = buildDefaultFallbackFeedback(facts);
  if (!llmCaller) return fallback;

  const factsText = compileFeedbackFacts(facts);
  const prompt = buildFeedbackPrompt(factsText);

  try {
    const rawResult = await llmCaller({
      prompt,
      schema: FEEDBACK_SCHEMA,
      temperature: 0,
      maxTokens: 200
    });

    const parsed = typeof rawResult === 'string' ? extractAndParseLLMJson(rawResult) : rawResult;
    const candidate = parsed?.feedback || (typeof rawResult === 'string' ? rawResult : '');
    const cleaned = sanitizeFeedbackText(candidate, '');
    if (!cleaned || !isConsistentWithFacts(cleaned, facts)) {
      return fallback;
    }
    return cleaned;
  } catch (err) {
    console.warn('[FeedbackVerbalizer] Fallback to default feedback:', err?.message || err);
    return fallback;
  }
}
