export class AttemptRepository {
  constructor(database) {
    this.database = database;
  }

  findUserAttempts(userId, limit = 50) {
    return this.database.prepare(`
      SELECT attempts.id, attempts.exam_id, attempts.user_id, attempts.score, 
             attempts.total_questions, attempts.percentage, attempts.passed, 
             attempts.time_spent_seconds, attempts.created_at, exams.title as exam_title
      FROM attempts
      JOIN exams ON attempts.exam_id = exams.id
      WHERE attempts.user_id = ?
      ORDER BY attempts.created_at DESC
      LIMIT ?
    `).all(userId, limit);
  }

  findAttemptById(attemptId) {
    const rawAttempt = this.database.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId);
    if (!rawAttempt) return null;

    return {
      ...rawAttempt,
      results: JSON.parse(rawAttempt.results_json),
      answers: JSON.parse(rawAttempt.answers_json),
    };
  }

  fetchUserExamStats(userId, examIds = []) {
    if (examIds.length === 0) {
      return { counts: {}, lastExamId: null };
    }

    const placeholders = examIds.map(() => '?').join(',');
    const countRows = this.database.prepare(`
      SELECT exam_id, COUNT(*) as count 
      FROM attempts 
      WHERE user_id = ? AND exam_id IN (${placeholders})
      GROUP BY exam_id
    `).all(userId, ...examIds);

    const counts = {};
    for (const row of countRows) {
      counts[row.exam_id] = Number(row.count);
    }

    const lastAttempt = this.database.prepare(`
      SELECT exam_id 
      FROM attempts 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(userId);

    return {
      counts,
      lastExamId: lastAttempt?.exam_id || null,
    };
  }
}
