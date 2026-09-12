/**
 * Schreiben evaluation service: text normalization, form field matching, and essay scoring.
 */

export function normalizeAnswer(str = '') {
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

export function matchTextAnswer(userAnswer = '', question = {}) {
  const cleanUser = normalizeAnswer(userAnswer);
  if (!cleanUser) return false;

  const rawCorrect = question.correct_answer || '';
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});

  const acceptedList = [
    ...rawCorrect.split('|'),
    ...(options?.accepted_answers || []),
  ].map(normalizeAnswer).filter(Boolean);

  if (acceptedList.includes(cleanUser)) return true;

  return acceptedList.some(target => cleanUser.includes(target) || target.includes(cleanUser));
}

export function evaluateEssay(userAnswer = '', question = {}) {
  const text = (userAnswer || '').trim();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const maxPoints = question.max_points || 10;

  let points = 0;
  if (wordCount >= 20) {
    points = 10;
  } else if (wordCount >= 10) {
    points = 6;
  } else if (wordCount >= 5) {
    points = 3;
  }

  return {
    word_count: wordCount,
    points_earned: points,
    max_points: maxPoints,
    is_correct: points >= 6,
  };
}
