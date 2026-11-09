// H2 grader in Node with the app's q4 embedder (exp 3, prereg "Runs H1 / H2"): spans by the project's own
// preprocessing/parser, fold head of the letter's task (data/h2-q4.json), band rule, frame gate, purpose check B.
// Usage (repo root): node --import ./tests/support/loadLexiconData.js scripts/eval/experiments/h2/h2-grade.mjs open|calibration|hidden
// Experiment 3 spike (not product code): frozen heads/thresholds in data/h2-q4.json, trained leave one task out.
// open/calibration: also writes out/H2-node/<set>.json (per-letter levels, for parity with Python).
// hidden: prints aggregate numbers only (needs the private key; never prints a letter).
import fs from 'node:fs';
import { runStage0Preprocessing } from '../../../../src/services/schreiben/grading/stage0Preprocessing.js';
import { parseSentencePropositions } from '../../../../src/services/schreiben/linguistic/clauseStructureParser.js';
import { resolveLevelContext } from '../../../../src/services/schreiben/levelContext.js';
import { createSentenceEmbedder } from '../../../../src/services/embeddings/embeddingService.js';

const set = process.argv[2] || 'open';
const R = new URL('../../../../', import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const H = read(new URL('./data/h2-q4.json', import.meta.url));
const ctx = resolveLevelContext('A1');
const lex = ctx.lexicon;
await lex.load?.();

async function loadLetters() {
  if (set === 'hidden') return (await import('../../hiddenSetStore.mjs')).loadHiddenLetters();
  if (set === 'open') {
    const d = new URL('tests/fixtures/schreiben-open/', R);
    return fs.readdirSync(d).filter((f) => f.endsWith('.json')).sort().flatMap((f) => read(new URL(f, d))
      .map((l, i) => ({ ...l, id: l.id || `${f.replace('.json', '')}-${String(i + 1).padStart(2, '0')}` })));
  }
  const d = new URL('scripts/eval/calibration/', R);
  return fs.readdirSync(d).filter((f) => /^letters-levels-.*\.json$/.test(f)).sort().flatMap((f) => read(new URL(f, d))
    .map((l, i) => ({ ...l, id: `${f.replace(/^letters-levels-|\.json$/g, '')}-${i}` })));
}

const clausesOf = (s) => {
  let props = [];
  try { props = parseSentencePropositions(s, { lexicon: lex }); } catch { props = []; }
  return [...new Set(props.map((p) => (p.rawText || '').trim()).filter((t) => t && t !== s.trim()))];
};
const hasPredication = (ss) => ss.some((s) => s.trim().endsWith('?')
  || lex.tag(s.split(/\s+/).filter(Boolean)).some((t) => t.pos === 'VERB_FIN' || t.pos === 'VERB_MOD'));

const ex = await createSentenceEmbedder({ dtype: 'q4' });
const cache = new Map();
async function emb(t) {
  if (!cache.has(t)) {
    const v = (await ex(`title: none | text: ${t}`)).data;
    let n = 0; for (let j = 0; j < v.length; j++) n += v[j] * v[j]; n = Math.sqrt(n);
    cache.set(t, Float32Array.from(v, (x) => x / n));
  }
  return cache.get(t);
}
const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
const maxCos = async (v, refs) => { let m = -Infinity; for (const r of refs) m = Math.max(m, dot(v, await emb(r))); return refs.length ? m : 0; };

async function proba(head, unit, span) {
  const v = await emb(span);
  const P = await maxCos(v, unit.fulfils); const M = await maxCos(v, unit.misses); const Rv = await maxCos(v, unit.rivals);
  const O = await maxCos(v, unit.irr); const D = dot(v, await emb(unit.desc));
  const x = [P, M, Rv, O, D, P - M, P - Rv, P - O, D - O].map((z, i) => (z - head.mean[i]) / head.scale[i]);
  const z = head.coef.map((w, k) => w.reduce((s, wi, i) => s + wi * x[i], head.intercept[k]));
  const mx = Math.max(...z); const e = z.map((q) => Math.exp(q - mx)); const s = e.reduce((a, b) => a + b, 0);
  const p = Object.fromEntries(head.classes.map((c, k) => [c, e[k] / s]));
  return { F: p.F || 0, C: p.C || 0 };
}

async function grade(L) {
  const head = H[L.seedQuestionId];
  const sentences = runStage0Preprocessing(L.text, ctx).bodySentences;
  const spans = [...new Set([...sentences, ...sentences.flatMap(clausesOf), ...sentences.slice(1).map((s, i) => `${sentences[i]} ${s}`)]
    .filter((x) => x.trim()))];
  const whole = new Set(sentences);
  const [tF, tP, tC] = head.thresholds;
  const lps = [];
  for (const c of head.criteria) {
    const lv = [];
    for (const u of c.units) {
      let s = 0; let cc = 0;
      for (const sp of spans) { const p = await proba(head, u, sp); s = Math.max(s, p.F); if (whole.has(sp)) cc = Math.max(cc, p.C); }
      lv.push(!spans.length ? 0 : (cc >= tC ? 0 : (s >= tF ? 2 : (s >= tP ? 1 : 0))));
    }
    lps.push(lv.length === 1 ? lv[0] : (lv.every((v) => v === 2) ? 2 : (lv.some((v) => v >= 1) ? 1 : 0)));
  }
  if (!hasPredication(sentences)) return [0, 0, 0];
  const lvec = await emb(L.text);
  const on = await maxCos(lvec, head.purposeLetters.onTask); const off = await maxCos(lvec, head.purposeLetters.offTask);
  return on >= off ? lps : [0, 0, 0];
}

const all = await loadLetters();
const letters = all.filter((l) => H[l.seedQuestionId]);
const byCat = {};
const PTS = [0, 1.5, 3];
let n = 0, exact = 0, over = 0, under = 0, within = 0, abs = 0;
const perLetter = {};
const c0 = process.cpuUsage(); const w0 = Date.now();
for (const L of letters) {
  const got = await grade(L); const want = L.expected.lp;
  got.forEach((g, i) => { n++; if (g === want[i]) exact++; else if (g > want[i]) over++; else under++; });
  const cat = (byCat[L.category] ??= { letters: 0, lp: 0, exact: 0 });
  cat.letters++; got.forEach((g, i) => { cat.lp++; if (g === want[i]) cat.exact++; });
  const d = got.reduce((s, g) => s + PTS[g], 0) - want.reduce((s, g) => s + PTS[g], 0); // KG equal on both sides
  if (Math.abs(d) <= 0.5) within++; abs += Math.abs(d);
  if (set !== 'hidden') perLetter[L.id] = got;
}
const cpu = process.cpuUsage(c0);
console.log(JSON.stringify({ set, letters: letters.length, skippedOtherTasks: all.length - letters.length, exactLP: `${(100 * exact / n).toFixed(1)}%`, over, under,
  within05: `${(100 * within / letters.length).toFixed(1)}%`, meanAbs: +(abs / letters.length).toFixed(2),
  cpuMsPerLetter: Math.round((cpu.user + cpu.system) / 1000 / letters.length), wallMsPerLetter: Math.round((Date.now() - w0) / letters.length),
  note: 'cpu/wall include embedding the bank references once per task (cached)' }));
// Categories with at least 8 letters only (as eval-schreiben does), exact Leitpunkt level.
console.log(JSON.stringify(Object.fromEntries(Object.entries(byCat).filter(([, c]) => c.letters >= 8)
  .map(([k, c]) => [k, `${c.exact}/${c.lp} (${c.letters} letters)`]))));
if (set !== 'hidden') {
  fs.mkdirSync(new URL('./out/H2-node/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL(`./out/H2-node/${set}.json`, import.meta.url), JSON.stringify(perLetter));
}
ex.dispose?.();
