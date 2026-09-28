/**
 * Compares a time of day: "14:00" = "14 Uhr" = "vierzehn Uhr", "9.30" = "9:30 Uhr", "um 9" = "9 Uhr".
 * "abends um 8" = "20 Uhr". A text with another number ("halb 9", "9 oder 10 Uhr") has no single time.
 */
import { splitNumberWords, numberOf } from './schreibenNumberTokens.js';
import functionWords from './linguistic/data/functionWords.json' with { type: 'json' };
import calendarWords from './linguistic/data/calendarWords.json' with { type: 'json' };

const CLOCK_TIME = /(?<![\d.,])(\d{1,2})(?:\s*[:.]\s*(\d{2}))?(?![\d.,]*\d)/g;
const FILLERS = new Set(functionWords.quantityFillers);
const HOUR_WORDS = new Set(calendarWords.hourWords);
const DAY_PARTS = calendarWords.dayParts;

const isDayPart = (word) => Object.hasOwn(DAY_PARTS, word);

function toMinutes(hours, minutes = 0) {
  const h = Number(String(hours).replace(',', '.'));
  const m = Number(minutes);
  return Number.isInteger(h) && h <= 24 && m < 60 ? h * 60 + m : null;
}

// The words beside the time: "Uhr" is the unit of every time, so it is left out.
const otherWordsOf = (text) => splitNumberWords(text).filter((word) => !numberOf(word) && !FILLERS.has(word) && !HOUR_WORDS.has(word));

function minutesOf(clockTimes, restNumbers) {
  if (clockTimes.length === 1 && !restNumbers.length) return toMinutes(clockTimes[0][1], clockTimes[0][2]);
  if (!clockTimes.length && restNumbers.length === 1) return toMinutes(restNumbers[0]);
  return null;
}

const liesIn = (hour, [from, to]) => (from <= to ? hour >= from && hour <= to : hour >= from || hour <= to);

// A part of the day picks the half of the clock: "abends um 8" is 20:00, and "abends um 9" is not 9 Uhr.
function onDayPart(minutes, words) {
  const part = words.find(isDayPart);
  if (minutes === null || !part) return minutes;
  const hour = Math.floor(minutes / 60);
  const fitting = (hour <= 12 ? [hour, hour + 12] : [hour]).find((h) => liesIn(h, DAY_PARTS[part]));
  return fitting === undefined ? null : minutes + (fitting - hour) * 60;
}

function parseTimeOfDay(str = '') {
  const text = String(str).toLowerCase();
  const clockTimes = [...text.matchAll(CLOCK_TIME)];
  const [clock] = clockTimes;
  const rest = clockTimes.length === 1 ? `${text.slice(0, clock.index)} ${text.slice(clock.index + clock[0].length)}` : text;
  const words = otherWordsOf(rest);
  const minutes = onDayPart(minutesOf(clockTimes, splitNumberWords(rest).map(numberOf).filter(Boolean)), words);
  return minutes === null ? null : { minutes, words, marked: marksTime(text) };
}

// "Uhr", "14:30" or a part of the day ("morgens um 9") shows that a number is a time.
function marksTime(text) {
  return /\d{1,2}:\d{2}/.test(text) || splitNumberWords(text).some((word) => HOUR_WORDS.has(word) || isDayPart(word));
}

/** @returns {boolean} the text writes a time of day: "14:30" or a number with "Uhr" */
export function writesTime(str = '') {
  const text = String(str).toLowerCase();
  return /\d{1,2}:\d{2}/.test(text) || splitNumberWords(text).some((word) => HOUR_WORDS.has(word));
}

const includesAll = (words, others) => words.every((word) => others.includes(word));

// An answer that marks its number as a time may add words ("Montag morgens 9 Uhr" for "Montag, 9 Uhr"),
// but no other words: "9 Euro" is not "9 Uhr", "Dienstag, 9 Uhr" is not "Montag, 9 Uhr".
function wordsAgree(answer, expected) {
  if (includesAll(answer.words, expected.words)) return true;
  return answer.marked && includesAll(expected.words, answer.words.filter((word) => !isDayPart(word)));
}

export function areTimesEquivalent(answer = '', expected = '') {
  const a = parseTimeOfDay(answer);
  const b = parseTimeOfDay(expected);
  return Boolean(a && b) && a.minutes === b.minutes && wordsAgree(a, b);
}
