import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TRANSLATION_CONTRACT } from '../src/i18n/contracts/translationContract.js';

const SRC_DIR = new URL('../src', import.meta.url).pathname;
const LITERAL_KEY_CALL = /\bt\??\.?\(\s*'([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)'/g;

function listSourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listSourceFiles(path);
    return /\.(js|jsx)$/.test(name) ? [path] : [];
  });
}

function isInContract(keyPath) {
  return keyPath.split('.').reduce((node, key) => node?.[key], TRANSLATION_CONTRACT) !== undefined;
}

describe('i18n keys used in source', () => {
  it('every literal t("…") key exists in the translation contract', () => {
    const missing = listSourceFiles(SRC_DIR).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(LITERAL_KEY_CALL)]
        .map((match) => match[1])
        .filter((keyPath) => !isInContract(keyPath))
        .map((keyPath) => `${keyPath} (${file.slice(SRC_DIR.length + 1)})`));
    assert.deepEqual(missing, [], `Keys missing from contract would render raw in UI:\n${missing.join('\n')}`);
  });
});
