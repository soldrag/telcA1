import { getOrCreateUserId } from './userIdentity.js';
import {
  getLocalTestTypes,
  getLocalExams,
  getLocalExamDetails,
  submitLocalExamAnswers,
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
  const userId = getOrCreateUserId();
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
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

export async function submitExamAnswers(examId, { answers = {}, timeSpentSeconds = 0 } = {}) {
  if (!examId) throw new Error('examId is required to submit exam answers');
  if (isStaticMode() || examId.startsWith('schreiben-')) {
    return submitLocalExamAnswers(examId, { answers, timeSpentSeconds });
  }
  try {
    return await request(`/api/exams/${encodeURIComponent(examId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeSpentSeconds })
    });
  } catch {
    return submitLocalExamAnswers(examId, { answers, timeSpentSeconds });
  }
}

export async function fetchUserAttempts() {
  try {
    return await request('/api/attempts');
  } catch {
    return { attempts: [], userId: getOrCreateUserId() };
  }
}

export async function fetchAttemptDetail(attemptId) {
  if (!attemptId) throw new Error('attemptId is required to fetch attempt detail');
  return request(`/api/attempts/${encodeURIComponent(attemptId)}`);
}
