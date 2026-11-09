/**
 * Precomputed reference vectors of a task's Leitpunkt units for the evidence head: unique phrase vectors stored as
 * int16 (base64; int8 moved 2 of 540 levels) once, units and purpose prototypes as indices into them. Built by
 * scripts/eval/evidence-head/buildReferences.mjs with the app's embedder, so the browser embeds only the letter.
 */

const SCALE = 32767;

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(text) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(text, 'base64'));
  return Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
}

/** FNV-1a hash of the phrase list a task's vectors were built from: stale vectors are caught by a test. */
export function hashPhrases(texts) {
  let h = 0x811c9dc5;
  for (const ch of texts.join('\n')) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

/** A unit-length vector as int16. */
export function encodeReferenceVector(vector) {
  return toBase64(new Uint8Array(Int16Array.from(vector, (v) => Math.max(-SCALE, Math.min(SCALE, Math.round(v * SCALE)))).buffer));
}

/** Decodes and re-normalises, so cosines stay true cosines. */
export function decodeReferenceVector(text) {
  // A copy starts at offset 0: a Node Buffer view may sit at an odd offset an Int16Array cannot take.
  const values = Float32Array.from(new Int16Array(Uint8Array.from(fromBase64(text)).buffer), (v) => v / SCALE);
  const norm = Math.hypot(...values) || 1;
  return values.map((v) => v / norm);
}

/**
 * @param {{ vectors: string[], groups: Array<{ lp: string, units: Array<{ key, fulfils: number[], misses: number[],
 *   rivals: number[], irr: number[], desc: number }> }>, purpose: { onTask: number[], offTask: number[] } }} stored
 * @returns {{ groups: Array<{ lp, units }>, purpose: { onTask: Float32Array[], offTask: Float32Array[] } }}
 */
export function decodeTaskReferences(stored) {
  return resolveTaskReferences(stored, stored.vectors.map(decodeReferenceVector));
}

/** The indexed structure with its vectors in place. @param {Float32Array[]} vectors - one per index */
export function resolveTaskReferences(stored, vectors) {
  const pick = (indices) => indices.map((i) => vectors[i]);
  return {
    groups: stored.groups.map((g) => ({
      lp: g.lp,
      units: g.units.map((u) => ({ key: u.key, fulfils: pick(u.fulfils), misses: pick(u.misses), rivals: pick(u.rivals), irr: pick(u.irr), desc: vectors[u.desc] })),
    })),
    purpose: { onTask: pick(stored.purpose.onTask), offTask: pick(stored.purpose.offTask) },
  };
}

/**
 * Text form of the same structure, for a task whose phrases come with the question (evaluation tasks): the caller
 * embeds `texts` and resolves them with resolveTaskReferences.
 * @param {{ groups: Array<{ lp, units: object[] }>, purposeLetters: { onTask: string[], offTask: string[] } }} units
 */
export function indexTaskReferences({ groups, purposeLetters }) {
  const texts = [];
  const at = new Map();
  const idx = (t) => { if (!at.has(t)) { at.set(t, texts.length); texts.push(t); } return at.get(t); };
  const indexed = groups.map((g) => ({
    lp: g.lp,
    units: g.units.map((u) => ({ key: u.key, fulfils: u.fulfils.map(idx), misses: u.misses.map(idx), rivals: u.rivals.map(idx), irr: u.irr.map(idx), desc: idx(u.desc) })),
  }));
  return { texts, groups: indexed, purpose: { onTask: purposeLetters.onTask.map(idx), offTask: purposeLetters.offTask.map(idx) } };
}
