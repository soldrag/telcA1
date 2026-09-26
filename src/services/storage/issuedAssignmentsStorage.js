/**
 * Assignments a teacher issued from this browser, with the results that came back via #review= links.
 * One link may go to a whole group, so an entry keeps a list of submissions.
 */

const STORAGE_KEY = 'telc_issued';
const MAX_ENTRIES = 50;
const MAX_SUBMISSIONS = 40;
export const ISSUED_CHANGE_EVENT = 'telc-issued-change';

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
    // Quota or private mode: the link itself still works, only the list is lost.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ISSUED_CHANGE_EVENT));
}

export function getIssuedAssignments() {
  return readList();
}

export function saveIssuedAssignment(entry) {
  if (!entry?.assignmentId || !entry?.url) return;
  const record = { submissions: [], issuedAt: new Date().toISOString(), ...entry };
  writeList([record, ...readList().filter((item) => item.assignmentId !== entry.assignmentId)]);
}

function isSameSubmission(a, b) {
  return a.reviewToken === b.reviewToken || (a.submittedAt === b.submittedAt && a.studentName === b.studentName);
}

/** Returns true when the result belongs to an assignment issued here. */
export function recordIssuedSubmission(assignmentId, submission) {
  if (!assignmentId || !submission) return false;
  const list = readList();
  const entry = list.find((item) => item.assignmentId === assignmentId);
  if (!entry) return false;
  const others = (entry.submissions || []).filter((item) => !isSameSubmission(item, submission));
  const updated = { ...entry, submissions: [submission, ...others].slice(0, MAX_SUBMISSIONS) };
  writeList(list.map((item) => (item.assignmentId === assignmentId ? updated : item)));
  return true;
}
