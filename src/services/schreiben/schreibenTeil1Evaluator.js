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
// A word of a number or date answer counts as a number too, so "Juni" is not one typo from "Juli" in "18. Juli".
function containsAcceptedWords(answer, expected, accepts) {
  const answerWords = normalizeGermanText(answer).split(' ');
  const expectedWords = normalizeGermanText(expected).split(' ');
  const inNumberAnswer = /\d/.test(expected);
  for (let start = 0; start + expectedWords.length <= answerWords.length; start++) {
    if (expectedWords.every((word, i) => accepts(answerWords[start + i], word, inNumberAnswer))) return true;
  }
  return false;
}

export function evaluateTeil1Answer(userAnswer = '', question = {}) {
  const answer = String(userAnswer || '').trim();
  if (!answer) return false;

  const acceptedRawList = extractAcceptedRawList(question);
  if (acceptedRawList.length === 0) return false;

  const regulation = getSchreibenRegulation(question.level);
  const accepts = (text, expected, inNumberAnswer = false) => {
    const facts = compareFormAnswer(text, expected);
    return regulation.acceptsTeil1Answer({ ...facts, hasDigits: facts.hasDigits || inNumberAnswer });
  };

  return acceptedRawList.some((expected) => (
    accepts(answer, expected) || containsAcceptedWords(answer, expected, accepts)
  ));
}
