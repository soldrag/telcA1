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
import { tagTokens } from './linguistic/a1LexiconService.js';
import { splitGermanSentences } from './linguistic/sentenceTokenizer.js';
import { segmentMacroStructure } from './linguistic/macroSegmenter.js';

export function checkGermanA1Grammar(text = '') {
  if (!text || !text.trim()) return [];

  const macro = segmentMacroStructure(text);
  const macroErrors = [];
  if (macro.anrede?.error) {
    macroErrors.push(macro.anrede.error);
  }

  const sentences = splitGermanSentences(macro.bodyText || text);
  const topologicalErrors = [];
  const caseValencyErrors = [];

  for (const sentence of sentences) {
    const topoResult = parseSentenceTopology(sentence);
    if (topoResult.errors && topoResult.errors.length > 0) {
      topologicalErrors.push(...topoResult.errors);
    }

    const words = sentence.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
    const tagged = tagTokens(words);
    const caseErrors = validateCaseAndValency(tagged);
    if (caseErrors.length > 0) {
      caseValencyErrors.push(...caseErrors);
    }
  }

  const errors = [
    ...macroErrors,
    ...topologicalErrors,
    ...caseValencyErrors,
    ...checkAgreementRules(text),
    ...checkSyntaxRules(text),
    ...checkRektionRules(text),
    ...checkOrthographyRules(text),
  ];

  // De-duplicate errors: eliminate identical or overlapping errors
  const deduped = [];
  for (const err of errors) {
    const orig = (err.original || '').toLowerCase().trim();
    if (!orig) continue;
    const cleanOrig = orig.replace(/[.,!?;:]+$/, '').trim();

    const existingIdx = deduped.findIndex(e => {
      const eOrig = (e.original || '').toLowerCase().trim();
      const cleanEOrig = eOrig.replace(/[.,!?;:]+$/, '').trim();
      if (cleanEOrig === cleanOrig) return true;
      return e.category === err.category && (cleanEOrig.includes(cleanOrig) || cleanOrig.includes(cleanEOrig));
    });

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
