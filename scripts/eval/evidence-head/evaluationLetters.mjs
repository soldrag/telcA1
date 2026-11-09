/**
 * The open and calibration letters as the evidence head grades them: body sentences, clauses and adjacent pairs as
 * spans, a predication gate and the purpose check against the task's prototype letters; and the measures.
 * The hidden and MERLIN sets are graded in CI only.
 */

import fs from 'node:fs';
import { runStage0Preprocessing } from '../../../src/services/schreiben/grading/stage0Preprocessing.js';
import { parseSentencePropositions } from '../../../src/services/schreiben/linguistic/clauseStructureParser.js';
import { resolveLevelContext } from '../../../src/services/schreiben/levelContext.js';
import { resolveAddresseeRegister } from '../../../src/services/schreiben/letterRegister.js';
import { readLetter, leitpunktLevels } from './headModel.mjs';

const OPEN = new URL('../../../tests/fixtures/schreiben-open/', import.meta.url);
const CALIBRATION = new URL('../calibration/', import.meta.url);
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
const PTS = [0, 1.5, 3];

function readSets() {
  const open = fs.readdirSync(OPEN).filter((f) => f.endsWith('.json')).sort().flatMap((f) => readJson(new URL(f, OPEN))
    .map((l, i) => ({ ...l, set: 'open', id: l.id || `${f.replace('.json', '')}-${String(i + 1).padStart(2, '0')}` })));
  const calibration = fs.readdirSync(CALIBRATION).filter((f) => /^letters-levels-.*\.json$/.test(f)).sort().flatMap((f) => readJson(new URL(f, CALIBRATION))
    .map((l, i) => ({ ...l, set: 'calibration', id: `${f.replace(/^letters-levels-|\.json$/g, '')}-${i}` })));
  return [...open, ...calibration];
}

/** @returns {Promise<Array<{ id, set, task, category, text, expected, sentences, spans, hasPredication }>>} */
export async function loadEvaluationLetters(tasks) {
  const ctx = resolveLevelContext('A1');
  await ctx.lexicon.load();
  const clausesOf = (s) => {
    let props = [];
    try { props = parseSentencePropositions(s, { lexicon: ctx.lexicon }); } catch { props = []; }
    return props.map((p) => (p.rawText || '').trim()).filter((t) => t && t !== s.trim());
  };
  const predicates = (s) => s.trim().endsWith('?') || ctx.lexicon.tag(s.split(/\s+/).filter(Boolean)).some((t) => t.pos === 'VERB_FIN' || t.pos === 'VERB_MOD');
  return readSets().map((L) => {
    const register = resolveAddresseeRegister(tasks[L.seedQuestionId].question);
    const sentences = runStage0Preprocessing(L.text, ctx, { addresseeRegister: register }).bodySentences;
    const spans = [...new Set([...sentences, ...sentences.flatMap(clausesOf), ...sentences.slice(1).map((s, i) => `${sentences[i]} ${s}`)])].filter((x) => x.trim());
    return { id: L.id, set: L.set, task: L.seedQuestionId, category: L.category, text: L.text, expected: L.expected.lp, sentences, spans, hasPredication: sentences.some(predicates) };
  });
}

const closest = (v, refs) => Math.max(...refs.map((r) => r.reduce((s, x, i) => s + x * v[i], 0)));

/** Leitpunkt levels of one letter; a letter without a statement, or closer to another purpose, earns none. */
export function readEvaluationLetter({ head, thresholds, groups, task, letter, vec }) {
  if (!letter.hasPredication) return [0, 0, 0];
  const levels = leitpunktLevels(readLetter(head, groups, { spans: letter.spans, whole: new Set(letter.sentences) }, vec), thresholds);
  const v = vec.get(letter.text);
  const { onTask, offTask } = task.bank.purposeLetters;
  return closest(v, onTask.map((t) => vec.get(t))) >= closest(v, offTask.map((t) => vec.get(t))) ? levels : levels.map(() => 0);
}

function measures(rows) {
  let exact = 0; let over = 0; let under = 0; let within = 0; let abs = 0;
  for (const { got, expected } of rows) {
    got.forEach((g, i) => { if (g === expected[i]) exact += 1; else if (g > expected[i]) over += 1; else under += 1; });
    const d = got.reduce((s, g) => s + PTS[g], 0) - expected.reduce((s, g) => s + PTS[g], 0);
    if (Math.abs(d) <= 0.5) within += 1;
    abs += Math.abs(d);
  }
  const pct = (x, n) => `${((100 * x) / n).toFixed(1)}%`;
  return { letters: rows.length, exactLP: pct(exact, rows.length * 3), over, under, within05: pct(within, rows.length), meanAbs: (abs / rows.length).toFixed(2) };
}

/** Prints the measures per set (KG left out: Leitpunkte only) and exact Leitpunkt hits per category. */
export function summarize(graded) {
  for (const set of ['open', 'calibration']) {
    const rows = graded.filter((g) => g.set === set);
    console.log(`\n== ${set}`, measures(rows));
    const cats = {};
    for (const r of rows) {
      const c = (cats[r.category] ??= [0, 0]);
      r.got.forEach((g, i) => { c[0] += g === r.expected[i] ? 1 : 0; c[1] += 1; });
    }
    console.log(Object.fromEntries(Object.entries(cats).map(([k, [h, n]]) => [k, `${h}/${n}`])));
  }
}
