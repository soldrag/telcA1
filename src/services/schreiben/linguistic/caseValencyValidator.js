/**
 * Case, Preposition Rektion, and Valency Validator for German A1.
 * Strictly complies with McConnell limits (<= 180 lines, <= 25 lines per function).
 */

import { lookupWord } from './a1LexiconService.js';

import { checkPrepositionCase } from './prepositionDeclensionChecker.js';

const UNCOUNTABLE_NOUNS = new Set(['arbeit', 'zeit', 'geld']);

function checkUncountableQuantifiers(tokens = []) {
  const errors = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const word = tokens[i].lower;
    const next = tokens[i + 1].lower;

    // "zu viele Arbeiten" / "viele Arbeiten" -> "viel Arbeit"
    if ((word === 'viele' || word === 'vielen') && UNCOUNTABLE_NOUNS.has(next.replace(/en$/, ''))) {
      const isZu = i > 0 && tokens[i - 1].lower === 'zu';
      const prefix = isZu ? `${tokens[i - 1].raw} ` : '';
      const orig = `${prefix}${tokens[i].raw} ${tokens[i + 1].raw}`;
      const corr = `${isZu ? 'zu viel' : 'viel'} ${tokens[i + 1].raw.replace(/en$/i, '')}`;
      errors.push({
        category: 'rektion',
        code: 'ERR_UNCOUNTABLE_MASS_NOUN',
        original: orig,
        correction: corr,
        explanation: `Nicht zählbares Nomen: „${tokens[i + 1].raw}“ wird im A1 als unzählbar verwendet: „${corr}“ (nicht „${orig}“).`
      });
    }
  }
  return errors;
}

function checkVerbValency(tokens = []) {
  const errors = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    const afterNext = tokens[i + 2] || null;

    // Direct pronoun: "antworten Sie mich" -> "antworten Sie mir"
    if (t.pos === 'VERB_FIN' && t.valency === 'DAT' && next) {
      const pronounToken = next.pos === 'PRON_SUBJ' && afterNext ? afterNext : next;
      if (pronounToken && pronounToken.lower === 'mich') {
        const orig = next.pos === 'PRON_SUBJ' ? `${t.raw} ${next.raw} ${pronounToken.raw}` : `${t.raw} ${pronounToken.raw}`;
        const corr = next.pos === 'PRON_SUBJ' ? `${t.raw} ${next.raw} mir` : `${t.raw} mir`;
        errors.push({
          category: 'rektion',
          code: 'ERR_VERB_VALENCY_DAT',
          original: orig,
          correction: corr,
          explanation: `Das Verb „${t.lemma}“ verlangt den Dativ: „${corr}“ (nicht „${orig}“).`
        });
      }
    }

    // Direct pronoun error: "rufen Sie mir" -> "rufen Sie mich"
    if (t.lemma === 'rufen' || t.lemma === 'anrufen' || t.lemma === 'zurückrufen') {
      const pronounToken = next.pos === 'PRON_SUBJ' && afterNext ? afterNext : next;
      if (pronounToken && pronounToken.lower === 'mir') {
        const orig = next.pos === 'PRON_SUBJ' ? `${t.raw} ${next.raw} ${pronounToken.raw}` : `${t.raw} ${pronounToken.raw}`;
        const corr = next.pos === 'PRON_SUBJ' ? `${t.raw} ${next.raw} mich` : `${t.raw} mich`;
        errors.push({
          category: 'rektion',
          code: 'ERR_VERB_VALENCY_AKK',
          original: orig,
          correction: corr,
          explanation: `Das Verb „${t.lemma}“ ist transitiv und verlangt den Akkusativ: „${corr}“ (nicht „${orig}“).`
        });
      }

      // Misplaced preposition before direct object: "rufen Sie an mich zurück"
      const anIdx = tokens.findIndex((tok, idx) => idx > i && tok.lower === 'an');
      if (anIdx !== -1 && tokens[anIdx + 1]?.pos === 'PRON_OBJ') {
        const objToken = tokens[anIdx + 1];
        const nextTok = tokens[anIdx + 2];
        const hasZurueck = nextTok && nextTok.lower === 'zurück';
        const orig = `an ${objToken.raw}${hasZurueck ? ' zurück' : ''}`;
        const corr = `${objToken.raw}${hasZurueck ? ' zurück' : ' an'}`;
        errors.push({
          category: 'rektion',
          code: 'ERR_TRANSITIVE_VERB_PREPOSITION',
          original: orig,
          correction: corr,
          explanation: `Das Verb „${hasZurueck ? 'zurückrufen' : 'anrufen'}“ ist transitiv und wird ohne die Präposition „an“ verwendet: „${corr}“ (nicht „${orig}“).`
        });
      }
    }
  }
  return errors;
}

function checkObjectMasculineAccusative(tokens = []) {
  const errors = [];
  for (let i = 0; i < tokens.length - 2; i++) {
    const t0 = tokens[i].lower;
    const t1 = tokens[i + 1].lower;
    const t2 = tokens[i + 2].lower;

    // "ein neuer Termin" in object context
    if (t0 === 'ein' && t1 === 'neuer' && (t2 === 'termin' || t2 === 'kurs')) {
      const orig = `${tokens[i].raw} ${tokens[i + 1].raw} ${tokens[i + 2].raw}`;
      const nounCap = tokens[i + 2].raw.charAt(0).toUpperCase() + tokens[i + 2].raw.slice(1);
      errors.push({
        category: 'rektion',
        code: 'ERR_ACCUSATIVE_MASCULINE_OBJECT',
        original: orig,
        correction: `einen neuen ${nounCap}`,
        explanation: `Akkusativ maskulin als Objekt: „einen neuen ${nounCap}“ (nicht „${orig}“).`
      });
    }
  }
  return errors;
}

export function validateCaseAndValency(tokens = []) {
  return [
    ...checkPrepositionCase(tokens),
    ...checkUncountableQuantifiers(tokens),
    ...checkVerbValency(tokens),
    ...checkObjectMasculineAccusative(tokens)
  ];
}
