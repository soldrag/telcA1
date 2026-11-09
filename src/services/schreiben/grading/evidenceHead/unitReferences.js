/**
 * Reference phrases of a task's Leitpunkt units for the keyword-free evidence head. A unit is a Leitpunkt, or one
 * aspect of it where the rubric declares `aspects` — never a part guessed from the label. Phrases come from the
 * task's example bank (`src/data/exams/example-bank/<task>.json`) and its example phrases
 * (`schreiben-leitpunkt-examples.json`), all written from the task text. Level-free: the data is injected.
 */

const missesOf = (misses) => (Array.isArray(misses) ? misses : Object.values(misses || {}).flat());
const lpOf = (unitKey) => unitKey.split(':')[0];

/**
 * Bank units with the example phrases added: { [bankKey]: { lp, fulfils, misses } }.
 * @param {{ units: object }} bank - the task's example bank
 * @param {object} [examples] - the task's entry of schreiben-leitpunkt-examples.json
 */
export function collectBankUnits(bank, examples = {}) {
  const units = {};
  for (const [key, unit] of Object.entries(bank.units)) {
    units[key] = { lp: lpOf(key), fulfils: [...unit.fulfils], misses: missesOf(unit.misses) };
  }
  for (const [lp, entry] of Object.entries(examples)) {
    const parts = entry.aspects
      ? Object.entries(entry.aspects).map(([aspect, v]) => [`${lp}:${aspect}`, v])
      : [[lp, entry]];
    for (const [key, phrases] of parts) {
      const target = units[key] || Object.values(units).find((u) => u.lp === lp);
      if (!target) continue;
      target.fulfils.push(...(phrases.fulfils || []));
      target.misses.push(...missesOf(phrases.misses));
    }
  }
  return units;
}

function describeUnit(task, criterion, aspect) {
  return `${task.situation} Leitpunkt: ${criterion.label}${aspect ? ` – ${aspect}` : ''}`;
}

/**
 * One unit as the head reads it: its own phrases, the other Leitpunkte's fulfilling phrases (rivals), phrases of
 * another purpose and neutral letter phrases (irrelevant), and a description built from the task text.
 * @param {{ task: { situation: string }, criterion: object, aspect?: string|null, phrases: { fulfils, misses },
 *   bankUnits: object, irrelevant: string[] }} input
 */
export function viewUnit({ task, criterion, aspect = null, phrases, bankUnits, irrelevant }) {
  return {
    key: aspect ? `${criterion.id}:${aspect}` : criterion.id,
    lp: criterion.id,
    desc: describeUnit(task, criterion, aspect),
    fulfils: phrases.fulfils,
    misses: phrases.misses,
    rivals: Object.values(bankUnits).filter((u) => u.lp !== criterion.id).flatMap((u) => u.fulfils),
    irr: irrelevant,
  };
}

function mergedPhrases(bankUnits, lp) {
  const parts = Object.values(bankUnits).filter((u) => u.lp === lp);
  return { fulfils: parts.flatMap((u) => u.fulfils), misses: parts.flatMap((u) => u.misses) };
}

/**
 * The units a letter is graded on, grouped by Leitpunkt in rubric order.
 * @param {{ task: { situation: string, criteria: object[] }, bank: object, examples?: object, neutral: string[] }} input
 *   task.criteria: the rubric's leitpunkte_criteria (declared `aspects` only)
 * @returns {Array<{ lp: string, units: object[] }>}
 */
export function letterUnits({ task, bank, examples, neutral }) {
  const bankUnits = collectBankUnits(bank, examples);
  const irrelevant = [...(bank.otherPurpose || []), ...neutral];
  return task.criteria.map((criterion) => {
    const aspects = (criterion.aspects || []).map((a) => a.label);
    const units = aspects.length
      ? aspects.map((aspect) => viewUnit({ task, criterion, aspect, phrases: bankUnits[`${criterion.id}:${aspect}`], bankUnits, irrelevant }))
      : [viewUnit({ task, criterion, phrases: mergedPhrases(bankUnits, criterion.id), bankUnits, irrelevant })];
    return { lp: criterion.id, units };
  });
}
