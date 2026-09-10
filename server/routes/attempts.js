import { Router } from 'express';
import { extractUserId } from '../services/user-context.js';
import { AttemptRepository } from '../repositories/attempt.repository.js';

export function createAttemptsRouter(databaseOrRepository) {
  const router = Router();
  const attemptRepository = databaseOrRepository instanceof AttemptRepository
    ? databaseOrRepository
    : new AttemptRepository(databaseOrRepository);

  router.get('/', (req, res) => {
    try {
      const userId = extractUserId(req);
      const attempts = attemptRepository.findUserAttempts(userId, 50);
      res.json({ attempts, userId });
    } catch (error) {
      console.error('[AttemptsRouter Error] Failed to fetch attempts:', error);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      const attemptId = req.params.id;
      if (!attemptId || typeof attemptId !== 'string' || attemptId.trim().length === 0) {
        return res.status(400).json({ error: 'Valid attempt ID is required' });
      }

      const attempt = attemptRepository.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      res.json(attempt);
    } catch (error) {
      console.error('[AttemptsRouter Error] Failed to fetch attempt detail:', error);
      res.status(500).json({ error: 'Failed to fetch attempt detail' });
    }
  });

  return router;
}
