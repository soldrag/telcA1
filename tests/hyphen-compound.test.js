import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lookupWord } from '../src/services/schreiben/linguistic/a1LexiconService.js';
import { resolveHyphenCompoundNouns } from '../src/services/schreiben/linguistic/hyphenCompound.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { findSeedQuestion } from './helpers/regressionFixtures.js';

const nounHead = [{ pos: 'NOUN', lemma: 'Wohnung', gender: 'f', number: 'sg' }];
const lookupWohnung = (part) => (part === 'Wohnung' ? nounHead : []);

describe('hyphenated compounds are read by their last part', () => {
  it('gives a compound the noun readings of its head', () => {
    assert.deepEqual(resolveHyphenCompoundNouns('2-Zimmer-Wohnung', lookupWohnung), nounHead);
    assert.deepEqual(resolveHyphenCompoundNouns('Drei-Zimmer-Wohnung', lookupWohnung), nounHead);
  });

  it('leaves words without a capitalised alphabetic head unknown', () => {
    for (const word of ['Wohnung', 'E-mail', 'Wi-Fi', '3-4', 'Zimmer-3', 'ein-', 'Köln-Ehrenfeld']) {
      assert.deepEqual(resolveHyphenCompoundNouns(word, lookupWohnung), [], word);
    }
  });

  it('does not read a head the dictionary knows only as a verb as a noun', () => {
    const verbOnly = () => [{ pos: 'VERB_FIN', lemma: 'machen' }];
    assert.deepEqual(resolveHyphenCompoundNouns('Wohn-Machen', verbOnly), []);
  });

  it('is wired into the lexicon lookup; a known word keeps its own readings', () => {
    assert.equal(lookupWord('2-Zimmer-Wohnung')[0]?.gender, 'f');
    assert.deepEqual(lookupWord('Anna-Xyzqq'), []);
  });
});

describe('a missing article before a hyphenated compound is flagged like one before its head', () => {
  const grade = async (body) => gradeSchreibenSubmission({
    userText: `Sehr geehrte Frau Neumann,\n\n${body}\n\nMit freundlichen Grüßen\nAnna Beispiel`,
    question: await findSeedQuestion('s7-q6'),
    provider: new NoneProvider(),
  });
  const articleErrors = (res) => res.grammar_errors.filter((e) => e.code === 'ERR_MISSING_ARTICLE');

  it('flags the bare compound', async () => {
    assert.equal(articleErrors(await grade('ich suche 2-Zimmer-Wohnung in Köln.')).length, 1);
  });

  it('accepts the compound with an article, a name and a place compound', async () => {
    for (const body of ['ich suche eine 2-Zimmer-Wohnung in Köln.', 'ich heiße Anna-Maria.', 'ich wohne in Köln-Ehrenfeld.', 'Die 3-Zimmer-Wohnung ist schön.']) {
      assert.equal(articleErrors(await grade(body)).length, 0, body);
    }
  });
});
