export const exam = {
  id: 'schreiben-modellsatz-5',
  title: 'telc Deutsch A1 — Schreiben 5',
  subtitle: 'Schriftlicher Ausdruck (Teil 1 und 2)',
  description: 'Тренировочный вариант Schreiben telc A1: запись на городскую экскурсию и письмо преподавателю о болезни.',
  test_type: 'schreiben',
  sort_order: 5
};

export const questions = [
  {
    id: 's5-q1',
    exam_id: 'schreiben-modellsatz-5',
    teil: 1,
    question_number: 1,
    title: 'Stadtrundfahrt Berlin • Familienname',
    situation: 'Ihre Kollegin Sarah Lindemann möchte mit ihrem Freund eine Stadtrundfahrt in Berlin buchen. Helfen Sie ihr beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Kollegin Sarah Lindemann wohnt in Potsdam in der Waldstraße 12. Sie möchte am 24. Mai zusammen mit ihrem Freund an der Stadtrundfahrt „Berlin Panorama“ teilnehmen. Sie kommen zu zweit. Den Fahrpreis von 36 Euro bezahlt sie direkt bar beim Busfahrer.',
    statement: 'Feld (1) — Familienname der Teilnehmerin:',
    options_json: {
      form_label: 'Familienname',
      accepted_answers: ['lindemann', 'frau lindemann', 'sarah lindemann']
    },
    correct_answer: 'lindemann',
    clue_quote: 'Ihre Kollegin Sarah Lindemann wohnt in Potsdam',
    explanation_ru: 'Фамилия участницы — Lindemann.',
    explanation_en: 'The participant’s surname is Lindemann.',
    explanation_de: 'Der Familienname lautet Lindemann.',
    vocabulary_notes: [
      { word: 'der Familienname', translation: 'фамилия', translation_en: 'surname / family name' }
    ]
  },
  {
    id: 's5-q2',
    exam_id: 'schreiben-modellsatz-5',
    teil: 1,
    question_number: 2,
    title: 'Stadtrundfahrt Berlin • Anzahl Personen',
    situation: 'Ihre Kollegin Sarah Lindemann möchte mit ihrem Freund eine Stadtrundfahrt in Berlin buchen. Helfen Sie ihr beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Kollegin Sarah Lindemann wohnt in Potsdam in der Waldstraße 12. Sie möchte am 24. Mai zusammen mit ihrem Freund an der Stadtrundfahrt „Berlin Panorama“ teilnehmen. Sie kommen zu zweit. Den Fahrpreis von 36 Euro bezahlt sie direkt bar beim Busfahrer.',
    statement: 'Feld (2) — Anzahl der Personen:',
    options_json: {
      form_label: 'Anzahl Personen',
      accepted_answers: ['2', 'zwei', '2 personen', 'zwei personen', 'zu zweit']
    },
    correct_answer: '2',
    clue_quote: 'Sie kommen zu zweit',
    explanation_ru: 'Количество участников — 2 человека (Сара и её друг).',
    explanation_en: 'Number of participants is 2 (Sarah and her friend).',
    explanation_de: 'Die Anzahl der Personen beträgt 2.',
    vocabulary_notes: [
      { word: 'zu zweit', translation: 'вдвоём', translation_en: 'two people / in pairs' }
    ]
  },
  {
    id: 's5-q3',
    exam_id: 'schreiben-modellsatz-5',
    teil: 1,
    question_number: 3,
    title: 'Stadtrundfahrt Berlin • Datum der Fahrt',
    situation: 'Ihre Kollegin Sarah Lindemann möchte mit ihrem Freund eine Stadtrundfahrt in Berlin buchen. Helfen Sie ihr beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Kollegin Sarah Lindemann wohnt in Potsdam in der Waldstraße 12. Sie möchte am 24. Mai zusammen mit ihrem Freund an der Stadtrundfahrt „Berlin Panorama“ teilnehmen. Sie kommen zu zweit. Den Fahrpreis von 36 Euro bezahlt sie direkt bar beim Busfahrer.',
    statement: 'Feld (3) — Datum der Rundfahrt:',
    options_json: {
      form_label: 'Datum der Fahrt',
      accepted_answers: ['24. mai', '24.05', '24.05.', '24.5.', '24 mai']
    },
    correct_answer: '24. mai|24.05',
    clue_quote: 'Sie möchte am 24. Mai zusammen mit ihrem Freund',
    explanation_ru: 'Дата экскурсии — 24 мая (24. Mai / 24.05).',
    explanation_en: 'Tour date is May 24th.',
    explanation_de: 'Das Datum der Rundfahrt ist der 24. Mai.',
    vocabulary_notes: [
      { word: 'die Stadtrundfahrt', translation: 'экскурсия по городу', translation_en: 'city tour' }
    ]
  },
  {
    id: 's5-q4',
    exam_id: 'schreiben-modellsatz-5',
    teil: 1,
    question_number: 4,
    title: 'Stadtrundfahrt Berlin • Name der Tour',
    situation: 'Ihre Kollegin Sarah Lindemann möchte mit ihrem Freund eine Stadtrundfahrt in Berlin buchen. Helfen Sie ihr beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Kollegin Sarah Lindemann wohnt in Potsdam in der Waldstraße 12. Sie möchte am 24. Mai zusammen mit ihrem Freund an der Stadtrundfahrt „Berlin Panorama“ teilnehmen. Sie kommen zu zweit. Den Fahrpreis von 36 Euro bezahlt sie direkt bar beim Busfahrer.',
    statement: 'Feld (4) — Name / Titel der Rundfahrt:',
    options_json: {
      form_label: 'Name der Tour',
      accepted_answers: ['berlin panorama', '„berlin panorama“']
    },
    correct_answer: 'berlin panorama',
    clue_quote: 'an der Stadtrundfahrt „Berlin Panorama“ teilnehmen',
    explanation_ru: 'Название экскурсии — Berlin Panorama.',
    explanation_en: 'The name of the tour is Berlin Panorama.',
    explanation_de: 'Der Name der Tour ist Berlin Panorama.',
    vocabulary_notes: [
      { word: 'teilnehmen', translation: 'участвовать / принимать участие', translation_en: 'to participate / take part' }
    ]
  },
  {
    id: 's5-q5',
    exam_id: 'schreiben-modellsatz-5',
    teil: 1,
    question_number: 5,
    title: 'Stadtrundfahrt Berlin • Zahlungsart',
    situation: 'Ihre Kollegin Sarah Lindemann möchte mit ihrem Freund eine Stadtrundfahrt in Berlin buchen. Helfen Sie ihr beim Ausfüllen des Anmeldeformulars.',
    context_header: 'Ausgangssituation',
    context_body: 'Ihre Kollegin Sarah Lindemann wohnt in Potsdam in der Waldstraße 12. Sie möchte am 24. Mai zusammen mit ihrem Freund an der Stadtrundfahrt „Berlin Panorama“ teilnehmen. Sie kommen zu zweit. Den Fahrpreis von 36 Euro bezahlt sie direkt bar beim Busfahrer.',
    statement: 'Feld (5) — Zahlungsweise:',
    options_json: {
      form_label: 'Zahlungsweise',
      accepted_answers: ['bar', 'barzahlung', 'in bar', 'bargeld']
    },
    correct_answer: 'bar',
    clue_quote: 'bezahlt sie direkt bar beim Busfahrer',
    explanation_ru: 'Оплата производится наличными (bar / Barzahlung).',
    explanation_en: 'Payment is cash (bar).',
    explanation_de: 'Die Zahlungsweise ist bar.',
    vocabulary_notes: [
      { word: 'bar', translation: 'наличными', translation_en: 'cash' }
    ]
  },
  {
    id: 's5-q6',
    exam_id: 'schreiben-modellsatz-5',
    teil: 2,
    level: 'A1',
    question_number: 6,
    title: 'Teil 2 • Entschuldigung im Deutschkurs wegen Krankheit',
    situation: 'Sie können heute und morgen nicht zum Deutschkurs kommen, weil Sie krank sind. Schreiben Sie eine E-Mail an Ihre Lehrerin, Frau Berg.',
    context_header: 'Leitpunkte (Schreiben Sie zu allen 3 Punkten)',
    context_body: '1. Grund für Ihr Schreiben\n2. Wie lange können Sie nicht kommen\n3. Bitte um Hausaufgaben per E-Mail',
    statement: 'Schreiben Sie eine kurze E-Mail (ca. 30 Wörter). Denken Sie an Anrede und Gruß.',
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte: [
        'Grund für Ihr Schreiben',
        'Wie lange können Sie nicht kommen',
        'Bitte um Hausaufgaben per E-Mail'
      ],
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben',
            intent: 'REASON_EXPLANATION',
            keywords: ['krank', 'fieber', 'grippe', 'bett', 'arzt', 'nicht kommen', 'fehlen'],
            requiredMatches: 1
          },
          {
            id: 'lp2',
            label: 'Wie lange können Sie nicht kommen',
            intent: 'GENERAL',
            evidence: 'temporal',
            keywords: ['heute', 'morgen', 'tage', 'tag', 'woche', 'montag', 'bleiben', 'wieder', 'zeit'],
            requiredMatches: 2
          },
          {
            id: 'lp3',
            label: 'Bitte um Hausaufgaben per E-Mail',
            intent: 'ACTION_REQUEST',
            keywords: ['hausaufgabe', 'hausaufgaben', 'schicken', 'senden', 'mail', 'email', 'übung', 'uebungen'],
            requiredMatches: 2
          }
        ]
      },
      sample_solution: 'Sehr geehrte Frau Berg,\n\nich kann heute und morgen nicht zum Deutschkurs kommen, weil ich krank bin und Fieber habe. Ich bleibe zwei Tage im Bett und komme am Montag wieder. Können Sie mir bitte die Hausaufgaben per E-Mail schicken?\n\nMit freundlichen Grüßen\nSarah Lindemann',
      breakdown: [
        { label: 'Anrede', text: 'Sehr geehrte Frau Berg,' },
        { label: 'Punkt 1 (Grund: krank)', text: 'ich kann heute und morgen nicht zum Deutschkurs kommen, weil ich krank bin und Fieber habe.' },
        { label: 'Punkt 2 (Dauer: zwei Tage / Montag)', text: 'Ich bleibe zwei Tage im Bett und komme am Montag wieder.' },
        { label: 'Punkt 3 (Hausaufgaben per E-Mail)', text: 'Können Sie mir bitte die Hausaufgaben per E-Mail schicken?' },
        { label: 'Grußformel', text: 'Mit freundlichen Grüßen\n[Vorname Nachname]' }
      ]
    },
    correct_answer: 'musterloesung',
    clue_quote: 'Sehr geehrte Frau Berg, ich kann heute und morgen nicht zum Deutschkurs kommen',
    explanation_ru: 'Образцовое официальное письмо уровня A1: вежливое обращение к преподавателю по фамилии (Sehr geehrte Frau Berg), раскрытие всех 3 пунктов (болезнь, срок отсутствия и просьба выслать задания) и стандартная формула вежливости (Mit freundlichen Grüßen).',
    explanation_en: 'Sample A1 formal email: polite salutation by name (Sehr geehrte Frau Berg), coverage of all 3 guide points (illness, duration, request for homework), and formal closing (Mit freundlichen Grüßen).',
    explanation_de: 'Musterlösung für die Entschuldigung wegen Krankheit mit formeller Anrede, vollständigen Leitpunkten und förmlicher Grußformel.',
    vocabulary_notes: [
      { word: 'krank sein', translation: 'быть больным', translation_en: 'to be ill / sick' },
      { word: 'die Hausaufgabe', translation: 'домашнее задание', translation_en: 'homework' },
      { word: 'schicken', translation: 'отправлять / присылать', translation_en: 'to send' }
    ]
  }
];
