/**
 * Reads the task's Leitpunkt criteria: the rubric's leitpunkte_criteria, or plain Leitpunkt labels
 * (one keyword concept each) for tasks without a rubric.
 */
export function resolveLeitpunktCriteria(question = {}) {
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});

  if (Array.isArray(options.rubric?.leitpunkte_criteria)) {
    return options.rubric.leitpunkte_criteria;
  }

  return (options.leitpunkte || []).map((lp, index) => ({
    id: `lp${index + 1}`,
    label: lp,
    requiredMatches: 1
  }));
}
