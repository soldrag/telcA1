/**
 * Renders a language-neutral examiner feedback descriptor into localized text (RU/EN).
 * Pure and synchronous: called at display time with the current UI language.
 */

import { interpolate } from '../../../i18n/interpolate.js';
import { EXAMINER_PHRASES } from './examinerPhraseBank.js';
import { formatStudentQuote } from './studentQuoteFormatter.js';

const QUOTED_PARAMS = Object.freeze(['quote', 'correction', 'criterion', 'missingAspect']);

function resolveBankLanguage(language) {
  return EXAMINER_PHRASES[language] ? language : 'en';
}

function formatParams(params = {}, language) {
  const formatted = { ...params };
  for (const key of QUOTED_PARAMS) {
    if (params[key] !== undefined) formatted[key] = formatStudentQuote(params[key], language);
  }
  return formatted;
}

function renderEntry({ code, params } = {}, language) {
  const template = EXAMINER_PHRASES[language][code];
  return template ? interpolate(template, formatParams(params, language)) : '';
}

/**
 * @param {{ summary?: Array, bullets?: Array }|null} descriptor
 * @param {string} language
 * @returns {{ summary: string, bulletPoints: Array<{category: string, status: string, text: string}>, language: string }|null}
 */
export function renderExaminerFeedback(descriptor, language = 'en') {
  if (!descriptor || !Array.isArray(descriptor.summary)) return null;
  const lang = resolveBankLanguage(language);
  const bulletPoints = (descriptor.bullets || [])
    .map((b) => ({ category: b.category, status: b.status, text: renderEntry(b, lang) }))
    .filter((b) => b.text);
  const summary = descriptor.summary.map((e) => renderEntry(e, lang)).filter(Boolean).join(' ');
  return { summary, bulletPoints, language: lang };
}
