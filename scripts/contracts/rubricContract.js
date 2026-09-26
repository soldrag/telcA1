/**
 * Rubric contract: every Schreiben Leitpunkt declares its speech act (`intent`) and, where a detector
 * proves it, its evidence kind (`evidence` on the criterion or its aspects) — nothing is guessed from labels.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { INTENT_TYPES, EVIDENCE_KINDS } from '../../src/services/schreiben/linguistic/criterionIntents.js';

const EVIDENCE = Object.values(EVIDENCE_KINDS);

function validateCriterion(name, criterion, errors) {
  if (!INTENT_TYPES[criterion.intent]) errors.push(`${name}: intent "${criterion.intent}" is not one of INTENT_TYPES`);
  const declared = [criterion, ...(criterion.aspects || [])].filter((c) => c.evidence !== undefined);
  for (const c of declared) {
    if (!EVIDENCE.includes(c.evidence)) errors.push(`${name}: evidence "${c.evidence}" is not one of ${EVIDENCE.join('/')}`);
  }
}

async function collectRubrics(seedsDir) {
  const files = fs.readdirSync(seedsDir).filter((f) => f.startsWith('schreiben-') && f.endsWith('.js'));
  const modules = await Promise.all(files.map((f) => import(pathToFileURL(path.join(seedsDir, f)).href)));
  return modules.flatMap((m) => m.questions || [])
    .filter((q) => q.options_json?.rubric?.leitpunkte_criteria)
    .map((q) => ({ id: q.id, criteria: q.options_json.rubric.leitpunkte_criteria }));
}

export async function validateRubrics(seedsDir, errors) {
  for (const { id, criteria } of await collectRubrics(seedsDir)) {
    criteria.forEach((c) => validateCriterion(`rubric ${id}/${c.id}`, c, errors));
  }
}
