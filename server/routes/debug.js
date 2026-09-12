/**
 * Debug API routes: receives client-side telemetry, serves log entries.
 */
import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import * as logger from '../services/debug-logger.js';

export function createDebugRouter() {
  const router = Router();

  router.post('/trace', (req, res) => {
    const { category = 'CLIENT', message = '', data = null } = req.body || {};
    logger.debug(category, message, data);
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
