/**
 * Level-independent grammar engine: tags a sentence with the profile's lexicon, analyses noun phrases
 * and clauses once, then runs the rules the profile enables. The engine holds no level knowledge.
 */
import { chunkNounPhrases } from './analysis/nounPhraseChunker.js';
import { describeClauses } from './analysis/clauseContext.js';
import { GRAMMAR_RULES } from './grammarRules/index.js';

function resolveRules(ruleIds = []) {
  return ruleIds.map((id) => {
    if (!GRAMMAR_RULES[id]) throw new Error(`Unknown grammar rule "${id}"`);
    return GRAMMAR_RULES[id];
  });
}

/**
 * @param {{ lexicon: { lookup: Function, findForms: Function, tag: Function }, rules: string[], policy?: object }} profile
 * @returns {{ checkSentence: (words: string[]) => Array<object> }}
 */
export function createGrammarEngine({ lexicon, rules, policy = {} }) {
  const activeRules = resolveRules(rules);
  return {
    checkSentence(words = []) {
      const tokens = lexicon.tag(words);
      const analysis = { tokens, phrases: chunkNounPhrases(tokens, lexicon), clauses: describeClauses(tokens) };
      return activeRules.flatMap((rule) => rule.check(analysis, { lexicon, policy }));
    },
  };
}
