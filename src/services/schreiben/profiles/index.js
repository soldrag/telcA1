/** Registry of grammar profiles by CEFR level; unknown levels fall back to A1 until their profile exists. */
import { A1_GRAMMAR_PROFILE } from './a1GrammarProfile.js';

const PROFILES = new Map([['A1', A1_GRAMMAR_PROFILE]]);

export function getGrammarProfile(level = 'A1') {
  return PROFILES.get(String(level || 'A1').toUpperCase()) || A1_GRAMMAR_PROFILE;
}
