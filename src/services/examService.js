import {
  getLocalTestTypes,
  getLocalExams,
  getLocalExamDetails,
  submitLocalExamAnswers,
  preloadLocalGrading,
} from './localDataService.js';

// The app is a static site: exams ship with the bundle and answers are graded in the browser.

export async function fetchTestTypes() {
  return getLocalTestTypes();
}

export async function fetchExams(testType = 'lesen') {
  return getLocalExams(testType);
}

export async function fetchExamDetails(examId) {
  if (!examId) throw new Error('examId is required to fetch details');
  return getLocalExamDetails(examId);
}

/** Loads the grading code and data ahead of submit; a failure only means they load on submit instead. */
export function preloadExamGrading(testType = 'schreiben') {
  return preloadLocalGrading(testType).catch(() => {});
}

/** Answers are graded in the browser and never leave the device. */
export async function submitExamAnswers(examId, { answers = {}, timeSpentSeconds = 0, onProgress = null } = {}) {
  if (!examId) throw new Error('examId is required to submit exam answers');
  return submitLocalExamAnswers(examId, { answers, timeSpentSeconds, onProgress });
}
