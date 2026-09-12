/**
 * Declarative Semantic Frame & Conversive Pair Validator for German A1.
 * Pure generic interpreter: zero hardcoded domain nouns or verbs.
 * Complies strictly with McConnell limits (<= 120 lines, <= 20 lines per function).
 */

import { chunkSentenceStructure } from './clauseChunker.js';

function checkConversiveErrors(taggedTokens = [], rules = []) {
  const errors = [];
  if (!Array.isArray(rules) || rules.length === 0) return errors;

  for (const rule of rules) {
    const forbidden = (rule.forbiddenLemma || '').toLowerCase();
    const matchToken = taggedTokens.find(t => (t.lemma || t.lower) === forbidden);
    if (matchToken) {
      errors.push({
        category: 'lexik',
        code: 'ERR_CONVERSIVE_VERB_DIRECTION',
        original: matchToken.raw,
        correction: rule.expectedLemma,
        explanation: rule.messageDe || `Falsches Verb: Bitte verwenden Sie „${rule.expectedLemma}“.`,
        penalty: 1
      });
    }
  }
  return errors;
}

function checkSlotIncompatibilities(predicates = [], args = [], slot = {}) {
  const predLemmas = slot.predicateLemmas || [];
  const hasMatchingPred = predicates.some(p => predLemmas.includes((p.lemma || p.lower || '').toLowerCase()));
  if (!hasMatchingPred) return [];

  const incompat = slot.incompatibleCategories || [];
  const errors = [];

  for (const arg of args) {
    const cat = arg.head?.category;
    if (cat && incompat.includes(cat)) {
      const phrase = arg.tokens.map(t => t.raw).join(' ');
      errors.push({
        category: 'semantik',
        code: 'ERR_SEMANTIC_ROLE_INVERSION',
        original: phrase,
        explanation: slot.conflictMessageDe || 'Sinnentstellung / Thema verfehlt.',
        penalty: 2
      });
    }
  }
  return errors;
}

function checkSlotBindingErrors(chunkedClauses = [], slots = []) {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const errors = [];

  for (const clause of chunkedClauses) {
    for (const slot of slots) {
      errors.push(...checkSlotIncompatibilities(clause.predicates, clause.arguments, slot));
    }
  }
  return errors;
}

export function validateSentenceFrame({ taggedTokens = [], conversiveRules = [], semanticSlots = [] }) {
  const conversiveErrors = checkConversiveErrors(taggedTokens, conversiveRules);
  const chunkedClauses = chunkSentenceStructure(taggedTokens);
  const slotErrors = checkSlotBindingErrors(chunkedClauses, semanticSlots);

  const allErrors = [...conversiveErrors, ...slotErrors];
  const maxPenalty = allErrors.reduce((max, e) => Math.max(max, e.penalty || 0), 0);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    maxPenalty
  };
}
