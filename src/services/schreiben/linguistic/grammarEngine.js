/**
 * Level-independent grammar engine: tags a sentence with the profile's lexicon, analyses noun phrases
 * and clauses once, then runs the rules the profile enables. Letter rules check the zones around the body
 * (salutation, closing) and the body as a whole. The engine holds no level knowledge.
 */
import { chunkNounPhrases } from './analysis/nounPhraseChunker.js';
import { describeClauses } from './analysis/clauseContext.js';
import { GRAMMAR_RULES } from './grammarRules/index.js';
import { LETTER_RULES } from './letterRules/index.js';

function resolveRules(ruleIds = [], registry = GRAMMAR_RULES) {
  return ruleIds.map((id) => {
    if (!registry[id]) throw new Error(`Unknown grammar rule "${id}"`);
    return registry[id];
  });
}

/**
 * @param {{ lexicon: { lookup: Function, findForms: Function, tag: Function }, rules: string[], letterRules?: string[], policy?: object }} profile
 * @returns {{ checkSentence: (words: string[]) => Array<object>,
 *   checkLetter: (letter: { salutation?: { text: string }, closing?: { text: string }, bodySentences?: string[] }) => Array<object> }}
 */
export function createGrammarEngine({ lexicon, rules, letterRules = [], policy = {} }) {
  const sentenceRules = resolveRules(rules);
  const zoneRules = resolveRules(letterRules, LETTER_RULES);
  const checkSentence = (words = []) => {
    const tokens = lexicon.tag(words);
    const analysis = { tokens, phrases: chunkNounPhrases(tokens, lexicon), clauses: describeClauses(tokens) };
    return sentenceRules.flatMap((rule) => rule.check(analysis, { lexicon, policy }));
  };
  return {
    checkSentence,
    checkLetter: (letter = {}) => zoneRules.flatMap((rule) => rule.check(letter, { lexicon, policy, checkSentence })),
  };
}
