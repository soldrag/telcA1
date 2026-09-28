import { compareFormAnswer, normalizeGermanText } from './schreibenFormAnswerFacts.js';
import { writesAnyNumber, writesNumber } from './schreibenNumberTokens.js';
import { writesDateWithYear } from './schreibenDateNormalizer.js';
import { writesTime } from './schreibenTimeNormalizer.js';
import functionWords from './linguistic/data/functionWords.json' with { type: 'json' };
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

// Words as written, so an abbreviation keeps its dot ("Poststr. 14").
const splitAnswerWords = (text) => text.split(/\s+/).filter((word) => normalizeGermanText(word));

// A number answer counts only when the answer writes no other number: "18. Juni oder 18. Juli" is not "18. Juli".
const writesOtherNumber = (answerWords, start, length) => (
  [...answerWords.slice(0, start), ...answerWords.slice(start + length)].some((word) => writesNumber(word))
);

// "mit Kreditkarte", "am 18. Juli": the expected words appear in the answer in a row, each one accepted.
// Only the numbers must be exact: "Hauptstrase 5" is "Hauptstraße 5", but "19. Juli" or "18. Juni" is not "18. Juli".
function containsAcceptedWords(answer, expected, accepts) {
  const answerWords = splitAnswerWords(answer);
  const expectedWords = splitAnswerWords(expected);
  const isNumberAnswer = writesAnyNumber(expected);
  for (let start = 0; start + expectedWords.length <= answerWords.length; start++) {
    if (isNumberAnswer && writesOtherNumber(answerWords, start, expectedWords.length)) continue;
    if (expectedWords.every((word, i) => accepts(answerWords[start + i], word))) return true;
  }
  return false;
}

const CHOICE_MARKERS = new Set(functionWords.alternativeMarkers);
const NOTE_ANSWER_MARKERS = new Set([...functionWords.alternativeMarkers, ...functionWords.rangeMarkers]);
const BRACKET_NOTE = /\(([^()]*)\)/g;

const containsMarker = (text, markers) => text.toLowerCase().split(/[^\p{L}]+/u).some((word) => markers.has(word));

// An answer that names a choice ("Montag oder Donnerstag") does not say which one is meant, unless the expected
// answer itself is written with the marker. A range ("bis 18 Uhr") is one answer and stays a match.
const namesChoice = (reading, expected) => containsMarker(reading, CHOICE_MARKERS) && !containsMarker(expected, CHOICE_MARKERS);

// "3 (drei)", "3 Personen (2 Erwachsene, 1 Kind)": a note in brackets explains the answer and is not graded,
// unless it offers another answer ("18. Juli (oder 19. Juli)"). "(030) 123456" is read with its brackets opened,
// and the note alone may be the answer ("4 Personen (2 Erwachsene, 2 Kinder)").
function readingsOf(answer) {
  const notes = [...answer.matchAll(BRACKET_NOTE)].map((match) => match[1]);
  const opened = answer.replace(BRACKET_NOTE, ' $1 ').trim();
  if (!notes.length || notes.some((note) => containsMarker(note, NOTE_ANSWER_MARKERS))) return [opened];
  const withoutNotes = answer.replace(BRACKET_NOTE, ' ').trim();
  return [withoutNotes, opened, ...notes].filter(Boolean);
}

// A date with its year anywhere in the answer: "am 05.08.1995 geboren", "5. August 1995 in Porto".
function writesYearSomewhere(reading) {
  const words = splitAnswerWords(reading);
  return words.some((_, end) => writesDateWithYear(words.slice(0, end + 1).join(' ')));
}

// A written year must be the year of the task: when some expected form writes it ("05.08.1996"), a form
// without it ("05.08.") does not accept "05.08.1995".
function expectedFormsFor(reading, acceptedRawList) {
  const withYear = acceptedRawList.filter(writesDateWithYear);
  return withYear.length && writesYearSomewhere(reading) ? withYear : acceptedRawList;
}

// A time is compared as a whole, with its "Uhr" and part of the day: word by word "9 Euro" would find "9" = "9:00".
const matchesWordByWord = (expected) => !writesTime(expected);

export function evaluateTeil1Answer(userAnswer = '', question = {}) {
  const answer = String(userAnswer || '').trim();
  if (!answer) return false;

  const acceptedRawList = extractAcceptedRawList(question);
  if (acceptedRawList.length === 0) return false;

  const regulation = getSchreibenRegulation(question.level);

  return readingsOf(answer).some((reading) => expectedFormsFor(reading, acceptedRawList).some((expected) => {
    const offersAlternative = namesChoice(reading, expected);
    const accepts = (text, expectedText) => (
      regulation.acceptsTeil1Answer({ ...compareFormAnswer(text, expectedText), offersAlternative })
    );
    return accepts(reading, expected) || (matchesWordByWord(expected) && containsAcceptedWords(reading, expected, accepts));
  }));
}
