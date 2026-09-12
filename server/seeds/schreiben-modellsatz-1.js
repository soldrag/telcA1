export const exam = {
  id: 'schreiben-modellsatz-1',
  title: 'telc Deutsch A1 — Schreiben 1',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Официальный тренировочный вариант Schreiben telc A1: заполнение гостиничного формуляра и письмо в языковую школу.',
  test_type: 'schreiben',
  time_limit_minutes: 15,
  total_questions: 6,
  pass_score: 9,
  sort_order: 1
};

export const questions = [
  {
    id: 's1-q1',
    exam_id: 'schreiben-modellsatz-1',
    teil: 1,
    question_number: 1,
    title: 'Anmeldung Hotel Elbflorenz • Familienname',
    situation: 'Ihre Freundin Eva Bauer macht mit ihrem Mann und ihrem 6-jährigen Sohn Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Hotelformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Eva Bauer wohnt in Köln, Poststraße 14. Sie möchte für 4 Nächte vom 18. bis 22. Juli mit ihrem Mann Michael und ihrem 6-jährigen Sohn Lukas im Hotel „Elbflorenz“ in Dresden übernachten. Sie bucht ein Doppelzimmer mit Zusatzbett für das Kind und bezahlt mit Kreditkarte.',
    statement: 'Feld (1) — Familienname der Gäste:',
    options_json: {
      form_label: 'Familienname',
      placeholder: 'z. B. Bauer',
      accepted_answers: ['bauer', 'familie bauer', 'frau bauer']
    },
    correct_answer: 'bauer',
    clue_quote: 'Ihre Freundin Eva Bauer wohnt in Köln',
    explanation_ru: 'Фамилия гостьи — Bauer.',
    explanation_en: 'The guest family name is Bauer.',
    explanation_de: 'Der Familienname lautet Bauer.',
    vocabulary_notes: [
      { word: 'der Familienname', translation: 'фамилия', translation_en: 'surname / family name' }
    ]
  },
  {
    id: 's1-q2',
    exam_id: 'schreiben-modellsatz-1',
    teil: 1,
    question_number: 2,
    title: 'Anmeldung Hotel Elbflorenz • Anzahl Personen',
    situation: 'Ihre Freundin Eva Bauer macht mit ihrem Mann und ihrem 6-jährigen Sohn Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Hotelformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Eva Bauer wohnt in Köln, Poststraße 14. Sie möchte für 4 Nächte vom 18. bis 22. Juli mit ihrem Mann Michael und ihrem 6-jährigen Sohn Lukas im Hotel „Elbflorenz“ in Dresden übernachten. Sie bucht ein Doppelzimmer mit Zusatzbett für das Kind und bezahlt mit Kreditkarte.',
    statement: 'Feld (2) — Anzahl der Personen (gesamt):',
    options_json: {
      form_label: 'Anzahl Personen',
      placeholder: 'z. B. 3',
      accepted_answers: ['3', 'drei', '3 personen', 'drei personen', '2 erwachsene 1 kind']
    },
    correct_answer: '3',
    clue_quote: 'mit ihrem Mann Michael und ihrem 6-jährigen Sohn Lukas',
    explanation_ru: 'Всего едут 3 человека: Ева, муж и сын (3 Personen).',
    explanation_en: 'Total 3 persons: Eva, husband and son.',
    explanation_de: 'Insgesamt 3 Personen (Eva, ihr Mann und ihr Sohn).',
    vocabulary_notes: [
      { word: 'die Anzahl', translation: 'количество / число', translation_en: 'number / quantity' }
    ]
  },
  {
    id: 's1-q3',
    exam_id: 'schreiben-modellsatz-1',
    teil: 1,
    question_number: 3,
    title: 'Anmeldung Hotel Elbflorenz • Anreisetag',
    situation: 'Ihre Freundin Eva Bauer macht mit ihrem Mann und ihrem 6-jährigen Sohn Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Hotelformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Eva Bauer wohnt in Köln, Poststraße 14. Sie möchte für 4 Nächte vom 18. bis 22. Juli mit ihrem Mann Michael und ihrem 6-jährigen Sohn Lukas im Hotel „Elbflorenz“ in Dresden übernachten. Sie bucht ein Doppelzimmer mit Zusatzbett für das Kind und bezahlt mit Kreditkarte.',
    statement: 'Feld (3) — Anreisetag (Datum):',
    options_json: {
      form_label: 'Anreisetag',
      placeholder: 'z. B. 18. Juli',
      accepted_answers: ['18. juli', '18.07', '18.07.', '18.7.', '18 juli']
    },
    correct_answer: '18. juli|18.07',
    clue_quote: 'vom 18. bis 22. Juli',
    explanation_ru: 'Дата заезда (Anreise) — 18 июля (18. Juli / 18.07).',
    explanation_en: 'Arrival date is July 18th.',
    explanation_de: 'Der Anreisetag ist der 18. Juli.',
    vocabulary_notes: [
      { word: 'die Anreise', translation: 'прибытие / заезд', translation_en: 'arrival' }
    ]
  },
  {
    id: 's1-q4',
    exam_id: 'schreiben-modellsatz-1',
    teil: 1,
    question_number: 4,
    title: 'Anmeldung Hotel Elbflorenz • Zimmertyp',
    situation: 'Ihre Freundin Eva Bauer macht mit ihrem Mann und ihrem 6-jährigen Sohn Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Hotelformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Eva Bauer wohnt in Köln, Poststraße 14. Sie möchte für 4 Nächte vom 18. bis 22. Juli mit ihrem Mann Michael und ihrem 6-jährigen Sohn Lukas im Hotel „Elbflorenz“ in Dresden übernachten. Sie bucht ein Doppelzimmer mit Zusatzbett für das Kind und bezahlt mit Kreditkarte.',
    statement: 'Feld (4) — Gewünschter Zimmertyp:',
    options_json: {
      form_label: 'Zimmertyp',
      placeholder: 'z. B. Doppelzimmer',
      accepted_answers: ['doppelzimmer', 'doppelzimmer mit zusatzbett', 'dz']
    },
    correct_answer: 'doppelzimmer',
    clue_quote: 'Sie bucht ein Doppelzimmer mit Zusatzbett',
    explanation_ru: 'Тип номера — двухместный (Doppelzimmer).',
    explanation_en: 'Room type is a double room (Doppelzimmer).',
    explanation_de: 'Gewünscht ist ein Doppelzimmer.',
    vocabulary_notes: [
      { word: 'das Doppelzimmer', translation: 'двухместный номер', translation_en: 'double room' }
    ]
  },
  {
    id: 's1-q5',
    exam_id: 'schreiben-modellsatz-1',
    teil: 1,
    question_number: 5,
    title: 'Anmeldung Hotel Elbflorenz • Zahlungsweise',
    situation: 'Ihre Freundin Eva Bauer macht mit ihrem Mann und ihrem 6-jährigen Sohn Urlaub in Dresden. Helfen Sie ihr beim Ausfüllen des Hotelformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Eva Bauer wohnt in Köln, Poststraße 14. Sie möchte für 4 Nächte vom 18. bis 22. Juli mit ihrem Mann Michael und ihrem 6-jährigen Sohn Lukas im Hotel „Elbflorenz“ in Dresden übernachten. Sie bucht ein Doppelzimmer mit Zusatzbett für das Kind und bezahlt mit Kreditkarte.',
    statement: 'Feld (5) — Zahlungsart / Bezahlung:',
    options_json: {
      form_label: 'Zahlungsweise',
      placeholder: 'z. B. Kreditkarte',
      accepted_answers: ['kreditkarte', 'mit kreditkarte', 'per kreditkarte']
    },
    correct_answer: 'kreditkarte',
    clue_quote: 'bezahlt mit Kreditkarte',
    explanation_ru: 'Способ оплаты — кредитная карта (Kreditkarte).',
    explanation_en: 'Payment method is credit card.',
    explanation_de: 'Die Zahlungsweise ist Kreditkarte.',
    vocabulary_notes: [
      { word: 'die Zahlungsweise', translation: 'способ оплаты', translation_en: 'method of payment' }
    ]
  },
  {
    id: 's1-q6',
    exam_id: 'schreiben-modellsatz-1',
    teil: 2,
    question_number: 6,
    title: 'Teil 2 • E-Mail an eine Sprachschule',
    situation: 'Sie möchten im August einen Deutschkurs an der Sprachschule „Aktiv“ in München besuchen. Schreiben Sie eine kurze E-Mail an die Schule.',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben (Deutschkurs A1 im August)\n2. Wann und wie lange (Termin, 4 Wochen, vormittags)\n3. Frage nach Kursgebühren und Anmeldung',
    statement: 'Verfassen Sie eine E-Mail (ca. 30 Wörter). Beachten Sie Anrede, 3 Leitpunkte und Grußformel.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben (Deutschkurs A1 im August)',
        'Wann und wie lange (Termin, 4 Wochen, vormittags)',
        'Frage nach den Kurskosten und Anmeldung'
      ],
      sample_solution: 'Sehr geehrte Damen und Herren,\n\nich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen. Ich habe vier Wochen Zeit und möchte gern vormittags lernen. Wie viel kostet der Kurs und wie kann ich mich anmelden?\n\nMit freundlichen Grüßen\nMaria Ivanova',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrte Damen und Herren,' },
        { label: 'Punkt 1 (Grund)', text: 'ich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen.' },
        { label: 'Punkt 2 (Zeit/Dauer)', text: 'Ich habe vier Wochen Zeit und möchte gern vormittags lernen.' },
        { label: 'Punkt 3 (Kosten/Anmeldung)', text: 'Wie viel kostet der Kurs und wie kann ich mich anmelden?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrte Damen und Herren, ich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule machen...',
    explanation_ru: 'Образцовое письмо уровня A1: вежливое официальное обращение (Sehr geehrte Damen und Herren), 3 предложения по пунктам плана (причина, сроки, вопрос о стоимости и записи) и формула вежливости (Mit freundlichen Grüßen).',
    explanation_en: 'Sample A1 email: formal salutation, covering all 3 guide points (reason, time/duration, cost/registration inquiry), and polite sign-off.',
    explanation_de: 'telc A1 Musterlösung mit formeller Anrede, vollständiger Bearbeitung aller drei Leitpunkte und korrekter Grußformel.',
    vocabulary_notes: [
      { word: 'Sehr geehrte Damen und Herren', translation: 'Уважаемые дамы и господа (официальное обращение)', translation_en: 'Dear Sir or Madam' },
      { word: 'sich anmelden', translation: 'зарегистрироваться / записаться', translation_en: 'to register / sign up' },
      { word: 'Mit freundlichen Grüßen', translation: 'С наилучшими пожеланиями', translation_en: 'Yours sincerely' }
    ]
  }
];
