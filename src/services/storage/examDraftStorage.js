import { isExamDraft } from '../../utils/examDraft.js';

/**
 * @typedef {object} ExamDraftStorage
 * @property {() => import('../../utils/examDraft.js').ExamDraft | null} read  the saved draft; null if none or unreadable
 * @property {(draft: import('../../utils/examDraft.js').ExamDraft) => void} save
 * @property {() => void} clear
 */

const STORAGE_KEY = 'telc_exam_draft';

/** One draft survives a reload; private mode or blocked storage just means nothing is kept. */
export const localExamDraft = {
  read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return isExamDraft(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  save(draft) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch { /* private mode or full: keep going without a draft */ }
  },
  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* nothing to clear */ }
  },
};
