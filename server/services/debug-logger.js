/**
 * Structured debug logger for Docker stdout + persistent file output.
 * Categories: LLM-PROMPT, LLM-RAW, LLM-PARSED, ARBITRATOR, EVAL, HTTP, etc.
 */
import { appendFile } from 'node:fs/promises';
import path from 'node:path';

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const currentLevel = LOG_LEVELS[
  (process.env.LOG_LEVEL || 'info').toUpperCase()
] ?? LOG_LEVELS.INFO;

const isDebug = process.env.DEBUG === 'true' || currentLevel === LOG_LEVELS.DEBUG;

const LOG_FILE = path.join(
  process.env.DATA_DIR || '/app/data',
  'debug.log'
);

function formatEntry(level, category, message, data) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level}] [${category}] ${message}`;
  if (!data) return base;
  const serialized = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return `${base}\n${serialized}`;
}

function shouldLog(level) {
  return (LOG_LEVELS[level] ?? LOG_LEVELS.INFO) >= currentLevel;
}

async function writeToFile(entry) {
  try {
    await appendFile(LOG_FILE, entry + '\n', 'utf-8');
  } catch {
    // Silently skip if data dir not writable (e.g. in tests)
  }
}

function log(level, category, message, data = null) {
  if (!shouldLog(level)) return;
  const entry = formatEntry(level, category, message, data);
  console.log(entry);
  writeToFile(entry);
}

export function debug(category, message, data) {
  log('DEBUG', category, message, data);
}

export function info(category, message, data) {
  log('INFO', category, message, data);
}

export function warn(category, message, data) {
  log('WARN', category, message, data);
}

export function error(category, message, data) {
  log('ERROR', category, message, data);
}

export function isDebugEnabled() {
  return isDebug;
}

export function getLogFilePath() {
  return LOG_FILE;
}
