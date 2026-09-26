/** Registry of level-independent letter rules (salutation, closing, whole body); a level profile selects them by id. */
import { salutationAgreementRule } from './salutationAgreementRule.js';
import { salutationCommaCaseRule } from './salutationCommaCaseRule.js';
import { closingFormulaRule } from './closingFormulaRule.js';
import { nounCapitalizationRule } from './nounCapitalizationRule.js';
import { umlautSpellingRule } from './umlautSpellingRule.js';

const RULES = [salutationAgreementRule, salutationCommaCaseRule, closingFormulaRule, nounCapitalizationRule, umlautSpellingRule];

export const LETTER_RULES = Object.freeze(Object.fromEntries(RULES.map((rule) => [rule.id, rule])));
