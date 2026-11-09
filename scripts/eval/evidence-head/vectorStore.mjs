/**
 * Sentence vectors for training and evaluating the evidence head, with the app's embedder (EmbeddingGemma q4,
 * `sentence_embedding`, document prompt), unit length, cached on disk outside the repository so a retrain does not
 * embed the same thousands of phrases again. The cache is keyed by text; delete it after a model change.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createSentenceEmbedder } from '../../../src/services/embeddings/embeddingService.js';

const PROMPT = 'title: none | text: ';
const DIM = 768;
export const CACHE_FILE = path.join(os.homedir(), '.cache', 'telc-a1', 'evidence-head-q4.bin');

function readCache() {
  const cache = new Map();
  if (!fs.existsSync(CACHE_FILE)) return cache;
  const buf = fs.readFileSync(CACHE_FILE);
  let at = 0;
  while (at < buf.length) {
    const len = buf.readUInt32LE(at);
    const text = buf.toString('utf8', at + 4, at + 4 + len);
    at += 4 + len;
    cache.set(text, new Float32Array(buf.buffer.slice(buf.byteOffset + at, buf.byteOffset + at + DIM * 4)));
    at += DIM * 4;
  }
  return cache;
}

function encodeEntry(text, vector) {
  const t = Buffer.from(text, 'utf8');
  const head = Buffer.alloc(4);
  head.writeUInt32LE(t.length);
  return Buffer.concat([head, t, Buffer.from(vector.buffer, vector.byteOffset, DIM * 4)]);
}

const unitLength = (data) => {
  const norm = Math.hypot(...data) || 1;
  return Float32Array.from(data, (v) => v / norm);
};

/** @returns {Promise<{ embed: (texts: string[]) => Promise<Float32Array[]>, close: () => void }>} */
export async function openVectorStore() {
  const cache = readCache();
  let embedder = null;
  const pending = [];
  const embed = async (texts) => {
    for (const text of new Set(texts)) {
      if (cache.has(text)) continue;
      embedder ??= await createSentenceEmbedder({ dtype: 'q4' });
      const vector = unitLength((await embedder(`${PROMPT}${text}`)).data);
      cache.set(text, vector);
      pending.push(encodeEntry(text, vector));
    }
    return texts.map((t) => cache.get(t));
  };
  const close = () => {
    if (pending.length) {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      fs.appendFileSync(CACHE_FILE, Buffer.concat(pending));
      pending.length = 0;
    }
    embedder?.dispose?.();
  };
  return { embed, close };
}
