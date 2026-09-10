import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractUserId } from '../server/services/user-context.js';

describe('User Context Service', () => {
  it('extracts user ID from x-user-id header', () => {
    const req = { headers: { 'x-user-id': 'custom-user-123' } };
    assert.equal(extractUserId(req), 'custom-user-123');
  });

  it('extracts user ID from cookie when header is absent', () => {
    const req = { headers: { cookie: 'other=abc; telc_user_id=cookie-user-456; theme=dark' } };
    assert.equal(extractUserId(req), 'cookie-user-456');
  });

  it('prefers header over cookie when both are present', () => {
    const req = {
      headers: {
        'x-user-id': 'header-user',
        cookie: 'telc_user_id=cookie-user'
      }
    };
    assert.equal(extractUserId(req), 'header-user');
  });

  it('falls back to anonymous if no user identity is provided', () => {
    assert.equal(extractUserId({}), 'anonymous');
    assert.equal(extractUserId(null), 'anonymous');
    assert.equal(extractUserId({ headers: {} }), 'anonymous');
  });
});
