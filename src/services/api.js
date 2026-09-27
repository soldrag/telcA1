import {
  getLocalTestTypes,
  getLocalExams,
  getLocalExamDetails,
  submitLocalExamAnswers,
  preloadLocalGrading,
} from './localDataService.js';

async function parseErrorResponse(response) {
  try {
    const errorData = await response.json();
    return errorData.error || `HTTP error ${response.status}`;
  } catch (parseError) {
    return `HTTP error ${response.status}`;
  }
}

let customFetcher = null;

export function configureApi({ fetcher } = {}) {
  if (fetcher) customFetcher = fetcher;
}

function isStaticMode() {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.endsWith('github.io') ||
    window.location.protocol === 'file:'
  );
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const fetchFn = customFetcher || (typeof window !== 'undefined' ? window.fetch.bind(window) : globalThis.fetch);
  const response = await fetchFn(endpoint, { ...options, headers });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchTestTypes() {
  if (isStaticMode()) return getLocalTestTypes();
  try {
    return await request('/api/test-types');
  } catch {
    return getLocalTestTypes();
  }
}

export async function fetchExams(testType = 'lesen') {
  if (isStaticMode()) return getLocalExams(testType);
  try {
    return await request(`/api/exams?type=${encodeURIComponent(testType)}`);
  } catch {
    return getLocalExams(testType);
  }
}

export async function fetchNextRandomExam(testType = 'lesen') {
  if (isStaticMode()) {
    const { exams } = getLocalExams(testType);
    const randomIndex = Math.floor(Math.random() * exams.length);
    return { exam: exams[randomIndex] || null };
  }
  try {
    return await request(`/api/exams/next-random?type=${encodeURIComponent(testType)}`);
  } catch {
    const { exams } = getLocalExams(testType);
    const randomIndex = Math.floor(Math.random() * exams.length);
    return { exam: exams[randomIndex] || null };
  }
}

export async function fetchExamDetails(examId) {
  if (!examId) throw new Error('examId is required to fetch details');
  if (isStaticMode()) return getLocalExamDetails(examId);
  try {
    return await request(`/api/exams/${encodeURIComponent(examId)}`);
  } catch {
    return getLocalExamDetails(examId);
  }
}

/** Loads the grading code and data ahead of submit; a failure only means they load on submit instead. */
export function preloadExamGrading() {
  return preloadLocalGrading().catch(() => {});
}

/** Answers are graded in the browser and never leave the device. */
export async function submitExamAnswers(examId, { answers = {}, timeSpentSeconds = 0 } = {}) {
  if (!examId) throw new Error('examId is required to submit exam answers');
  return submitLocalExamAnswers(examId, { answers, timeSpentSeconds });
}
