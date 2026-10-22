import leitpunktExamples from '../../data/exams/schreiben-leitpunkt-examples.json' with { type: 'json' };

// Example phrases per task and Leitpunkt ({ fulfils, misses }, or { aspects: { label: { fulfils, misses } } }):
// rubric data the Micro-Ranker compares sentences with, written from the task only (never from graded letters).
function attachExamples(criteria, questionId) {
  const byLeitpunkt = leitpunktExamples[questionId];
  if (!byLeitpunkt) return criteria;
  return criteria.map((criterion) => (byLeitpunkt[criterion.id]
    ? { ...criterion, examples: byLeitpunkt[criterion.id] }
    : criterion));
}

/**
 * Reads the task's Leitpunkt criteria: the rubric's leitpunkte_criteria, or plain Leitpunkt labels
 * (one keyword concept each) for tasks without a rubric.
 */
export function resolveLeitpunktCriteria(question = {}) {
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});

  if (Array.isArray(options.rubric?.leitpunkte_criteria)) {
    return attachExamples(options.rubric.leitpunkte_criteria, question.id);
  }

  return (options.leitpunkte || []).map((lp, index) => ({
    id: `lp${index + 1}`,
    label: lp,
    requiredMatches: 1
  }));
}
