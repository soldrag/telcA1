import { getOrCreateUserId } from './userIdentity.js';

async function request(endpoint, options = {}) {
  const userId = getOrCreateUserId();
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `HTTP error ${response.status}`;
    throw new Error(message);
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
  return request(`/api/exams/${encodeURIComponent(examId)}`);
}

export function submitExamAnswers(examId, { answers, timeSpentSeconds }) {
  return request(`/api/exams/${encodeURIComponent(examId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers, timeSpentSeconds })
  });
}

export function fetchUserAttempts() {
  return request('/api/attempts');
}

export function fetchAttemptDetail(attemptId) {
  return request(`/api/attempts/${encodeURIComponent(attemptId)}`);
}
