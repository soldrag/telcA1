/**
 * Stage 4: Feedback Summary (Deterministic Template Bank by default).
 * Assembles feedback from computed facts using verified A1 German phrases.
 * Supports optional Qwen3 polish via feature flag (disabled by default).
 */

import { FEEDBACK_SCHEMA } from './types.js';
import { executeQwen3Prompt } from './qwen3Service.js';

const TEMPLATE_BANK = {
  anrede: {
    2: 'Die Anrede ist passend und formal korrekt gewählt.',
    1: 'Die Anrede ist vorhanden, weist jedoch kleinere Formfehler auf.',
    0: 'Es fehlt eine passende Anrede zu Beginn des Briefes.'
  },
  leitpunkte: {
    full: 'Alle drei Inhaltspunkte sind verständlich und vollständig bearbeitet.',
    partial: 'Die Inhaltspunkte wurden im Wesentlichen bearbeitet, teilweise fehlen Einzelheiten.',
    weak: 'Mehrere geforderte Inhaltspunkte fehlen oder sind unvollständig.'
  },
  gruss: {
    2: 'Grußformel und Name am Schluss sind vollständig und passend.',
    1: 'Die Grußformel oder der Name am Schluss ist unvollständig.',
    0: 'Es fehlt eine passende Grußformel oder der Name am Ende.'
  },
  grammar: {
    clean: 'Sprachlich sehr sorgfältig: keine wesentlichen Grammatikfehler gefunden.',
    minor: 'Gute sprachliche Verständlichkeit mit nur wenigen kleinen Fehlern.',
    moderate: 'Achten Sie auf Verbformen und Wortstellung, um Punktabzüge zu vermeiden.',
    heavy: 'Mehrere Grammatik- und Satzbaufehler beeinträchtigen die Verständlichkeit.'
  }
};

export function assembleDeterministicFeedback({
  anredeScore = 0,
  lpScore = 0,
  grussScore = 0,
  grammarErrorCount = 0
}) {
  const anredeText = TEMPLATE_BANK.anrede[anredeScore] || TEMPLATE_BANK.anrede[0];
  const lpKey = lpScore >= 5 ? 'full' : (lpScore >= 3 ? 'partial' : 'weak');
  const lpText = TEMPLATE_BANK.leitpunkte[lpKey];
  const grussText = TEMPLATE_BANK.gruss[grussScore] || TEMPLATE_BANK.gruss[0];

  const gramKey = grammarErrorCount === 0 ? 'clean' :
    (grammarErrorCount <= 2 ? 'minor' : (grammarErrorCount <= 5 ? 'moderate' : 'heavy'));
  const gramText = TEMPLATE_BANK.grammar[gramKey];

  return `${anredeText} ${lpText} ${grussText} ${gramText}`;
}

export async function polishFeedbackWithLLM(templateText = '', qwenEngine = null) {
  if (!templateText || !qwenEngine) return templateText;

  const prompt = `You are a friendly German A1 examiner.
Facts:
"${templateText}"

Task: Rephrase these facts into 2 friendly, motivating sentences in simple German (level A1).
Strict rules:
- Do NOT add new errors or change scores.
- Rely ONLY on the facts above.
- Answer strictly in JSON: {"feedback": "..."}`;

  try {
    const result = await executeQwen3Prompt({
      prompt,
      schema: FEEDBACK_SCHEMA,
      maxTokens: 180,
      engine: qwenEngine
    });
    const candidate = String(result?.feedback || '').trim();
    return candidate.length >= 20 ? candidate : templateText;
  } catch (err) {
    console.warn('[Stage4Feedback] Polish failed, using deterministic template:', err?.message || err);
    return templateText;
  }
}

export async function runStage4Feedback({
  facts = {},
  enableLlmPolish = false,
  qwenEngine = null
}) {
  const deterministicText = assembleDeterministicFeedback({
    anredeScore: facts.anredeScore ?? 0,
    lpScore: facts.lpScore ?? 0,
    grussScore: facts.grussScore ?? 0,
    grammarErrorCount: facts.grammarErrorCount ?? 0
  });

  if (!enableLlmPolish || !qwenEngine) {
    return {
      feedback: deterministicText,
      isPolished: false
    };
  }

  const polishedText = await polishFeedbackWithLLM(deterministicText, qwenEngine);
  return {
    feedback: polishedText,
    isPolished: polishedText !== deterministicText
  };
}
