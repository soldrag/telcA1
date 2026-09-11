export const moduleExams = [
  {
    id: 'hoeren-modellsatz-1',
    title: 'telc Deutsch A1 — Hören 1',
    subtitle: 'Hörverstehen (Teil 1, 2 und 3)',
    description: 'Официальный тренировочный вариант Hörverstehen telc A1: диалоги, объявления на вокзале и автоответчик.',
    test_type: 'hoeren',
    time_limit_minutes: 20,
    total_questions: 15,
    pass_score: 9,
    sort_order: 1
  },
  {
    id: 'schreiben-modellsatz-1',
    title: 'telc Deutsch A1 — Schreiben 1',
    subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
    description: 'Официальный тренировочный вариант Schreiben telc A1: заполнение формуляра и написание письма.',
    test_type: 'schreiben',
    time_limit_minutes: 15,
    total_questions: 6,
    pass_score: 9,
    sort_order: 1
  },
  {
    id: 'sprechen-modellsatz-1',
    title: 'telc Deutsch A1 — Sprechen 1',
    subtitle: 'Mündliche Prüfung (Teil 1, 2 und 3)',
    description: 'Официальный тренировочный вариант Sprechen telc A1: рассказ о себе, вопросы по карточкам и просьбы.',
    test_type: 'sprechen',
    time_limit_minutes: 15,
    total_questions: 3,
    pass_score: 9,
    sort_order: 1
  }
];

export const moduleQuestions = [
  // Hören: Teil 1 (Диалог)
  {
    id: 'h1-q1',
    exam_id: 'hoeren-modellsatz-1',
    teil: 1,
    question_number: 1,
    title: 'Im Kaufhaus • Dialog',
    situation: 'Sie hören ein kurzes Gespräch an der Kasse.',
    context_header: 'Audio-Transkription',
    context_body: '— Guten Tag, was kostet diese Jacke bitte?\n— Die Jacke kostet regulär 89 Euro, aber heute ist sie im Angebot für 59 Euro.',
    options_json: [
      { id: 'a', title: '59 Euro', text: 'Die Jacke kostet 59 Euro.' },
      { id: 'b', title: '89 Euro', text: 'Die Jacke kostet 89 Euro.' },
      { id: 'c', title: '49 Euro', text: 'Die Jacke kostet 49 Euro.' }
    ],
    correct_answer: 'a',
    clue_quote: 'heute ist sie im Angebot für 59 Euro.',
    explanation_ru: 'Специальная цена со скидкой сегодня составляет 59 евро (вариант a).',
    explanation_en: 'The discounted sale price today is 59 euros (option a).',
    explanation_de: 'Die Jacke kostet heute im Angebot 59 Euro.',
    vocabulary_notes: [{ word: 'im Angebot', translation: 'по скидке / по акции' }]
  },
  // Hören: Teil 2 (Durchsage)
  {
    id: 'h1-q2',
    exam_id: 'hoeren-modellsatz-1',
    teil: 2,
    question_number: 2,
    title: 'Durchsage am Bahnhof',
    situation: 'Sie hören eine Ansage am Hauptbahnhof.',
    context_header: 'Audio-Transkription',
    context_body: 'Achtung an Gleis 4: Der ICE 572 nach Hamburg fährt heute von Gleis 7 ab.',
    statement: 'Der Zug nach Hamburg fährt von Gleis 4 ab.',
    correct_answer: 'falsch',
    clue_quote: 'fährt heute von Gleis 7 ab.',
    explanation_ru: 'Поезд отправляется с пути 7, а не с пути 4. Утверждение неверно (Falsch).',
    explanation_en: 'The train departs from platform 7, not platform 4. The statement is False.',
    explanation_de: 'Der Zug fährt von Gleis 7 ab, nicht von Gleis 4.',
    vocabulary_notes: [{ word: 'Gleis', translation: 'путь / платформа' }]
  },
  // Hören: Teil 3 (Anrufbeantworter)
  {
    id: 'h1-q3',
    exam_id: 'hoeren-modellsatz-1',
    teil: 3,
    question_number: 3,
    title: 'Nachricht auf der Mailbox',
    situation: 'Sie hören eine Nachricht von Dr. Weber.',
    context_header: 'Audio-Transkription',
    context_body: 'Hallo Herr Schmidt, hier ist die Praxis Dr. Weber. Ihr Termin morgen um 10 Uhr muss leider auf 15 Uhr verschoben werden.',
    statement: 'Herr Schmidt soll morgen um 15 Uhr in die Praxis kommen.',
    correct_answer: 'richtig',
    clue_quote: 'muss leider auf 15 Uhr verschoben werden.',
    explanation_ru: 'Приём перенесён на 15:00. Утверждение верно (Richtig).',
    explanation_en: 'The appointment has been postponed to 15:00. The statement is True.',
    explanation_de: 'Der Termin wurde auf 15 Uhr verschoben.',
    vocabulary_notes: [{ word: 'verschieben', translation: 'переносить (время)' }]
  },

  // Schreiben: Teil 1 (Formular)
  {
    id: 's1-q1',
    exam_id: 'schreiben-modellsatz-1',
    teil: 1,
    question_number: 1,
    title: 'Anmeldung Hotelbuchung • Familienname',
    situation: 'Ihre Freundin Eva Bauer reist mit ihrem Sohn nach Dresden.',
    context_header: 'Ausgangstext',
    context_body: 'Eva Bauer wohnt in Köln und möchte für 3 Nächte ein Doppelzimmer im Hotel Dresden buchen.',
    statement: 'Tragen Sie den Familiennamen ein:',
    correct_answer: 'bauer',
    clue_quote: 'Eva Bauer',
    explanation_ru: 'Фамилия гостьи — Bauer.',
    explanation_en: 'The guest’s last name is Bauer.',
    explanation_de: 'Der Familienname lautet Bauer.',
    vocabulary_notes: [{ word: 'Familienname', translation: 'фамилия' }]
  },
  {
    id: 's1-q2',
    exam_id: 'schreiben-modellsatz-1',
    teil: 2,
    question_number: 2,
    title: 'E-Mail an ein Hotel schreiben',
    situation: 'Schreiben Sie eine E-Mail an das Hotel Sonnenschein.',
    context_header: 'Leitpunkte (План письма)',
    context_body: '1. Grund für Ihr Schreiben (Zimmer buchen)\n2. Anreisedatum und Personenanzahl\n3. Frage nach Frühstück',
    statement: 'Verfassen Sie eine kurze E-Mail (ca. 30 Wörter). Schreiben Sie zu allen 3 Punkten.',
    correct_answer: 'richtig',
    clue_quote: 'Sehr geehrte Damen und Herren...',
    explanation_ru: 'Пример письма: «Sehr geehrte Damen und Herren, ich möchte ein Einzelzimmer für 2 Nächte ab dem 15. Mai buchen. Ist das Frühstück im Preis inklusive? Mit freundlichen Grüßen, ...»',
    explanation_en: 'Sample email covering all three required guide points with salutation and closing.',
    explanation_de: 'Musterlösung für die telc A1 E-Mail mit Grußformel und allen drei Leitpunkten.',
    vocabulary_notes: [{ word: 'Sehr geehrte Damen und Herren', translation: 'Уважаемые дамы и господа' }]
  },

  // Sprechen: Teil 1, 2, 3
  {
    id: 'sp1-q1',
    exam_id: 'sprechen-modellsatz-1',
    teil: 1,
    question_number: 1,
    title: 'Teil 1 • Sich vorstellen',
    situation: 'Stellen Sie sich kurz vor (ca. 1 Minute).',
    context_header: 'Stichworte',
    context_body: '• Name\n• Alter\n• Land\n• Wohnort\n• Sprachen\n• Beruf\n• Hobby',
    statement: 'Bereiten Sie Ihre Antworten vor. Der Prüfer stellt anschließend 2 Fragen (Buchstabieren und Telefonnummer).',
    correct_answer: 'richtig',
    clue_quote: 'Ich heiße ..., ich komme aus ..., ich wohne in ...',
    explanation_ru: 'Шаблон рассказа: «Ich heiße Anna. Ich bin 28 Jahre alt. Ich komme aus der Ukraine und wohne in Berlin. Ich spreche Ukrainisch, Russisch und ein bisschen Deutsch. Ich bin Ingenieurin von Beruf. Mein Hobby ist Musik hören.»',
    explanation_en: 'Sample personal introduction covering all official telc A1 speaking criteria.',
    explanation_de: 'Sprechen Teil 1 Selbstdarstellung nach den offiziellen telc Kriterien.',
    vocabulary_notes: [{ word: 'Sich vorstellen', translation: 'представиться' }]
  }
];
