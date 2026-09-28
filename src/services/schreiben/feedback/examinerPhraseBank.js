/**
 * Examiner feedback phrase bank (RU/EN), keyed by diagnostic and examiner codes.
 * Tokens: {quote} {correction} {criterion} {missingAspect} {count} {points} {maxPoints}.
 * Quote marks are added by the renderer, so templates never wrap tokens in quotes.
 */

export const EXAMINER_PHRASE_TOKENS = Object.freeze([
  'quote', 'correction', 'criterion', 'missingAspect', 'count', 'points', 'maxPoints',
]);

const RU = Object.freeze({
  OVERALL_EXCELLENT: 'Отличная работа: {points} из {maxPoints} баллов.',
  OVERALL_GOOD: 'Хороший результат: {points} из {maxPoints} баллов, задание выполнено.',
  OVERALL_PARTIAL: 'Задание выполнено частично: {points} из {maxPoints} баллов.',
  OVERALL_THEME_MISSED: 'Письмо не отвечает на пункты задания, поэтому баллов за содержание нет ({points} из {maxPoints}).',
  OVERALL_INSUFFICIENT: 'Текст слишком короткий или неразборчивый для оценки ({points} из {maxPoints}).',

  SUMMARY_LP_ALL_COVERED: 'Все пункты задания раскрыты.',
  SUMMARY_LP_INVERTED: 'Главная проблема — пункт {criterion}: написанное противоречит заданию.',
  SUMMARY_LP_MISSING: 'Не раскрыт пункт {criterion}.',
  SUMMARY_LP_MISSING_MANY: 'Не раскрыто пунктов задания: {count}.',
  SUMMARY_LP_PARTIAL: 'Пункт {criterion} раскрыт не полностью.',
  SUMMARY_LP_VOID_NO_PREDICATION: 'В письме только отдельные слова, без предложений: пункты задания не засчитываются. Напишите о каждом пункте хотя бы одно предложение.',
  SUMMARY_LP_VOID_OFF_TOPIC: 'Письмо написано на другую тему, поэтому пункты задания не засчитываются.',
  SUMMARY_FRAMING_ANREDE: 'В начале не хватает подходящего обращения.',
  SUMMARY_FRAMING_GRUSS: 'В конце не хватает прощания с подписью.',
  SUMMARY_FRAMING_BOTH: 'Не хватает обращения в начале и прощания с подписью в конце.',
  SUMMARY_FRAMING_FLAWED: 'В обращении или прощании есть неточности.',
  SUMMARY_GRAMMAR_ERRORS: 'Найдено грамматических ошибок: {count}. На балл они не влияют, если смысл понятен.',
  GRAMMAR_CLEAN: 'Грубых грамматических ошибок не найдено.',

  ANREDE_PERFECT: 'Обращение {quote} подобрано верно.',
  ANREDE_MINOR_FLAW: 'Обращение {quote} есть, но проверьте падеж, стиль или запятую.',
  ANREDE_REGISTER_MISMATCH: 'Обращение {quote} слишком неформальное для официального письма.',
  ANREDE_DECLENSION_FLAW: 'В обращении {quote} ошибка в окончании. Правильно: {correction}.',
  ANREDE_PUNCTUATION_FLAW: 'После обращения {quote} пропущена запятая.',
  GRUSS_PERFECT: 'Прощание оформлено правильно: {quote}.',
  GRUSS_INCOMPLETE: 'Прощание {quote} слишком неформальное для официального письма.',

  LP_FULFILLED: 'Пункт {criterion} раскрыт: {quote}.',
  LP_PARTIAL: 'Пункт {criterion} затронут ({quote}), но не хватает подробностей.',
  LP_MISSING_ASPECT: 'В пункте {criterion} не раскрыт аспект {missingAspect}.',
  LP_FRAME_VIOLATION: 'В пункте {criterion} смысл передан неточно: {quote}. Проверьте, кто что делает.',
  LP_INVERTED_DEFECT: 'Пункт {criterion} не зачтён: по фразе {quote} всё в порядке, а нужно сообщить о проблеме.',
  LP_INVERTED_REQUEST: 'Пункт {criterion} не зачтён: в {quote} вы отказываетесь, а нужно попросить.',
  LP_INVERTED_CANCEL: 'Пункт {criterion} не зачтён: в {quote} отмена не выражена.',
  LP_INVERTED_GENERAL: 'Пункт {criterion} не зачтён: {quote} противоречит заданию.',

  GRAMMAR_V2: 'Порядок слов: в {quote} спрягаемый глагол стоит на 2-м месте → {correction}.',
  GRAMMAR_VERB_FINAL: 'Рамочная конструкция: в {quote} глагол уходит в конец → {correction}.',
  GRAMMAR_REKTION: 'Падеж или предлог: {quote} → {correction}.',
  GRAMMAR_GENERAL: 'Форма слова: {quote} → {correction}.',
});

const EN = Object.freeze({
  OVERALL_EXCELLENT: 'Excellent work: {points} of {maxPoints} points.',
  OVERALL_GOOD: 'Good result: {points} of {maxPoints} points, the task is done.',
  OVERALL_PARTIAL: 'The task is only partly done: {points} of {maxPoints} points.',
  OVERALL_THEME_MISSED: 'The letter does not address the task points, so it earns no content points ({points} of {maxPoints}).',
  OVERALL_INSUFFICIENT: 'The text is too short or unreadable to grade ({points} of {maxPoints}).',

  SUMMARY_LP_ALL_COVERED: 'All task points are covered.',
  SUMMARY_LP_INVERTED: 'The main problem is point {criterion}: what you wrote contradicts the task.',
  SUMMARY_LP_MISSING: 'Point {criterion} is missing.',
  SUMMARY_LP_MISSING_MANY: 'Task points missing: {count}.',
  SUMMARY_LP_PARTIAL: 'Point {criterion} is only partly covered.',
  SUMMARY_LP_VOID_NO_PREDICATION: 'The letter lists single words without sentences, so the task points do not count. Write at least one sentence for each point.',
  SUMMARY_LP_VOID_OFF_TOPIC: 'The letter is about a different topic, so the task points do not count.',
  SUMMARY_FRAMING_ANREDE: 'A proper salutation is missing at the start.',
  SUMMARY_FRAMING_GRUSS: 'A closing with your name is missing at the end.',
  SUMMARY_FRAMING_BOTH: 'Both the salutation at the start and the closing with your name are missing.',
  SUMMARY_FRAMING_FLAWED: 'The salutation or the closing has small form errors.',
  SUMMARY_GRAMMAR_ERRORS: 'Grammar errors found: {count}. They do not lower the score while the meaning is clear.',
  GRAMMAR_CLEAN: 'No serious grammar errors found.',

  ANREDE_PERFECT: 'The salutation {quote} is appropriate.',
  ANREDE_MINOR_FLAW: 'The salutation {quote} is there, but check its case, register or comma.',
  ANREDE_REGISTER_MISMATCH: 'The salutation {quote} is too informal for an official email.',
  ANREDE_DECLENSION_FLAW: 'Ending error in salutation {quote}. Correct form: {correction}.',
  ANREDE_PUNCTUATION_FLAW: 'Missing comma after the salutation {quote}.',
  GRUSS_PERFECT: 'The closing is correct: {quote}.',
  GRUSS_INCOMPLETE: 'The closing {quote} is too informal for an official email.',

  LP_FULFILLED: 'Point {criterion} is covered: {quote}.',
  LP_PARTIAL: 'Point {criterion} is touched on ({quote}), but details are missing.',
  LP_MISSING_ASPECT: 'In point {criterion}, the aspect {missingAspect} is not covered.',
  LP_FRAME_VIOLATION: 'Point {criterion} is not quite right: {quote}. Check who does what.',
  LP_INVERTED_DEFECT: 'Point {criterion} not counted: {quote} says everything is fine, but the task asks you to report a problem.',
  LP_INVERTED_REQUEST: 'Point {criterion} not counted: in {quote} you decline, but the task asks you to request it.',
  LP_INVERTED_CANCEL: 'Point {criterion} not counted: {quote} does not express the cancellation.',
  LP_INVERTED_GENERAL: 'Point {criterion} not counted: {quote} contradicts the task.',

  GRAMMAR_V2: 'Word order: in {quote} the finite verb goes in position 2 → {correction}.',
  GRAMMAR_VERB_FINAL: 'Sentence bracket: in {quote} the verb goes to the end → {correction}.',
  GRAMMAR_REKTION: 'Case or preposition: {quote} → {correction}.',
  GRAMMAR_GENERAL: 'Word form: {quote} → {correction}.',
});

export const EXAMINER_PHRASES = Object.freeze({ ru: RU, en: EN });
