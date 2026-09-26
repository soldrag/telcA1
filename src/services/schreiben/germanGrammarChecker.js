/**
 * Unified German A1 grammar and orthography checker orchestrator.
 * Combines Topological Field Model (V2, Satzklammer), Case/Valency rules, and specialized checkers.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { checkOrthographyRules } from './rules/orthographyRuleChecker.js';
import { checkAgreementRules } from './rules/agreementRuleChecker.js';
import { checkSyntaxRules } from './rules/syntaxRuleChecker.js';
import { checkRektionRules } from './rules/rektionRuleChecker.js';
import { parseSentenceTopology } from './linguistic/topologicalFieldParser.js';
import { validateCaseAndValency } from './linguistic/caseValencyValidator.js';
import { createGrammarEngine } from './linguistic/grammarEngine.js';
import { A1_GRAMMAR_PROFILE } from './profiles/a1GrammarProfile.js';
import { tagTokens } from './linguistic/a1LexiconService.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';

const a1GrammarEngine = createGrammarEngine(A1_GRAMMAR_PROFILE);

function collectSentenceLinguisticErrors(sentence) {
  const errors = [];
  const topoResult = parseSentenceTopology(sentence);
  if (topoResult.errors?.length > 0) {
    errors.push(...topoResult.errors);
  }

  const words = sentence.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
  const tagged = tagTokens(words);
  errors.push(...validateCaseAndValency(tagged), ...a1GrammarEngine.checkSentence(words));
  return errors;
}

function findOverlappingErrorIndex(deduped, err, cleanOrig) {
  return deduped.findIndex((existing) => {
    const eOrig = (existing.original || '').toLowerCase().trim();
    const cleanEOrig = eOrig.replace(/[.,!?;:]+$/, '').trim();
    if (cleanEOrig === cleanOrig) return true;
    return existing.category === err.category && (cleanEOrig.includes(cleanOrig) || cleanOrig.includes(cleanEOrig));
  });
}

function deduplicateGrammarErrors(errors) {
  const deduped = [];
  for (const err of errors) {
    const orig = (err.original || '').toLowerCase().trim();
    if (!orig) continue;
    const cleanOrig = orig.replace(/[.,!?;:]+$/, '').trim();
    const existingIdx = findOverlappingErrorIndex(deduped, err, cleanOrig);

    if (existingIdx !== -1) {
      const existing = deduped[existingIdx];
      const preferNew = (err.category === 'rektion' || err.category === 'syntax') && existing.category === 'orthography';
      if (preferNew || orig.length > existing.original.length) {
        deduped[existingIdx] = err;
      }
    } else {
      deduped.push(err);
    }
  }
  return deduped;
}

export function checkGermanA1Grammar(text = '') {
  if (!text?.trim()) return [];

  const macro = segmentMacroStructure(text);
  const macroErrors = macro.anrede?.error ? [macro.anrede.error] : [];
  const sentences = splitGermanSentences(macro.bodyText || text);
  const sentenceErrors = sentences.flatMap(collectSentenceLinguisticErrors);

  const allRawErrors = [
    ...macroErrors,
    ...sentenceErrors,
    ...checkAgreementRules(text),
    ...checkSyntaxRules(text),
    ...checkRektionRules(text),
    ...checkOrthographyRules(text),
  ];

  return deduplicateGrammarErrors(allRawErrors);
}
