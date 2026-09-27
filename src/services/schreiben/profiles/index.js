/** Registry of grammar profiles by CEFR level; a level without a profile is an error (taskLevel.js). */
import { A1_GRAMMAR_PROFILE } from './a1GrammarProfile.js';
import { resolveTaskLevel } from '../taskLevel.js';

const PROFILES = new Map([['A1', A1_GRAMMAR_PROFILE]]);

export function getGrammarProfile(level) {
  return PROFILES.get(resolveTaskLevel(level, PROFILES, 'getGrammarProfile'));
}
