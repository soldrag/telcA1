/**
 * Local storage manager for assignment lockouts and statuses.
 * Ensures an assignment cannot be re-executed in the same browser once submitted.
 */

const KEY_PREFIX = 'telc_assignment_lockout_';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function getAssignmentState(assignmentId) {
  if (!assignmentId) return null;
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`${KEY_PREFIX}${assignmentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function recordAssignmentStarted(assignmentId, metadata = {}) {
  if (!assignmentId) return;
  const storage = getStorage();
  if (!storage) return;

  try {
    const existing = getAssignmentState(assignmentId) || {};
    const state = {
      ...existing,
      status: existing.status === 'submitted' ? 'submitted' : 'in_progress',
      startedAt: existing.startedAt || new Date().toISOString(),
      ...metadata,
    };
    storage.setItem(`${KEY_PREFIX}${assignmentId}`, JSON.stringify(state));
    return state;
  } catch {
    return null;
  }
}

export function recordAssignmentSubmitted(assignmentId, { shareUrl, telemetry } = {}) {
  if (!assignmentId) return;
  const storage = getStorage();
  if (!storage) return;

  try {
    const existing = getAssignmentState(assignmentId) || {};
    const state = {
      ...existing,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      shareUrl: shareUrl || existing.shareUrl || null,
      telemetry: telemetry || existing.telemetry || null,
    };
    storage.setItem(`${KEY_PREFIX}${assignmentId}`, JSON.stringify(state));
    return state;
  } catch {
    return null;
  }
}

export function isAssignmentSubmitted(assignmentId) {
  const state = getAssignmentState(assignmentId);
  return state?.status === 'submitted';
}
