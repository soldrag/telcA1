import { areDatesEquivalent } from './schreibenDateNormalizer.js';
import { areNumbersEquivalent } from './schreibenNumberNormalizer.js';
import {
  normalizeGermanText,
  normalizeUmlauts,
  isFuzzyWordMatch,
} from './schreibenFuzzyMatcher.js';

function extractAcceptedRawList(question = {}) {
  const rawCorrect = question.correct_answer || '';
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});

  return [
    ...rawCorrect.split('|'),
    ...(options?.accepted_answers || []),
  ].map(s => String(s).trim()).filter(Boolean);
}

function matchTextPhrases(cleanUser, target) {
  if (cleanUser === target) return true;
  if (normalizeUmlauts(cleanUser) === normalizeUmlauts(target)) return true;

  if (target.includes(' ')) {
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(cleanUser);
  }

  const userWords = cleanUser.split(' ');
  if (userWords.includes(target)) return true;

  return userWords.some((word) => isFuzzyWordMatch(word, target));
}

export function evaluateTeil1Answer(userAnswer = '', question = {}) {
  const rawUser = String(userAnswer || '').trim();
  if (!rawUser) return false;

  const acceptedRawList = extractAcceptedRawList(question);
  if (acceptedRawList.length === 0) return false;

  const dateOrNumMatch = acceptedRawList.some((target) => (
    areDatesEquivalent(rawUser, target) || areNumbersEquivalent(rawUser, target)
  ));
  if (dateOrNumMatch) return true;

  const cleanUser = normalizeGermanText(rawUser);
  const acceptedCleanList = acceptedRawList.map(normalizeGermanText).filter(Boolean);

  return acceptedCleanList.some((target) => matchTextPhrases(cleanUser, target));
}
