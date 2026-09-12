/**
 * Stage 0: Preprocessing (Deterministic, Zero LLM).
 * Handles text normalization, salutation & closing block extraction,
 * body sentence segmentation, and word count calculation.
 */

import { analyzeSalutation } from '../salutationAnalyzer.js';
import { analyzeClosing } from '../closingAnalyzer.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';

export function normalizeRawText(text = '') {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

export function countWords(text = '') {
  return ((text || '').match(/[\p{L}\p{N}]+/gu) || []).length;
}

export function extractBodyText(fullText = '', salutationText = '', closingText = '', senderName = '') {
  let body = fullText;
  if (salutationText) {
    body = body.replace(salutationText, '').trim();
  }
  if (closingText) {
    body = body.replace(closingText, '').trim();
  }
  if (senderName) {
    body = body.replace(senderName, '').trim();
  }
  return body.trim();
}

export function runStage0Preprocessing(rawText = '') {
  const normalized = normalizeRawText(rawText);
  const wordCount = countWords(normalized);

  const salutation = analyzeSalutation(normalized, { isFormal: true });
  const closing = analyzeClosing(normalized, { isFormal: true });

  const bodyText = extractBodyText(
    normalized,
    salutation.recognized ? salutation.text : '',
    closing.recognized ? closing.text : '',
    closing.senderName || ''
  );

  const bodySentences = splitGermanSentences(bodyText);

  return {
    rawText: normalized,
    wordCount,
    salutation,
    closing,
    bodyText,
    bodySentences
  };
}
