export const exam = {
  id: 'schreiben-modellsatz-7',
  title: 'telc Deutsch A1 — Schreiben 7',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Тренировочный вариант Schreiben telc A1: аренда велосипедов на вокзале и запрос на просмотр квартиры.',
  test_type: 'schreiben',
  sort_order: 7
};

export const questions = [
  {
    id: 's7-q1',
    exam_id: 'schreiben-modellsatz-7',
    teil: 1,
    question_number: 1,
    title: 'Radstation München • Familienname',
    situation: 'Ihre Freundin Elena Rossi möchte an der Radstation am Hauptbahnhof in München Fahrräder für sich und ihre Familie leihen. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Elena Rossi wohnt in Augsburg, Maximilianstraße 15. Sie möchte am 10. Juni für ein Wochenende (2 Tage) an der Radstation am Hauptbahnhof in München drei Fahrräder mieten: ein Damenrad und zwei Kinderräder. Die Kaution bezahlt sie mit Kreditkarte.',
    statement: 'Feld (1) — Familienname der Kundin:',
    options_json: {
      form_label: 'Familienname',
      accepted_answers: ['rossi', 'frau rossi', 'elena rossi']
    },
    correct_answer: 'rossi',
    clue_quote: 'Ihre Freundin Elena Rossi wohnt in Augsburg',
    explanation_ru: 'Фамилия клиентки — Rossi.',
    explanation_en: 'The customer’s surname is Rossi.',
    explanation_de: 'Der Familienname lautet Rossi.',
    vocabulary_notes: [
      { word: 'der Familienname', translation: 'фамилия', translation_en: 'surname / family name' }
    ]
  },
  {
    id: 's7-q2',
    exam_id: 'schreiben-modellsatz-7',
    teil: 1,
    question_number: 2,
    title: 'Radstation München • Mietdatum',
    situation: 'Ihre Freundin Elena Rossi möchte an der Radstation am Hauptbahnhof in München Fahrräder für sich und ihre Familie leihen. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Elena Rossi wohnt in Augsburg, Maximilianstraße 15. Sie möchte am 10. Juni für ein Wochenende (2 Tage) an der Radstation am Hauptbahnhof in München drei Fahrräder mieten: ein Damenrad und zwei Kinderräder. Die Kaution bezahlt sie mit Kreditkarte.',
    statement: 'Feld (2) — Datum des Mietbeginns:',
    options_json: {
      form_label: 'Mietdatum',
      accepted_answers: ['10. juni', '10.06', '10.06.', '10.6.', '10 juni']
    },
    correct_answer: '10. juni|10.06',
    clue_quote: 'Sie möchte am 10. Juni für ein Wochenende',
    explanation_ru: 'Дата начала аренды — 10 июня (10. Juni / 10.06).',
    explanation_en: 'Rental start date is June 10th.',
    explanation_de: 'Das Mietdatum ist der 10. Juni.',
    vocabulary_notes: [
      { word: 'das Mietdatum', translation: 'дата аренды', translation_en: 'rental date' }
    ]
  },
  {
    id: 's7-q3',
    exam_id: 'schreiben-modellsatz-7',
    teil: 1,
    question_number: 3,
    title: 'Radstation München • Anzahl Fahrräder',
    situation: 'Ihre Freundin Elena Rossi möchte an der Radstation am Hauptbahnhof in München Fahrräder für sich und ihre Familie leihen. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Elena Rossi wohnt in Augsburg, Maximilianstraße 15. Sie möchte am 10. Juni für ein Wochenende (2 Tage) an der Radstation am Hauptbahnhof in München drei Fahrräder mieten: ein Damenrad und zwei Kinderräder. Die Kaution bezahlt sie mit Kreditkarte.',
    statement: 'Feld (3) — Anzahl der Fahrräder:',
    options_json: {
      form_label: 'Anzahl Fahrräder',
      accepted_answers: ['3', 'drei', '3 fahrräder', 'drei fahrräder', '3 fahrraeder', '1 damenrad und 2 kinderräder', 'ein damenrad und zwei kinderräder']
    },
    correct_answer: '3',
    clue_quote: 'drei Fahrräder mieten: ein Damenrad und zwei Kinderräder',
    explanation_ru: 'Количество велосипедов — 3 (drei Fahrräder).',
    explanation_en: 'Number of bicycles is 3.',
    explanation_de: 'Die Anzahl der Fahrräder beträgt 3.',
    vocabulary_notes: [
      { word: 'das Fahrrad', translation: 'велосипед', translation_en: 'bicycle' }
    ]
  },
  {
    id: 's7-q4',
    exam_id: 'schreiben-modellsatz-7',
    teil: 1,
    question_number: 4,
    title: 'Radstation München • Mietdauer',
    situation: 'Ihre Freundin Elena Rossi möchte an der Radstation am Hauptbahnhof in München Fahrräder für sich und ihre Familie leihen. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Elena Rossi wohnt in Augsburg, Maximilianstraße 15. Sie möchte am 10. Juni für ein Wochenende (2 Tage) an der Radstation am Hauptbahnhof in München drei Fahrräder mieten: ein Damenrad und zwei Kinderräder. Die Kaution bezahlt sie mit Kreditkarte.',
    statement: 'Feld (4) — Dauer der Ausleihe:',
    options_json: {
      form_label: 'Mietdauer',
      accepted_answers: ['2 tage', 'zwei tage', 'wochenende', 'ein wochenende', '1 wochenende', 'für ein wochenende']
    },
    correct_answer: '2 tage|wochenende',
    clue_quote: 'für ein Wochenende (2 Tage)',
    explanation_ru: 'Срок аренды — 2 дня / выходные (2 Tage / Wochenende).',
    explanation_en: 'Rental duration is 2 days / weekend.',
    explanation_de: 'Die Mietdauer beträgt 2 Tage (ein Wochenende).',
    vocabulary_notes: [
      { word: 'die Mietdauer', translation: 'срок аренды', translation_en: 'rental period' }
    ]
  },
  {
    id: 's7-q5',
    exam_id: 'schreiben-modellsatz-7',
    teil: 1,
    question_number: 5,
    title: 'Radstation München • Bezahlung Kaution',
    situation: 'Ihre Freundin Elena Rossi möchte an der Radstation am Hauptbahnhof in München Fahrräder für sich und ihre Familie leihen. Helfen Sie ihr beim Ausfüllen des Formulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Freundin Elena Rossi wohnt in Augsburg, Maximilianstraße 15. Sie möchte am 10. Juni für ein Wochenende (2 Tage) an der Radstation am Hauptbahnhof in München drei Fahrräder mieten: ein Damenrad und zwei Kinderräder. Die Kaution bezahlt sie mit Kreditkarte.',
    statement: 'Feld (5) — Zahlungsweise für die Kaution:',
    options_json: {
      form_label: 'Zahlungsart Kaution',
      accepted_answers: ['kreditkarte', 'mit kreditkarte', 'per kreditkarte']
    },
    correct_answer: 'kreditkarte',
    clue_quote: 'Die Kaution bezahlt sie mit Kreditkarte',
    explanation_ru: 'Оплата залога производится кредитной картой (Kreditkarte).',
    explanation_en: 'Deposit payment is by credit card.',
    explanation_de: 'Die Kaution wird mit Kreditkarte bezahlt.',
    vocabulary_notes: [
      { word: 'die Kaution', translation: 'залог / депозит', translation_en: 'deposit / bond' }
    ]
  },
  {
    id: 's7-q6',
    exam_id: 'schreiben-modellsatz-7',
    teil: 2,
    level: 'A1',
    question_number: 6,
    title: 'Teil 2 • Besichtigungsanfrage für eine Wohnung',
    situation: 'Sie suchen eine Wohnung und haben eine Anzeige für eine 2-Zimmer-Wohnung in Köln gesehen. Schreiben Sie eine E-Mail an die Vermieterin, Frau Neumann.',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben\n2. Personen und Beruf\n3. Termin für eine Besichtigung',
    statement: 'Schreiben Sie eine kurze E-Mail (ca. 30 Wörter). Denken Sie an Anrede und Gruß.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben',
        'Personen und Beruf',
        'Termin für eine Besichtigung'
      ],
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben',
            intent: 'REASON_EXPLANATION',
            keywords: ['wohnung', 'anzeige', 'mieten', 'interessieren', 'interesse', 'gesehen'],
            requiredMatches: 2,
            conversive_rules: [
              {
                forbiddenLemma: 'vermieten',
                expectedLemma: 'mieten',
                messageDe: 'Als Interessent möchten Sie die Wohnung „mieten“, nicht „vermieten“.'
              }
            ]
          },
          {
            id: 'lp2',
            label: 'Personen und Beruf',
            intent: 'GENERAL',
            keywords: ['person', 'personen', 'mann', 'frau', 'kind', 'allein', 'arbeiten', 'beruf', 'lehrer', 'arbeite'],
            requiredMatches: 2,
            aspects: [
              {
                label: 'Personen',
                evidence: 'personCount',
                keywords: ['person', 'personen', 'mann', 'frau', 'kind', 'kinder', 'allein', 'ziehen']
              },
              {
                label: 'Beruf',
                evidence: 'occupation',
                keywords: ['beruf', 'arbeiten', 'arbeite', 'lehrer', 'lehrerin', 'arzt', 'ärztin', 'ingenieur']
              }
            ]
          },
          {
            id: 'lp3',
            label: 'Termin für eine Besichtigung',
            intent: 'APPOINTMENT_PROPOSAL',
            evidence: 'temporal',
            keywords: ['besichtigung', 'besichtigen', 'termin', 'zeit', 'samstag', 'montag', 'wann', 'können', 'sehen'],
            requiredMatches: 2
          }
        ]
      },
      sample_solution: 'Sehr geehrte Frau Neumann,\n\nich habe Ihre Anzeige für die Wohnung gesehen und möchte sie gern mieten. Ich ziehe mit meinem Mann ein, wir sind zwei Personen und ich arbeite als Lehrerin in Köln. Haben Sie am Samstag Zeit für einen Besichtigungstermin?\n\nMit freundlichen Grüßen\nElena Rossi',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrte Frau Neumann,' },
        { label: 'Punkt 1 (Grund: Wohnung mieten)', text: 'ich habe Ihre Anzeige für die Wohnung gesehen und möchte sie gern mieten.' },
        { label: 'Punkt 2 (Personen und Beruf: 2 Personen, Lehrerin)', text: 'Ich ziehe mit meinem Mann ein, wir sind zwei Personen und ich arbeite als Lehrerin in Köln.' },
        { label: 'Punkt 3 (Besichtigungstermin am Samstag)', text: 'Haben Sie am Samstag Zeit für einen Besichtigungstermin?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrte Frau Neumann, ich habe Ihre Anzeige für die Wohnung gesehen',
    explanation_ru: 'Образцовое официальное письмо арендодателю уровня A1: уважительное обращение по фамилии (Sehr geehrte Frau Neumann), сообщение о намерении снять жилье, указание состава семьи и профессии (Lehrerin), запрос термина для просмотра и официальное прощание (Mit freundlichen Grüßen).',
    explanation_en: 'Sample formal A1 email to a landlady: polite salutation by name, interest in renting, household info & occupation, viewing request, and standard formal closing.',
    explanation_de: 'Formelle Wohnungsanfrage für telc A1 mit korrekter Anrede, vollständigen Angaben zu den drei Leitpunkten und förmlicher Grußformel.',
    vocabulary_notes: [
      { word: 'die Anzeige', translation: 'объявление', translation_en: 'advertisement / listing' },
      { word: 'die Besichtigung', translation: 'осмотр / просмотр (квартиры)', translation_en: 'viewing / inspection' },
      { word: 'der Besichtigungstermin', translation: 'время / термин для просмотра', translation_en: 'viewing appointment' }
    ]
  }
];
