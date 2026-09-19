/**
 * Pure pedagogical tutor feedback resolver for Schreiben criteria.
 * Resolves 1-sentence localized explanations for each criterion score.
 * Clean Architecture & McConnell limits: <= 120 lines, <= 25 lines per function.
 */

import { DIAGNOSTIC_CODES } from './feedbackContracts.js';

const TUTOR_MESSAGES = {
  ru: {
    LP_INVERTED_DEFECT: 'Пункт не зачтён (0/2): в тексте сказано, что прибор исправен, а требовалось сообщить о поломке.',
    LP_INVERTED_REQUEST: 'Пункт не зачтён (0/2): в тексте выражен отказ от мастера/помощи, а требовалось попросить о визите.',
    LP_INVERTED_CANCEL: 'Пункт не зачтён (0/2): отмена встречи не выражена или смысл отменён.',
    LP_INVERTED_GENERAL: 'Пункт не зачтён (0/2): формулировка противоречит заданию.',
    LP_FRAME_VIOLATION: 'Смысловая неточность: нарушение ролей или логики высказывания.',
    LP_MISSING: 'Пункт не найден (0/2): в письме нет информации по этому требованию.',
    LP_PARTIAL: 'Пункт раскрыт частично (1/2): тема упомянута, но не хватает деталей.',
    LP_FULFILLED: 'Пункт раскрыт полностью (2/2): смысл передан верно и понятно.',

    ANREDE_PERFECT: 'Обращение подобрано верно и соответствует официальному стилю (2/2).',
    ANREDE_MINOR_FLAW: 'Обращение есть, но содержит неточность в падеже, стиле или пунктуации (1/2).',
    ANREDE_MISSING: 'В начале письма отсутствует подходящее обращение (0/2).',

    GRUSS_PERFECT: 'Прощальная формула и имя автора указаны верно (2/2).',
    GRUSS_INCOMPLETE: 'Прощальная формула или имя автора неполные (1/2).',
    GRUSS_MISSING: 'В конце письма отсутствует прощальная формула или имя автора (0/2).',
  },
  en: {
    LP_INVERTED_DEFECT: 'Point missed (0/2): the text states the appliance works, but the task required reporting a defect.',
    LP_INVERTED_REQUEST: 'Point missed (0/2): the text refuses a technician/help, while the task required requesting a visit.',
    LP_INVERTED_CANCEL: 'Point missed (0/2): appointment cancellation was not expressed or negated.',
    LP_INVERTED_GENERAL: 'Point missed (0/2): the statement contradicts the required task prompt.',
    LP_FRAME_VIOLATION: 'Semantic flaw: communicative role reversal or sentence frame violation.',
    LP_MISSING: 'Point missing (0/2): no matching statement for this requirement was found.',
    LP_PARTIAL: 'Point partially addressed (1/2): topic mentioned, but key details are missing.',
    LP_FULFILLED: 'Point fully addressed (2/2): clearly conveyed and matches the requirement.',

    ANREDE_PERFECT: 'Salutation is appropriate and formally correct (2/2).',
    ANREDE_MINOR_FLAW: 'Salutation is present, but has minor case, register, or punctuation flaws (1/2).',
    ANREDE_MISSING: 'Missing appropriate salutation at the start of the letter (0/2).',

    GRUSS_PERFECT: 'Closing formula and sender name are complete and appropriate (2/2).',
    GRUSS_INCOMPLETE: 'Closing formula or sender name is incomplete (1/2).',
    GRUSS_MISSING: 'Missing closing formula or sender name at the end of the letter (0/2).',
  },
  de: {
    LP_INVERTED_DEFECT: 'Inhaltspunkt nicht erfüllt (0/2): Es wurde beschrieben, dass das Gerät funktioniert, statt den Defekt zu melden.',
    LP_INVERTED_REQUEST: 'Inhaltspunkt nicht erfüllt (0/2): Der Handwerker/die Hilfe wurde abgelehnt, statt darum zu bitten.',
    LP_INVERTED_CANCEL: 'Inhaltspunkt nicht erfüllt (0/2): Der Termin wurde nicht wie gefordert abgesagt.',
    LP_INVERTED_GENERAL: 'Inhaltspunkt nicht erfüllt (0/2): Die Aussage widerspricht der Aufgabenstellung.',
    LP_FRAME_VIOLATION: 'Sinnfehler: Rollenvertauschung oder fehlerhafter Satzrahmen.',
    LP_MISSING: 'Inhaltspunkt fehlt (0/2): Im Text wurden keine passenden Angaben hierzu gefunden.',
    LP_PARTIAL: 'Inhaltspunkt teilweise bearbeitet (1/2): Das Thema wird erwähnt, es fehlen jedoch Einzelheiten.',
    LP_FULFILLED: 'Inhaltspunkt vollständig erfüllt (2/2): Verständlich und themengerecht bearbeitet.',

    ANREDE_PERFECT: 'Die Anrede ist passend und formal korrekt gewählt (2/2).',
    ANREDE_MINOR_FLAW: 'Die Anrede ist vorhanden, weist jedoch kleinere Formfehler auf (1/2).',
    ANREDE_MISSING: 'Es fehlt eine passende Anrede zu Beginn des Briefes (0/2).',

    GRUSS_PERFECT: 'Grußformel und Name am Schluss sind vollständig und passend (2/2).',
    GRUSS_INCOMPLETE: 'Die Grußformel oder der Name am Schluss ist unvollständig (1/2).',
    GRUSS_MISSING: 'Es fehlt eine Grußformel oder ein Name am Ende des Briefes (0/2).',
  }
};

function resolveFallbackByScore(criterionId, score, langDict) {
  if (criterionId === 'anrede') {
    return score >= 2 ? langDict.ANREDE_PERFECT : (score === 1 ? langDict.ANREDE_MINOR_FLAW : langDict.ANREDE_MISSING);
  }
  if (criterionId === 'gruss') {
    return score >= 2 ? langDict.GRUSS_PERFECT : (score === 1 ? langDict.GRUSS_INCOMPLETE : langDict.GRUSS_MISSING);
  }
  return score >= 2 ? langDict.LP_FULFILLED : (score === 1 ? langDict.LP_PARTIAL : langDict.LP_MISSING);
}

export function resolveTutorCriterionFeedback({
  criterionId = '',
  score = 0,
  diagnosticCode = '',
  matchedSentence = '',
  language = 'ru'
}) {
  const langKey = TUTOR_MESSAGES[language] ? language : 'de';
  const langDict = TUTOR_MESSAGES[langKey];

  let baseNote = (diagnosticCode && langDict[diagnosticCode])
    ? langDict[diagnosticCode]
    : resolveFallbackByScore(criterionId, score, langDict);

  if (matchedSentence && typeof matchedSentence === 'string' && matchedSentence.length <= 60 && diagnosticCode?.startsWith('LP_INVERTED')) {
    const quote = matchedSentence.trim().replace(/[.,!?;:]+$/, '');
    const quoteSuffix = langKey === 'ru' ? ` («${quote}»)` : ` ("${quote}")`;
    baseNote = `${baseNote}${quoteSuffix}`;
  }

  return baseNote;
}
