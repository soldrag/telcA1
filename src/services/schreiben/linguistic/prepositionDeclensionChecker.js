/**
 * Preposition Rektion and Dativ/Akkusativ Declension Checker for German A1.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { lookupWord } from './a1LexiconService.js';

const AKK_PREPS = new Set(['für', 'durch', 'gegen', 'ohne', 'um', 'bis']);
const DAT_PREPS = new Set(['aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu']);
const UNINFLECTED_DETERMINERS = new Set(['mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'ein', 'kein']);

function checkDativDefiniteArticle(prepToken, detToken, nounToken, noun) {
  const prep = prepToken.lower;
  const det = detToken.lower;
  const isZu = prep === 'zu';
  const isBei = prep === 'bei';
  const isVon = prep === 'von';

  if (det === 'der' && noun.gender === 'm') {
    const corr = isZu ? 'zum / zu dem' : (isBei ? 'beim / bei dem' : (isVon ? 'vom / von dem' : `${prepToken.raw} dem`));
    return {
      orig: `${prepToken.raw} ${detToken.raw} ${nounToken.raw}`,
      corr: `${corr} ${nounToken.raw}`,
      expl: `Die Präposition „${prepToken.raw}“ verlangt den Dativ: „${corr} ${nounToken.raw}“ (nicht „${prepToken.raw} der ${nounToken.raw}“).`
    };
  }
  if (det === 'die' && noun.gender === 'f' && noun.number !== 'pl') {
    const corr = isZu ? 'zur / zu der' : `${prepToken.raw} der`;
    return {
      orig: `${prepToken.raw} ${detToken.raw} ${nounToken.raw}`,
      corr: `${corr} ${nounToken.raw}`,
      expl: `Die Präposition „${prepToken.raw}“ verlangt bei femininen Nomen den Dativ: „${corr} ${nounToken.raw}“ (nicht „${prepToken.raw} die ${nounToken.raw}“).`
    };
  }
  if (det === 'den' && noun.gender === 'm' && noun.number !== 'pl') {
    return {
      orig: `${prepToken.raw} den ${nounToken.raw}`,
      corr: `${prepToken.raw} dem ${nounToken.raw}`,
      expl: `Die Präposition „${prepToken.raw}“ verlangt den Dativ: „${prepToken.raw} dem ${nounToken.raw}“ (nicht „${prepToken.raw} den ${nounToken.raw}“).`
    };
  }
  return null;
}

function checkDativDeterminer(prepToken, detToken, nounToken, noun) {
  const det = detToken.lower;
  const isZu = prepToken.lower === 'zu';

  if (UNINFLECTED_DETERMINERS.has(det)) {
    if (noun.gender === 'f') {
      const corrDet = det === 'ein' ? 'einer' : `${det}er`;
      return {
        orig: `${prepToken.raw} ${detToken.raw} ${nounToken.raw}`,
        corr: `${prepToken.raw} ${corrDet} ${nounToken.raw}`,
        expl: `Die Präposition „${prepToken.raw}“ verlangt bei femininen Nomen den Dativ mit der Endung „-er“: „${prepToken.raw} ${corrDet} ${nounToken.raw}“ (nicht „${prepToken.raw} ${detToken.raw} ${nounToken.raw}“).`
      };
    }
    if (noun.gender === 'm' || noun.gender === 'n') {
      const corrDet = det === 'ein' ? 'einem' : `${det}em`;
      const corrPrep = (isZu && det === 'ein') ? 'zu einem / zum' : `${prepToken.raw} ${corrDet}`;
      return {
        orig: `${prepToken.raw} ${detToken.raw} ${nounToken.raw}`,
        corr: `${corrPrep} ${nounToken.raw}`,
        expl: `Die Präposition „${prepToken.raw}“ verlangt im Dativ die Endung „-em“: „${corrPrep} ${nounToken.raw}“ (nicht „${prepToken.raw} ${detToken.raw} ${nounToken.raw}“).`
      };
    }
  }

  if (noun.gender === 'f' && det.endsWith('e')) {
    const detEntry = lookupWord(det).find(e => e.pos === 'DET');
    if (detEntry && Array.isArray(detEntry.case) && !detEntry.case.includes('DAT')) {
      const stem = det.slice(0, -1);
      const corrDet = `${stem}er`;
      return {
        orig: `${prepToken.raw} ${detToken.raw} ${nounToken.raw}`,
        corr: `${prepToken.raw} ${corrDet} ${nounToken.raw}`,
        expl: `Die Präposition „${prepToken.raw}“ verlangt bei femininen Nomen den Dativ mit der Endung „-er“: „${prepToken.raw} ${corrDet} ${nounToken.raw}“ (nicht „${prepToken.raw} ${detToken.raw} ${nounToken.raw}“).`
      };
    }
  }

  return null;
}

function checkDativNumeralPlural(prepToken, numToken, nounToken) {
  if (!prepToken || !numToken || !nounToken) return null;
  const isNum = /^\d+$/.test(numToken.lower) || lookupWord(numToken.lower).some(e => e.pos === 'ADJ' || e.pos === 'NUM');
  if (!isNum) return null;

  const nounLower = nounToken.lower.replace(/[.,!?;:]+$/, '');
  const plNoun = lookupWord(nounLower).find(n => n.pos === 'NOUN' && n.number === 'pl');
  if (!plNoun) return null;

  if (Array.isArray(plNoun.case) && !plNoun.case.includes('DAT')) {
    const corrNoun = nounLower.endsWith('e') ? `${nounToken.raw}n` : `${nounToken.raw}en`;
    return {
      orig: `${prepToken.raw} ${numToken.raw} ${nounToken.raw}`,
      corr: `${prepToken.raw} ${numToken.raw} ${corrNoun}`,
      expl: `Die Präposition „${prepToken.raw}“ verlangt den Dativ Plural: „${prepToken.raw} ${numToken.raw} ${corrNoun}“ (nicht „${prepToken.raw} ${numToken.raw} ${nounToken.raw}“).`
    };
  }
  return null;
}

function checkDativArticlesAndDeterminers(prepToken, detToken, nounToken) {
  if (!prepToken || !detToken || !nounToken) return null;
  const nounLower = nounToken.lower.replace(/[.,!?;:]+$/, '');
  const noun = lookupWord(nounLower).find(e => e.pos === 'NOUN') || null;
  if (!noun) return null;

  return checkDativDefiniteArticle(prepToken, detToken, nounToken, noun)
    || checkDativDeterminer(prepToken, detToken, nounToken, noun);
}

export function checkPrepositionCase(tokens = []) {
  const errors = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const prep = tokens[i].lower;
    const next = tokens[i + 1].lower;
    const nounToken = tokens[i + 2] || null;

    if (AKK_PREPS.has(prep) && (next === 'der' || next === 'dem')) {
      const noun = nounToken ? nounToken.raw : '';
      errors.push({
        category: 'rektion',
        code: 'ERR_PREP_CASE_AKK',
        original: `${tokens[i].raw} ${tokens[i + 1].raw}${noun ? ' ' + noun : ''}`,
        correction: `${tokens[i].raw} den${noun ? ' ' + noun : ''}`,
        explanation: `Die Präposition „${tokens[i].raw}“ verlangt den Akkusativ: „${tokens[i].raw} den${noun ? ' ' + noun : ''}“ (nicht „${tokens[i].raw} ${tokens[i + 1].raw}“).`
      });
    } else if (DAT_PREPS.has(prep)) {
      const datRes = checkDativArticlesAndDeterminers(tokens[i], tokens[i + 1], nounToken)
        || checkDativNumeralPlural(tokens[i], tokens[i + 1], nounToken);
      if (datRes) {
        errors.push({
          category: 'rektion',
          code: 'ERR_PREP_CASE_DAT',
          original: datRes.orig,
          correction: datRes.corr,
          explanation: datRes.expl
        });
      }
    }
  }
  return errors;
}
