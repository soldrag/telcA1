/**
 * CEFR level of a Schreiben task, resolved against a level registry (policies, grammar profiles,
 * regulations). A task names its level in its data (`question.level`). Tasks saved before that field
 * existed — stored attempts, assignment links — are all telc A1, so a missing level means A1.
 * A named level without a registered entry is an error: grading an A2 letter by A1 rules would give
 * wrong points silently.
 */

export const LEGACY_TASK_LEVEL = 'A1';

/**
 * @param {string} [level] - the task's `level` field
 * @param {Map<string, unknown>} registry - entries keyed by upper-case level
 * @param {string} registryName - for the error message
 * @returns {string} the registry key
 */
export function resolveTaskLevel(level, registry, registryName) {
  const hasLevel = level !== undefined && level !== null && String(level).trim() !== '';
  const key = hasLevel ? String(level).trim().toUpperCase() : LEGACY_TASK_LEVEL;
  if (!registry.has(key)) {
    throw new RangeError(`${registryName}: level "${key}" is not registered`);
  }
  return key;
}
