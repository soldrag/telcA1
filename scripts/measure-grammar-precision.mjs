/**
 * Grammar hint precision and recall on an independent corpus (tests/fixtures/grammar/precision, written by a
 * separate annotator without the checker): hints on correct sentences are false positives; each learner
 * sentence has one error and its corrected form. Diagnostic only — never tune rules to this corpus.
 * Usage: npm run measure:grammar [-- --details]
 */
// Per-rule precision on correct sentences and per-category recall on single-error learner sentences.
import { readFileSync } from 'node:fs';
import { loadLexiconData } from '../src/services/schreiben/linguistic/a1LexiconService.js';
import { checkGermanA1Grammar } from '../src/services/schreiben/germanGrammarChecker.js';
await loadLexiconData();
const dir = process.argv.slice(2).find((a) => !a.startsWith('--')) || new URL('../tests/fixtures/grammar/precision', import.meta.url).pathname;
const norm = (s) => s.replace(/[.,!?;:„“"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const fired = new Map(); const bump = (code, key) => { const r = fired.get(code) || { tp: 0, fp: 0, bad: 0, fps: [] }; r[key]++; fired.set(code, r); return r; };
const correct = readFileSync(`${dir}/correct.txt`, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const errors = readFileSync(`${dir}/errors.tsv`, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t')).filter((r) => r.length >= 3);
for (const text of [...correct, ...errors.map((r) => r[2])]) {
  for (const e of checkGermanA1Grammar(text)) bump(e.code, 'fp').fps.push(`${text}  ⇒  ${e.original} → ${e.correction}`);
}
const recall = new Map();
for (const [cat, wrong, right] of errors) {
  const r = recall.get(cat) || { n: 0, flagged: 0, fixed: 0, missed: [] }; r.n++;
  const hints = checkGermanA1Grammar(wrong);
  if (hints.length) r.flagged++;
  // A marker hint ("… [Verb fehlt]") names the defect without a rewrite: right when it marks this sentence.
  const isMarker = (e) => /\[[^\]]*fehlt[^\]]*\]/.test(String(e.correction || ''));
  const fixes = hints.filter((e) => isMarker(e) || norm(right).includes(norm(String(e.correction || ''))));
  if (fixes.length) r.fixed++; else r.missed.push(`${wrong}  ⇒  ${hints.map((e) => `${e.code}: ${e.correction}`).join('; ') || '—'}`);
  for (const e of hints) bump(e.code, fixes.includes(e) ? 'tp' : 'bad');
  recall.set(cat, r);
}
console.log(`correct sentences: ${correct.length + errors.length}, learner sentences: ${errors.length}\n`);
console.log('RULE PRECISION (tp = right fix on learner sentence, bad = wrong/unrelated hint there, fp = hint on a correct sentence)');
for (const [code, r] of [...fired].sort((a, b) => (b[1].fp + b[1].bad) - (a[1].fp + a[1].bad))) {
  const p = r.tp / Math.max(1, r.tp + r.fp + r.bad);
  console.log(`${code.padEnd(36)} tp=${String(r.tp).padStart(3)} bad=${String(r.bad).padStart(3)} fp=${String(r.fp).padStart(3)} precision=${(p * 100).toFixed(0)}%`);
}
console.log('\nRECALL PER CATEGORY (fixed = a hint whose correction is in the corrected sentence)');
for (const [cat, r] of [...recall].sort()) console.log(`${cat.padEnd(24)} n=${String(r.n).padStart(3)} flagged=${String(r.flagged).padStart(3)} fixed=${String(r.fixed).padStart(3)}`);
if (process.argv.includes('--details')) {
  console.log('\nFALSE POSITIVES'); for (const [code, r] of fired) for (const f of r.fps) console.log(`${code}: ${f}`);
  console.log('\nMISSED / WRONG'); for (const [cat, r] of recall) for (const m of r.missed) console.log(`${cat}: ${m}`);
}
