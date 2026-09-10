import { Router } from 'express';
import { extractUserId } from '../services/user-context.js';

export function createAttemptsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      const userId = extractUserId(req);
      const attempts = db.prepare(`
        SELECT a.id, a.exam_id, a.user_id, a.score, a.total_questions, a.percentage, 
               a.passed, a.time_spent_seconds, a.created_at, e.title as exam_title
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
        LIMIT 50
      `).all(userId);

      res.json({ attempts, userId });
    } catch (err) {
      console.error('Error fetching attempts:', err);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      const attempt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      res.json({
        ...attempt,
        results: JSON.parse(attempt.results_json),
        answers: JSON.parse(attempt.answers_json)
      });
    } catch (err) {
      console.error('Error fetching attempt detail:', err);
      res.status(500).json({ error: 'Failed to fetch attempt detail' });
    }
  });

  return router;
}
