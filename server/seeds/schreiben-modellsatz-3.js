export const exam = {
  id: 'schreiben-modellsatz-3',
  title: 'telc Deutsch A1 — Schreiben 3',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Оригинальный тренировочный вариант Schreiben telc A1: анкета в спортивный клуб и письмо арендодателю о ремонте отопления.',
  test_type: 'schreiben',
  time_limit_minutes: 15,
  total_questions: 6,
  pass_score: 9,
  sort_order: 3
};

export const questions = [
  {
    id: 's3-q1',
    exam_id: 'schreiben-modellsatz-3',
    teil: 1,
    question_number: 1,
    title: 'Sportverein Fit & Aktiv • Familienname',
    situation: 'Ihre Nachbarin Maria Santos möchte sich im Sportverein „Fit & Aktiv“ in Hamburg anmelden. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Nachbarin Maria Santos wohnt in Hamburg, Hafenstraße 22. Sie ist am 05.08.1996 in Madrid geboren. Sie möchte ab dem 1. Oktober einen Yogakurs für 6 Monate besuchen. Sie möchte jeden Dienstag trainieren und bezahlt die Monatsgebühr per Überweisung.',
    statement: 'Feld (1) — Familienname:',
    options_json: {
      form_label: 'Familienname',
      accepted_answers: ['santos', 'frau santos', 'maria santos']
    },
    correct_answer: 'santos',
    clue_quote: 'Ihre Nachbarin Maria Santos wohnt in Hamburg',
    explanation_ru: 'Фамилия заявительницы — Santos.',
    explanation_en: 'The applicant’s surname is Santos.',
    explanation_de: 'Der Familienname lautet Santos.',
    vocabulary_notes: [
      { word: 'der Familienname', translation: 'фамилия', translation_en: 'surname / family name' }
    ]
  },
  {
    id: 's3-q2',
    exam_id: 'schreiben-modellsatz-3',
    teil: 1,
    question_number: 2,
    title: 'Sportverein Fit & Aktiv • Geburtsdatum',
    situation: 'Ihre Nachbarin Maria Santos möchte sich im Sportverein „Fit & Aktiv“ in Hamburg anmelden. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Nachbarin Maria Santos wohnt in Hamburg, Hafenstraße 22. Sie ist am 05.08.1996 in Madrid geboren. Sie möchte ab dem 1. Oktober einen Yogakurs für 6 Monate besuchen. Sie möchte jeden Dienstag trainieren und bezahlt die Monatsgebühr per Überweisung.',
    statement: 'Feld (2) — Geburtsdatum:',
    options_json: {
      form_label: 'Geburtsdatum',
      accepted_answers: ['05.08.1996', '05.08.96', '5. august 1996', '5.8.1996', '05.08.', '05. 08. 1996']
    },
    correct_answer: '05.08.1996',
    clue_quote: 'Sie ist am 05.08.1996 in Madrid geboren',
    explanation_ru: 'Дата рождения — 05.08.1996.',
    explanation_en: 'Date of birth is 05.08.1996.',
    explanation_de: 'Das Geburtsdatum ist der 05.08.1996.',
    vocabulary_notes: [
      { word: 'das Geburtsdatum', translation: 'дата рождения', translation_en: 'date of birth' }
    ]
  },
  {
    id: 's3-q3',
    exam_id: 'schreiben-modellsatz-3',
    teil: 1,
    question_number: 3,
    title: 'Sportverein Fit & Aktiv • Wohnort',
    situation: 'Ihre Nachbarin Maria Santos möchte sich im Sportverein „Fit & Aktiv“ in Hamburg anmelden. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Nachbarin Maria Santos wohnt in Hamburg, Hafenstraße 22. Sie ist am 05.08.1996 in Madrid geboren. Sie möchte ab dem 1. Oktober einen Yogakurs für 6 Monate besuchen. Sie möchte jeden Dienstag trainieren und bezahlt die Monatsgebühr per Überweisung.',
    statement: 'Feld (3) — Wohnort:',
    options_json: {
      form_label: 'Wohnort',
      accepted_answers: ['hamburg', 'in hamburg']
    },
    correct_answer: 'hamburg',
    clue_quote: 'wohnt in Hamburg',
    explanation_ru: 'Город проживания — Hamburg (родилась в Мадриде, но проживает в Гамбурге).',
    explanation_en: 'City of residence is Hamburg.',
    explanation_de: 'Der Wohnort ist Hamburg.',
    vocabulary_notes: [
      { word: 'der Wohnort', translation: 'место жительства', translation_en: 'place of residence' }
    ]
  },
  {
    id: 's3-q4',
    exam_id: 'schreiben-modellsatz-3',
    teil: 1,
    question_number: 4,
    title: 'Sportverein Fit & Aktiv • Kursangebot',
    situation: 'Ihre Nachbarin Maria Santos möchte sich im Sportverein „Fit & Aktiv“ in Hamburg anmelden. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Nachbarin Maria Santos wohnt in Hamburg, Hafenstraße 22. Sie ist am 05.08.1996 in Madrid geboren. Sie möchte ab dem 1. Oktober einen Yogakurs für 6 Monate besuchen. Sie möchte jeden Dienstag trainieren und bezahlt die Monatsgebühr per Überweisung.',
    statement: 'Feld (4) — Gewünschter Kurs / Sportart:',
    options_json: {
      form_label: 'Gewünschter Kurs',
      accepted_answers: ['yoga', 'yogakurs']
    },
    correct_answer: 'yoga',
    clue_quote: 'einen Yogakurs für 6 Monate besuchen',
    explanation_ru: 'Выбранный курс — Yoga / Yogakurs.',
    explanation_en: 'Selected course is Yoga (Yogakurs).',
    explanation_de: 'Der gewünschte Kurs ist Yoga.',
    vocabulary_notes: [
      { word: 'der Kurs', translation: 'курс', translation_en: 'course' }
    ]
  },
  {
    id: 's3-q5',
    exam_id: 'schreiben-modellsatz-3',
    teil: 1,
    question_number: 5,
    title: 'Sportverein Fit & Aktiv • Zahlungsweise',
    situation: 'Ihre Nachbarin Maria Santos möchte sich im Sportverein „Fit & Aktiv“ in Hamburg anmelden. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Nachbarin Maria Santos wohnt in Hamburg, Hafenstraße 22. Sie ist am 05.08.1996 in Madrid geboren. Sie möchte ab dem 1. Oktober einen Yogakurs für 6 Monate besuchen. Sie möchte jeden Dienstag trainieren und bezahlt die Monatsgebühr per Überweisung.',
    statement: 'Feld (5) — Zahlungsweise:',
    options_json: {
      form_label: 'Zahlungsweise',
      accepted_answers: ['überweisung', 'ueberweisung', 'per überweisung']
    },
    correct_answer: 'überweisung',
    clue_quote: 'bezahlt die Monatsgebühr per Überweisung',
    explanation_ru: 'Способ оплаты — банковский перевод (Überweisung / per Überweisung).',
    explanation_en: 'Payment method is bank transfer (Überweisung).',
    explanation_de: 'Die Zahlungsweise ist per Überweisung.',
    vocabulary_notes: [
      { word: 'die Überweisung', translation: 'банковский перевод', translation_en: 'bank transfer' }
    ]
  },
  {
    id: 's3-q6',
    exam_id: 'schreiben-modellsatz-3',
    teil: 2,
    question_number: 6,
    title: 'Teil 2 • Heizungsausfall in der Wohnung',
    situation: 'In Ihrer Wohnung ist die Heizung kaputt. Es ist sehr kalt. Schreiben Sie eine E-Mail an Ihren Vermieter, Herrn Meier.',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben\n2. Problem beschreiben\n3. Handwerker / Reparaturtermin',
    statement: 'Schreiben Sie eine kurze E-Mail (ca. 30 Wörter). Denken Sie an Anrede und Gruß.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben',
        'Problem beschreiben',
        'Handwerker / Reparaturtermin'
      ],
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben',
            keywords: ['heizung', 'kaputt', 'funktioniert', 'geht', 'problem'],
            requiredMatches: 2
          },
          {
            id: 'lp2',
            label: 'Problem beschreiben',
            keywords: ['kalt', 'kind', 'kinder', 'baby', 'wohnung', 'winter'],
            requiredMatches: 2
          },
          {
            id: 'lp3',
            label: 'Handwerker / Reparaturtermin',
            keywords: ['handwerker', 'techniker', 'reparieren', 'reparatur', 'kommen', 'wann', 'termin'],
            requiredMatches: 2
          }
        ]
      },
      sample_solution: 'Sehr geehrter Herr Meier,\n\nin meiner Wohnung ist die Heizung kaputt und funktioniert nicht mehr. Es ist sehr kalt und ich habe ein kleines Kind. Wann kann ein Handwerker kommen und die Heizung reparieren?\n\nMit freundlichen Grüßen\nMaria Santos',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrter Herr Meier,' },
        { label: 'Punkt 1 (Grund: Heizung kaputt)', text: 'in meiner Wohnung ist die Heizung kaputt und funktioniert nicht mehr.' },
        { label: 'Punkt 2 (Problem: Kalt / Kind)', text: 'Es ist sehr kalt und ich habe ein kleines Kind.' },
        { label: 'Punkt 3 (Termin Handwerker)', text: 'Wann kann ein Handwerker kommen und die Heizung reparieren?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrter Herr Meier, in meiner Wohnung ist die Heizung kaputt und funktioniert nicht mehr.',
    explanation_ru: 'Письмо содержит официальное обращение (Sehr geehrter Herr Meier), раскрытие всех 3 пунктов (поломка отопления, холод и ребенок в квартире, вопрос о визите мастера) и формулу вежливости (Mit freundlichen Grüßen).',
    explanation_en: 'Sample email with formal salutation, full coverage of 3 points (heating breakdown, cold room with child, repair request), and polite closing.',
    explanation_de: 'Formelle E-Mail mit passender Anrede, vollständiger Bearbeitung der 3 Leitpunkte und formeller Grußformel.',
    vocabulary_notes: [
      { word: 'die Heizung', translation: 'отопление', translation_en: 'heating' },
      { word: 'kaputt', translation: 'сломанный / неисправный', translation_en: 'broken' },
      { word: 'der Handwerker', translation: 'мастер / специалист по ремонту', translation_en: 'tradesman / technician' }
    ]
  }
];
