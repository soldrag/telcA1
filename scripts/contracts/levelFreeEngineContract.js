/**
 * Engine/level separation (CLAUDE.md §5.1): every Schreiben module is level-free except the level data
 * and the bindings listed below. A new level adds a policy, a profile, a regulation and its data —
 * never a level name or a level import in engine code.
 */
import fs from 'node:fs';
import path from 'node:path';

const LEVEL_MODULES = [
  'grading/policies/',
  'profiles/',
  'regulations/',
  'linguistic/a1LexiconService.js',
  'germanGrammarChecker.js',
  'taskLevel.js',
];
// a1Lexicon, a1RankerPolicy, defaultA1…, A1_GRAMMAR_PROFILE, TelcA1…, and a bare level name 'A1'/'B2'.
const LEVEL_REFERENCE = /a1[A-Z]|A1[A-Z_]|\b[AB][12]\b/;

function listJsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJsFiles(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function validateEngineIsLevelFree(schreibenDir, errors) {
  for (const file of listJsFiles(schreibenDir)) {
    const relative = path.relative(schreibenDir, file).split(path.sep).join('/');
    if (LEVEL_MODULES.some((allowed) => relative.startsWith(allowed))) continue;
    const match = stripComments(fs.readFileSync(file, 'utf8')).match(LEVEL_REFERENCE);
    if (match) errors.push(`engine module ${relative} references a level ("${match[0]}"); inject it through resolveLevelContext or move it to level data`);
  }
}
