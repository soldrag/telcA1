import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isOnline, subscribeNetworkStatus, registerServiceWorker } from '../src/services/pwaRegister.js';
import { getLanIpAddresses } from '../server/services/network-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('PWA & Offline Capability Contracts', () => {
  it('validates manifest.webmanifest structure and icon references', () => {
    const manifestPath = path.join(rootDir, 'public/manifest.webmanifest');
    assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist in public/');

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(typeof manifestContent.name, 'string', 'manifest must have a name');
    assert.equal(typeof manifestContent.short_name, 'string', 'manifest must have a short_name');
    assert.equal(manifestContent.display, 'standalone', 'display must be standalone for PWA');
    assert.equal(manifestContent.start_url, './', 'start_url must be relative ./ for subpaths');
    assert.ok(Array.isArray(manifestContent.icons), 'icons must be an array');
    assert.ok(manifestContent.icons.length >= 2, 'at least 192 and 512 icons required');

    for (const icon of manifestContent.icons) {
      const iconPath = path.join(rootDir, 'public', icon.src);
      assert.ok(fs.existsSync(iconPath), `Icon file ${icon.src} must exist in public/`);
    }
  });

  it('validates service worker (sw.js) syntax and essential offline handlers', () => {
    const swPath = path.join(rootDir, 'public/sw.js');
    assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');

    const content = fs.readFileSync(swPath, 'utf8');
    assert.ok(content.includes("self.addEventListener('install'"), 'must have install listener');
    assert.ok(content.includes("self.addEventListener('activate'"), 'must have activate listener');
    assert.ok(content.includes("self.addEventListener('fetch'"), 'must have fetch listener');
    assert.ok(content.includes('caches.open'), 'must use Cache API');
    assert.ok(content.includes('handleNavigation'), 'must handle navigation requests');
  });

  it('verifies pwaRegister service utility functions', async () => {
    assert.equal(typeof isOnline(), 'boolean', 'isOnline must return a boolean');

    const unsubscribe = subscribeNetworkStatus(() => {});
    assert.equal(typeof unsubscribe, 'function', 'subscribeNetworkStatus must return an unsubscribe function');
    unsubscribe();

    const reg = await registerServiceWorker();
    assert.equal(reg, null, 'registerServiceWorker should safely return null in non-browser/node environment');
  });

  it('verifies getLanIpAddresses returns array of valid IPv4 strings', () => {
    const ips = getLanIpAddresses();
    assert.ok(Array.isArray(ips), 'getLanIpAddresses must return an array');
    for (const ip of ips) {
      assert.match(ip, /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, `${ip} must be valid IPv4`);
    }
  });
});
