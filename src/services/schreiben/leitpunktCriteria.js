/** The task's options, stored as an object or (in older data) as a JSON string. */
export function readTaskOptions(question = {}) {
  return typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});
}

/** Reads the task's Leitpunkt criteria: the rubric's leitpunkte_criteria, or plain Leitpunkt labels without a rubric. */
export function resolveLeitpunktCriteria(question = {}) {
  const options = readTaskOptions(question);

  if (Array.isArray(options.rubric?.leitpunkte_criteria)) {
    return options.rubric.leitpunkte_criteria;
  }

  return (options.leitpunkte || []).map((lp, index) => ({ id: `lp${index + 1}`, label: lp }));
}
