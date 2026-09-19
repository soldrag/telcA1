/**
 * Stage 4: Feedback Summary (Deterministic Template Bank by default).
 * Assembles feedback from computed facts using verified A1 German phrases.
 * Supports optional Qwen3 polish via feature flag (disabled by default).
 */

import { FEEDBACK_SCHEMA } from './types.js';
import { executeQwen3Prompt } from './qwen3Service.js';
import { buildFeedbackPolishPrompt } from './prompts.js';

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
  const hasGoodFraming = anredeScore === 2 && grussScore === 2;

  const gramText = grammarErrorCount === 0
    ? 'Sprachlich sehr sorgfältig: keine wesentlichen Grammatikfehler gefunden.'
    : (grammarErrorCount <= 2
      ? 'Gute sprachliche Verständlichkeit mit nur wenigen kleinen Fehlern.'
      : (grammarErrorCount <= 5
        ? 'Achten Sie auf Verbformen und Wortstellung, um Punktabzüge zu vermeiden.'
        : 'Mehrere Grammatik- und Satzbaufehler beeinträchtigen die Verständlichkeit.'));

  if (lpScore === 0) {
    if (hasGoodFraming) {
      return `Die Anrede ist passend und formal korrekt gewählt, und die Grußformel ist vollständig. Allerdings wurde das geforderte Thema verfehlt: Die Inhaltspunkte wurden nicht erfüllt oder inhaltlich abgelehnt. ${gramText}`;
    }
    const framingProblem = anredeScore === 0 && grussScore === 0
      ? 'Es fehlen sowohl eine passende Anrede als auch die Grußformel.'
      : (anredeScore === 0 ? 'Es fehlt eine passende Anrede zu Beginn.' : 'Die Grußformel oder der Name am Schluss ist unvollständig.');
    return `Die geforderten Inhaltspunkte wurden nicht erfüllt oder inhaltlich abgelehnt. ${framingProblem} ${gramText}`;
  }

  if (lpScore >= 5) {
    if (hasGoodFraming) {
      return `Die Anrede ist passend und formal korrekt gewählt. Alle drei Inhaltspunkte sind verständlich und vollständig bearbeitet. Grußformel und Name am Schluss sind vollständig und passend. ${gramText}`;
    }
    const framingNote = anredeScore < 2
      ? 'Die Inhaltspunkte sind vollständig bearbeitet, achten Sie jedoch auf eine korrekte formelle Anrede.'
      : 'Die Inhaltspunkte sind vollständig bearbeitet, achten Sie jedoch auf eine vollständige Grußformel mit Namen.';
    return `${framingNote} ${gramText}`;
  }

  if (hasGoodFraming) {
    return `Die Anrede ist passend und formal korrekt gewählt. Die Inhaltspunkte wurden im Wesentlichen bearbeitet, teilweise fehlen jedoch wichtige Einzelheiten. Grußformel und Name am Schluss sind passend. ${gramText}`;
  }
  return `Die geforderten Inhaltspunkte wurden nur teilweise bearbeitet. Achten Sie zudem auf die formale Gestaltung von Anrede und Grußformel. ${gramText}`;
}

export async function polishFeedbackWithLLM(templateText = '', qwenEngine = null) {
  if (!templateText || !qwenEngine) return templateText;

  const prompt = buildFeedbackPolishPrompt(templateText);

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
