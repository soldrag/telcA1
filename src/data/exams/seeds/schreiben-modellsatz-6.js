export const exam = {
  id: 'schreiben-modellsatz-6',
  title: 'telc Deutsch A1 — Schreiben 6',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Тренировочный вариант Schreiben telc A1: анкета на кемпинг и письмо в отель для бронирования номера.',
  test_type: 'schreiben',
  sort_order: 6
};

export const questions = [
  {
    id: 's6-q1',
    exam_id: 'schreiben-modellsatz-6',
    teil: 1,
    question_number: 1,
    title: 'Campingplatz Seewiese • Familienname',
    situation: 'Ihr Kollege Thomas Becker möchte auf dem Campingplatz „Seewiese“ am Chiemsee einen Stellplatz reservieren. Helfen Sie ihm beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Thomas Becker wohnt in Nürnberg in der Gartenstraße 7. Er möchte vom 12. bis 19. Juli für 7 Nächte mit seiner Frau auf dem Campingplatz „Seewiese“ am Chiemsee Urlaub machen. Er reserviert einen Stellplatz für sein Wohnmobil (2 Personen). Die Anzahlung von 50 Euro bezahlt er per Überweisung.',
    statement: 'Feld (1) — Familienname des Gastes:',
    options_json: {
      form_label: 'Familienname',
      accepted_answers: ['becker', 'herr becker', 'thomas becker']
    },
    correct_answer: 'becker',
    clue_quote: 'Ihr Kollege Thomas Becker wohnt in Nürnberg',
    explanation_ru: 'Фамилия гостя — Becker.',
    explanation_en: 'The guest’s surname is Becker.',
    explanation_de: 'Der Familienname lautet Becker.',
    vocabulary_notes: [
      { word: 'der Campingplatz', translation: 'кемпинг / палаточный лагерь', translation_en: 'campsite / campground' }
    ]
  },
  {
    id: 's6-q2',
    exam_id: 'schreiben-modellsatz-6',
    teil: 1,
    question_number: 2,
    title: 'Campingplatz Seewiese • Anzahl Personen',
    situation: 'Ihr Kollege Thomas Becker möchte auf dem Campingplatz „Seewiese“ am Chiemsee einen Stellplatz reservieren. Helfen Sie ihm beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Thomas Becker wohnt in Nürnberg in der Gartenstraße 7. Er möchte vom 12. bis 19. Juli für 7 Nächte mit seiner Frau auf dem Campingplatz „Seewiese“ am Chiemsee Urlaub machen. Er reserviert einen Stellplatz für sein Wohnmobil (2 Personen). Die Anzahlung von 50 Euro bezahlt er per Überweisung.',
    statement: 'Feld (2) — Anzahl der Personen:',
    options_json: {
      form_label: 'Anzahl Personen',
      accepted_answers: ['2', 'zwei', '2 personen', 'zwei personen']
    },
    correct_answer: '2',
    clue_quote: 'mit seiner Frau auf dem Campingplatz „Seewiese“ am Chiemsee Urlaub machen. Er reserviert einen Stellplatz für sein Wohnmobil (2 Personen)',
    explanation_ru: 'Количество человек — 2 (Томас и его супруга).',
    explanation_en: 'Number of persons is 2 (Thomas and his wife).',
    explanation_de: 'Es reisen 2 Personen an.',
    vocabulary_notes: [
      { word: 'die Personenzahl', translation: 'количество человек', translation_en: 'number of people' }
    ]
  },
  {
    id: 's6-q3',
    exam_id: 'schreiben-modellsatz-6',
    teil: 1,
    question_number: 3,
    title: 'Campingplatz Seewiese • Anreisetag',
    situation: 'Ihr Kollege Thomas Becker möchte auf dem Campingplatz „Seewiese“ am Chiemsee einen Stellplatz reservieren. Helfen Sie ihm beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Thomas Becker wohnt in Nürnberg in der Gartenstraße 7. Er möchte vom 12. bis 19. Juli für 7 Nächte mit seiner Frau auf dem Campingplatz „Seewiese“ am Chiemsee Urlaub machen. Er reserviert einen Stellplatz für sein Wohnmobil (2 Personen). Die Anzahlung von 50 Euro bezahlt er per Überweisung.',
    statement: 'Feld (3) — Anreisetag (Datum):',
    options_json: {
      form_label: 'Anreisetag',
      accepted_answers: ['12. juli', '12.07', '12.07.', '12.7.', '12 juli']
    },
    correct_answer: '12. juli|12.07',
    clue_quote: 'vom 12. bis 19. Juli',
    explanation_ru: 'Дата заезда — 12 июля (12. Juli / 12.07).',
    explanation_en: 'Arrival date is July 12th.',
    explanation_de: 'Der Anreisetag ist der 12. Juli.',
    vocabulary_notes: [
      { word: 'der Anreisetag', translation: 'день приезда', translation_en: 'arrival date' }
    ]
  },
  {
    id: 's6-q4',
    exam_id: 'schreiben-modellsatz-6',
    teil: 1,
    question_number: 4,
    title: 'Campingplatz Seewiese • Stellplatztyp',
    situation: 'Ihr Kollege Thomas Becker möchte auf dem Campingplatz „Seewiese“ am Chiemsee einen Stellplatz reservieren. Helfen Sie ihm beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Thomas Becker wohnt in Nürnberg in der Gartenstraße 7. Er möchte vom 12. bis 19. Juli für 7 Nächte mit seiner Frau auf dem Campingplatz „Seewiese“ am Chiemsee Urlaub machen. Er reserviert einen Stellplatz für sein Wohnmobil (2 Personen). Die Anzahlung von 50 Euro bezahlt er per Überweisung.',
    statement: 'Feld (4) — Art des Stellplatzes:',
    options_json: {
      form_label: 'Stellplatztyp',
      accepted_answers: ['stellplatz', 'wohnmobil', 'stellplatz wohnmobil', 'stellplatz für wohnmobil', 'wohnmobilstellplatz']
    },
    correct_answer: 'wohnmobil',
    clue_quote: 'reserviert einen Stellplatz für sein Wohnmobil',
    explanation_ru: 'Тип места — для автодома (Wohnmobil / Stellplatz Wohnmobil).',
    explanation_en: 'Pitch type is for a campervan (Wohnmobil).',
    explanation_de: 'Gewünscht ist ein Stellplatz für ein Wohnmobil.',
    vocabulary_notes: [
      { word: 'das Wohnmobil', translation: 'автодом / кемпер', translation_en: 'motorhome / campervan' }
    ]
  },
  {
    id: 's6-q5',
    exam_id: 'schreiben-modellsatz-6',
    teil: 1,
    question_number: 5,
    title: 'Campingplatz Seewiese • Zahlungsart',
    situation: 'Ihr Kollege Thomas Becker möchte auf dem Campingplatz „Seewiese“ am Chiemsee einen Stellplatz reservieren. Helfen Sie ihm beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihr Kollege Thomas Becker wohnt in Nürnberg in der Gartenstraße 7. Er möchte vom 12. bis 19. Juli für 7 Nächte mit seiner Frau auf dem Campingplatz „Seewiese“ am Chiemsee Urlaub machen. Er reserviert einen Stellplatz für sein Wohnmobil (2 Personen). Die Anzahlung von 50 Euro bezahlt er per Überweisung.',
    statement: 'Feld (5) — Zahlungsweise:',
    options_json: {
      form_label: 'Zahlungsweise',
      accepted_answers: ['überweisung', 'ueberweisung', 'per überweisung', 'banküberweisung']
    },
    correct_answer: 'überweisung',
    clue_quote: 'Die Anzahlung von 50 Euro bezahlt er per Überweisung',
    explanation_ru: 'Способ оплаты — банковский перевод (Überweisung / per Überweisung).',
    explanation_en: 'Payment method is bank transfer (Überweisung).',
    explanation_de: 'Die Bezahlung erfolgt per Überweisung.',
    vocabulary_notes: [
      { word: 'die Überweisung', translation: 'банковский перевод', translation_en: 'bank transfer' }
    ]
  },
  {
    id: 's6-q6',
    exam_id: 'schreiben-modellsatz-6',
    teil: 2,
    level: 'A1',
    question_number: 6,
    title: 'Teil 2 • Zimmerreservierung im Hotel Alpenblick',
    situation: 'Sie möchten im August Urlaub in den Bergen machen. Schreiben Sie eine E-Mail an das Hotel „Alpenblick“ in Garmisch.',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben\n2. Wann und wie lange\n3. Frühstück und Parkplatz',
    statement: 'Schreiben Sie eine kurze E-Mail (ca. 30 Wörter). Denken Sie an Anrede und Gruß.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben',
        'Wann und wie lange',
        'Frühstück und Parkplatz'
      ],
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben',
            intent: 'REASON_EXPLANATION',
            keywords: ['zimmer', 'reservieren', 'buchen', 'urlaub', 'hotel', 'übernachten', 'uebernachten', 'einzelzimmer', 'doppelzimmer'],
            requiredMatches: 2
          },
          {
            id: 'lp2',
            label: 'Wann und wie lange',
            intent: 'GENERAL',
            evidence: 'temporal',
            keywords: ['august', 'woche', 'tage', 'vom', 'bis', 'anreise', 'bleiben', 'zeit'],
            requiredMatches: 2
          },
          {
            id: 'lp3',
            label: 'Frühstück und Parkplatz',
            intent: 'INFORMATION_REQUEST',
            keywords: ['frühstück', 'fruehstueck', 'parkplatz', 'auto', 'parken', 'kosten', 'inklusive', 'gibt'],
            requiredMatches: 2,
            aspects: [
              {
                label: 'Frühstück',
                keywords: ['frühstück', 'fruehstueck', 'essen', 'inklusive']
              },
              {
                label: 'Parkplatz',
                keywords: ['parkplatz', 'auto', 'parken', 'garage']
              }
            ]
          }
        ]
      },
      sample_solution: 'Sehr geehrte Damen und Herren,\n\nich möchte im August ein Einzelzimmer in Ihrem Hotel reservieren. Ich komme vom 14. bis 21. August und bleibe eine Woche. Gibt es bei Ihnen ein Frühstück und haben Sie einen Parkplatz für mein Auto?\n\nMit freundlichen Grüßen\nThomas Becker',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrte Damen und Herren,' },
        { label: 'Punkt 1 (Grund: Zimmer reservieren)', text: 'ich möchte im August ein Einzelzimmer in Ihrem Hotel reservieren.' },
        { label: 'Punkt 2 (Zeitraum: 14. bis 21. August)', text: 'Ich komme vom 14. bis 21. August und bleibe eine Woche.' },
        { label: 'Punkt 3 (Frühstück und Parkplatz)', text: 'Gibt es bei Ihnen ein Frühstück und haben Sie einen Parkplatz für mein Auto?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrte Damen und Herren, ich möchte im August ein Einzelzimmer in Ihrem Hotel reservieren',
    explanation_ru: 'Образцовое официальное письмо уровня A1: стандартное обращение (Sehr geehrte Damen und Herren), ответ на 3 пункта плана (бронирование номера, даты приезда и срок, вопросы о завтраке и парковке) и официальная концовка (Mit freundlichen Grüßen).',
    explanation_en: 'Sample formal A1 email: standard formal salutation, full coverage of the 3 points (room booking, dates/duration, breakfast/parking inquiry), and formal sign-off.',
    explanation_de: 'Formelle Reservierungsanfrage für telc A1 mit korrekter Anrede, vollständigen Angaben zu den drei Leitpunkten und formeller Grußformel.',
    vocabulary_notes: [
      { word: 'reservieren', translation: 'бронировать / резервировать', translation_en: 'to reserve / book' },
      { word: 'das Frühstück', translation: 'завтрак', translation_en: 'breakfast' },
      { word: 'der Parkplatz', translation: 'парковка / парковочное место', translation_en: 'parking space' }
    ]
  }
];
