/**
 * The app reads the keyword stage's vectors from its single EmbeddingGemma session (createEmbeddingExtractors
 * `pooled`); they must equal the feature-extraction pipeline's, which the keyword stage was calibrated on, bit for bit
 * on Node/WASM. Usage: node scripts/eval/check-embedding-parity.mjs (downloads the model on first use).
 */

import { pipeline } from '@huggingface/transformers';
import { createEmbeddingExtractors, computeEmbedding } from '../../src/services/embeddings/embeddingService.js';

const SENTENCES = [
  'Ich möchte im August einen Deutschkurs machen.',
  'Wie viel kostet der Kurs pro Woche?',
  'Leider kann ich am Montag nicht kommen, weil ich krank bin.',
  'ich binn ser krangk und kan nich komen',
  'Liebe Grüße',
  'Die Heizung in meiner Wohnung ist seit drei Tagen kaputt, bitte schicken Sie schnell einen Handwerker.',
];

const reference = await pipeline('feature-extraction', 'onnx-community/embeddinggemma-300m-ONNX', { dtype: 'q4' });
const { pooled, dispose } = await createEmbeddingExtractors();
let worst = 0;
for (const sentence of SENTENCES) {
  for (const isQuery of [false, true]) {
    const a = await computeEmbedding(sentence, isQuery, reference);
    const b = await computeEmbedding(sentence, isQuery, pooled);
    worst = Math.max(worst, ...a.map((v, i) => Math.abs(v - b[i])));
  }
}
dispose();
await reference.dispose();
console.log(`Keyword-stage vectors, pipeline vs single session: largest difference ${worst} over ${SENTENCES.length * 2} prompts`);
if (worst !== 0) process.exit(1);
