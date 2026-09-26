/**
 * A singular count noun (lexicon `countable`) as the verb's object needs an article:
 * "einen Deutschkurs machen", not "Deutschkurs machen".
 */
import { resolveRequiredCases } from '../analysis/caseGovernor.js';
import { findClauseOf } from '../analysis/clauseContext.js';
import { generateDeterminer } from '../morphology/determinerMorphology.js';
import { spanToVerb } from './phraseSpan.js';

const INDEFINITE = { family: 'possessive', lemma: 'ein' };

function isBareCountObject(phrase) {
  const entry = phrase.head?.analysis.entry;
  return entry?.countable && entry.number !== 'pl' && !phrase.determiner && !phrase.quantifier && !phrase.governor;
}

function checkPhrase(analysis, phrase, context) {
  if (!isBareCountObject(phrase)) return null;
  const required = resolveRequiredCases(phrase, { ...analysis, ...context });
  if (required?.kind !== 'verb') return null;
  const article = generateDeterminer(INDEFINITE, required.cases[0], phrase.head.analysis.slot);
  const span = spanToVerb(analysis.tokens, phrase, findClauseOf(analysis.clauses, phrase.start));
  return {
    category: 'rektion',
    code: 'ERR_MISSING_ARTICLE',
    original: span.text,
    correction: `${article} ${span.text}`,
    explanation: `Fehlender Artikel: „${phrase.head.analysis.entry.lemma}“ ist zählbar und braucht einen Artikel: „${article} ${span.text}“.`,
  };
}

export const determinerlessCountNounRule = {
  id: 'determinerlessCountNoun',
  check(analysis, context) {
    return analysis.phrases.map((phrase) => checkPhrase(analysis, phrase, context)).filter(Boolean);
  },
};
