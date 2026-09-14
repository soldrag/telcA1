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
  it('exposes semver version matching package.json (0.5.1)', () => {
    assert.equal(APP_VERSION, '0.5.1');
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
    assert.ok(summary.startsWith('v0.5.1 ('));
    assert.ok(summary.includes(COMMIT_HASH));
  });

  it('formats descriptive tooltip string with metadata', () => {
    const tooltip = getVersionTooltip();
    assert.ok(tooltip.includes('Version: v0.5.1'));
    assert.ok(tooltip.includes(`Commit: ${COMMIT_HASH}`));
    assert.ok(tooltip.includes('Mode:'));
  });
});
