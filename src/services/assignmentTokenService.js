import {
  compressStringToBase64Url,
  decompressBase64UrlToString,
} from './share/streamCompressor.js';
import { signAssignmentPayload } from './security/teacherSecurityService.js';

const TASK_TOKEN_PREFIX = 'zt1.';

function generateAssignmentId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `asg_${ts}_${rand}`;
}

function mapRawToAssignment(data) {
  return {
    assignmentId: data.aid,
    examId: data.eid,
    testType: data.type || 'lesen',
    timeLimitSeconds: Number(data.lim) || 0,
    teacherName: data.tname ? String(data.tname).trim() : null,
    studentName: data.sname ? String(data.sname).trim() : null,
    note: data.note ? String(data.note).trim().slice(0, 200) : null,
    createdAt: data.dt || null,
    signature: data.sig || null,
  };
}

export async function encodeAssignmentToken({
  examId,
  testType = 'lesen',
  timeLimitSeconds = 0,
  teacherName,
  studentName,
  note,
  teacherKey,
} = {}) {
  if (!examId) throw new Error('Assignment must specify an examId');
  if (!teacherKey) throw new Error('Teacher key is required to sign assignment');

  const aid = generateAssignmentId();
  const created = new Date().toISOString();
  const limit = Math.max(0, Number(timeLimitSeconds) || 0);

  const sig = await signAssignmentPayload(
    { aid, eid: examId, created, limit, student: studentName },
    teacherKey
  );

  const payload = {
    v: 1,
    aid,
    eid: examId,
    type: testType,
    lim: limit,
    tname: teacherName ? String(teacherName).trim().slice(0, 60) : undefined,
    sname: studentName ? String(studentName).trim().slice(0, 60) : undefined,
    note: note ? String(note).trim().slice(0, 200) : undefined,
    dt: created,
    sig,
  };

  const serialized = JSON.stringify(payload);
  const compressed = await compressStringToBase64Url(serialized);
  return `${TASK_TOKEN_PREFIX}${compressed}`;
}

export async function decodeAssignmentToken(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const trimmed = token.trim();
    if (!trimmed.startsWith(TASK_TOKEN_PREFIX)) return null;

    const rawJson = await decompressBase64UrlToString(
      trimmed.slice(TASK_TOKEN_PREFIX.length)
    );
    const data = JSON.parse(rawJson);

    if (data?.v !== 1 || !data?.aid || !data?.eid || typeof data.eid !== 'string') {
      return null;
    }

    return mapRawToAssignment(data);
  } catch (error) {
    console.warn('[assignmentTokenService] Failed to decode task token:', error);
    return null;
  }
}

export async function buildAssignmentUrl({
  assignmentConfig,
  originAndPath,
} = {}) {
  const token = await encodeAssignmentToken(assignmentConfig);
  const base = originAndPath || (
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'http://localhost'
  );
  return `${base}#task=${token}`;
}

export function parseAssignmentTokenFromUrl(targetUrl) {
  const searchSource = targetUrl || (typeof window !== 'undefined' ? window.location.href : '');
  if (!searchSource) return null;

  try {
    const parsed = new URL(searchSource, 'http://localhost');
    if (parsed.hash.startsWith('#task=')) {
      return parsed.hash.replace('#task=', '').trim();
    }
    const queryToken = parsed.searchParams.get('task');
    return queryToken ? queryToken.trim() : null;
  } catch {
    const hashMatch = searchSource.match(/#task=([^&]+)/);
    return hashMatch ? hashMatch[1].trim() : null;
  }
}

export function clearAssignmentTokenFromUrl() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState(null, '', cleanUrl);
}
