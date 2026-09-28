/**
 * Pure pedagogical tutor feedback resolver for Schreiben criteria.
 * Resolves 1-sentence localized explanations for each criterion score.
 * Clean Architecture & McConnell limits: <= 120 lines, <= 25 lines per function.
 */

import { formatStudentQuote } from './studentQuoteFormatter.js';

const TUTOR_MESSAGES = {
  ru: {
    LP_INVERTED_DEFECT: 'Пункт не зачтён: в тексте сказано, что прибор исправен, а требовалось сообщить о поломке.',
    LP_INVERTED_REQUEST: 'Пункт не зачтён: в тексте выражен отказ от мастера/помощи, а требовалось попросить о визите.',
    LP_INVERTED_CANCEL: 'Пункт не зачтён: отмена встречи не выражена или смысл отменён.',
    LP_INVERTED_GENERAL: 'Пункт не зачтён: формулировка противоречит заданию.',
    LP_FRAME_VIOLATION: 'Смысловая неточность: нарушение ролей или логики высказывания.',
    LP_MISSING: 'Пункт не найден: в письме нет информации по этому требованию.',
    LP_PARTIAL: 'Пункт раскрыт частично: тема упомянута, но не хватает деталей.',
    LP_FULFILLED: 'Пункт раскрыт полностью: смысл передан верно и понятно.',

    ANREDE_PERFECT: 'Обращение подобрано верно и соответствует официальному стилю.',
    ANREDE_MINOR_FLAW: 'Обращение есть, но содержит неточность в падеже, стиле или пунктуации.',
    ANREDE_REGISTER_MISMATCH: 'Обращение слишком неформальное для официального письма.',
    ANREDE_DECLENSION_FLAW: 'В обращении допущена ошибка в окончании или падеже.',
    ANREDE_PUNCTUATION_FLAW: 'В обращении пропущена запятая в конце строки.',
    ANREDE_MISSING: 'В начале письма отсутствует подходящее обращение.',

    GRUSS_PERFECT: 'Прощальная формула подходит к письму.',
    GRUSS_INCOMPLETE: 'Прощание слишком неформальное для официального письма.',
    GRUSS_NO_SENDER_NAME: 'Прощальная формула верная; подпишитесь своим именем — баллы не снижаются.',
    GRUSS_MISSING: 'В конце письма нет прощальной формулы.',
  },
  en: {
    LP_INVERTED_DEFECT: 'Point missed: the text states the appliance works, but the task required reporting a defect.',
    LP_INVERTED_REQUEST: 'Point missed: the text refuses a technician/help, while the task required requesting a visit.',
    LP_INVERTED_CANCEL: 'Point missed: appointment cancellation was not expressed or negated.',
    LP_INVERTED_GENERAL: 'Point missed: the statement contradicts the required task prompt.',
    LP_FRAME_VIOLATION: 'Semantic flaw: communicative role reversal or sentence frame violation.',
    LP_MISSING: 'Point missing: no matching statement for this requirement was found.',
    LP_PARTIAL: 'Point partially addressed: topic mentioned, but key details are missing.',
    LP_FULFILLED: 'Point fully addressed: clearly conveyed and matches the requirement.',

    ANREDE_PERFECT: 'Salutation is appropriate and formally correct.',
    ANREDE_MINOR_FLAW: 'Salutation is present, but has minor case, register, or punctuation flaws.',
    ANREDE_REGISTER_MISMATCH: 'Salutation is too informal for an official email.',
    ANREDE_DECLENSION_FLAW: 'Grammatical ending or case error in salutation.',
    ANREDE_PUNCTUATION_FLAW: 'Missing comma at the end of the salutation.',
    ANREDE_MISSING: 'Missing appropriate salutation at the start of the letter.',

    GRUSS_PERFECT: 'The closing formula is appropriate.',
    GRUSS_INCOMPLETE: 'Closing is too informal for an official email.',
    GRUSS_NO_SENDER_NAME: 'The closing formula is correct; sign with your name (no points are lost).',
    GRUSS_MISSING: 'The letter has no closing formula.',
  },
  de: {
    LP_INVERTED_DEFECT: 'Inhaltspunkt nicht erfüllt: Es wurde beschrieben, dass das Gerät funktioniert, statt den Defekt zu melden.',
    LP_INVERTED_REQUEST: 'Inhaltspunkt nicht erfüllt: Der Handwerker/die Hilfe wurde abgelehnt, statt darum zu bitten.',
    LP_INVERTED_CANCEL: 'Inhaltspunkt nicht erfüllt: Der Termin wurde nicht wie gefordert abgesagt.',
    LP_INVERTED_GENERAL: 'Inhaltspunkt nicht erfüllt: Die Aussage widerspricht der Aufgabenstellung.',
    LP_FRAME_VIOLATION: 'Sinnfehler: Rollenvertauschung oder fehlerhafter Satzrahmen.',
    LP_MISSING: 'Inhaltspunkt fehlt: Im Text wurden keine passenden Angaben hierzu gefunden.',
    LP_PARTIAL: 'Inhaltspunkt teilweise bearbeitet: Das Thema wird erwähnt, es fehlen jedoch Einzelheiten.',
    LP_FULFILLED: 'Inhaltspunkt vollständig erfüllt: Verständlich und themengerecht bearbeitet.',

    ANREDE_PERFECT: 'Die Anrede ist passend und formal korrekt gewählt.',
    ANREDE_MINOR_FLAW: 'Die Anrede ist vorhanden, weist jedoch kleinere Formfehler auf.',
    ANREDE_REGISTER_MISMATCH: 'Die Anrede ist für einen formellen Brief zu informell.',
    ANREDE_DECLENSION_FLAW: 'Die Anrede enthält einen Deklinations- oder Endungsfehler.',
    ANREDE_PUNCTUATION_FLAW: 'Nach der Anrede fehlt ein Komma.',
    ANREDE_MISSING: 'Es fehlt eine passende Anrede zu Beginn des Briefes.',

    GRUSS_PERFECT: 'Die Grußformel ist passend.',
    GRUSS_INCOMPLETE: 'Der Gruß ist für einen formellen Brief zu informell.',
    GRUSS_NO_SENDER_NAME: 'Die Grußformel ist richtig; unterschreiben Sie mit Ihrem Namen (kein Punktabzug).',
    GRUSS_MISSING: 'Am Ende des Briefes fehlt eine Grußformel.',
  }
};

function isCodeCompatibleWithScore(code, score) {
  if (!code) return false;
  if (score >= 2) {
    return ['LP_FULFILLED', 'ANREDE_PERFECT', 'GRUSS_PERFECT', 'GRUSS_NO_SENDER_NAME'].includes(code);
  }
  if (score === 1) {
    return [
      'LP_PARTIAL',
      'ANREDE_MINOR_FLAW',
      'ANREDE_REGISTER_MISMATCH',
      'ANREDE_DECLENSION_FLAW',
      'ANREDE_PUNCTUATION_FLAW',
      'GRUSS_INCOMPLETE',
      'LP_FRAME_VIOLATION'
    ].includes(code);
  }
  return [
    'LP_MISSING',
    'LP_INVERTED_DEFECT',
    'LP_INVERTED_REQUEST',
    'LP_INVERTED_CANCEL',
    'LP_INVERTED_GENERAL',
    'LP_FRAME_VIOLATION',
    'ANREDE_MISSING',
    'GRUSS_MISSING'
  ].includes(code);
}

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

  const isCompatible = diagnosticCode && isCodeCompatibleWithScore(diagnosticCode, score);
  let baseNote = (isCompatible && langDict[diagnosticCode])
    ? langDict[diagnosticCode]
    : resolveFallbackByScore(criterionId, score, langDict);

  if (matchedSentence && typeof matchedSentence === 'string' && matchedSentence.length <= 60 && diagnosticCode?.startsWith('LP_INVERTED') && score === 0) {
    baseNote = `${baseNote} (${formatStudentQuote(matchedSentence, langKey)})`;
  }

  return baseNote;
}
