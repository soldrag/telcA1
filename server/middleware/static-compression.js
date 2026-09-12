import fs from 'node:fs';
import path from 'node:path';

const MIME_MAP = {
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.html': 'text/html; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=UTF-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

export function resolveMimeType(filePath = '') {
  const cleanPath = filePath.replace(/\.(br|gz)$/, '');
  const ext = path.extname(cleanPath).toLowerCase();
  return MIME_MAP[ext] || null;
}

export function getStaticCacheControl(filePath = '') {
  if (filePath.includes('/assets/') || filePath.endsWith('.woff2')) {
    return 'public, max-age=31536000, immutable';
  }
  if (filePath.endsWith('.html') || filePath.endsWith('/') || !path.extname(filePath)) {
    return 'no-cache';
  }
  return 'public, max-age=3600';
}

export function createPrecompressedMiddleware(staticDir) {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const safePath = path.normalize(req.path).replace(/^(\.\.[/\\])+/, '');
    const absolutePath = path.join(staticDir, safePath);

    if (acceptEncoding.includes('br') && fs.existsSync(`${absolutePath}.br`)) {
      req.url = `${req.url}.br`;
      res.setHeader('Vary', 'Accept-Encoding');
    } else if (acceptEncoding.includes('gzip') && fs.existsSync(`${absolutePath}.gz`)) {
      req.url = `${req.url}.gz`;
      res.setHeader('Vary', 'Accept-Encoding');
    }

    next();
  };
}

export function configureStaticHeaders(res, filePath) {
  res.setHeader('Cache-Control', getStaticCacheControl(filePath));

  if (filePath.endsWith('.br')) {
    res.setHeader('Content-Encoding', 'br');
  } else if (filePath.endsWith('.gz')) {
    res.setHeader('Content-Encoding', 'gzip');
  }

  const mimeType = resolveMimeType(filePath);
  if (mimeType) {
    res.setHeader('Content-Type', mimeType);
  }
}
