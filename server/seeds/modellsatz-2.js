export const exam = {
  id: 'modellsatz-2',
  title: 'telc Deutsch A1 — Modellsatz 2',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Второй официальный вариант экзамена telc Deutsch A1 с новыми аутентичными текстами, вывесками и интернет-объявлениями.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 2 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: Email from Jan to Felix (Aufgaben 1-2)
  {
    id: 'm2-q1',
    exam_id: 'modellsatz-2',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Jan an Felix',
    context_header: 'Von: Jan Schuster <jan.schuster@gmx.de>\nAn: Felix Meyer <felix.m@web.de>\nDatum: 3. Mai, 11:15 Uhr\nBetreff: Ausflug zum Starnberger See',
    context_body: `Hallo Felix,

hast du am Samstag Zeit? Das Wetter soll super werden (Sonne und 24 Grad!). Ich möchte mit dem Zug zum Starnberger See fahren und dort ein Ruderboot mieten.

Wir können uns um 9:30 Uhr am Münchner Hauptbahnhof am Gleis 28 treffen. Die S-Bahn fährt um 9:42 Uhr ab. Ich kaufe schon vorab ein Gruppen-Tagesticket für uns beide.

Pack bitte deine Badesachen und ein Picknick ein!

Antworte mir kurz, ob du mitkommst.

Bis Samstag
Jan`,
    statement: 'Felix soll das Zugticket für die Fahrt kaufen.',
    correct_answer: 'falsch',
    clue_quote: 'Ich kaufe schon vorab ein Gruppen-Tagesticket für uns beide.',
    explanation_ru: 'Ян пишет: «Ich kaufe schon vorab ein Gruppen-Tagesticket für uns beide» («Я заранее куплю групповой билет на день для нас обоих»). Значит, билет покупает Ян, а не Феликс. Феликсу нужно взять плавательные принадлежности и еду. Утверждение неверно (Falsch).',
    explanation_de: 'Jan kauft das Ticket selbst („Ich kaufe schon vorab ein Gruppen-Tagesticket"). Felix muss kein Ticket kaufen.',
    vocabulary_notes: [
      { word: 'vorab / im Voraus', translation: 'заранее' },
      { word: 'Gruppen-Tagesticket', translation: 'групповой билет на весь день' },
      { word: 'Badesachen', translation: 'вещи для купания' }
    ]
  },
  {
    id: 'm2-q2',
    exam_id: 'modellsatz-2',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Jan an Felix',
    context_header: 'Von: Jan Schuster <jan.schuster@gmx.de>\nAn: Felix Meyer <felix.m@web.de>\nDatum: 3. Mai, 11:15 Uhr\nBetreff: Ausflug zum Starnberger See',
    context_body: `Hallo Felix,

hast du am Samstag Zeit? Das Wetter soll super werden (Sonne und 24 Grad!). Ich möchte mit dem Zug zum Starnberger See fahren und dort ein Ruderboot mieten.

Wir können uns um 9:30 Uhr am Münchner Hauptbahnhof am Gleis 28 treffen. Die S-Bahn fährt um 9:42 Uhr ab. Ich kaufe schon vorab ein Gruppen-Tagesticket für uns beide.

Pack bitte deine Badesachen und ein Picknick ein!

Antworte mir kurz, ob du mitkommst.

Bis Samstag
Jan`,
    statement: 'Die beiden wollen sich direkt am Bahnhof treffen.',
    correct_answer: 'richtig',
    clue_quote: 'Wir können uns um 9:30 Uhr am Münchner Hauptbahnhof am Gleis 28 treffen.',
    explanation_ru: 'Ян предлагает встретиться в 9:30 на главном вокзале Мюнхена на платформе 28 («am Münchner Hauptbahnhof am Gleis 28»). Утверждение верно (Richtig).',
    explanation_de: 'Sie treffen sich am Münchner Hauptbahnhof (Gleis 28).',
    vocabulary_notes: [
      { word: 'Hauptbahnhof', translation: 'главный вокзал' },
      { word: 'Gleis', translation: 'железнодорожный путь / платформа' },
      { word: 'abfahren', translation: 'отправляться' }
    ]
  },

  // Text 2: Hotel & Ferienresort Ostseeperle (Aufgaben 3-5)
  {
    id: 'm2-q3',
    exam_id: 'modellsatz-2',
    teil: 1,
    question_number: 3,
    title: 'Buchungsbestätigung — Hotel Ostseeperle',
    context_header: 'Hotel Ostseeperle Rügen — Buchungsbestätigung Nr. 88341',
    context_body: `Sehr geehrte Familie Becker,

vielen Dank für Ihre Reservierung! Wir freuen uns auf Ihren Besuch.

Ihre Buchungsdetails:
- Anreise: Freitag, 18. Juli (Zimmer ab 15:00 Uhr bezugsfertig)
- Abreise: Sonntag, 20. Juli (Zimmerabgabe bis 11:00 Uhr)
- Zimmer: 1 Doppelzimmer mit Balkon und Meerblick
- Verpflegung: Frühstücksbuffet ist im Preis enthalten (täglich 07:30 – 10:30 Uhr)

Wichtige Hinweise:
Parkplätze in unserer Tiefgarage stehen Ihnen kostenlos zur Verfügung. Haustiere wie Hunde sind in unserem Hotel leider nicht erlaubt.

Bei Fragen rufen Sie uns gerne an!

Herzliche Grüße
Ihr Empfangsteam`,
    statement: 'Das Frühstück kostet extra und ist nicht im Preis inbegriffen.',
    correct_answer: 'falsch',
    clue_quote: 'Frühstücksbuffet ist im Preis enthalten',
    explanation_ru: 'В подтверждении бронирования прямо указано: «Frühstücksbuffet ist im Preis enthalten» («Завтрак "шведский стол" включен в стоимость»). Платить за него отдельно не требуется. Утверждение неверно (Falsch).',
    explanation_de: 'Das Frühstück ist bereits im Preis enthalten und kostet nicht extra.',
    vocabulary_notes: [
      { word: 'im Preis enthalten / inbegriffen', translation: 'включено в стоимость' },
      { word: 'extra kosten', translation: 'стоить дополнительно' },
      { word: 'die Reservierung / Buchung', translation: 'бронирование' }
    ]
  },
  {
    id: 'm2-q4',
    exam_id: 'modellsatz-2',
    teil: 1,
    question_number: 4,
    title: 'Buchungsbestätigung — Hotel Ostseeperle',
    context_header: 'Hotel Ostseeperle Rügen — Buchungsbestätigung Nr. 88341',
    context_body: `Sehr geehrte Familie Becker,

vielen Dank für Ihre Reservierung! Wir freuen uns auf Ihren Besuch.

Ihre Buchungsdetails:
- Anreise: Freitag, 18. Juli (Zimmer ab 15:00 Uhr bezugsfertig)
- Abreise: Sonntag, 20. Juli (Zimmerabgabe bis 11:00 Uhr)
- Zimmer: 1 Doppelzimmer mit Balkon und Meerblick
- Verpflegung: Frühstücksbuffet ist im Preis enthalten (täglich 07:30 – 10:30 Uhr)

Wichtige Hinweise:
Parkplätze in unserer Tiefgarage stehen Ihnen kostenlos zur Verfügung. Haustiere wie Hunde sind in unserem Hotel leider nicht erlaubt.

Bei Fragen rufen Sie uns gerne an!

Herzliche Grüße
Ihr Empfangsteam`,
    statement: 'Gäste können ihr Auto im Hotel kostenlos parken.',
    correct_answer: 'richtig',
    clue_quote: 'Parkplätze in unserer Tiefgarage stehen Ihnen kostenlos zur Verfügung.',
    explanation_ru: 'В тексте написано: «Parkplätze in unserer Tiefgarage stehen Ihnen kostenlos zur Verfügung» («Парковочные места в нашем подземном гараже предоставляются бесплатно»). Утверждение верно (Richtig).',
    explanation_de: 'Das Parken in der Tiefgarage ist kostenlos.',
    vocabulary_notes: [
      { word: 'kostenlos', translation: 'бесплатно' },
      { word: 'zur Verfügung stehen', translation: 'находиться в распоряжении' },
      { word: 'die Tiefgarage', translation: 'подземная парковка' }
    ]
  },
  {
    id: 'm2-q5',
    exam_id: 'modellsatz-2',
    teil: 1,
    question_number: 5,
    title: 'Buchungsbestätigung — Hotel Ostseeperle',
    context_header: 'Hotel Ostseeperle Rügen — Buchungsbestätigung Nr. 88341',
    context_body: `Sehr geehrte Familie Becker,

vielen Dank für Ihre Reservierung! Wir freuen uns auf Ihren Besuch.

Ihre Buchungsdetails:
- Anreise: Freitag, 18. Juli (Zimmer ab 15:00 Uhr bezugsfertig)
- Abreise: Sonntag, 20. Juli (Zimmerabgabe bis 11:00 Uhr)
- Zimmer: 1 Doppelzimmer mit Balkon und Meerblick
- Verpflegung: Frühstücksbuffet ist im Preis enthalten (täglich 07:30 – 10:30 Uhr)

Wichtige Hinweise:
Parkplätze in unserer Tiefgarage stehen Ihnen kostenlos zur Verfügung. Haustiere wie Hunde sind in unserem Hotel leider nicht erlaubt.

Bei Fragen rufen Sie uns gerne an!

Herzliche Grüße
Ihr Empfangsteam`,
    statement: 'Man darf einen Hund mit in das Hotel bringen.',
    correct_answer: 'falsch',
    clue_quote: 'Haustiere wie Hunde sind in unserem Hotel leider nicht erlaubt.',
    explanation_ru: 'В примечании написано: «Haustiere wie Hunde sind in unserem Hotel leider nicht erlaubt» («Домашние животные, такие как собаки, в нашем отеле, к сожалению, не разрешены»). Утверждение неверно (Falsch).',
    explanation_de: 'Hunde sind im Hotel nicht erlaubt.',
    vocabulary_notes: [
      { word: 'nicht erlaubt', translation: 'не разрешено' },
      { word: 'das Haustier (-e)', translation: 'домашнее животное' },
      { word: 'mitbringen', translation: 'привозить с собой' }
    ]
  },

  // ==========================================
  // MODELLSATZ 2 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm2-q6',
    exam_id: 'modellsatz-2',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie möchten schwimmen lernen und suchen einen Schwimmkurs für Erwachsene am Wochenende.',
    options_json: [
      {
        id: 'a',
        badge: 'www.aquafit-citybad.de',
        title: 'Stadtbad AquaFit: Schwimmkurse für Erwachsene',
        text: 'Schwimmen lernen ohne Angst! Professionelle Trainer für Anfänger und Wiedereinsteiger ab 18 Jahren. Kurstermine: Samstags 10:00–11:30 Uhr oder sonntags 14:00–15:30 Uhr. Jetzt anmelden!',
        details: 'Zielgruppe: Erwachsene (ab 18) • Zeiten: Samstag & Sonntag'
      },
      {
        id: 'b',
        badge: 'www.kinder-wasserwelten.de',
        title: 'Schwimmschule Seepferdchen — Spaß für die Kleinen',
        text: 'Schwimmkurse ausschließlich für Babys und Kleinkinder von 1 bis 6 Jahren. Spielerisches Lernen im warmen Kinderbecken. Montag bis Freitag von 14:00 bis 17:00 Uhr.',
        details: 'Zielgruppe: Nur Kinder (1–6 Jahre) • Zeiten: Mo–Fr nachmittags'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Schwimmkurse für Erwachsene ... ab 18 Jahren. Kurstermine: Samstags oder sonntags',
    explanation_ru: 'Вам нужен: 1) курс плавания для взрослых (für Erwachsene), 2) на выходных (am Wochenende). Вариант «b» — только для детей до 6 лет в будни. Вариант «a» предлагает курсы для взрослых от 18 лет по субботам и воскресеньям. Правильный ответ: a.',
    explanation_de: 'Gesucht ist ein Kurs für Erwachsene am Wochenende. Anzeige a bietet Erwachsenen-Schwimmkurse samstags und sonntags an.',
    vocabulary_notes: [
      { word: 'der Erwachsene', translation: 'взрослый' },
      { word: 'das Wochenende (Sa & So)', translation: 'выходные' },
      { word: 'ausschließlich für Kinder', translation: 'исключительно для детей' }
    ]
  },
  {
    id: 'm2-q7',
    exam_id: 'modellsatz-2',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Ihre Waschmaschine ist kaputt. Sie suchen jemanden, der sie schnell zu Hause repariert.',
    options_json: [
      {
        id: 'a',
        badge: 'www.elektromarkt-kaufen24.de',
        title: 'MediaElektronik — Neugeräte günstig kaufen',
        text: 'Riesige Auswahl an neuen Marken-Waschmaschinen, Trocknern und Kühlschränken zu Bestpreisen. Schnelle Lieferung bis in Ihre Wohnung ab 299 €. Altgerätemitnahme auf Wunsch.',
        details: 'Service: Verkauf von Neugeräten • Keine Reparaturen'
      },
      {
        id: 'b',
        badge: 'www.hausgeraete-notdienst-reparatur.de',
        title: 'Blitz-Reparaturdienst für Haushaltsgeräte vor Ort',
        text: 'Waschmaschine, Spülmaschine oder Herd defekt? Unser Techniker kommt direkt zu Ihnen nach Hause! Schnelle Fehlerdiagnose und Sofort-Reparatur meist noch am selben Tag.',
        details: 'Service: Vor-Ort-Reparatur beim Kunden zu Hause'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Waschmaschine ... defekt? Unser Techniker kommt direkt zu Ihnen nach Hause! Sofort-Reparatur',
    explanation_ru: 'Ваша стиральная машина сломана, вам нужен ремонт на дому (zu Hause repariert). Вариант «a» продаёт новую бытовую технику. Вариант «b» — служба ремонта бытовой техники на дому («vor Ort beim Kunden zu Hause», «Techniker kommt zu Ihnen nach Hause»). Правильный ответ: b.',
    explanation_de: 'Gesucht wird eine Reparatur der Waschmaschine zu Hause. Anzeige b bietet Vor-Ort-Reparaturservice.',
    vocabulary_notes: [
      { word: 'kaputt / defekt', translation: 'сломанный' },
      { word: 'reparieren', translation: 'ремонтировать' },
      { word: 'vor Ort / zu Hause', translation: 'на месте / дома' }
    ]
  },
  {
    id: 'm2-q8',
    exam_id: 'modellsatz-2',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie möchten am Samstagnachmittag mit Kindern ins Kino gehen und einen Animationsfilm auf Deutsch sehen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.cineplex-familienkino.de',
        title: 'Cineplex: Das bunte Familien- und Kinderkino',
        text: 'Jeden Samstag und Sonntag ab 14:30 Uhr: Die neuesten Animations- und Zeichentrickfilme für die ganze Familie in deutscher Sprache! Günstige Familientickets und frisches Popcorn.',
        details: 'Programm: Animationsfilme für Familien • Sa & So ab 14:30 Uhr'
      },
      {
        id: 'b',
        badge: 'www.arthouse-kino-original.de',
        title: 'Programmkino Lichtspiel: Filme in Originalversion',
        text: 'Internationale Dokumentationen und französische Dramen in Originalfassung mit englischen Untertiteln (OmU). Vorstellungen täglich ab 20:30 Uhr. Kein Zutritt für Kinder unter 16 Jahren.',
        details: 'Programm: Originalversion (nicht Deutsch) • Erst ab 20:30 Uhr'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Jeden Samstag und Sonntag ab 14:30 Uhr: Animations- und Zeichentrickfilme ... in deutscher Sprache!',
    explanation_ru: 'Вам нужно: 1) в субботу днём (Samstagnachmittag, 14:30), 2) с детьми (mit Kindern), 3) анимационный фильм на немецком языке. Вариант «b» показывает фильмы на иностранных языках с субтитрами только вечером с 20:30 для взрослых (16+). Вариант «a» — детские анимационные фильмы в 14:30 на немецком. Правильный ответ: a.',
    explanation_de: 'Gesucht ist ein Animationsfilm für Kinder am Samstagnachmittag auf Deutsch. Anzeige a passt perfekt.',
    vocabulary_notes: [
      { word: 'der Zeichentrickfilm / Animationsfilm', translation: 'мультфильм' },
      { word: 'in deutscher Sprache', translation: 'на немецком языке' },
      { word: 'Originalfassung mit Untertiteln', translation: 'оригинальная версия с субтитрами' }
    ]
  },
  {
    id: 'm2-q9',
    exam_id: 'modellsatz-2',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten Ihren Geburtstag feiern und suchen einen Raum, den man für eine private Feier mieten kann.',
    options_json: [
      {
        id: 'a',
        badge: 'www.bueros-coworking-space.de',
        title: 'OfficeHub: Moderne Konferenzräume und Arbeitsplätze',
        text: 'Professionelle Arbeitsumgebung für Meetings, Seminare und Business-Workshops. Tagungsräume mit Beamer und Whiteboard mieten. Keine privaten Feiern oder Partys erlaubt.',
        details: 'Nutzung: Nur Business & Meetings • Keine privaten Partys'
      },
      {
        id: 'b',
        badge: 'www.partyraum-location-mieten.de',
        title: 'EventLocation „Alte Scheune" mieten',
        text: 'Der perfekte Partyraum für Ihren Geburtstag, Jubiläen oder Familienfeste! Mit Musikanlage, kleiner Bar und Küche. Platz für bis zu 50 Personen. Freie Termine am Wochenende.',
        details: 'Nutzung: Private Feiern & Geburtstage • Mit Musikanlage & Bar'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Der perfekte Partyraum für Ihren Geburtstag ... Platz für bis zu 50 Personen',
    explanation_ru: 'Вам нужно снять помещение для частного дня рождения (Geburtstag feiern, private Feier). В варианте «a» прямо сказано: «Keine privaten Feiern oder Partys erlaubt» (деловые семинары, вечеринки запрещены). Вариант «b» — аренда зала специально для дней рождения и праздников («Partyraum für Ihren Geburtstag»). Правильный ответ: b.',
    explanation_de: 'Gesucht wird ein Partyraum für einen Geburtstag. Bei Anzeige a sind Feiern verboten. Anzeige b vermietet Partyräume.',
    vocabulary_notes: [
      { word: 'die Feier / das Fest', translation: 'праздник / торжество' },
      { word: 'Partyraum mieten', translation: 'арендовать зал для вечеринки' },
      { word: 'nicht erlaubt / verboten', translation: 'запрещено' }
    ]
  },
  {
    id: 'm2-q10',
    exam_id: 'modellsatz-2',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie möchten am frühen Sonntagmorgen um 6:00 Uhr vom Flughafen München mit öffentlichen Verkehrsmitteln in die Innenstadt fahren.',
    options_json: [
      {
        id: 'a',
        badge: 'www.s-bahn-muenchen-fahrplan.de',
        title: 'S-Bahn München: Flughafenlinie S1 und S8',
        text: 'Direkte Verbindung vom Flughafen zum Hauptbahnhof. Die Linien S1 und S8 fahren an Samstagen und Sonntagen rund um die Uhr alle 20 Minuten (auch ab 04:00 und 06:00 Uhr früh).',
        details: 'Verkehrsmittel: S-Bahn • Fährt 24/7 alle 20 Min auch früh morgens'
      },
      {
        id: 'b',
        badge: 'www.expressbus-city-airport.de',
        title: 'Airport-City-Expressbus',
        text: 'Unser Reisebus verbindet den Flughafen mit der Messe München. Betriebszeiten: Nur an Wochentagen von Montag bis Freitag von 08:00 bis 18:00 Uhr. Am Wochenende kein Fahrbetrieb.',
        details: 'Verkehrsmittel: Bus zur Messe • Nur Mo–Fr, kein Wochenende'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Die Linien S1 und S8 fahren an Samstagen und Sonntagen rund um die Uhr ... (auch ab 04:00 und 06:00 Uhr früh)',
    explanation_ru: 'Вам нужно: 1) воскресенье раннее утро, 6:00 (Sonntagmorgen, 6:00 Uhr), 2) общественный транспорт в центр города. Экспресс-автобус «b» не ходит по выходным («Am Wochenende kein Fahrbetrieb») и едет только к ярмарке/Messe. Поезда S-Bahn «a» (S1/S8) ходят по воскресеньям круглосуточно каждые 20 минут в центр. Правильный ответ: a.',
    explanation_de: 'Gesucht ist eine Fahrt am Sonntagmorgen um 6:00 Uhr. Anzeige a fährt sonntags rund um die Uhr, Anzeige b fährt am Wochenende gar nicht.',
    vocabulary_notes: [
      { word: 'öffentliche Verkehrsmittel', translation: 'общественный транспорт' },
      { word: 'rund um die Uhr', translation: 'круглосуточно' },
      { word: 'früh morgens', translation: 'рано утром' }
    ]
  },

  // ==========================================
  // MODELLSATZ 2 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm2-q11',
    exam_id: 'modellsatz-2',
    teil: 3,
    question_number: 11,
    title: 'Hinweisschild an der Haltestelle',
    context_header: 'Münchner Verkehrsgesellschaft (MVG)',
    context_body: `Achtung Fahrgäste!

Wegen Gleisbauarbeiten fährt die Trambahnlinie 16 von Freitag, 20:00 Uhr bis Montag, 04:00 Uhr nicht.

Ersatzverkehr mit Bussen ist eingerichtet:
Bitte benutzen Sie die Busse der Linie E16. Die Ersatzhaltestelle befindet sich 50 Meter weiter rechts vor der Postfiliale.`,
    statement: 'Am Samstag fährt die Straßenbahn 16 ganz normal.',
    correct_answer: 'falsch',
    clue_quote: 'fährt die Trambahnlinie 16 von Freitag, 20:00 Uhr bis Montag, 04:00 Uhr nicht.',
    explanation_ru: 'На остановке написано, что трамвай 16 не ходит с 20:00 пятницы до 4:00 утра понедельника из-за ремонта путей («fährt nicht»). Суббота попадает в этот интервал, вместо трамвая ходят автобусы. Утверждение неверно (Falsch).',
    explanation_de: 'Die Tram fährt am Wochenende gar nicht, es gibt Ersatzbusse.',
    vocabulary_notes: [
      { word: 'Gleisbauarbeiten', translation: 'ремонтные работы на путях' },
      { word: 'Ersatzverkehr / Ersatzbus', translation: 'компенсационный автобусный маршрут' },
      { word: 'fährt nicht', translation: 'не ходит' }
    ]
  },
  {
    id: 'm2-q12',
    exam_id: 'modellsatz-2',
    teil: 3,
    question_number: 12,
    title: 'Aushang an der Eingangstür eines Supermarkts',
    context_header: 'REWE Supermarkt — Filiale Westend',
    context_body: `Liebe Kundinnen und Kunden,

wegen Inventur schließt unser Markt am kommenden Donnerstag bereits um 18:00 Uhr (statt 20:00 Uhr).

Am Freitag ab 07:00 Uhr morgens haben wir wieder wie gewohnt für Sie geöffnet.

Wir bitten um Ihr Verständnis!`,
    statement: 'Am Donnerstag kann man noch um 19:00 Uhr einkaufen.',
    correct_answer: 'falsch',
    clue_quote: 'schließt unser Markt am kommenden Donnerstag bereits um 18:00 Uhr',
    explanation_ru: 'В объявлении написано: супермаркет в четверг закрывается уже в 18:00 из-за инвентаризации («bereits um 18:00 Uhr»). В 19:00 магазин уже будет закрыт, делать покупки нельзя. Утверждение неверно (Falsch).',
    explanation_de: 'Der Markt schließt schon um 18:00 Uhr. Um 19:00 Uhr ist er bereits geschlossen.',
    vocabulary_notes: [
      { word: 'bereits / schon', translation: 'уже' },
      { word: 'schließen', translation: 'закрываться' },
      { word: 'einkaufen', translation: 'делать покупки' }
    ]
  },
  {
    id: 'm2-q13',
    exam_id: 'modellsatz-2',
    teil: 3,
    question_number: 13,
    title: 'Schild an der Tür einer Postfiliale',
    context_header: 'Deutsche Post & DHL Paketshop',
    context_body: `Sehr geehrte Kunden,

Paketabholung nur gegen Vorlage eines gültigen Lichtbildausweises (Personalausweis oder Reisepass).

Sie können Ihr Paket nicht persönlich abholen?
Füllen Sie bitte die Vollmacht auf der gelben Benachrichtigungskarte aus. Dann kann eine andere Person die Sendung für Sie abholen.`,
    statement: 'Eine andere Person darf ein Paket abholen, wenn sie eine Vollmacht hat.',
    correct_answer: 'richtig',
    clue_quote: 'Füllen Sie bitte die Vollmacht auf der gelben Benachrichtigungskarte aus. Dann kann eine andere Person die Sendung für Sie abholen.',
    explanation_ru: 'В объявлении написано: если вы не можете прийти лично, заполните доверенность («die Vollmacht»), и тогда другой человек сможет забрать посылку («kann eine andere Person die Sendung für Sie abholen»). Утверждение верно (Richtig).',
    explanation_de: 'Mit einer ausgefüllten Vollmacht kann eine andere Person das Paket abholen.',
    vocabulary_notes: [
      { word: 'die Vollmacht', translation: 'доверенность' },
      { word: 'abholen', translation: 'забирать' },
      { word: 'eine andere Person', translation: 'другой человек' }
    ]
  },
  {
    id: 'm2-q14',
    exam_id: 'modellsatz-2',
    teil: 3,
    question_number: 14,
    title: 'Hinweisschild im Hallenbad',
    context_header: 'Stadtbad Nord — Baderegeln',
    context_body: `Wichtiger Sicherheitshinweis!

Das Tragen von Badeschuhen ist im gesamten Nass- und Duschbereich aus Sicherheitsgründen Pflicht.

Das Springen vom Beckenrand ist nur im Sprungbecken (Halle 2) erlaubt. Im Schwimmerbecken ist Springen strengstens verboten.`,
    statement: 'Man darf im Schwimmerbecken vom Beckenrand ins Wasser springen.',
    correct_answer: 'falsch',
    clue_quote: 'Im Schwimmerbecken ist Springen strengstens verboten.',
    explanation_ru: 'На табличке в бассейне строго написано: «Im Schwimmerbecken ist Springen strengstens verboten» (Прыжки с бортика в плавательном бассейне строго запрещены!). Прыгать разрешено только в специальном прыжковом бассейне (Sprungbecken). Утверждение неверно (Falsch).',
    explanation_de: 'Im Schwimmerbecken ist das Springen strengstens verboten, nicht erlaubt.',
    vocabulary_notes: [
      { word: 'strengstens verboten', translation: 'строжайше запрещено' },
      { word: 'springen', translation: 'прыгать' },
      { word: 'erlaubt', translation: 'разрешено' }
    ]
  },
  {
    id: 'm2-q15',
    exam_id: 'modellsatz-2',
    teil: 3,
    question_number: 15,
    title: 'Aushang an der Pinnwand eines Studentenwohnheims',
    context_header: 'Studentenwerk — Waschsalon im Keller',
    context_body: `Liebe Bewohnerinnen und Bewohner,

die Waschmaschinen und Wäschetrockner funktionieren nur mit der aufladbaren Mensa-Karte.

Barzahlung mit Münzen ist leider nicht mehr möglich!

Mensa-Karten können am Terminal im Erdgeschoss mit EC-Karte oder Bargeld aufgeladen werden.`,
    statement: 'Man kann die Waschmaschinen im Keller mit Münzen bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'Barzahlung mit Münzen ist leider nicht mehr möglich! ... funktionieren nur mit der aufladbaren Mensa-Karte.',
    explanation_ru: 'В объявлении чётко сказано: стиральные машины работают только по студенческой карточке («funktionieren nur mit der Mensa-Karte»), а оплата монетами больше не принимается («Barzahlung mit Münzen ist leider nicht mehr möglich»). Утверждение неверно (Falsch).',
    explanation_de: 'Münzzahlung ist nicht mehr möglich („Barzahlung mit Münzen ist leider nicht mehr möglich").',
    vocabulary_notes: [
      { word: 'die Münzen (pl.)', translation: 'монеты' },
      { word: 'nicht mehr möglich', translation: 'больше невозможно' },
      { word: 'aufladbar', translation: 'пополняемый' }
    ]
  }
];
