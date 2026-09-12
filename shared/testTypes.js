export const TEST_TYPES = [
  {
    id: 'lesen',
    title: 'Lesen',
    titleRu: 'Чтение',
    status: 'active',
    totalQuestions: 15,
    timeLimitMinutes: 25,
    maxScore: 15,
    passScore: 9,
    partsCount: 3,
    variantsCount: 10,
    description: 'Аутентичные письма, интернет-каталоги и объявления с электронным бланком ответов.'
  },
  {
    id: 'hoeren',
    title: 'Hören',
    titleRu: 'Аудирование',
    status: 'upcoming',
    totalQuestions: 15,
    timeLimitMinutes: 20,
    maxScore: 15,
    passScore: 9,
    partsCount: 3,
    variantsCount: 0,
    description: 'Короткие диалоги, автоответчик и аудиообъявления в общественных местах.'
  },
  {
    id: 'schreiben',
    title: 'Schreiben',
    titleRu: 'Письмо',
    status: 'active',
    totalQuestions: 6,
    timeLimitMinutes: 15,
    maxScore: 15,
    passScore: 9,
    partsCount: 2,
    variantsCount: 4,
    description: 'Заполнение формуляра на 5 пунктов и написание короткого письма/e-mail (~30 слов).'
  },
  {
    id: 'sprechen',
    title: 'Sprechen',
    titleRu: 'Говорение',
    status: 'upcoming',
    totalQuestions: 3,
    timeLimitMinutes: 15,
    maxScore: 15,
    passScore: 9,
    partsCount: 3,
    variantsCount: 0,
    description: 'Групповой экзамен: самопрезентация, карточки с вопросами и формулировка просьб.'
  }
];

export const VALID_TEST_TYPES = new Set(TEST_TYPES.map((t) => t.id));

export function getTestTypeById(id) {
  return TEST_TYPES.find((t) => t.id === id) || TEST_TYPES[0];
}

export function isValidTestType(id) {
  return VALID_TEST_TYPES.has(id);
}
