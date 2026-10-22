/**
 * Encrypted store of the hidden Schreiben evaluation set.
 * Each batch is sealed with a fresh AES-256-GCM key, which is wrapped with the RSA public key kept in the
 * repository (scripts/eval/hidden-set-public.pem). Anyone can add letters; only the holder of the private key
 * (the CI secret) can grade them, and it prints aggregate numbers only (`npm run eval:hidden`), so whoever
 * changes the grader never sees a letter and cannot fit to them.
 * Private key: $TELC_HIDDEN_PRIVATE_KEY (PEM text, the CI secret) or ~/.config/telc-a1/hidden-eval.pem.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const HIDDEN_DIR = new URL('../../tests/fixtures/schreiben-hidden/', import.meta.url);
export const STAGING_DIR = path.join(os.homedir(), '.cache', 'telc-a1', 'hidden-staging');
const PUBLIC_KEY_FILE = new URL('./hidden-set-public.pem', import.meta.url);
const PRIVATE_KEY_FILE = path.join(os.homedir(), '.config', 'telc-a1', 'hidden-eval.pem');

const ALGORITHM = 'aes-256-gcm';
const OAEP = { padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' };

function readPrivateKey() {
  const pem = process.env.TELC_HIDDEN_PRIVATE_KEY
    || (fs.existsSync(PRIVATE_KEY_FILE) ? fs.readFileSync(PRIVATE_KEY_FILE, 'utf8') : null);
  if (!pem) {
    throw new Error('The hidden set needs the private key: set TELC_HIDDEN_PRIVATE_KEY or place it at ~/.config/telc-a1/hidden-eval.pem.');
  }
  return crypto.createPrivateKey(pem);
}

export function sealBatch(letters) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(letters), 'utf8'), cipher.final()]);
  const wrappedKey = crypto.publicEncrypt({ key: fs.readFileSync(PUBLIC_KEY_FILE, 'utf8'), ...OAEP }, key);
  return JSON.stringify({
    v: 2,
    key: wrappedKey.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  });
}

function openBatch(sealed, privateKey) {
  const { key, iv, tag, data } = JSON.parse(sealed);
  const aesKey = crypto.privateDecrypt({ key: privateKey, ...OAEP }, Buffer.from(key, 'base64'));
  const decipher = crypto.createDecipheriv(ALGORITHM, aesKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8'));
}

/** All sealed batches, decrypted in memory only. */
export function loadHiddenLetters() {
  const privateKey = readPrivateKey();
  const dir = HIDDEN_DIR.pathname;
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.enc'))
    .sort()
    .flatMap((f) => openBatch(fs.readFileSync(path.join(dir, f), 'utf8'), privateKey));
}
