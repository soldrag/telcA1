# Руководство по добавлению новых вариантов экзамена telc Deutsch A1 (Lesen)

Этот документ содержит исчерпывающие правила, структуру данных, языковые требования и примеры для генерации новых тренировочных вариантов экзамена **telc Deutsch A1 / Start Deutsch 1 (Leseverstehen)**.

Используйте это руководство в качестве промпта и спецификации для AI-агента или методиста при создании новых вариантов (Modellsatz 3, 4, 5...).

---

## 1. Официальная структура экзамена telc A1 — Lesen

Каждый новый вариант **ОБЯЗАТЕЛЬНО** должен содержать ровно **15 заданий (Aufgaben 1–15)**, разбитых на 3 части:

| Часть | Номера заданий | Тип материалов | Формат ответа | Особенности формата |
|---|---|---|---|---|
| **Teil 1** | Aufgaben 1–5 | 2 коротких текста (e-mail, личное письмо, памятка школы/отеля) | **Richtig (+)** / **Falsch (-)** | Текст 1 содержит 2 вопроса (1–2), Текст 2 содержит 3 вопроса (3–5). |
| **Teil 2** | Aufgaben 6–10 | 5 жизненных ситуаций + по 2 веб-сайта/объявления на каждую ситуацию | **a** или **b** | Нужно выбрать сайт, который на 100% удовлетворяет запросу ситуации. Второй сайт — дистрактор с тонким несовпадением. |
| **Teil 3** | Aufgaben 11–15 | 5 коротких объявлений, табличек на дверях, вывесок (Schilder, Aushänge) | **Richtig (+)** / **Falsch (-)** | К каждой вывеске дано ровно 1 утверждение: верно оно или ложно. |

- **Время на выполнение**: ровно **25 минут** (`time_limit_minutes: 25`).
- **Максимум баллов**: **15 баллов** (1 задание = 1 балл).
- **Проходной балл**: **9 из 15** (60%).

---

## 2. Языковые стандарты и требования к уровню A1 (GER / CEFR)

При генерации текстов необходимо строго придерживаться лексического минимума уровня A1:

1. **Грамматика A1**:
   - Время: преимущественно Präsens, базовый Perfekt с вспомогательными глаголами *haben* и *sein* (*hat angerufen*, *ist gefahren*).
   - Модальные глаголы: *können*, *müssen*, *wollen*, *dürfen*, *möchten*.
   - Повелительное наклонение (Императив): вежливая форма (*Bringen Sie bitte mit*, *Rufen Sie an*).
   - Предлоги времени и места: *am Montag*, *um 14 Uhr*, *von... bis...*, *ab 18 Uhr*, *vor dem Eingang*, *neben der Post*.
   - **ЗАПРЕЩЕНО**: сложный Konjunktiv II (кроме вежливого *hätte / wäre / möchte / könnte*), пассив прошедших времён, сложноподчинённые предложения с редкими союзами, падеж Genitiv (вместо него *von + Dativ*).

2. **Аутентичность и реализм**:
   - Немецкие имена (*Stefan, Sabine, Markus, Elena, Herr/Frau Weber, Becker, Müller*).
   - Немецкие города и локации (*Berlin, München, Köln, Hamburg, Frankfurt, Ostsee, Marienplatz, Hauptbahnhof*).
   - Реалистичные немецкие форматы времени (24-часовой формат: *09:30 Uhr*, *18:00 Uhr*), дат (*14. Oktober*), номеров телефонов и доменов (*.de*).
   - Немецкая типографика: умлауты (ä, ö, ü, Ä, Ö, Ü) и буква **ß** (*Straße, schließen, Gruß*).

3. **Баланс правильных ответов**:
   - В Teil 1 и Teil 3 ответы должны распределяться сбалансированно (примерно 50% `richtig`, 50% `falsch`).
   - В Teil 2 ответы должны чередоваться между `a` и `b` (например, 2-3 `a` и 2-3 `b`).

---

## 3. Методические правила составления заданий и ловушек (Fallen)

### 📌 Teil 1 (Письма и Email)
- Тексты должны быть объемом 50–90 слов.
- **Типичные темы**:
  - Приглашение на день рождения, новоселье, барбекю или пикник.
  - Подтверждение бронирования гостиницы, курса, билетов.
  - Информация от языковой школы (время начала, покупка учебника, вводный тест).
- **Ловушки**:
  - *Кто покупает/приносит*: автор пишет «я уже купил еду, принеси только музыку», утверждение заявляет «Собеседник должен принести еду» (**Falsch**).
  - *Дни недели*: «Занятия с понедельника по четверг, в пятницу уроков нет», утверждение заявляет «Уроки идут с понедельника по пятницу» (**Falsch**).
  - *Время*: сбор в 8:45, уроки в 9:00, утверждение: «Встречаются до 9:00» (**Richtig**).

### 📌 Teil 2 (Ситуации и выбор веб-сайта a / b)
- Описание ситуации формулируется стандартно: «Sie möchten... / Sie suchen...».
- Должно быть **2–3 ключевых критерия** (например: 1. велосипед; 2. подержанный/недорогой; 3. покупка, а не аренда).
- **Ловушки дистракторов**:
  - Ищут покупку подержанного — сайт «a» предлагает только краткосрочную аренду (Verleih).
  - Ищут курсы плавания для взрослых по выходным — сайт «b» предлагает курсы только для детей до 6 лет в будни.
  - Хотят вегетарианскую еду в воскресенье — сайт «a» предлагает мясные рульки, а сайт «b» — 100% вегетарианское био-кафе, открытое в воскресенье.
  - Поездка на поезде с велосипедом — сайт «b» предлагает междугородный автобус, где провоз велосипедов запрещён.

### 📌 Teil 3 (Вывески, таблички и объявления)
- Короткие тексты объемом 20–40 слов, имитирующие реальные объявления на стенах или дверях.
- **Типичные контексты**:
  - Табличка на двери врача (отпуск, замещающий врач с адресом).
  - Объявление у лифта в универмаге (ремонт, лифт не работает: «außer Betrieb», пользуйтесь лестницей).
  - Объявление в пекарне/кафе (только наличные: «keine Kartenzahlung», или спецчасы в воскресенье).
  - Правила общежития/бассейна (время тишины: «Ruhezeiten», запрет прыгать с бортика).
  - Общественный транспорт (замена трамвая на автобус из-за ремонта путей).
- **Ключевые слова A1 для проверки**:
  - *außer Betrieb / defekt / kaputt* (не работает)
  - *geschlossen* (закрыто) vs *geöffnet* (открыто)
  - *nicht erlaubt / verboten* (запрещено) vs *erlaubt / gestattet* (разрешено)
  - *nur bar zahlen / keine Kartenzahlung* (только наличными)
  - *kostenlos / gratis* (бесплатно)

---

## 4. Спецификация JSON-схемы данных

Все задания хранятся в файле `server/seed-data.js`. При добавлении нового варианта нужно добавить объект экзамена в массив `exams` и 15 объектов вопросов в массив `questions`.

### Схема объекта экзамена (`exams`):
```javascript
{
  id: 'modellsatz-3', // уникальный ID: modellsatz-N
  title: 'telc Deutsch A1 — Modellsatz 3',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Краткое описание на русском языке для пользователя.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9
}
```

### Схема вопроса для Teil 1 (E-Mails & Briefe):
```javascript
{
  id: 'm3-q1', // ID формата m{N}-q{номер}
  exam_id: 'modellsatz-3',
  teil: 1,
  question_number: 1, // от 1 до 5
  title: 'E-Mail von Laura an Thomas',
  context_header: 'Von: Laura <laura.k@webmail.de>\nAn: Thomas <thomas.b@gmx.de>\nDatum: 10. Mai\nBetreff: Umzug am Samstag',
  context_body: `Hallo Thomas,\n\nam Samstag ziehe ich um...`,
  statement: 'Thomas soll Laura beim Umzug helfen.', // утверждение на немецком
  correct_answer: 'richtig', // строго 'richtig' или 'falsch'
  clue_quote: 'Kannst du mir bitte ab 10 Uhr beim Tragen helfen?', // точная цитата из текста
  explanation_ru: 'Подробное объяснение на русском: перевод фразы, разбор логики и почему ответ именно такой.',
  explanation_de: 'Краткое подтверждение на немецком.',
  vocabulary_notes: [
    { word: 'beim Umzug helfen', translation: 'помогать при переезде' },
    { word: 'tragen', translation: 'носить / таскать' }
  ]
}
```

### Схема вопроса для Teil 2 (Webseiten & Anzeigen):
```javascript
{
  id: 'm3-q6',
  exam_id: 'modellsatz-3',
  teil: 2,
  question_number: 6, // от 6 до 10
  title: 'Aufgabe 6',
  situation: 'Sie möchten am Samstagabend in Berlin mit Freunden tanzen gehen.', // описание ситуации
  options_json: [
    {
      id: 'a',
      badge: 'www.club-disco-berlin.de', // реалистичный URL
      title: 'Club Nightlife Berlin',
      text: 'Jeden Samstag ab 22:00 Uhr große Tanzparty mit DJs auf 3 Floors. Cocktails und beste Musik.',
      details: 'Musik: Dance & Pop • Geöffnet: Sa ab 22 Uhr'
    },
    {
      id: 'b',
      badge: 'www.kammermusik-saal-berlin.de',
      title: 'Klassische Konzerte im Kammermusiksaal',
      text: 'Erleben Sie ruhige klassische Konzerte am Samstagnachmittag um 15:00 Uhr. Keine Tanzveranstaltung.',
      details: 'Musik: Klassik • Nur Sitzplätze'
    }
  ],
  correct_answer: 'a', // строго 'a' или 'b'
  clue_quote: 'Jeden Samstag ab 22:00 Uhr große Tanzparty ... Cocktails und beste Musik.',
  explanation_ru: 'Разбор на русском: почему сайт "a" подходит (танцевальная вечеринка в субботу вечером), а сайт "b" не подходит (классический концерт днем, без танцев).',
  explanation_de: 'Gesucht wird eine Tanzgelegenheit am Samstagabend. Anzeige a bietet eine Party an.',
  vocabulary_notes: [
    { word: 'tanzen gehen', translation: 'идти танцевать' },
    { word: 'die Veranstaltung', translation: 'мероприятие' }
  ]
}
```

### Схема вопроса для Teil 3 (Schilder & Aushänge):
```javascript
{
  id: 'm3-q11',
  exam_id: 'modellsatz-3',
  teil: 3,
  question_number: 11, // от 11 до 15
  title: 'Hinweisschild an der Eingangstür einer Zahnarztpraxis',
  context_header: 'Zahnarztpraxis Dr. Meier',
  context_body: `Liebe Patientinnen und Patienten,\n\nunsere Praxis bleibt vom 15. bis 22. Juli wegen Renovierung geschlossen.\nVertretung: Dr. Frank, Marktstraße 8, Tel. 089/123456.`,
  statement: 'Man kann am 18. Juli von Dr. Meier behandelt werden.',
  correct_answer: 'falsch', // строго 'richtig' или 'falsch'
  clue_quote: 'unsere Praxis bleibt vom 15. bis 22. Juli wegen Renovierung geschlossen.',
  explanation_ru: 'Разбор на русском: практика закрыта на ремонт с 15 по 22 июля («geschlossen»), поэтому 18 июля попасть к доктору Майеру нельзя.',
  explanation_de: 'Die Praxis ist bis 22. Juli geschlossen.',
  vocabulary_notes: [
    { word: 'geschlossen', translation: 'закрыто' },
    { word: 'die Vertretung', translation: 'замещение / дежурный врач' }
  ]
}
```

---

## 5. Пошаговый процесс внедрения нового теста в приложение

Когда новый вариант подготовлен:

### Шаг 1: Добавление в `server/seed-data.js`
1. Откройте `server/seed-data.js`.
2. Добавьте новый объект в массив `seedData.exams`:
   ```javascript
   {
     id: 'modellsatz-3',
     title: 'telc Deutsch A1 — Modellsatz 3',
     subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
     description: 'Третий официальный тренировочный вариант экзамена telc Deutsch A1.',
     time_limit_minutes: 25,
     total_questions: 15,
     pass_score: 9
   }
   ```
3. Добавьте 15 заданий (от `m3-q1` до `m3-q15`) в массив `seedData.questions`.

### Шаг 2: Обновление базы данных SQLite
При запуске сервера вызывается `initDatabase()`. Чтобы принудительно обновить базу новыми записями:
- Либо удалите файл базы `data/telc_a1.db` (он автоматически создастся заново и заполнит все варианты из `seed-data.js`):
  ```bash
  rm data/telc_a1.db
  ```
- Либо выполните скрипт вызова `seedDatabase()`:
  ```bash
  node -e "import('./server/db.js').then(m => m.seedDatabase())"
  ```

### Шаг 3: Проверка корректности (Верификация)
Проверьте через терминал, что все 15 вопросов нового теста корректно читаются:
```bash
node -e "import('./server/db.js').then(m => {
  const count = m.db.prepare('SELECT COUNT(*) as c FROM questions WHERE exam_id = ?').get('modellsatz-3');
  console.log('Modellsatz 3 questions:', count.c);
})"
```
Вывод должен быть: `Modellsatz 3 questions: 15`.

Затем запустите приложение:
```bash
npm start
```
Новый вариант автоматически появится в выпадающем списке вариантов в шапке сайта!

---

## 6. Чеклист качества перед добавлением

Перед сохранением нового варианта проверьте:
- [ ] Ровно 15 вопросов: Teil 1 (5 шт.), Teil 2 (5 шт.), Teil 3 (5 шт.).
- [ ] Указана точная цитата `clue_quote` для каждого вопроса.
- [ ] Написано понятное и подробное объяснение `explanation_ru` на русском языке.
- [ ] Добавлены словарные карточки `vocabulary_notes` с базовыми словами A1.
- [ ] В Teil 1 и Teil 3 ответы `richtig` / `falsch` сбалансированы.
- [ ] В Teil 2 оба варианта (`a` и `b`) выглядят правдоподобно, но верный ровно один.
- [ ] Нет грамматических ошибок и опечаток в немецком тексте.
