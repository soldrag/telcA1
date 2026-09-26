/**
 * Closing formula: no comma after the formula, and the case the formula's own grammar requires
 * ("Mit freundliche Grüßen" → Dativ), checked by the sentence rules. Umlaut spelling is umlautSpellingRule.
 */
import { matchClosing } from '../letter/letterFormulaMatcher.js';
import { joinWords } from './letterWording.js';

function checkTrailingComma(words) {
  if (!words.at(-1).raw.endsWith(',')) return [];
  const formula = joinWords(words);
  return [{
    category: 'orthography',
    code: 'ERR_COMMA_AFTER_CLOSING',
    original: `${formula},`,
    correction: formula,
    explanation: `Kommasetzung bei der Grußformel: Im Deutschen steht nach der Grußformel kein Komma: „${formula}“ (nicht „${formula},“)`,
  }];
}

export const closingFormulaRule = {
  id: 'closingFormula',
  check(letter, { checkSentence }) {
    const formula = matchClosing(letter.closing?.text);
    if (!formula) return [];
    return [
      ...checkTrailingComma(formula.words),
      ...checkSentence(formula.words.map((w) => w.word)),
    ];
  },
};
