/**
 * The reference vectors a task is graded against: the app's precomputed vectors (data/exams/evidence-head/), or,
 * for a task that carries its own phrases (`options_json.evidenceBank`, the evaluation tasks), those phrases embedded
 * on the spot. Cached per task for the life of the worker.
 */

import neutralBank from '../../../../data/exams/example-bank/neutral.json' with { type: 'json' };
import { loadStoredTaskReferences } from '../../../../data/exams/evidence-head/index.js';
import { readTaskOptions } from '../../leitpunktCriteria.js';
import { letterUnits } from './unitReferences.js';
import { decodeTaskReferences, indexTaskReferences, resolveTaskReferences } from './referenceVectors.js';

const cache = new Map();

/** The phrase structure of a task, as the build script indexes it (also used to check stored vectors are current). */
export function indexTaskPhrases({ task, bank, examples }) {
  const groups = letterUnits({ task, bank, examples, neutral: neutralBank.neutral });
  return indexTaskReferences({ groups, purposeLetters: bank.purposeLetters });
}

function assertMatchesRubric(refs, criteria, taskId) {
  const expected = criteria.map((c) => c.id).join(',');
  const stored = refs.groups.map((g) => g.lp).join(',');
  if (expected !== stored) throw new Error(`Evidence references of ${taskId} are stale (${stored} vs ${expected}): rebuild them`);
}

/**
 * @param {{ question: object, criteria: object[], embed: (text: string) => Promise<Float32Array> }} input
 * @returns {Promise<object|null>} decoded references, null when the task has none
 */
export async function loadTaskReferences({ question, criteria, embed }) {
  if (cache.has(question.id)) return cache.get(question.id);
  const bank = readTaskOptions(question).evidenceBank;
  let refs = null;
  if (bank) {
    const indexed = indexTaskPhrases({ task: { situation: question.situation, criteria }, bank, examples: bank.examples });
    refs = resolveTaskReferences(indexed, await Promise.all(indexed.texts.map(embed)));
  } else {
    const stored = await loadStoredTaskReferences(question.id);
    refs = stored ? decodeTaskReferences(stored) : null;
  }
  if (refs) assertMatchesRubric(refs, criteria, question.id);
  cache.set(question.id, refs);
  return refs;
}
