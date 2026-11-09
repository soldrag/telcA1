/**
 * Macro structure of a letter: Anrede (salutation), body, Grußformel (closing) and Unterschrift (signature).
 * Formulas are recognised by letterFormulaMatcher from data/letterFormulas.json; this module only segments
 * and rates their register. Grammar inside the formulas is checked by the letter rules of the grammar engine.
 */
import { matchSalutation, matchClosing, findLastClosingOffset } from './letter/letterFormulaMatcher.js';

const SALUTATION_PUNCTUATION_WINDOW = 60;
const CLOSING_SEARCH_LINES = 3;

function findSalutationCut(text = '') {
  if (!matchSalutation(text)) return -1;
  const punctIdx = text.search(/[,!]/);
  return punctIdx !== -1 && punctIdx < SALUTATION_PUNCTUATION_WINDOW ? punctIdx + 1 : -1;
}

function splitSingleLineBlocks(text = '') {
  let res = text;
  const salCut = findSalutationCut(res);
  if (salCut !== -1) {
    res = `${res.slice(0, salCut).trim()}\n${res.slice(salCut).trim()}`;
  }
  const closingCut = findLastClosingOffset(res);
  if (closingCut !== -1) {
    res = `${res.slice(0, closingCut).trim()}\n${res.slice(closingCut).trim()}`;
  }
  return res;
}

function normalizeLines(rawText = '') {
  const text = String(rawText || '').replace(/\r\n?/g, '\n');
  return splitSingleLineBlocks(text)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
}

// A formula fits the task's register, or is semi-formal ("Hallo", "Viele Grüße"), which suits any addressee; a
// formal formula to a friend is as atypical as an informal one to a stranger (reglament §6).
function fitsRegister(register, isFormalRequired) {
  if (register === 'semiFormal') return true;
  return isFormalRequired ? register !== 'informal' : register !== 'formal';
}

function parseSalutation(line = '', isFormalRequired = true) {
  const formula = matchSalutation(line);
  if (!formula) return { recognized: false, score: 0, text: '', register: 'none' };
  const punctMatch = line.match(/([,!.])$/);
  return {
    recognized: true,
    score: fitsRegister(formula.register, isFormalRequired) ? 2 : 1,
    text: line,
    register: formula.register,
    punctuation: punctMatch ? punctMatch[1] : '',
  };
}

// The sender's name is no criterion of the Kommunikative Gestaltung: only the formula and its register are rated.
function rateClosing({ register, isFormalRequired }) {
  return fitsRegister(register, isFormalRequired) ? 2 : 1;
}

function readSenderName(lines, index, formula) {
  if (index + 1 < lines.length) return lines.slice(index + 1).join(' ').trim();
  return formula.trailing.replace(/^[!.,;\s]+/, '').trim();
}

function findClosingLine(lines, startFrom) {
  const windowStart = Math.max(startFrom, lines.length - CLOSING_SEARCH_LINES);
  const order = [...lines.keys()].slice(windowStart).concat([...lines.keys()].slice(startFrom, windowStart));
  for (const index of order) {
    const formula = matchClosing(lines[index]);
    if (formula) return { index, formula: { ...formula, trailing: lines[index].slice(formula.words.at(-1).start + formula.words.at(-1).raw.length) } };
  }
  return null;
}

function parseClosingAndSignature(lines = [], startFrom = 1, isFormalRequired = true) {
  const found = findClosingLine(lines, startFrom);
  if (!found) return { closingIdx: -1, recognized: false, score: 0, text: '', senderName: '', hasName: false };
  const senderName = readSenderName(lines, found.index, found.formula);
  return {
    closingIdx: found.index,
    recognized: true,
    score: rateClosing({ register: found.formula.register, isFormalRequired }),
    register: found.formula.register,
    text: lines[found.index],
    senderName,
    hasName: Boolean(senderName),
  };
}

function extractBodyAndSentences(lines = [], salutationEnd = 0, closingStart = -1) {
  const end = closingStart !== -1 ? closingStart : lines.length;
  const bodyText = lines.slice(salutationEnd + 1, end).join(' ').trim();
  const bodySentences = bodyText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  return { bodyText, bodySentences };
}

export function segmentMacroStructure(rawText = '', { isFormalRequired = true } = {}) {
  const lines = normalizeLines(rawText);
  if (lines.length === 0) {
    return { anrede: { recognized: false, score: 0 }, closing: { recognized: false, score: 0 }, bodyText: '', bodySentences: [] };
  }

  const salutation = parseSalutation(lines[0], isFormalRequired);
  const salutationIdx = salutation.recognized ? 0 : -1;
  const closing = parseClosingAndSignature(lines, salutationIdx + 1, isFormalRequired);
  const { bodyText, bodySentences } = extractBodyAndSentences(lines, salutationIdx, closing.closingIdx);

  return {
    anrede: salutation,
    closing,
    bodyText,
    bodySentences,
    wordCount: (bodyText.match(/[\p{L}\p{N}]+/gu) || []).length
  };
}
