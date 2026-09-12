/**
 * Service for encoding and decoding exam attempts into a portable URL-safe token.
 * Enables students to share their results with a teacher without requiring server storage.
 */

function encodeBase64Url(str) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(base64url) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64url, 'base64url').toString('utf-8');
  }
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeAttemptToken({ attempt, studentName } = {}) {
  if (!attempt?.exam_id) {
    throw new Error('Attempt must contain an exam_id');
  }

  const payload = {
    v: 1,
    eid: attempt.exam_id,
    type: attempt.test_type || 'lesen',
    ans: attempt.answers || {},
    time: Number(attempt.time_spent_seconds) || 0,
    date: attempt.created_at || new Date().toISOString(),
    name: studentName ? String(studentName).trim().slice(0, 100) : undefined,
  };

  const serialized = JSON.stringify(payload);
  return encodeBase64Url(serialized);
}

export function decodeAttemptToken(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const rawJson = decodeBase64Url(token.trim());
    const data = JSON.parse(rawJson);

    if (data?.v !== 1 || !data?.eid || typeof data.eid !== 'string') {
      return null;
    }

    return {
      examId: data.eid,
      testType: data.type || 'lesen',
      answers: typeof data.ans === 'object' && data.ans !== null ? data.ans : {},
      timeSpentSeconds: Number(data.time) || 0,
      createdAt: data.date || null,
      studentName: data.name ? String(data.name).trim() : null,
    };
  } catch (error) {
    console.warn('[shareTokenService] Failed to decode token:', error);
    return null;
  }
}

export function buildShareUrl({ attempt, studentName, originAndPath } = {}) {
  const token = encodeAttemptToken({ attempt, studentName });
  const base = originAndPath || (
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'http://localhost'
  );
  return `${base}#review=${token}`;
}

export function parseReviewTokenFromUrl(targetUrl) {
  const searchSource = targetUrl || (typeof window !== 'undefined' ? window.location.href : '');
  if (!searchSource) return null;

  try {
    const parsed = new URL(searchSource, 'http://localhost');
    if (parsed.hash.startsWith('#review=')) {
      return parsed.hash.replace('#review=', '').trim();
    }
    const queryToken = parsed.searchParams.get('review');
    return queryToken ? queryToken.trim() : null;
  } catch {
    const hashMatch = searchSource.match(/#review=([^&]+)/);
    return hashMatch ? hashMatch[1].trim() : null;
  }
}

export function clearReviewTokenFromUrl() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState(null, '', cleanUrl);
}
