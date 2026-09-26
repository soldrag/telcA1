/**
 * Assignments a student opened from teacher links, kept in this browser so they
 * stay listed on the home screen after the #task= hash is gone.
 */

const STORAGE_KEY = 'telc_assignments';
const MAX_ENTRIES = 30;

function readList() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    // Quota or private mode: the list is a convenience, the assignment itself still works.
  }
}

export function getReceivedAssignments() {
  return readList();
}

export function saveReceivedAssignment(assignment, token) {
  if (!assignment?.assignmentId || !token) return;
  const list = readList();
  const existing = list.find((item) => item.assignmentId === assignment.assignmentId);
  const entry = {
    ...existing,
    assignmentId: assignment.assignmentId,
    examId: assignment.examId,
    testType: assignment.testType,
    note: assignment.note || null,
    teacherName: assignment.teacherName || null,
    timeLimitSeconds: assignment.timeLimitSeconds || 0,
    deadline: assignment.deadline || null,
    token,
    receivedAt: existing?.receivedAt || new Date().toISOString(),
  };
  writeList([entry, ...list.filter((item) => item.assignmentId !== assignment.assignmentId)]);
}

export function recordReceivedAssignmentResult(assignmentId, { score } = {}) {
  if (!assignmentId) return;
  const list = readList();
  const updated = list.map((item) => (item.assignmentId === assignmentId
    ? { ...item, score: score ?? null, submittedAt: new Date().toISOString() }
    : item));
  writeList(updated);
}
