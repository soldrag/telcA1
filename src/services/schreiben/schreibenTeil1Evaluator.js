import { compareFormAnswer, normalizeGermanText } from './schreibenFormAnswerFacts.js';
import { getSchreibenRegulation } from './regulations/index.js';

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

// "mit Kreditkarte", "am 18. Juli": the expected words appear in the answer in a row, each one accepted.
// Each word is compared knowing its whole expected answer, so "Juni" is not one typo from "Juli" in "18. Juli".
function containsAcceptedWords(answer, expected, accepts) {
  const answerWords = normalizeGermanText(answer).split(' ');
  const expectedWords = normalizeGermanText(expected).split(' ');
  for (let start = 0; start + expectedWords.length <= answerWords.length; start++) {
    if (expectedWords.every((word, i) => accepts(answerWords[start + i], word, expected))) return true;
  }
  return false;
}

export function evaluateTeil1Answer(userAnswer = '', question = {}) {
  const answer = String(userAnswer || '').trim();
  if (!answer) return false;

  const acceptedRawList = extractAcceptedRawList(question);
  if (acceptedRawList.length === 0) return false;

  const regulation = getSchreibenRegulation(question.level);
  const accepts = (text, expected, expectedPhrase) => (
    regulation.acceptsTeil1Answer(compareFormAnswer(text, expected, expectedPhrase))
  );

  return acceptedRawList.some((expected) => (
    accepts(answer, expected) || containsAcceptedWords(answer, expected, accepts)
  ));
}
