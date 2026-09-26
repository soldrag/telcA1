/**
 * Grammar engine contracts: paradigm and lexicon data shape, level profiles naming existing rules,
 * and engine modules free of level knowledge (no A1 lexicon imports, no level names in code).
 */
import fs from 'node:fs';
import path from 'node:path';
import paradigms from '../../src/services/schreiben/linguistic/data/declensionParadigms.json' with { type: 'json' };
import lexicon from '../../src/services/schreiben/linguistic/a1Lexicon.json' with { type: 'json' };
import letterFormulas from '../../src/services/schreiben/linguistic/data/letterFormulas.json' with { type: 'json' };
import { GRAMMAR_RULES } from '../../src/services/schreiben/linguistic/grammarRules/index.js';
import { LETTER_RULES } from '../../src/services/schreiben/linguistic/letterRules/index.js';
import { A1_GRAMMAR_PROFILE } from '../../src/services/schreiben/profiles/a1GrammarProfile.js';

const CASES = ['NOM', 'AKK', 'DAT', 'GEN'];
const SLOTS = ['m', 'f', 'n', 'pl'];
const PROFILES = [A1_GRAMMAR_PROFILE];
const ENGINE_PATHS = ['analysis', 'morphology', 'grammarRules', 'letter', 'letterRules', 'grammarEngine.js', 'grammarCheckOrchestrator.js',
  'grammarErrorDeduper.js', 'macroSegmenter.js', 'sentenceTokenizer.js', 'topologicalFieldParser.js', 'vorfeldChunker.js', 'vorfeldOrderChecker.js',
  'subordinateClauseChecker.js', 'verblessClauseChecker.js', 'clauseStructureParser.js'];
const REGISTERS = { salutations: ['formal', 'informal'], closings: ['formal', 'semiFormal', 'informal'] };

function validateTable(name, table, errors) {
  for (const c of CASES) for (const s of SLOTS) {
    if (typeof table?.[c]?.[s] !== 'string') errors.push(`${name}: missing ending for ${c}:${s}`);
  }
}

function validateParadigms(errors) {
  for (const [family, spec] of Object.entries(paradigms.determiners)) validateTable(`determiner ${family}`, spec.forms, errors);
  for (const [declension, table] of Object.entries(paradigms.adjectiveEndings)) validateTable(`adjective ${declension}`, table, errors);
}

function validateEntry(word, e, errors) {
  if (e.pos === 'NOUN' && e.number !== 'pl' && e.gender && !['m', 'f', 'n'].includes(e.gender)) errors.push(`lexicon "${word}": noun gender "${e.gender}"`);
  if (e.pos === 'NOUN' && e.weakMasculine && !e.obliqueForm) errors.push(`lexicon "${word}": weakMasculine without obliqueForm`);
  if (e.pos === 'PREP' && !['AKK', 'DAT', 'GEN', 'WECHSEL'].includes(e.prepCase)) errors.push(`lexicon "${word}": prepCase "${e.prepCase}"`);
  if (e.objCase && !['AKK', 'DAT'].includes(e.objCase)) errors.push(`lexicon "${word}": objCase "${e.objCase}"`);
}

function validateProfiles(errors) {
  for (const profile of PROFILES) {
    for (const id of profile.rules) if (!GRAMMAR_RULES[id]) errors.push(`profile ${profile.level}: unknown rule "${id}"`);
    for (const id of profile.letterRules || []) if (!LETTER_RULES[id]) errors.push(`profile ${profile.level}: unknown letter rule "${id}"`);
    for (const port of ['lookup', 'findForms', 'tag']) if (typeof profile.lexicon[port] !== 'function') errors.push(`profile ${profile.level}: lexicon port lacks ${port}()`);
    for (const [category, weight] of Object.entries(profile.accuracyWeights || {})) if (!(weight > 0)) errors.push(`profile ${profile.level}: accuracy weight ${category}`);
    if (!profile.accuracyWeights) errors.push(`profile ${profile.level}: no accuracyWeights`);
  }
}

function validateLetterFormulas(errors) {
  for (const [kind, registers] of Object.entries(REGISTERS)) {
    for (const formula of letterFormulas[kind] || []) {
      const name = `letter formula ${kind} "${(formula.words || []).join(' ')}"`;
      if (!formula.words?.length || formula.words.some((w) => typeof w !== 'string' || w !== w.toLowerCase())) errors.push(`${name}: words must be lower-case strings`);
      if (!registers.includes(formula.register)) errors.push(`${name}: register "${formula.register}"`);
    }
  }
}

function listFiles(target) {
  if (!fs.statSync(target).isDirectory()) return [target];
  return fs.readdirSync(target).flatMap((f) => listFiles(path.join(target, f)));
}

function validateEngineIsLevelFree(linguisticDir, errors) {
  for (const file of ENGINE_PATHS.flatMap((p) => listFiles(path.join(linguisticDir, p)))) {
    const code = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    if (/a1Lexicon|\bA[12]\b|\bB[12]\b/.test(code)) errors.push(`engine module ${path.basename(file)} references a level; move it to a profile`);
  }
}

export function validateGrammarData(srcDir, errors) {
  validateParadigms(errors);
  for (const [word, entries] of Object.entries(lexicon)) entries.forEach((e) => validateEntry(word, e, errors));
  validateProfiles(errors);
  validateLetterFormulas(errors);
  validateEngineIsLevelFree(path.join(srcDir, 'services/schreiben/linguistic'), errors);
}
