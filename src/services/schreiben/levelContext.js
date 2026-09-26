/**
 * Composition root of one exam level: its ranker policy, the policy's lexicon port and the grammar
 * checker of its grammar profile. Engine modules receive this context as a parameter; only the
 * registries (policies/, profiles/) map a level name to level data.
 */
import { getRankerPolicy } from './grading/policies/index.js';
import { getGrammarProfile } from './profiles/index.js';
import { createGrammarChecker } from './linguistic/grammarCheckOrchestrator.js';

const contexts = new Map();

function buildLevelContext(level) {
  const policy = getRankerPolicy(level);
  return Object.freeze({
    level: policy.level,
    policy,
    lexicon: policy.lexicon,
    grammar: createGrammarChecker(getGrammarProfile(level)),
  });
}

/**
 * @param {string} [level] - CEFR level of the task (question.level); unregistered levels use the registry default
 * @returns {{ level: string, policy: object, lexicon: object, grammar: { checkLetter: Function, findSalutationDeclensionError: Function } }}
 */
export function resolveLevelContext(level) {
  const key = String(level || '').toUpperCase();
  if (!contexts.has(key)) contexts.set(key, buildLevelContext(level));
  return contexts.get(key);
}
