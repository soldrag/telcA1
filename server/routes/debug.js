/**
 * Debug API routes: receives client-side telemetry, serves log entries.
 */
import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import * as logger from '../services/debug-logger.js';
import { createDebugAuthMiddleware } from '../middleware/debug-auth.js';

function sanitizeLogText(input, maxLength) {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/[\r\n]/g, ' ').trim();
}

export function createDebugRouter({ authMiddleware = createDebugAuthMiddleware() } = {}) {
  const router = Router();

  if (authMiddleware) {
    router.use(authMiddleware);
  }

  router.post('/trace', (req, res) => {
    const { category, message, data = null } = req.body || {};
    const safeCategory = sanitizeLogText(category, 64) || 'CLIENT';
    const safeMessage = sanitizeLogText(message, 512);
    logger.debug(safeCategory, safeMessage, data);
    res.json({ ok: true });
  });

  router.get('/logs', async (_req, res) => {
    try {
      const logPath = logger.getLogFilePath();
      const content = await readFile(logPath, 'utf-8');
      const lines = content.trim().split('\n').slice(-200);
      res.type('text/plain').send(lines.join('\n'));
    } catch {
      res.type('text/plain').send('No logs yet.');
    }
  });

  router.delete('/logs', async (_req, res) => {
    try {
      await writeFile(logger.getLogFilePath(), '', 'utf-8');
      res.json({ ok: true, message: 'Logs cleared' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
