/**
 * Encrypted store of the hidden Schreiben evaluation set.
 * The letters are sealed with AES-256-GCM; the key lives outside the repository, so whoever changes the
 * grader sees only the aggregate result (`npm run eval:hidden`), never a letter, and cannot fit to them.
 * Key: $TELC_HIDDEN_KEY_FILE or ~/.config/telc-a1/hidden-eval.key (32 random bytes, base64).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const HIDDEN_DIR = new URL('../../tests/fixtures/schreiben-hidden/', import.meta.url);
export const STAGING_DIR = path.join(os.homedir(), '.cache', 'telc-a1', 'hidden-staging');
export const KEY_FILE = process.env.TELC_HIDDEN_KEY_FILE || path.join(os.homedir(), '.config', 'telc-a1', 'hidden-eval.key');

const ALGORITHM = 'aes-256-gcm';

export function readKey() {
  if (!fs.existsSync(KEY_FILE)) {
    throw new Error(`Hidden-set key not found at ${KEY_FILE} (set TELC_HIDDEN_KEY_FILE).`);
  }
  const key = Buffer.from(fs.readFileSync(KEY_FILE, 'utf8').trim(), 'base64');
  if (key.length !== 32) throw new Error('Hidden-set key must be 32 bytes, base64-encoded.');
  return key;
}

export function createKeyFile() {
  if (fs.existsSync(KEY_FILE)) return false;
  fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
  fs.writeFileSync(KEY_FILE, crypto.randomBytes(32).toString('base64') + '\n', { mode: 0o600 });
  return true;
}

export function sealBatch(letters, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(letters), 'utf8'), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') });
}

function openBatch(sealed, key) {
  const { iv, tag, data } = JSON.parse(sealed);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8'));
}

/** All sealed batches, decrypted in memory only. */
export function loadHiddenLetters(key = readKey()) {
  const dir = HIDDEN_DIR.pathname;
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.enc'))
    .sort()
    .flatMap((f) => openBatch(fs.readFileSync(path.join(dir, f), 'utf8'), key));
}
