export const exam = {
  id: 'schreiben-modellsatz-2',
  title: 'telc Deutsch A1 — Schreiben 2',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Официальный тренировочный вариант Schreiben telc A1: анкета в библиотеку и письмо об отмене визита к врачу.',
  test_type: 'schreiben',
  time_limit_minutes: 15,
  total_questions: 6,
  pass_score: 9,
  sort_order: 2
};

export const questions = [
  {
    id: 's2-q1',
    exam_id: 'schreiben-modellsatz-2',
    teil: 1,
    question_number: 1,
    title: 'Stadtbibliothek Leipzig • Familienname',
    situation: 'Ihr Kollege Stefan Müller möchte Mitglied in der Stadtbibliothek Leipzig werden. Füllen Sie das Formular für ihn aus.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Stefan Müller wurde am 12.03.1994 in Frankfurt geboren. Er wohnt jetzt in Leipzig, Goethestraße 8. Er möchte einen Bibliotheksausweis für ein ganzes Jahr und bezahlt die Gebühr bar vor Ort.',
    statement: 'Feld (1) — Familienname des Lesers:',
    options_json: {
      form_label: 'Familienname',
      placeholder: 'z. B. Müller',
      accepted_answers: ['müller', 'mueller']
    },
    correct_answer: 'müller',
    clue_quote: 'Ihr Kollege Stefan Müller',
    explanation_ru: 'Фамилия читателя — Müller.',
    explanation_en: 'The reader’s last name is Müller.',
    explanation_de: 'Der Familienname lautet Müller.',
    vocabulary_notes: [
      { word: 'der Ausweis', translation: 'удостоверение / билет', translation_en: 'ID card / library card' }
    ]
  },
  {
    id: 's2-q2',
    exam_id: 'schreiben-modellsatz-2',
    teil: 1,
    question_number: 2,
    title: 'Stadtbibliothek Leipzig • Geburtsdatum',
    situation: 'Ihr Kollege Stefan Müller möchte Mitglied in der Stadtbibliothek Leipzig werden. Füllen Sie das Formular für ihn aus.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Stefan Müller wurde am 12.03.1994 in Frankfurt geboren. Er wohnt jetzt in Leipzig, Goethestraße 8. Er möchte einen Bibliotheksausweis für ein ganzes Jahr und bezahlt die Gebühr bar vor Ort.',
    statement: 'Feld (2) — Geburtsdatum:',
    options_json: {
      form_label: 'Geburtsdatum',
      placeholder: 'z. B. 12.03.1994',
      accepted_answers: ['12.03.1994', '12.03.94', '12. märz 1994', '12 märz 1994']
    },
    correct_answer: '12.03.1994',
    clue_quote: 'wurde am 12.03.1994 in Frankfurt geboren',
    explanation_ru: 'Дата рождения — 12.03.1994.',
    explanation_en: 'Date of birth is 12.03.1994.',
    explanation_de: 'Das Geburtsdatum ist der 12.03.1994.',
    vocabulary_notes: [
      { word: 'das Geburtsdatum', translation: 'дата рождения', translation_en: 'date of birth' }
    ]
  },
  {
    id: 's2-q3',
    exam_id: 'schreiben-modellsatz-2',
    teil: 1,
    question_number: 3,
    title: 'Stadtbibliothek Leipzig • Wohnort',
    situation: 'Ihr Kollege Stefan Müller möchte Mitglied in der Stadtbibliothek Leipzig werden. Füllen Sie das Formular für ihn aus.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Stefan Müller wurde am 12.03.1994 in Frankfurt geboren. Er wohnt jetzt in Leipzig, Goethestraße 8. Er möchte einen Bibliotheksausweis für ein ganzes Jahr und bezahlt die Gebühr bar vor Ort.',
    statement: 'Feld (3) — Wohnort:',
    options_json: {
      form_label: 'Wohnort / Stadt',
      placeholder: 'z. B. Leipzig',
      accepted_answers: ['leipzig']
    },
    correct_answer: 'leipzig',
    clue_quote: 'Er wohnt jetzt in Leipzig',
    explanation_ru: 'Город проживания — Leipzig (родился во Франкфурте, но живет в Лейпциге).',
    explanation_en: 'City of residence is Leipzig.',
    explanation_de: 'Der Wohnort ist Leipzig.',
    vocabulary_notes: [
      { word: 'der Wohnort', translation: 'место жительства', translation_en: 'place of residence' }
    ]
  },
  {
    id: 's2-q4',
    exam_id: 'schreiben-modellsatz-2',
    teil: 1,
    question_number: 4,
    title: 'Stadtbibliothek Leipzig • Gültigkeitsdauer',
    situation: 'Ihr Kollege Stefan Müller möchte Mitglied in der Stadtbibliothek Leipzig werden. Füllen Sie das Formular für ihn aus.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Stefan Müller wurde am 12.03.1994 in Frankfurt geboren. Er wohnt jetzt in Leipzig, Goethestraße 8. Er möchte einen Bibliotheksausweis für ein ganzes Jahr und bezahlt die Gebühr bar vor Ort.',
    statement: 'Feld (4) — Dauer der Mitgliedschaft:',
    options_json: {
      form_label: 'Dauer der Karte',
      placeholder: 'z. B. 1 Jahr',
      accepted_answers: ['1 jahr', 'ein jahr', 'jahreskarte', '12 monate']
    },
    correct_answer: '1 jahr|jahreskarte',
    clue_quote: 'für ein ganzes Jahr',
    explanation_ru: 'Срок действия карты — 1 год / годовой абонемент (1 Jahr / Jahreskarte).',
    explanation_en: 'Membership duration is 1 year (1 Jahr / Jahreskarte).',
    explanation_de: 'Die gewünschte Dauer ist 1 Jahr.',
    vocabulary_notes: [
      { word: 'die Jahreskarte', translation: 'годовой абонемент', translation_en: 'annual pass' }
    ]
  },
  {
    id: 's2-q5',
    exam_id: 'schreiben-modellsatz-2',
    teil: 1,
    question_number: 5,
    title: 'Stadtbibliothek Leipzig • Zahlungsart',
    situation: 'Ihr Kollege Stefan Müller möchte Mitglied in der Stadtbibliothek Leipzig werden. Füllen Sie das Formular für ihn aus.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Stefan Müller wurde am 12.03.1994 in Frankfurt geboren. Er wohnt jetzt in Leipzig, Goethestraße 8. Er möchte einen Bibliotheksausweis für ein ganzes Jahr und bezahlt die Gebühr bar vor Ort.',
    statement: 'Feld (5) — Zahlungsart:',
    options_json: {
      form_label: 'Zahlungsart',
      placeholder: 'z. B. Bar',
      accepted_answers: ['bar', 'barzahlung', 'in bar']
    },
    correct_answer: 'bar',
    clue_quote: 'bezahlt die Gebühr bar vor Ort',
    explanation_ru: 'Оплата производится наличными (bar / Barzahlung).',
    explanation_en: 'Payment is cash (bar).',
    explanation_de: 'Die Zahlungsart ist bar.',
    vocabulary_notes: [
      { word: 'bar', translation: 'наличными', translation_en: 'cash' }
    ]
  },
  {
    id: 's2-q6',
    exam_id: 'schreiben-modellsatz-2',
    teil: 2,
    question_number: 6,
    title: 'Teil 2 • Terminabsage beim Arzt',
    situation: 'Sie haben am Montag um 14:00 Uhr einen Termin in der Praxis Dr. Schneider. Sie können aber nicht kommen. Schreiben Sie eine E-Mail an die Arztpraxis.',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben (Termin am Montag absagen)\n2. Warum können Sie nicht kommen (krank / Überstunden bei der Arbeit)\n3. Neuer Terminvorschlag (nächste Woche Dienstag oder Mittwoch)',
    statement: 'Schreiben Sie eine kurze E-Mail (ca. 30 Wörter). Denken Sie an Anrede und Gruß.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben (Termin am Montag absagen)',
        'Warum (Überstunden oder Arbeit)',
        'Neuer Terminvorschlag (Dienstag oder Mittwoch)'
      ],
      sample_solution: 'Sehr geehrte Damen und Herren,\n\nich habe am Montag um 14 Uhr einen Termin bei Herrn Dr. Schneider. Leider muss ich länger arbeiten und kann nicht kommen. Haben Sie nächste Woche am Dienstag oder Mittwoch einen neuen Termin frei?\n\nMit freundlichen Grüßen\nStefan Müller',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrte Damen und Herren,' },
        { label: 'Punkt 1 (Termin absagen)', text: 'ich habe am Montag um 14 Uhr einen Termin bei Dr. Schneider.' },
        { label: 'Punkt 2 (Begründung)', text: 'Leider muss ich länger arbeiten und kann nicht kommen.' },
        { label: 'Punkt 3 (Neuer Termin)', text: 'Haben Sie nächste Woche am Dienstag oder Mittwoch Zeit?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrte Damen und Herren, leider kann ich am Montag nicht zum Termin kommen...',
    explanation_ru: 'В письме присутствуют: официальное обращение (Sehr geehrte Damen und Herren), отмена текущего времени (Montag 14 Uhr), уважительная причина и предложение новых дат (Dienstag/Mittwoch), а также вежливое заключение (Mit freundlichen Grüßen).',
    explanation_en: 'Sample email covers appointment cancellation, valid reason, proposal for a new date, and polite salutation/closing.',
    explanation_de: 'Musterlösung für die Terminabsage mit korrekter Höflichkeitsform und vollständigen Leitpunkten.',
    vocabulary_notes: [
      { word: 'der Termin', translation: 'запись / встреча на определенное время', translation_en: 'appointment' },
      { word: 'absagen', translation: 'отменять', translation_en: 'to cancel' },
      { word: 'verschieben', translation: 'переносить', translation_en: 'to reschedule' }
    ]
  }
];
