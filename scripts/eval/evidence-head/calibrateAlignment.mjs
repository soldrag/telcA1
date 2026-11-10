/**
 * Level data of reference alignment (the evidence head's assessor without a model), from reference phrases only:
 * the IDF table over every fulfilling phrase, near miss and irrelevant phrase of the seven tasks, and thresholds by
 * leave one out — each fulfilling phrase against its unit's other fulfilling phrases (positives), the other
 * Leitpunkte's and the irrelevant phrases against the unit's (negatives); full = Youden J, partial = 5th percentile
 * of the positives (experiment 1, run A). No letter is read.
 *   node --import ./tests/support/loadLexiconData.js scripts/eval/evidence-head/calibrateAlignment.mjs
 */

import fs from 'node:fs';
import { loadTasks, TASK_IDS } from './headModel.mjs';
import { indexTaskPhrases } from '../../../src/services/schreiben/grading/evidenceHead/taskReferences.js';
import { tokenizeSpan, bestAlignment, idfFrom } from '../../../src/services/schreiben/grading/referenceAlignment/alignmentTokens.js';
import { resolveLevelContext } from '../../../src/services/schreiben/levelContext.js';

const OUT = new URL('../../../src/services/schreiben/grading/policies/a1ReferenceAlignment.json', import.meta.url);
const lexicon = resolveLevelContext('A1').lexicon;
await lexicon.load();
const tasks = await loadTasks();
const indexed = TASK_IDS.map((id) => indexTaskPhrases({ task: tasks[id], bank: tasks[id].bank, examples: tasks[id].examples }));

const phraseSet = new Set(indexed.flatMap((x) => x.groups.flatMap((g) => g.units.flatMap((u) => [...u.fulfils, ...u.misses, ...u.irr].map((i) => x.texts[i])))));
const tokenCache = new Map();
const tok = (t) => (tokenCache.has(t) ? tokenCache.get(t) : tokenCache.set(t, tokenizeSpan(t, lexicon)).get(t));
const df = {};
for (const p of phraseSet) for (const key of new Set(tok(p).map((t) => t.key))) df[key] = (df[key] || 0) + 1;
const idfTable = { N: phraseSet.size, df };
const context = { idf: idfFrom(idfTable), lexicon };

const positives = [];
const negatives = [];
for (const x of indexed) {
  const units = x.groups.flatMap((g) => g.units.map((u) => ({ ...u, lp: g.lp })));
  for (const u of units) {
    const refs = u.fulfils.map((i) => tok(x.texts[i]));
    refs.forEach((r, i) => positives.push(bestAlignment(refs.filter((_, j) => j !== i), r, context)));
    const others = [...new Set([...units.filter((v) => v.lp !== u.lp).flatMap((v) => v.fulfils), ...u.irr])];
    for (const i of others) negatives.push(bestAlignment(refs, tok(x.texts[i]), context));
  }
}

let best = { j: -1, t: 0 };
for (const t of [...new Set([...positives, ...negatives])].sort((a, b) => a - b)) {
  const tpr = positives.filter((s) => s >= t).length / positives.length;
  const fpr = negatives.filter((s) => s >= t).length / negatives.length;
  if (tpr - fpr > best.j + 1e-12) best = { j: tpr - fpr, t, tpr, fpr };
}
const sorted = [...positives].sort((a, b) => a - b);
const partial = Math.min(sorted[Math.floor(0.05 * (sorted.length - 1))], best.t);
const thresholds = { full: best.t, partial };
fs.writeFileSync(OUT, `${JSON.stringify({ version: 1, thresholds, idf: idfTable })}\n`);
console.log({ thresholds, youdenJ: best.j, tpr: best.tpr, fpr: best.fpr, positives: positives.length, negatives: negatives.length, tokens: Object.keys(df).length });
