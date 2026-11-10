/**
 * Expectations the keyword-free engine does not meet yet, recorded as regressions of the switch from the keyword
 * stage (todo.md, "Регрессии перехода на H2"): the tests stay as the examiner's verdict, never rewritten to the
 * engine's. Unit tests grade without the model (reference alignment); the real model is measured by
 * bench:schreiben and the CI evaluation.
 */

export const H2_REGRESSION = { todo: 'regression of the switch to the keyword-free engine (todo.md: Регрессии перехода на H2)' };

const REGRESSED_CASES = new Set(['G3', 'G4', 'C5', 'C9', '12_off_topic', '13_implicit_reason', '14_price_missing', '21_price_adjective_question']);

/** The test options of a generated case: a recorded regression or a plain test. */
export const regressionOf = (caseId) => (REGRESSED_CASES.has(caseId) ? H2_REGRESSION : {});
