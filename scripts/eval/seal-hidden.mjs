/**
 * Seals a staged batch of hidden letters: validates ~/.cache/telc-a1/hidden-staging/<batch>.json,
 * encrypts it with the repository's public key into tests/fixtures/schreiben-hidden/<batch>.enc and deletes
 * the plain file. Needs no secret; prints only counts and schema problems, never a letter.
 * Usage: node scripts/eval/seal-hidden.mjs <batch>
 */

import fs from 'node:fs';
import path from 'node:path';
import { HIDDEN_DIR, STAGING_DIR, sealBatch } from './hiddenSetStore.mjs';
import { validateLetters } from './letterSchema.mjs';

const batchName = process.argv[2];

if (!/^[a-z0-9-]+$/.test(batchName || '')) {
  console.error('Usage: node scripts/eval/seal-hidden.mjs <batch-name: a-z, 0-9, ->');
  process.exit(1);
}

const staged = path.join(STAGING_DIR, `${batchName}.json`);
const target = new URL(`${batchName}.enc`, HIDDEN_DIR);
if (!fs.existsSync(staged)) {
  console.error(`Nothing staged for "${batchName}" (expected ${staged}).`);
  process.exit(1);
}
if (fs.existsSync(target)) {
  console.error(`Batch "${batchName}" is already sealed; pick another name.`);
  process.exit(1);
}

let letters;
try {
  letters = JSON.parse(fs.readFileSync(staged, 'utf8'));
} catch (err) {
  console.error(`Staged file is not valid JSON: ${err.message}`);
  process.exit(1);
}
const problems = validateLetters(letters);
if (problems.length > 0) {
  console.error(`Not sealed, fix the staged file:\n${problems.join('\n')}`);
  process.exit(1);
}

const batch = letters.map((l, i) => ({ ...l, id: `${batchName}-${String(i + 1).padStart(2, '0')}` }));
fs.mkdirSync(HIDDEN_DIR, { recursive: true });
fs.writeFileSync(target, sealBatch(batch));
fs.rmSync(staged);
console.log(`Sealed ${batch.length} letters as ${batchName}.enc; the plain file is deleted.`);
