/**
 * Rubric contract: every graded Schreiben task names its CEFR `level`, and that level has a grading policy, a grammar
 * profile and a regulation, and the register its letter is written in (`addresseeRegister`), which decides the fitting
 * formulas. Every Leitpunkt has an id and a label; a compound one declares its `aspects` (nothing is split from labels).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getRankerPolicy } from '../../src/services/schreiben/grading/policies/index.js';
import { getGrammarProfile } from '../../src/services/schreiben/profiles/index.js';
import { getSchreibenRegulation } from '../../src/services/schreiben/regulations/index.js';
import { ADDRESSEE_REGISTERS } from '../../src/services/schreiben/letterRegister.js';

function validateCriterion(name, criterion, errors) {
  if (!criterion.id || !criterion.label) errors.push(`${name}: a Leitpunkt needs an id and a label`);
  for (const aspect of criterion.aspects || []) {
    if (!aspect.label) errors.push(`${name}: every declared aspect needs a label`);
  }
}

async function collectRubrics(seedsDir) {
  const files = fs.readdirSync(seedsDir).filter((f) => f.startsWith('schreiben-') && f.endsWith('.js'));
  const modules = await Promise.all(files.map((f) => import(pathToFileURL(path.join(seedsDir, f)).href)));
  return modules.flatMap((m) => m.questions || [])
    .filter((q) => q.options_json?.rubric?.leitpunkte_criteria)
    .map((q) => ({ id: q.id, level: q.level, register: q.options_json.rubric.addresseeRegister, criteria: q.options_json.rubric.leitpunkte_criteria }));
}

const LEVEL_REGISTRIES = { policy: getRankerPolicy, profile: getGrammarProfile, regulation: getSchreibenRegulation };

function validateLevel(id, level, errors) {
  if (!level) return errors.push(`rubric ${id}: task has no \`level\``);
  for (const [name, resolve] of Object.entries(LEVEL_REGISTRIES)) {
    try { resolve(level); } catch { errors.push(`rubric ${id}: level "${level}" has no registered ${name}`); }
  }
}

const REGISTERS = Object.values(ADDRESSEE_REGISTERS);

export async function validateRubrics(seedsDir, errors) {
  for (const { id, level, register, criteria } of await collectRubrics(seedsDir)) {
    validateLevel(id, level, errors);
    if (!REGISTERS.includes(register)) errors.push(`rubric ${id}: addresseeRegister "${register}" is not one of ${REGISTERS.join('/')}`);
    criteria.forEach((c) => validateCriterion(`rubric ${id}/${c.id}`, c, errors));
  }
}
