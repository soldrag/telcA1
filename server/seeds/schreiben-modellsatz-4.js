export const exam = {
  id: 'schreiben-modellsatz-4',
  title: 'telc Deutsch A1 — Schreiben 4',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Оригинальный тренировочный вариант Schreiben telc A1: запись на кулинарные курсы и бронирование апартаментов для отпуска.',
  test_type: 'schreiben',
  time_limit_minutes: 15,
  total_questions: 6,
  pass_score: 9,
  sort_order: 4
};

export const questions = [
  {
    id: 's4-q1',
    exam_id: 'schreiben-modellsatz-4',
    teil: 1,
    question_number: 1,
    title: 'Volkshochschule Bremen • Familienname',
    situation: 'Ihr Freund David Weber möchte mit seiner Frau einen Kochkurs an der Volkshochschule Bremen besuchen. Helfen Sie ihm beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Freund David Weber wohnt in Bremen in der Parkstraße 10. Er möchte ab dem 15. November zusammen mit seiner Frau an dem Abendkurs „Italienische Küche“ teilnehmen. Sie kommen zu zweit (2 Personen). Er bezahlt die Kursgebühr von 80 Euro direkt mit Kreditkarte.',
    statement: 'Feld (1) — Familienname des Teilnehmers:',
    options_json: {
      form_label: 'Familienname',
      accepted_answers: ['weber', 'herr weber', 'david weber']
    },
    correct_answer: 'weber',
    clue_quote: 'Ihr Freund David Weber wohnt in Bremen',
    explanation_ru: 'Фамилия участника — Weber.',
    explanation_en: 'The participant’s last name is Weber.',
    explanation_de: 'Der Familienname lautet Weber.',
    vocabulary_notes: [
      { word: 'der Teilnehmer', translation: 'участник', translation_en: 'participant' }
    ]
  },
  {
    id: 's4-q2',
    exam_id: 'schreiben-modellsatz-4',
    teil: 1,
    question_number: 2,
    title: 'Volkshochschule Bremen • Anzahl Personen',
    situation: 'Ihr Freund David Weber möchte mit seiner Frau einen Kochkurs an der Volkshochschule Bremen besuchen. Helfen Sie ihm beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Freund David Weber wohnt in Bremen in der Parkstraße 10. Er möchte ab dem 15. November zusammen mit seiner Frau an dem Abendkurs „Italienische Küche“ teilnehmen. Sie kommen zu zweit (2 Personen). Er bezahlt die Kursgebühr von 80 Euro direkt mit Kreditkarte.',
    statement: 'Feld (2) — Anzahl der Personen:',
    options_json: {
      form_label: 'Anzahl Personen',
      accepted_answers: ['2', 'zwei', '2 personen', 'zwei personen']
    },
    correct_answer: '2',
    clue_quote: 'Sie kommen zu zweit (2 Personen)',
    explanation_ru: 'Количество участников — 2 человека (Давид и его супруга).',
    explanation_en: 'Number of participants is 2 (David and his wife).',
    explanation_de: 'Es nehmen 2 Personen teil.',
    vocabulary_notes: [
      { word: 'die Personenzahl', translation: 'количество человек', translation_en: 'number of people' }
    ]
  },
  {
    id: 's4-q3',
    exam_id: 'schreiben-modellsatz-4',
    teil: 1,
    question_number: 3,
    title: 'Volkshochschule Bremen • Kursbezeichnung',
    situation: 'Ihr Freund David Weber möchte mit seiner Frau einen Kochkurs an der Volkshochschule Bremen besuchen. Helfen Sie ihm beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Freund David Weber wohnt in Bremen in der Parkstraße 10. Er möchte ab dem 15. November zusammen mit seiner Frau an dem Abendkurs „Italienische Küche“ teilnehmen. Sie kommen zu zweit (2 Personen). Er bezahlt die Kursgebühr von 80 Euro direkt mit Kreditkarte.',
    statement: 'Feld (3) — Kursname / Kursthema:',
    options_json: {
      form_label: 'Kursthema',
      accepted_answers: ['italienische küche', 'italienische kueche', 'italienisch']
    },
    correct_answer: 'italienische küche',
    clue_quote: 'an dem Abendkurs „Italienische Küche“ teilnehmen',
    explanation_ru: 'Тема курса — Italienische Küche.',
    explanation_en: 'Course subject is Italian Cuisine (Italienische Küche).',
    explanation_de: 'Das Kursthema ist Italienische Küche.',
    vocabulary_notes: [
      { word: 'die Küche', translation: 'кухня / кулинария', translation_en: 'cuisine / kitchen' }
    ]
  },
  {
    id: 's4-q4',
    exam_id: 'schreiben-modellsatz-4',
    teil: 1,
    question_number: 4,
    title: 'Volkshochschule Bremen • Kursbeginn',
    situation: 'Ihr Freund David Weber möchte mit seiner Frau einen Kochkurs an der Volkshochschule Bremen besuchen. Helfen Sie ihm beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Freund David Weber wohnt in Bremen in der Parkstraße 10. Er möchte ab dem 15. November zusammen mit seiner Frau an dem Abendkurs „Italienische Küche“ teilnehmen. Sie kommen zu zweit (2 Personen). Er bezahlt die Kursgebühr von 80 Euro direkt mit Kreditkarte.',
    statement: 'Feld (4) — Kursbeginn (Datum):',
    options_json: {
      form_label: 'Kursbeginn',
      accepted_answers: ['15. november', '15.11', '15.11.', '15 november']
    },
    correct_answer: '15. november|15.11',
    clue_quote: 'Er möchte ab dem 15. November zusammen mit seiner Frau',
    explanation_ru: 'Дата начала курса — 15 ноября (15. November / 15.11).',
    explanation_en: 'Course start date is November 15th.',
    explanation_de: 'Der Kurs beginnt am 15. November.',
    vocabulary_notes: [
      { word: 'der Kursbeginn', translation: 'начало курса', translation_en: 'start of course' }
    ]
  },
  {
    id: 's4-q5',
    exam_id: 'schreiben-modellsatz-4',
    teil: 1,
    question_number: 5,
    title: 'Volkshochschule Bremen • Zahlungsart',
    situation: 'Ihr Freund David Weber möchte mit seiner Frau einen Kochkurs an der Volkshochschule Bremen besuchen. Helfen Sie ihm beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Freund David Weber wohnt in Bremen in der Parkstraße 10. Er möchte ab dem 15. November zusammen mit seiner Frau an dem Abendkurs „Italienische Küche“ teilnehmen. Sie kommen zu zweit (2 Personen). Er bezahlt die Kursgebühr von 80 Euro direkt mit Kreditkarte.',
    statement: 'Feld (5) — Zahlungsweise:',
    options_json: {
      form_label: 'Zahlungsweise',
      accepted_answers: ['kreditkarte', 'mit kreditkarte', 'per kreditkarte']
    },
    correct_answer: 'kreditkarte',
    clue_quote: 'direkt mit Kreditkarte',
    explanation_ru: 'Оплата производится кредитной картой (Kreditkarte).',
    explanation_en: 'Payment is by credit card (Kreditkarte).',
    explanation_de: 'Die Bezahlung erfolgt mit Kreditkarte.',
    vocabulary_notes: [
      { word: 'die Kreditkarte', translation: 'кредитная карта', translation_en: 'credit card' }
    ]
  },
  {
    id: 's4-q6',
    exam_id: 'schreiben-modellsatz-4',
    teil: 2,
    question_number: 6,
    title: 'Teil 2 • Buchungsanfrage Ferienwohnung Ostsee',
    situation: 'Sie möchten im Sommer mit Ihrer Familie Urlaub an der Ostsee machen. Schreiben Sie eine E-Mail an Frau Hansen (Ferienwohnung „Meeresbrise“).',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben (Ferienwohnung an der Ostsee mieten)\n2. Personen und Zeitraum (2 Erwachsene, 1 Kind, 10. bis 17. Juli)\n3. Preis und Haustiere (Kosten der Wohnung, Hund erlaubt?)',
    statement: 'Schreiben Sie eine kurze E-Mail (ca. 30 Wörter). Denken Sie an Anrede und Gruß.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben (Ferienwohnung an der Ostsee mieten)',
        'Personen und Zeitraum (2 Erwachsene, 1 Kind, 10. bis 17. Juli)',
        'Preis und Haustiere (Kosten der Wohnung, Hund erlaubt?)'
      ],
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben (Ferienwohnung an der Ostsee mieten)',
            keywords: ['ferienwohnung', 'wohnung', 'urlaub', 'mieten', 'buchen', 'reservieren', 'ostsee', 'juli'],
            requiredMatches: 2,
            conversive_rules: [
              {
                forbiddenLemma: 'vermieten',
                expectedLemma: 'mieten',
                messageDe: 'Als Gast möchten Sie die Ferienwohnung „mieten“, nicht „vermieten“.'
              }
            ]
          },
          {
            id: 'lp2',
            label: 'Personen und Zeitraum (2 Erwachsene, 1 Kind, 10. bis 17. Juli)',
            keywords: ['erwachsene', 'kind', 'kinder', 'woche', 'bleiben', 'juli', 'personen'],
            requiredMatches: 2
          },
          {
            id: 'lp3',
            label: 'Preis und Haustiere (Kosten der Wohnung, Hund erlaubt?)',
            keywords: ['kosten', 'kostet', 'preis', 'hund', 'hunde', 'haustiere', 'erlaubt'],
            requiredMatches: 2,
            semantic_slots: [
              {
                predicateLemmas: ['kosten', 'preis'],
                allowedCategories: ['rental_object'],
                incompatibleCategories: ['pet', 'person'],
                conflictMessageDe: 'Sinnentstellung: Erfragt wird der Preis der Wohnung, nicht der Preis eines Haustiers.'
              },
              {
                predicateLemmas: ['erlaubt', 'erlauben'],
                allowedCategories: ['pet'],
                incompatibleCategories: ['rental_object'],
                conflictMessageDe: 'Sinnentstellung: Erfragt wird, ob Haustiere erlaubt sind (nicht die Wohnung).'
              }
            ]
          }
        ]
      },
      sample_solution: 'Sehr geehrte Frau Hansen,\n\nich möchte im Juli eine Ferienwohnung an der Ostsee mieten. Wir sind zwei Erwachsene und ein Kind und möchten vom 10. bis 17. Juli bleiben. Wie viel kostet die Wohnung und sind Hunde erlaubt?\n\nMit freundlichen Grüßen\nDavid Weber',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrte Frau Hansen,' },
        { label: 'Punkt 1 (Grund: Ferienwohnung)', text: 'ich möchte im Juli eine Ferienwohnung an der Ostsee mieten.' },
        { label: 'Punkt 2 (Personen / Zeitraum)', text: 'Wir sind zwei Erwachsene und ein Kind und möchten vom 10. bis 17. Juli bleiben.' },
        { label: 'Punkt 3 (Preis / Hund)', text: 'Wie viel kostet die Wohnung und sind Hunde erlaubt?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrte Frau Hansen, ich möchte im Juli eine Ferienwohnung an der Ostsee mieten.',
    explanation_ru: 'Образцовое письмо уровня A1: вежливое официальное обращение по фамилии (Sehr geehrte Frau Hansen), ответ на все 3 пункта плана (аренда жилья, количество гостей и даты, вопрос о цене и собаке) и корректная формула вежливости (Mit freundlichen Grüßen).',
    explanation_en: 'A1 sample email: formal personalized salutation, clear fulfillment of 3 guide points, and standard formal closing.',
    explanation_de: 'Vollständige Musterlösung für telc A1 mit formeller Anrede, Bearbeitung aller drei Leitpunkte und Verabschiedung.',
    vocabulary_notes: [
      { word: 'die Ferienwohnung', translation: 'квартира для отпуска / апартаменты', translation_en: 'holiday apartment' },
      { word: 'mieten', translation: 'арендовать / снимать', translation_en: 'to rent' },
      { word: 'erlaubt', translation: 'разрешено', translation_en: 'allowed / permitted' }
    ]
  }
];
