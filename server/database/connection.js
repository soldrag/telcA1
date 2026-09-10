import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);
const DEFAULT_DB_PATH = path.join(currentDirname, '../../data/telc_a1.db');

export function createDatabaseConnection(customDbPath = DEFAULT_DB_PATH) {
  const dataDirectory = path.dirname(customDbPath);
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }
  return new DatabaseSync(customDbPath);
}
