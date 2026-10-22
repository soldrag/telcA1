/**
 * Seals a staged batch of hidden letters: validates ~/.cache/telc-a1/hidden-staging/<batch>.json,
 * encrypts it into tests/fixtures/schreiben-hidden/<batch>.enc and deletes the plain file.
 * Prints only counts and schema problems, never a letter.
 * Usage: node scripts/eval/seal-hidden.mjs <batch>   ·   node scripts/eval/seal-hidden.mjs --init-key
 */

import fs from 'node:fs';
import path from 'node:path';
import { HIDDEN_DIR, STAGING_DIR, KEY_FILE, createKeyFile, readKey, sealBatch } from './hiddenSetStore.mjs';
import { validateLetters } from './letterSchema.mjs';

const arg = process.argv[2];

if (arg === '--init-key') {
  console.log(createKeyFile() ? `Key created: ${KEY_FILE}` : `Key already exists: ${KEY_FILE}`);
  fs.mkdirSync(STAGING_DIR, { recursive: true });
  process.exit(0);
}

if (!/^[a-z0-9-]+$/.test(arg || '')) {
  console.error('Usage: node scripts/eval/seal-hidden.mjs <batch-name: a-z, 0-9, ->');
  process.exit(1);
}

const staged = path.join(STAGING_DIR, `${arg}.json`);
const target = new URL(`${arg}.enc`, HIDDEN_DIR);
if (!fs.existsSync(staged)) {
  console.error(`Nothing staged for "${arg}" (expected ${staged}).`);
  process.exit(1);
}
if (fs.existsSync(target)) {
  console.error(`Batch "${arg}" is already sealed; pick another name.`);
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

const batch = letters.map((l, i) => ({ ...l, id: `${arg}-${String(i + 1).padStart(2, '0')}` }));
fs.mkdirSync(HIDDEN_DIR, { recursive: true });
fs.writeFileSync(target, sealBatch(batch, readKey()));
fs.rmSync(staged);
console.log(`Sealed ${batch.length} letters as ${arg}.enc; the plain file is deleted.`);
