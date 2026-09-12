import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  resolveMimeType,
  getStaticCacheControl,
  createPrecompressedMiddleware,
  configureStaticHeaders,
} from '../server/middleware/static-compression.js';

describe('Static Compression & Caching Middleware', () => {
  it('correctly maps file extensions to MIME types including compressed files', () => {
    assert.strictEqual(resolveMimeType('bundle.js'), 'application/javascript; charset=UTF-8');
    assert.strictEqual(resolveMimeType('bundle.js.br'), 'application/javascript; charset=UTF-8');
    assert.strictEqual(resolveMimeType('bundle.js.gz'), 'application/javascript; charset=UTF-8');
    assert.strictEqual(resolveMimeType('styles.css.br'), 'text/css; charset=UTF-8');
    assert.strictEqual(resolveMimeType('icon.svg'), 'image/svg+xml');
    assert.strictEqual(resolveMimeType('font.woff2'), 'font/woff2');
    assert.strictEqual(resolveMimeType('unknown.xyz'), null);
  });

  it('determines appropriate Cache-Control headers', () => {
    assert.strictEqual(getStaticCacheControl('/app/dist/assets/index-12345.js'), 'public, max-age=31536000, immutable');
    assert.strictEqual(getStaticCacheControl('/app/dist/fonts/inter-latin-400.woff2'), 'public, max-age=31536000, immutable');
    assert.strictEqual(getStaticCacheControl('/app/dist/index.html'), 'no-cache');
    assert.strictEqual(getStaticCacheControl('/'), 'no-cache');
    assert.strictEqual(getStaticCacheControl('/app/dist/favicon.ico'), 'public, max-age=3600');
  });

  it('rewrites URL and sets Vary header when precompressed .br file exists', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-test-'));
    fs.writeFileSync(path.join(tmpDir, 'test.js.br'), 'mock-br-content');

    const middleware = createPrecompressedMiddleware(tmpDir);
    const req = {
      method: 'GET',
      path: '/test.js',
      url: '/test.js',
      headers: { 'accept-encoding': 'gzip, deflate, br' },
    };
    const headersSet = {};
    const res = {
      setHeader(name, val) { headersSet[name] = val; },
    };
    let nextCalled = false;

    middleware(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.url, '/test.js.br');
    assert.strictEqual(headersSet['Vary'], 'Accept-Encoding');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('falls back to .gz if brotli is not supported by client', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-test-'));
    fs.writeFileSync(path.join(tmpDir, 'test.js.gz'), 'mock-gz-content');

    const middleware = createPrecompressedMiddleware(tmpDir);
    const req = {
      method: 'GET',
      path: '/test.js',
      url: '/test.js',
      headers: { 'accept-encoding': 'gzip, deflate' },
    };
    const headersSet = {};
    const res = {
      setHeader(name, val) { headersSet[name] = val; },
    };
    let nextCalled = false;

    middleware(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.url, '/test.js.gz');
    assert.strictEqual(headersSet['Vary'], 'Accept-Encoding');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('sets appropriate headers in configureStaticHeaders', () => {
    const headers = {};
    const res = {
      setHeader(name, val) { headers[name] = val; },
    };

    configureStaticHeaders(res, '/dist/assets/app.js.br');
    assert.strictEqual(headers['Cache-Control'], 'public, max-age=31536000, immutable');
    assert.strictEqual(headers['Content-Encoding'], 'br');
    assert.strictEqual(headers['Content-Type'], 'application/javascript; charset=UTF-8');
  });
});
