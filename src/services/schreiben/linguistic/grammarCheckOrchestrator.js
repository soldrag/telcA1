/**
 * Grammar check of a whole letter for one level profile: splits the letter into zones, runs the topological
 * parser and the sentence rules on every body sentence, the letter rules on the zones, and reports each defect
 * once. Level-independent: vocabulary, rules and tolerances come from the profile.
 */
import { parseSentenceTopology } from './topologicalFieldParser.js';
import { createGrammarEngine } from './grammarEngine.js';
import { splitGermanSentences } from './sentenceTokenizer.js';
import { segmentMacroStructure } from './macroSegmenter.js';
import { dedupeGrammarErrors } from './grammarErrorDeduper.js';

const toWords = (sentence) => sentence.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);

/**
 * @param {{ lexicon: object, rules: string[], letterRules?: string[], policy?: object }} profile
 * @returns {{ checkLetter: (text: string) => Array<object>, findSalutationDeclensionError: (line: string) => object|null }}
 */
export function createGrammarChecker(profile) {
  const engine = createGrammarEngine(profile);
  const topologyContext = { lexicon: profile.lexicon, policy: profile.policy };
  const checkBodySentence = (sentence) => [
    ...(parseSentenceTopology(sentence, topologyContext).errors || []),
    ...engine.checkSentence(toWords(sentence)),
  ];

  return {
    checkLetter(text = '') {
      if (!text?.trim()) return [];
      const macro = segmentMacroStructure(text);
      const bodySentences = splitGermanSentences(macro.bodyText || text);
      const letterErrors = engine.checkLetter({ salutation: macro.anrede, closing: macro.closing, bodySentences });
      return dedupeGrammarErrors([...bodySentences.flatMap(checkBodySentence), ...letterErrors].filter((e) => e.original));
    },
    findSalutationDeclensionError(line = '') {
      return engine.checkLetter({ salutation: { text: line } }).find((err) => err.code === 'ERR_SALUTATION_AGREEMENT') || null;
    },
  };
}
