function hasColumn(database, tableName, targetColumnName) {
  const tableColumns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  return tableColumns.some(columnInfo => columnInfo.name === targetColumnName);
}

export function runMigrations(database) {
  database.exec(`
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

  if (!hasColumn(database, 'exams', 'test_type')) {
    database.exec("ALTER TABLE exams ADD COLUMN test_type TEXT NOT NULL DEFAULT 'lesen'");
  }
  if (!hasColumn(database, 'exams', 'sort_order')) {
    database.exec("ALTER TABLE exams ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1");
  }
  if (!hasColumn(database, 'attempts', 'user_id')) {
    database.exec("ALTER TABLE attempts ADD COLUMN user_id TEXT NOT NULL DEFAULT 'anonymous'");
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_attempts_user_created ON attempts(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_attempts_user_exam ON attempts(user_id, exam_id);
    CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(test_type);
    CREATE INDEX IF NOT EXISTS idx_exams_sort ON exams(test_type, sort_order ASC);
  `);
}
