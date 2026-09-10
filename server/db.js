import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { seedData } from './seed-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/telc_a1.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

function hasColumn(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some(c => c.name === columnName);
}

function runMigrations() {
  if (!hasColumn('exams', 'test_type')) {
    db.exec("ALTER TABLE exams ADD COLUMN test_type TEXT NOT NULL DEFAULT 'lesen'");
  }
  if (!hasColumn('exams', 'sort_order')) {
    db.exec("ALTER TABLE exams ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1");
  }
  if (!hasColumn('attempts', 'user_id')) {
    db.exec("ALTER TABLE attempts ADD COLUMN user_id TEXT NOT NULL DEFAULT 'anonymous'");
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_attempts_user_created ON attempts(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_attempts_user_exam ON attempts(user_id, exam_id);
    CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(test_type);
    CREATE INDEX IF NOT EXISTS idx_exams_sort ON exams(test_type, sort_order ASC);
  `);
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      test_type TEXT NOT NULL DEFAULT 'lesen',
      time_limit_minutes INTEGER NOT NULL DEFAULT 25,
      total_questions INTEGER NOT NULL DEFAULT 15,
      pass_score INTEGER NOT NULL DEFAULT 9,
      sort_order INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      teil INTEGER NOT NULL,
      question_number INTEGER NOT NULL,
      title TEXT,
      situation TEXT,
      context_header TEXT,
      context_body TEXT,
      options_json TEXT,
      statement TEXT,
      correct_answer TEXT NOT NULL,
      clue_quote TEXT NOT NULL,
      explanation_ru TEXT NOT NULL,
      explanation_de TEXT NOT NULL,
      vocabulary_notes TEXT,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      user_id TEXT NOT NULL DEFAULT 'anonymous',
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage REAL NOT NULL,
      passed INTEGER NOT NULL,
      time_spent_seconds INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      results_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );
  `);

  runMigrations();
  seedDatabase();
}

export function seedDatabase() {
  const insertExam = db.prepare(`
    INSERT OR REPLACE INTO exams (
      id, title, subtitle, description, test_type, 
      time_limit_minutes, total_questions, pass_score, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT OR REPLACE INTO questions (
      id, exam_id, teil, question_number, title, situation, 
      context_header, context_body, options_json, statement, 
      correct_answer, clue_quote, explanation_ru, explanation_de, vocabulary_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const exam of seedData.exams) {
    insertExam.run(
      exam.id,
      exam.title,
      exam.subtitle,
      exam.description,
      exam.test_type || 'lesen',
      exam.time_limit_minutes,
      exam.total_questions,
      exam.pass_score,
      exam.sort_order || 1
    );
  }

  for (const q of seedData.questions) {
    insertQuestion.run(
      q.id,
      q.exam_id,
      q.teil,
      q.question_number,
      q.title || null,
      q.situation || null,
      q.context_header || null,
      q.context_body || null,
      q.options_json ? JSON.stringify(q.options_json) : null,
      q.statement || null,
      q.correct_answer,
      q.clue_quote,
      q.explanation_ru,
      q.explanation_de,
      q.vocabulary_notes ? JSON.stringify(q.vocabulary_notes) : null
    );
  }
}
