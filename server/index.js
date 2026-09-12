import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { db, initDatabase } from './db.js';
import { createExamsRouter } from './routes/exams.js';
import { createAttemptsRouter } from './routes/attempts.js';
import { createTestTypesRouter } from './routes/test-types.js';
import { createDebugRouter } from './routes/debug.js';
import * as logger from './services/debug-logger.js';
import {
  createPrecompressedMiddleware,
  configureStaticHeaders,
  getStaticCacheControl,
} from './middleware/static-compression.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(compression());
app.use(express.json());

app.use('/api/exams', createExamsRouter(db));
app.use('/api/attempts', createAttemptsRouter(db));
app.use('/api/test-types', createTestTypesRouter(db));
app.use('/api/debug', createDebugRouter());

const distPath = path.join(__dirname, '../dist');
app.use(createPrecompressedMiddleware(distPath));
app.use(
  express.static(distPath, {
    setHeaders: configureStaticHeaders,
  })
);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.setHeader('Cache-Control', getStaticCacheControl('index.html'));
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  logger.info('SERVER', 'Startup complete', {
    port: PORT, host: HOST,
    debug: logger.isDebugEnabled(),
    logFile: logger.getLogFilePath(),
    nodeEnv: process.env.NODE_ENV,
  });
});

const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../certs/cert.pem');
const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../certs/key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  try {
    const credentials = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
    https.createServer(credentials, app).listen(HTTPS_PORT, HOST, () => {
      console.log(`HTTPS server running on https://${HOST}:${HTTPS_PORT}`);
      logger.info('SERVER', 'HTTPS startup complete', { port: HTTPS_PORT, host: HOST });
    });
  } catch (err) {
    logger.error('SERVER', 'Failed to start HTTPS server', { error: err.message });
  }
}

