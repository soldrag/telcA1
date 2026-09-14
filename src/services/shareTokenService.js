/**
 * Service for encoding and decoding exam attempts into a portable URL-safe token.
 * Enables students to share their results with a teacher without requiring server storage.
 * Supports compact deflate-raw compression with full backward compatibility for legacy v1 tokens.
 */

import {
  compressStringToBase64Url,
  decompressBase64UrlToString,
} from './share/streamCompressor.js';

const COMPRESSED_TOKEN_PREFIX = 'z2.';

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

function mapPayloadToAttempt(data) {
  return {
    examId: data.eid,
    testType: data.type || 'lesen',
    answers: typeof data.ans === 'object' && data.ans !== null ? data.ans : {},
    timeSpentSeconds: Number(data.time) || 0,
    createdAt: data.date || null,
    studentName: data.name ? String(data.name).trim() : null,
    assignmentId: data.aid || null,
    teacherSignature: data.sig || null,
    assignmentCreatedAt: data.adt || null,
    assignmentTimeLimit: typeof data.alim === 'number' ? data.alim : null,
    telemetry: data.tel || null,
  };
}

export async function encodeAttemptToken({ attempt, studentName } = {}) {
  if (!attempt?.exam_id) {
    throw new Error('Attempt must contain an exam_id');
  }

  const payload = {
    v: 2,
    eid: attempt.exam_id,
    type: attempt.test_type || 'lesen',
    ans: attempt.answers || {},
    time: Number(attempt.time_spent_seconds) || 0,
    date: attempt.created_at || new Date().toISOString(),
    name: studentName ? String(studentName).trim().slice(0, 100) : undefined,
    aid: attempt.assignment_id || attempt.assignmentId || undefined,
    sig: attempt.teacher_signature || attempt.teacherSignature || undefined,
    adt: attempt.assignment_created_at || attempt.assignmentCreatedAt || undefined,
    alim: typeof attempt.assignment_time_limit === 'number'
      ? attempt.assignment_time_limit
      : (typeof attempt.assignmentTimeLimit === 'number' ? attempt.assignmentTimeLimit : undefined),
    tel: attempt.telemetry || undefined,
  };

  const serialized = JSON.stringify(payload);
  const compressed = await compressStringToBase64Url(serialized);
  return `${COMPRESSED_TOKEN_PREFIX}${compressed}`;
}

export async function decodeAttemptToken(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const trimmed = token.trim();
    const isCompressed = trimmed.startsWith(COMPRESSED_TOKEN_PREFIX);

    const rawJson = isCompressed
      ? await decompressBase64UrlToString(trimmed.slice(COMPRESSED_TOKEN_PREFIX.length))
      : decodeBase64Url(trimmed);

    const data = JSON.parse(rawJson);
    if ((data?.v !== 1 && data?.v !== 2) || !data?.eid || typeof data.eid !== 'string') {
      return null;
    }

    return mapPayloadToAttempt(data);
  } catch (error) {
    console.warn('[shareTokenService] Failed to decode token:', error);
    return null;
  }
}

export async function buildShareUrl({ attempt, studentName, originAndPath } = {}) {
  const token = await encodeAttemptToken({ attempt, studentName });
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
