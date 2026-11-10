/**
 * A test task with a rubric of its own carries its reference phrases itself (options_json.evidenceBank), as the
 * MERLIN evaluation tasks do: the keyword-free engine grades only tasks with reference phrases. Phrases are written
 * from the task, never from the letter under test; without any, a unit's label stands in (enough for tests of the
 * frame, the register or the feedback, which do not depend on the Leitpunkt levels).
 */

const unitKeys = (criterion) => ((criterion.aspects || []).length
  ? criterion.aspects.map((a) => [`${criterion.id}:${a.label}`, a.label])
  : [[criterion.id, criterion.label]]);

/**
 * @param {object} question - a task with options_json.rubric.leitpunkte_criteria
 * @param {Record<string, string[]>} [fulfils] - fulfilling phrases per unit key (lp1, or lp2:<aspect label>)
 * @param {Record<string, string[]>} [misses] - near misses per unit key
 */
export function withPhraseBank(question, fulfils = {}, misses = {}) {
  const criteria = question.options_json.rubric.leitpunkte_criteria;
  const units = Object.fromEntries(criteria.flatMap(unitKeys).map(([key, label]) => [
    key, { fulfils: fulfils[key] || [label], misses: misses[key] || [] },
  ]));
  return {
    ...question,
    options_json: { ...question.options_json, evidenceBank: { units, otherPurpose: [], purposeLetters: { onTask: [], offTask: [] } } },
  };
}
