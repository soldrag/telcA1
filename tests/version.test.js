import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_VERSION,
  COMMIT_HASH,
  getVersionSummary,
  getVersionTooltip,
  isDevEnvironment,
} from '../src/config/version.js';

describe('Application Versioning & Build Metadata', () => {
  // The build injects package.json's version (vite.config.js); tests see the fallback, so only its shape is checked.
  it('exposes a semver version', () => {
    assert.match(APP_VERSION, /^\d+\.\d+\.\d+$/);
  });

  it('exposes commit hash string or fallback', () => {
    assert.equal(typeof COMMIT_HASH, 'string');
    assert.ok(COMMIT_HASH.length > 0);
  });

  it('detects environment correctly', () => {
    const isDev = isDevEnvironment();
    assert.equal(typeof isDev, 'boolean');
  });

  it('formats compact summary string for footer', () => {
    const summary = getVersionSummary();
    assert.ok(summary.startsWith(`v${APP_VERSION} (`));
    assert.ok(summary.includes(COMMIT_HASH));
  });

  it('formats descriptive tooltip string with metadata', () => {
    const tooltip = getVersionTooltip();
    assert.ok(tooltip.includes(`Version: v${APP_VERSION}`));
    assert.ok(tooltip.includes(`Commit: ${COMMIT_HASH}`));
    assert.ok(tooltip.includes('Mode:'));
  });
});
