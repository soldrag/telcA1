/**
 * Canonical Single Source of Truth for all LLM prompts used in Schreiben Part 2.
 * Adheres to SRP: prompt templates only, no inference or scoring logic.
 */

/**
 * Builds the balanced prompt for Leitpunkt gray-zone arbitration (Stage 2).
 * Includes 3 balanced examples: 1 full, 1 partial, 1 no to eliminate bias towards "full".
 */
export function buildLeitpunktArbiterPrompt(lpLabel = '', relevantSentences = '') {
  return `You are checking a German A1 exam letter task point. Answer strictly in JSON.

Examples:
Task point: "Neuer Terminvorschlag"
Student sentences: "Passt es Ihnen am Dienstag?"
JSON: {"coverage":"full"}

Task point: "Kosten und Anmeldung"
Student sentences: "Wie viel kostet der Kurs?"
JSON: {"coverage":"partial"}

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

export const buildArbiterPrompt = buildLeitpunktArbiterPrompt;
export const buildLeitpunktPrompt = buildLeitpunktArbiterPrompt;

/**
 * Builds the prompt for single-sentence grammar candidate generation (Stage 3).
 * Evaluated sentence by sentence with strict exact-substring requirement.
 */
export function buildSentenceGrammarPrompt(sentence = '') {
  return `You are a German grammar checker for level A1. Answer strictly in JSON.

Examples:
Sentence: "Ich möchte ein Deutschkurs machen."
JSON: {"errors":[{"original":"ein Deutschkurs","correction":"einen Deutschkurs","explanation":"Akkusativ maskulin"}]}

Sentence: "Wie viel der Preis?"
JSON: {"errors":[{"original":"Wie viel der Preis","correction":"Wie viel ist der Preis","explanation":"Fehlendes Prädikat (ist)"}]}

Sentence: "Ich habe vier Wochen Zeit."
JSON: {"errors":[]}

Sentence: "${sentence}"

List grammar errors in this sentence.
"original" must be an EXACT substring of the sentence.
If there are no errors, return an empty list: {"errors": []}.
Schema: {"errors": [{"original": "...", "correction": "...", "explanation": "..."}]}`;
}

export const buildGrammarPrompt = buildSentenceGrammarPrompt;

/**
 * Builds the prompt for examiner feedback polishing (Stage 4).
 * Enforces strict fact-locking: never alter scores or invent new errors.
 */
export function buildFeedbackPolishPrompt(factsText = '') {
  return `You are a friendly German A1 examiner.
The FACTS below are the ONLY source of truth. Never add, invent or contradict them.

Rules:
- Write exactly 2 short sentences in simple German (level A1) based ONLY on these facts.
- If a task point is marked "fully addressed" in the facts, you must NOT tell the student to answer or fix that point.
- You may mention a task point as missing ONLY if the facts show it as "missing" (0/2).
- If the facts say "No grammar errors found", do not mention any grammar problem.

Facts:
${factsText}

Answer strictly in JSON: {"feedback": "..."}`;
}

export const buildFeedbackPrompt = buildFeedbackPolishPrompt;
