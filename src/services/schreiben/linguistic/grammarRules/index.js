/** Registry of level-independent grammar rules; a level profile selects rules by id. */
import { nounPhraseCaseRule } from './nounPhraseCaseRule.js';
import { calendarArticleRule } from './calendarArticleRule.js';
import { numeralPluralRule } from './numeralPluralRule.js';
import { countabilityRule } from './countabilityRule.js';

const RULES = [nounPhraseCaseRule, calendarArticleRule, numeralPluralRule, countabilityRule];

export const GRAMMAR_RULES = Object.freeze(Object.fromEntries(RULES.map((rule) => [rule.id, rule])));
