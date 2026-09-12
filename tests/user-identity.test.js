import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreateUserId, resetUserId, getShortUserId } from '../src/services/userIdentity.js';

describe('User Identity & Cookie-Free Privacy Compliance', () => {
  let originalWindow;
  let originalDocument;
  let mockStorage;
  let mockCookie;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;

    mockStorage = {};
    mockCookie = '';

    globalThis.window = {};
    globalThis.document = {
      get cookie() {
        return mockCookie;
      },
      set cookie(val) {
        if (val.includes('max-age=0')) {
          mockCookie = '';
        } else {
          mockCookie = val;
        }
      }
    };

    globalThis.localStorage = {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); },
      removeItem: (k) => { delete mockStorage[k]; },
    };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    delete globalThis.localStorage;
  });

  it('generates user id and never sets tracking cookie (§ 25 TDDDG compliance)', () => {
    const userId = getOrCreateUserId();
    assert.ok(userId.length > 0);
    // Cookie must remain empty!
    assert.equal(document.cookie, '', 'Tracking cookie must NOT be set');
    // Stored in localStorage only
    assert.equal(mockStorage['telc_user_id'], userId);
  });

  it('actively purges legacy tracking cookie if one existed', () => {
    mockCookie = 'telc_user_id=legacy-tracking-uuid';
    const userId = getOrCreateUserId();
    assert.ok(userId.length > 0);
    // Legacy cookie must be purged (empty)
    assert.equal(document.cookie, '', 'Legacy tracking cookie must be actively purged');
  });

  it('reuses existing ID from localStorage without touching cookies', () => {
    mockStorage['telc_user_id'] = 'user-stored-12345';
    const userId = getOrCreateUserId();
    assert.equal(userId, 'user-stored-12345');
    assert.equal(document.cookie, '');
  });

  it('resets user identity cleanly from localStorage and purges cookies', () => {
    mockStorage['telc_user_id'] = 'user-to-clear';
    mockCookie = 'telc_user_id=cookie-to-clear';
    resetUserId();
    assert.equal(mockStorage['telc_user_id'], undefined);
    assert.equal(document.cookie, '');
  });

  it('formats short user ID for display', () => {
    assert.equal(getShortUserId(null), '#guest');
    assert.equal(getShortUserId('anonymous'), '#guest');
    assert.equal(getShortUserId('user-abc12345'), '#abc12');
  });
});
