import { getOrCreateUserId } from './userIdentity.js';

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

export function fetchTestTypes() {
  return request('/api/test-types');
}

export function fetchExams(testType = 'lesen') {
  return request(`/api/exams?type=${encodeURIComponent(testType)}`);
}

export function fetchNextRandomExam(testType = 'lesen') {
  return request(`/api/exams/next-random?type=${encodeURIComponent(testType)}`);
}

export function fetchExamDetails(examId) {
  if (!examId) throw new Error('examId is required to fetch details');
  return request(`/api/exams/${encodeURIComponent(examId)}`);
}

export function submitExamAnswers(examId, { answers = {}, timeSpentSeconds = 0 } = {}) {
  if (!examId) throw new Error('examId is required to submit exam answers');
  return request(`/api/exams/${encodeURIComponent(examId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers, timeSpentSeconds })
  });
}

export function fetchUserAttempts() {
  return request('/api/attempts');
}

export function fetchAttemptDetail(attemptId) {
  if (!attemptId) throw new Error('attemptId is required to fetch attempt detail');
  return request(`/api/attempts/${encodeURIComponent(attemptId)}`);
}
