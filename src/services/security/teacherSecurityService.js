import { uint8ArrayToBase64Url } from '../share/streamCompressor.js';

const STORAGE_KEY = 'telc_teacher_key';

function getSubtleCrypto() {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) is not available in this environment');
}

export function buildCanonicalAssignmentMessage({ aid, eid, created, limit = 0, student = '' } = {}) {
  const normAid = String(aid || '').trim();
  const normEid = String(eid || '').trim();
  const normCreated = String(created || '').trim();
  const normLimit = Number(limit) || 0;
  const normStudent = String(student || '').trim().toLowerCase();
  return `${normAid}|${normEid}|${normCreated}|${normLimit}|${normStudent}`;
}

export function generateTeacherKey() {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomPin = Math.floor(1000 + Math.random() * 9000);
  return `LEHRER-${randomSuffix}-${randomPin}`;
}

export function getStoredTeacherKey() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setTeacherKey(customKey) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const cleanKey = String(customKey || '').trim();
  if (!cleanKey) return null;
  try {
    window.localStorage.setItem(STORAGE_KEY, cleanKey);
    return cleanKey;
  } catch {
    return null;
  }
}

export function getOrCreateTeacherKey() {
  const existing = getStoredTeacherKey();
  if (existing) return existing;
  const newKey = generateTeacherKey();
  setTeacherKey(newKey);
  return newKey;
}

async function importHmacKey(rawKeyString) {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  return await subtle.importKey(
    'raw',
    enc.encode(rawKeyString),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signAssignmentPayload(payload, teacherKey) {
  if (!teacherKey) {
    throw new Error('Teacher key is required to sign an assignment');
  }
  const subtle = getSubtleCrypto();
  const message = buildCanonicalAssignmentMessage(payload);
  const cryptoKey = await importHmacKey(teacherKey);
  const enc = new TextEncoder();
  const signatureBuffer = await subtle.sign('HMAC', cryptoKey, enc.encode(message));
  // 16-byte prefix provides 128-bit MAC security and compact URL tokens
  const truncatedBytes = new Uint8Array(signatureBuffer).slice(0, 16);
  return uint8ArrayToBase64Url(truncatedBytes);
}

export async function verifyAssignmentSignature(payload, signature, teacherKey) {
  if (!signature || !teacherKey) return false;
  try {
    const expectedSig = await signAssignmentPayload(payload, teacherKey);
    return expectedSig === signature;
  } catch {
    return false;
  }
}
