export const exam = {
  id: 'modellsatz-5',
  title: 'telc Deutsch A1 — Modellsatz 5',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Пятый официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: блошиный рынок, языковые курсы в VHS, ремонт техники, спорт и правила в общественных местах.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 5 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: E-Mail von Maria an Sandra (Aufgaben 1-2)
  {
    id: 'm5-q1',
    exam_id: 'modellsatz-5',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Maria an Sandra',
    context_header: 'Von: Maria Santos <maria.s@postmail.de>\nAn: Sandra Koch <sandra.koch@web.de>\nDatum: 5. April, 19:20 Uhr\nBetreff: Flohmarkt am Sonntag am Mauerpark',
    context_body: `Liebe Sandra,

hast du Lust, am Sonntag mit mir auf den großen Flohmarkt im Mauerpark zu gehen? Dort gibt es tolle alte Bücher, Vintage-Kleidung und Schallplatten.

Der Markt öffnet um 09:00 Uhr. Wollen wir uns um 09:30 Uhr direkt am Ausgang der U-Bahn-Station Eberswalder Straße treffen? Danach können wir noch im Café gemütlich frühstücken und Kaffee trinken.

Zieh bitte eine warme Jacke an, denn der Wetterbericht sagt kühlen Wind voraus.

Schreib mir kurz, ob das klappt!

Liebe Grüße
Maria`,
    statement: 'Maria und Sandra wollen sich an der U-Bahn-Station treffen.',
    correct_answer: 'richtig',
    clue_quote: 'Wollen wir uns um 09:30 Uhr direkt am Ausgang der U-Bahn-Station Eberswalder Straße treffen?',
    explanation_ru: 'Мария предлагает встретиться в 09:30 на выходе из станции метро («am Ausgang der U-Bahn-Station Eberswalder Straße»). Утверждение верно (Richtig).',
    explanation_en: 'Maria suggests meeting directly at the exit of the Eberswalder Straße subway station ("am Ausgang der U-Bahn-Station"). The statement is True.',
    explanation_de: 'Sie treffen sich an der U-Bahn-Station Eberswalder Straße.',
    vocabulary_notes: [
      { word: 'die U-Bahn-Station', translation: 'станция метро', translation_en: 'subway / metro station' },
      { word: 'der Flohmarkt', translation: 'блошиный рынок', translation_en: 'flea market' },
      { word: 'sich treffen', translation: 'встречаться', translation_en: 'to meet' }
    ]
  },
  {
    id: 'm5-q2',
    exam_id: 'modellsatz-5',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Maria an Sandra',
    context_header: 'Von: Maria Santos <maria.s@postmail.de>\nAn: Sandra Koch <sandra.koch@web.de>\nDatum: 5. April, 19:20 Uhr\nBetreff: Flohmarkt am Sonntag am Mauerpark',
    context_body: `Liebe Sandra,

hast du Lust, am Sonntag mit mir auf den großen Flohmarkt im Mauerpark zu gehen? Dort gibt es tolle alte Bücher, Vintage-Kleidung und Schallplatten.

Der Markt öffnet um 09:00 Uhr. Wollen wir uns um 09:30 Uhr direkt am Ausgang der U-Bahn-Station Eberswalder Straße treffen? Danach können wir noch im Café gemütlich frühstücken und Kaffee trinken.

Zieh bitte eine warme Jacke an, denn der Wetterbericht sagt kühlen Wind voraus.

Schreib mir kurz, ob das klappt!

Liebe Grüße
Maria`,
    statement: 'Maria und Sandra wollen vor dem Flohmarkt im Café frühstücken.',
    correct_answer: 'falsch',
    clue_quote: 'Wollen wir uns um 09:30 Uhr direkt am Ausgang der U-Bahn-Station ... treffen? Danach können wir noch im Café gemütlich frühstücken',
    explanation_ru: 'Мария предлагает позавтракать в кафе ПОСЛЕ рынка («Danach können wir noch im Café gemütlich frühstücken»), а не до него («vor dem Flohmarkt»). Слово «danach» означает «после этого / затем». Утверждение неверно (Falsch).',
    explanation_en: 'Maria proposes having breakfast at the café after visiting the flea market ("Danach können wir noch im Café gemütlich frühstücken"), not before it. The statement is False.',
    explanation_de: 'Sie frühstücken nach dem Flohmarkt („danach"), nicht davor.',
    vocabulary_notes: [
      { word: 'danach', translation: 'после этого / затем', translation_en: 'afterwards / then' },
      { word: 'frühstücken', translation: 'завтракать', translation_en: 'to have breakfast' },
      { word: 'vor dem Markt', translation: 'до рынка', translation_en: 'in front of the market / before the market' }
    ]
  },

  // Text 2: Volkshochschule Köln (Aufgaben 3-5)
  {
    id: 'm5-q3',
    exam_id: 'modellsatz-5',
    teil: 1,
    question_number: 3,
    title: 'Information der Volkshochschule (VHS) Köln',
    context_header: 'Volkshochschule Köln — Kursbestätigung: Spanisch für Anfänger (A1)',
    context_body: `Guten Tag Kursteilnehmer,

herzlichen Dank für Ihre Anmeldung zum Kurs „Spanisch für die Reise (A1.1)".

Kursdetails:
- Kursbeginn: Donnerstag, 16. Oktober, 18:30 Uhr
- Unterrichtszeiten: Jeden Donnerstag von 18:30 bis 20:00 Uhr (10 Termine)
- Kursort: VHS-Zentrum Neumarkt, Raum 204 (2. Etage)
- Wichtig: In den Herbstferien (vom 27. bis 31. Oktober) findet kein Unterricht statt!

Lehrmaterial:
Das Lehrbuch „Con gusto nuevo A1" ist bereits in der Kursgebühr enthalten und wird am ersten Kursabend von der Lehrkraft im Raum verteilt.

Mit freundlichen Grüßen
Ihr VHS-Team`,
    statement: 'Der Spanischkurs findet einmal in der Woche statt.',
    correct_answer: 'richtig',
    clue_quote: 'Unterrichtszeiten: Jeden Donnerstag von 18:30 bis 20:00 Uhr (10 Termine)',
    explanation_ru: 'Занятия проходят каждый четверг («jeden Donnerstag»). Это означает ровно один раз в неделю («einmal in der Woche»). Утверждение верно (Richtig).',
    explanation_en: 'The Spanish course meets every Thursday ("Jeden Donnerstag"), which is exactly once a week. The statement is True.',
    explanation_de: 'Der Kurs findet jeden Donnerstag statt, also einmal pro Woche.',
    vocabulary_notes: [
      { word: 'einmal in der Woche', translation: 'раз в неделю', translation_en: 'once a week' },
      { word: 'jeden Donnerstag', translation: 'каждый четверг', translation_en: 'every Thursday' },
      { word: 'der Kursort', translation: 'место проведения курса', translation_en: 'course venue / location' }
    ]
  },
  {
    id: 'm5-q4',
    exam_id: 'modellsatz-5',
    teil: 1,
    question_number: 4,
    title: 'Information der Volkshochschule (VHS) Köln',
    context_header: 'Volkshochschule Köln — Kursbestätigung: Spanisch für Anfänger (A1)',
    context_body: `Guten Tag Kursteilnehmer,

herzlichen Dank für Ihre Anmeldung zum Kurs „Spanisch für die Reise (A1.1)".

Kursdetails:
- Kursbeginn: Donnerstag, 16. Oktober, 18:30 Uhr
- Unterrichtszeiten: Jeden Donnerstag von 18:30 bis 20:00 Uhr (10 Termine)
- Kursort: VHS-Zentrum Neumarkt, Raum 204 (2. Etage)
- Wichtig: In den Herbstferien (vom 27. bis 31. Oktober) findet kein Unterricht statt!

Lehrmaterial:
Das Lehrbuch „Con gusto nuevo A1" ist bereits in der Kursgebühr enthalten und wird am ersten Kursabend von der Lehrkraft im Raum verteilt.

Mit freundlichen Grüßen
Ihr VHS-Team`,
    statement: 'In den Herbstferien gibt es normalen Spanischunterricht.',
    correct_answer: 'falsch',
    clue_quote: 'In den Herbstferien (vom 27. bis 31. Oktober) findet kein Unterricht statt!',
    explanation_ru: 'В памятке прямо написано с восклицательным знаком: во время осенних каникул занятий нет («In den Herbstferien ... findet kein Unterricht statt!»). Утверждение неверно (Falsch).',
    explanation_en: 'The notice clearly states that no classes take place during autumn holidays ("In den Herbstferien ... findet kein Unterricht statt!"). The statement is False.',
    explanation_de: 'In den Herbstferien fällt der Unterricht aus („kein Unterricht").',
    vocabulary_notes: [
      { word: 'die Herbstferien', translation: 'осенние каникулы', translation_en: 'autumn holidays' },
      { word: 'kein Unterricht', translation: 'нет занятий', translation_en: 'no classes / no lesson' },
      { word: 'stattfinden', translation: 'проходить / иметь место', translation_en: 'to take place' }
    ]
  },
  {
    id: 'm5-q5',
    exam_id: 'modellsatz-5',
    teil: 1,
    question_number: 5,
    title: 'Information der Volkshochschule (VHS) Köln',
    context_header: 'Volkshochschule Köln — Kursbestätigung: Spanisch für Anfänger (A1)',
    context_body: `Guten Tag Kursteilnehmer,

herzlichen Dank für Ihre Anmeldung zum Kurs „Spanisch für die Reise (A1.1)".

Kursdetails:
- Kursbeginn: Donnerstag, 16. Oktober, 18:30 Uhr
- Unterrichtszeiten: Jeden Donnerstag von 18:30 bis 20:00 Uhr (10 Termine)
- Kursort: VHS-Zentrum Neumarkt, Raum 204 (2. Etage)
- Wichtig: In den Herbstferien (vom 27. bis 31. Oktober) findet kein Unterricht statt!

Lehrmaterial:
Das Lehrbuch „Con gusto nuevo A1" ist bereits in der Kursgebühr enthalten und wird am ersten Kursabend von der Lehrkraft im Raum verteilt.

Mit freundlichen Grüßen
Ihr VHS-Team`,
    statement: 'Die Teilnehmer müssen das Spanischbuch selbst in der Buchhandlung kaufen.',
    correct_answer: 'falsch',
    clue_quote: 'Das Lehrbuch „Con gusto nuevo A1" ist bereits in der Kursgebühr enthalten und wird am ersten Kursabend von der Lehrkraft im Raum verteilt.',
    explanation_ru: 'В письме указано: учебник уже включен в стоимость курса («bereits in der Kursgebühr enthalten») и будет выдан преподавателем в первый вечер («wird von der Lehrkraft verteilt»). Покупать его в магазине не нужно. Утверждение неверно (Falsch).',
    explanation_en: 'The textbook is already included in the course fee ("in der Kursgebühr enthalten") and is handed out by the teacher on the first evening, so participants do not need to buy it. The statement is False.',
    explanation_de: 'Das Buch ist in der Kursgebühr enthalten und wird im Kurs verteilt.',
    vocabulary_notes: [
      { word: 'in der Kursgebühr enthalten', translation: 'включено в стоимость курса', translation_en: 'included in the course fee' },
      { word: 'die Lehrkraft / der Lehrer', translation: 'преподаватель', translation_en: 'teacher / instructor' },
      { word: 'verteilen', translation: 'раздавать', translation_en: 'to distribute / hand out' }
    ]
  },

  // ==========================================
  // MODELLSATZ 5 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm5-q6',
    exam_id: 'modellsatz-5',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Das Display Ihres Smartphones ist kaputtgegangen. Sie suchen eine Werkstatt für eine schnelle Sofort-Reparatur.',
    options_json: [
      {
        id: 'a',
        badge: 'www.smart-fix-express.de',
        title: 'SmartFix: Smartphone-Reparatur in 30 Minuten',
        text: 'Display kaputt oder Akku schwach? Wir reparieren Handys aller Marken direkt vor Ort ohne Termin. Hochwertige Ersatzteile mit 12 Monaten Garantie. Geöffnet Mo–Sa 10–19 Uhr.',
        details: 'Service: Express-Reparatur vor Ort • Displaywechsel in 30 Min'
      },
      {
        id: 'b',
        badge: 'www.phone-store-kaufen.de',
        title: 'HandyWorld — Neue Smartphones & Mobilfunkverträge',
        text: 'Die neuesten Top-Smartphones mit günstigen 2-Jahres-Verträgen. Riesige Auswahl an Zubehör wie Hüllen und Ladekabeln. Wir führen keine Reparaturarbeiten durch.',
        details: 'Service: Nur Verkauf von Neugeräten und Verträgen • Keine Reparatur'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'SmartFix: Smartphone-Reparatur in 30 Minuten ... Display kaputt oder Akku schwach? Wir reparieren Handys aller Marken direkt vor Ort',
    explanation_ru: 'Вам нужен: 1) ремонт разбитого экрана смартфона (Display kaputt, Reparatur), 2) быстро на месте. Сайт «b» продаёт новые телефоны с контрактами и не чинит технику («Wir führen keine Reparaturarbeiten durch»). Сайт «a» делает экспресс-ремонт экранов за 30 минут без записи. Правильный ответ: a.',
    explanation_en: 'Option a offers express on-site screen repairs in just 30 minutes without an appointment, whereas option b sells phone plans and does not perform any repair work.',
    explanation_de: 'Gesucht wird eine Displayreparatur für ein Smartphone. Anzeige a bietet Sofort-Reparatur in 30 Minuten an.',
    vocabulary_notes: [
      { word: 'das Display / der Bildschirm', translation: 'экран / дисплей', translation_en: 'display / screen' },
      { word: 'die Sofort-Reparatur', translation: 'срочный ремонт', translation_en: 'instant repair / while-you-wait repair' },
      { word: 'das Ersatzteil (-e)', translation: 'запасная деталь', translation_en: 'spare part(s)' }
    ]
  },
  {
    id: 'm5-q7',
    exam_id: 'modellsatz-5',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie haben kein eigenes Auto und suchen einen Kleinwagen für 2 Stunden am Samstagnachmittag, um Baumaterial zu transportieren.',
    options_json: [
      {
        id: 'a',
        badge: 'www.camper-urlaub-reisen.de',
        title: 'Wohnmobile & Camper mieten für den Urlaub',
        text: 'Mieten Sie vollausgestattete Wohnmobile für Ihre Ferienreise nach Schweden oder Italien. Mindestmietdauer: 7 Tage. Keine Kurzzeitmiete für wenige Stunden möglich.',
        details: 'Angebot: Campingbusse • Mindestmietdauer: 1 Woche'
      },
      {
        id: 'b',
        badge: 'www.stadtmobil-carsharing.de',
        title: 'StadtMobil Carsharing: Autos flexibel stundenweise mieten',
        text: 'Auto fahren, wann immer Sie wollen! Zahlreiche Kleinwagen und Kombis in Ihrer Nachbarschaft per App öffnen. Abrechnung minutengenau oder ab 3 € pro Stunde. Ideal für kurze Besorgungen.',
        details: 'Angebot: Carsharing stundenweise • Sofort per App mieten'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'StadtMobil Carsharing: Autos flexibel stundenweise mieten ... ab 3 € pro Stunde. Ideal für kurze Besorgungen.',
    explanation_ru: 'Вам нужно: 1) автомобиль на 2 часа (für 2 Stunden), 2) для коротких дел. Сайт «a» сдает автодома на время отпуска минимум на 7 дней («Mindestmietdauer: 7 Tage, keine Kurzzeitmiete»). Сайт «b» предлагает почасовой каршеринг («stundenweise mieten, ab 3 € pro Stunde»). Правильный ответ: b.',
    explanation_en: 'Option b offers flexible carsharing by the hour for short errands, whereas option a rents holiday camper vans with a 7-day minimum rental period.',
    explanation_de: 'Gesucht ist eine Autovermietung für 2 Stunden. Anzeige b bietet flexibles Carsharing auf Stundenbasis.',
    vocabulary_notes: [
      { word: 'stundenweise mieten', translation: 'арендовать по часам', translation_en: 'to rent by the hour' },
      { word: 'die Kurzzeitmiete', translation: 'краткосрочная аренда', translation_en: 'short-term rental' },
      { word: 'Besorgungen machen', translation: 'делать дела / покупки', translation_en: 'to run errands' }
    ]
  },
  {
    id: 'm5-q8',
    exam_id: 'modellsatz-5',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie möchten mit dem Laufen beginnen und suchen eine Laufsport-Gruppe für Anfänger am Samstagmorgen im Stadtpark.',
    options_json: [
      {
        id: 'a',
        badge: 'www.parkrun-einsteiger-lauf.de',
        title: 'ParkRun Treff: Gemeinsam joggen für Einsteiger',
        text: 'Lust auf Bewegung an der frischen Luft? Unser lockerer Lauftreff für Anfänger trifft sich jeden Samstag um 09:00 Uhr am Parkeingang. Leichtes Tempo (5 km), Gehpausen erlaubt. Kostenlos!',
        details: 'Zielgruppe: Anfänger & Einsteiger • Jeden Samstag um 09:00 Uhr'
      },
      {
        id: 'b',
        badge: 'www.marathon-leistungskader.de',
        title: 'Marathon Club 42: Leistungstraining für Wettkämpfer',
        text: 'Intensives Tempointervall- und Ausdauertraining für erfahrene Marathonläufer unter 3 Stunden. Training nur mittwochs und freitags ab 19:30 Uhr im Stadion. Nicht für Laufanfänger.',
        details: 'Zielgruppe: Erfahrene Leistungssportler • Mi & Fr abends'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Unser lockerer Lauftreff für Anfänger trifft sich jeden Samstag um 09:00 Uhr am Parkeingang.',
    explanation_ru: 'Критерии: 1) для начинающих (für Anfänger / Einsteiger), 2) в субботу утром (jeden Samstag um 09:00 Uhr), 3) в парке. Вариант «b» предназначен только для опытных спортсменов-марафонцев по вечерам («Nicht für Laufanfänger»). Вариант «a» — клуб бега для начинающих по субботам в 9:00. Правильный ответ: a.',
    explanation_en: 'Option a is a casual beginner running group in the park on Saturday morning at 09:00, whereas option b is an advanced marathon training session strictly not intended for beginners.',
    explanation_de: 'Gesucht ist eine Anfänger-Laufgruppe am Samstagmorgen. Anzeige a richtet sich an Anfänger am Samstag um 9:00 Uhr.',
    vocabulary_notes: [
      { word: 'der Einsteiger / der Anfänger', translation: 'новичок / начинающий', translation_en: 'beginner / novice' },
      { word: 'das Tempo', translation: 'скорость / темп', translation_en: 'pace / tempo / speed' },
      { word: 'die Gehpause', translation: 'перерыв на шаг', translation_en: 'walking break / pause' }
    ]
  },
  {
    id: 'm5-q9',
    exam_id: 'modellsatz-5',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie reisen mit der Bahn nach Hamburg und suchen ein Hotel direkt am Hauptbahnhof mit Frühstück im Zimmerpreis inbegriffen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.airporthotel-hamburg-nord.de',
        title: 'Airport Motel Hamburg Nord',
        text: 'Praktische Übernachtung für Fluggäste direkt an den Terminals des Flughafens (12 km vom Hauptbahnhof). Zimmer ohne Verpflegung, kein Frühstücksangebot im Haus.',
        details: 'Lage: Direkt am Flughafen (12 km weg) • Kein Frühstück'
      },
      {
        id: 'b',
        badge: 'www.hotel-bahnhof-hamburg.de',
        title: 'Hotel Station City: Nur 100 Meter vom Hauptbahnhof',
        text: 'Zentrale Lage im Herzen von Hamburg! Moderne Zimmer, gratis WLAN und jeden Morgen ab 06:30 Uhr großes Schlemmer-Frühstücksbuffet ohne Aufpreis im Zimmerpreis enthalten.',
        details: 'Lage: Direkt am Hauptbahnhof (100 m) • Frühstück inklusive'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Hotel Station City: Nur 100 Meter vom Hauptbahnhof ... großes Schlemmer-Frühstücksbuffet ohne Aufpreis im Zimmerpreis enthalten.',
    explanation_ru: 'Критерии: 1) прямо у вокзала (direkt am Hauptbahnhof), 2) завтрак включен в стоимость (Frühstück im Zimmerpreis enthalten). Вариант «a» находится в 12 км от вокзала у аэропорта и не предлагает завтрака. Вариант «b» находится в 100 м от вокзала и включает завтрак без доплаты. Правильный ответ: b.',
    explanation_en: 'Option b is located just 100 meters from the central station and includes a breakfast buffet in the room price, whereas option a is located 12 km away at the airport and does not offer breakfast.',
    explanation_de: 'Gesucht ist ein Hotel am Hauptbahnhof mit Frühstück inklusive. Anzeige b erfüllt beide Wünsche.',
    vocabulary_notes: [
      { word: 'im Zimmerpreis enthalten', translation: 'включено в стоимость номера', translation_en: 'included in room price' },
      { word: 'zentrale Lage', translation: 'центральное расположение', translation_en: 'central location' },
      { word: 'der Hauptbahnhof', translation: 'главный вокзал', translation_en: 'central train station' }
    ]
  },
  {
    id: 'm5-q10',
    exam_id: 'modellsatz-5',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie möchten mit Ihrem Partner Salsa tanzen lernen und suchen einen Anfängerkurs für Paare am Freitagabend.',
    options_json: [
      {
        id: 'a',
        badge: 'www.salsa-rhythmus-tanzschule.de',
        title: 'Tanzschule Ritmo Latino: Salsa & Bachata für Paare',
        text: 'Feurige Rhythmen und jede Menge Spaß! Neuer Salsa-Grundkurs für Paare und Anfänger ohne Vorkenntnisse. Immer freitags von 19:30 bis 21:00 Uhr. Jetzt Schnupperstunde buchen!',
        details: 'Tanzstil: Salsa für Paare • Freitag 19:30–21:00 Uhr'
      },
      {
        id: 'b',
        badge: 'www.breakdance-hiphop-kids.de',
        title: 'StreetDance Academy: Hip-Hop & Breakdance für Jugendliche',
        text: 'Coole Moves und Beats für Teens von 10 bis 16 Jahren. Training montags und mittwochs von 16:00 bis 17:30 Uhr. Kein Paartanz, keine Standard- oder Lateintänze.',
        details: 'Zielgruppe: Jugendliche (10–16) • Mo & Mi 16:00 Uhr'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Tanzschule Ritmo Latino: Salsa & Bachata für Paare ... Grundkurs für Paare und Anfänger ... Immer freitags von 19:30 bis 21:00 Uhr.',
    explanation_ru: 'Критерии: 1) сальса (Salsa), 2) для пар и начинающих (für Paare und Anfänger), 3) в пятницу вечером (freitags 19:30–21:00 Uhr). Сайт «b» обучает подростков брейк-дансу днем в будни. Сайт «a» ведет курсы сальсы для пар по пятницам вечером. Правильный ответ: a.',
    explanation_en: 'Option a offers a Salsa basic course for couples and beginners on Friday evenings from 19:30 to 21:00, whereas option b is a youth hip-hop dance class with no partner dancing.',
    explanation_de: 'Gesucht ist ein Salsa-Kurs für Paare am Freitagabend. Anzeige a bietet genau das an.',
    vocabulary_notes: [
      { word: 'der Paartanz', translation: 'парный танец', translation_en: 'couple dancing / partner dance' },
      { word: 'ohne Vorkenntnisse', translation: 'без предварительных навыков', translation_en: 'no previous experience required' },
      { word: 'die Schnupperstunde', translation: 'пробный урок', translation_en: 'taster session / trial class' }
    ]
  },

  // ==========================================
  // MODELLSATZ 5 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm5-q11',
    exam_id: 'modellsatz-5',
    teil: 3,
    question_number: 11,
    title: 'Hinweisschild am Leergutautomaten im Supermarkt',
    context_header: 'Supermarkt EDEKA — Information Pfandrückgabe',
    context_body: `Achtung Kunden!

Wegen technischer Reinigung ist dieser Leergutautomat im Eingangsberiech heute außer Betrieb.

Bitte geben Sie Ihre Pfandflaschen und Kisten am Ersatzautomaten hinten auf dem Parkplatz/Ladehof ab.

Der Bon ist an jeder Kasse einlösbar.`,
    statement: 'Man kann heute Pfandflaschen am Automaten auf dem Parkplatz abgeben.',
    correct_answer: 'richtig',
    clue_quote: 'Bitte geben Sie Ihre Pfandflaschen und Kisten am Ersatzautomaten hinten auf dem Parkplatz/Ladehof ab.',
    explanation_ru: 'В объявлении указано: автомат у входа не работает, но покупателей просят сдавать бутылки на запасном автомате на парковке («am Ersatzautomaten hinten auf dem Parkplatz abgeben»). Утверждение верно (Richtig).',
    explanation_en: 'Customers are instructed to return deposit bottles at the replacement machine in the parking lot ("am Ersatzautomaten hinten auf dem Parkplatz abgeben"). The statement is True.',
    explanation_de: 'Am Ersatzautomaten auf dem Parkplatz kann man die Flaschen abgeben.',
    vocabulary_notes: [
      { word: 'die Pfandflasche (-n)', translation: 'бутылка с залоговой стоимостью', translation_en: 'deposit bottle(s)' },
      { word: 'der Leergutautomat', translation: 'автомат приема бутылок', translation_en: 'bottle return machine' },
      { word: 'außer Betrieb', translation: 'не работает', translation_en: 'out of order / out of service' }
    ]
  },
  {
    id: 'm5-q12',
    exam_id: 'modellsatz-5',
    teil: 3,
    question_number: 12,
    title: 'Schild an der Tür einer Zahnarztpraxis',
    context_header: 'Zahnarztpraxis Dr. med. dent. Markus Lang',
    context_body: `Liebe Patientinnen und Patienten,

zum Schutz von Risikopatienten gilt in unserer Praxis weiterhin:
Das Betreten der Praxisräume ist nur mit einer gut sitzenden medizinischen Maske (OP-Maske oder FFP2-Maske) erlaubt.

Sollten Sie keine Maske dabeihaben, erhalten Sie eine an der Anmeldung gegen eine Gebühr von 1 €.`,
    statement: 'Patienten dürfen die Praxis auch ohne Maske betreten.',
    correct_answer: 'falsch',
    clue_quote: 'Das Betreten der Praxisräume ist nur mit einer gut sitzenden medizinischen Maske ... erlaubt.',
    explanation_ru: 'На дверях кабинета врача написано: вход разрешен ТОЛЬКО в медицинской маске («nur mit einer medizinischen Maske erlaubt»). Если маски нет, её нужно купить на стойке за 1 €. Входить без маски нельзя. Утверждение неверно (Falsch).',
    explanation_en: 'Entering the practice is only permitted with a medical mask ("nur mit einer gut sitzenden medizinischen Maske erlaubt"), so entering without a mask is not allowed. The statement is False.',
    explanation_de: 'Ohne Maske darf man die Praxis nicht betreten („nur mit ... Maske erlaubt").',
    vocabulary_notes: [
      { word: 'das Betreten', translation: 'вход / посещение', translation_en: 'entering / stepping on' },
      { word: 'nur mit Maske', translation: 'только в маске', translation_en: 'mask required / with mask only' },
      { word: 'die Schutzmaßnahme', translation: 'мера защиты', translation_en: 'protective measure' }
    ]
  },
  {
    id: 'm5-q13',
    exam_id: 'modellsatz-5',
    teil: 3,
    question_number: 13,
    title: 'Aushang an einer Straßenbahnhaltestelle',
    context_header: 'Verkehrsbetriebe Rhein-Sieg — Fahrgastinfo',
    context_body: `Wichtiger Fahrgasthinweis:

Einzelfahrscheine und 4er-Tickets müssen vor dem Einsteigen an den Entwertern auf dem Bahnsteig entwertet werden!

In den neuen Niederflur-Bahnen befinden sich keine Entwerter mehr. Fahren ohne gültigen Stempel gilt als Schwarzfahren (60 € Strafe).`,
    statement: 'Man muss die Fahrkarte vor der Fahrt auf dem Bahnsteig entwerten.',
    correct_answer: 'richtig',
    clue_quote: 'müssen vor dem Einsteigen an den Entwertern auf dem Bahnsteig entwertet werden! In den neuen Niederflur-Bahnen befinden sich keine Entwerter mehr.',
    explanation_ru: 'В объявлении написано: билеты необходимо прокомпостировать перед посадкой на платформе («vor dem Einsteigen auf dem Bahnsteig entwertet werden»), так как в самом вагоне компостеров больше нет. Утверждение верно (Richtig).',
    explanation_en: 'Tickets must be stamped at the validators on the platform before boarding ("vor dem Einsteigen an den Entwertern auf dem Bahnsteig entwertet werden"), because there are no validators inside the trams. The statement is True.',
    explanation_de: 'Tickets müssen vor dem Einsteigen auf dem Bahnsteig gestempelt werden.',
    vocabulary_notes: [
      { word: 'entwerten / abstempeln', translation: 'компостировать / гасить билет', translation_en: 'to validate / stamp a ticket' },
      { word: 'der Bahnsteig', translation: 'перрон / посадочная платформа', translation_en: 'train platform' },
      { word: 'das Schwarzfahren', translation: 'безбилетный проезд', translation_en: 'fare evasion / riding without a ticket' }
    ]
  },
  {
    id: 'm5-q14',
    exam_id: 'modellsatz-5',
    teil: 3,
    question_number: 14,
    title: 'Hinweisschild auf dem Parkplatz eines Einkaufszentrums',
    context_header: 'Einkaufszentrum CityPoint — Parkplatzordnung',
    context_body: `Kundenparkplatz!

Parken nur für Besucher des Einkaufszentrums.
Bitte legen Sie gut sichtbar Ihre Parkscheibe ins Auto.

Höchstparkdauer: 2 Stunden.
Bei Überschreiten der Parkzeit oder fehlender Parkscheibe wird das Fahrzeug kostenpflichtig abgeschleppt.`,
    statement: 'Man darf sein Auto den ganzen Tag kostenlos auf diesem Parkplatz stehen lassen.',
    correct_answer: 'falsch',
    clue_quote: 'Höchstparkdauer: 2 Stunden. Bei Überschreiten der Parkzeit ... kostenpflichtig abgeschleppt.',
    explanation_ru: 'На знаке указано: максимальное время парковки составляет 2 часа («Höchstparkdauer: 2 Stunden»), и необходимо выложить парковочный диск. Оставлять машину на весь день нельзя — её эвакуируют за счет владельца. Утверждение неверно (Falsch).',
    explanation_en: 'The maximum parking time is 2 hours ("Höchstparkdauer: 2 Stunden") and exceeding it leads to towing, so leaving the car for the entire day is not permitted. The statement is False.',
    explanation_de: 'Die maximale Parkdauer beträgt 2 Stunden, der ganze Tag ist nicht erlaubt.',
    vocabulary_notes: [
      { word: 'die Parkscheibe', translation: 'парковочный диск со стрелкой времени', translation_en: 'parking disc' },
      { word: 'Höchstparkdauer', translation: 'максимальная продолжительность парковки', translation_en: 'maximum parking time' },
      { word: 'abschleppen', translation: 'эвакуировать (автомобиль)', translation_en: 'to tow away' }
    ]
  },
  {
    id: 'm5-q15',
    exam_id: 'modellsatz-5',
    teil: 3,
    question_number: 15,
    title: 'Hinweistafel im Kunstmuseum',
    context_header: 'Museum für Moderne Kunst — Besucherregeln',
    context_body: `Liebe Museumsgäste,

das Fotografieren der Kunstwerke für private Zwecke ohne Blitzlicht ist im gesamten Ausstellungsbereich erlaubt.

Die Benutzung von Blitzlicht, Stativen und Selfie-Sticks ist zum Schutz der empfindlichen Gemälde strengstens verboten.`,
    statement: 'Man darf die Gemälde im Museum mit Blitzlicht fotografieren.',
    correct_answer: 'falsch',
    clue_quote: 'Die Benutzung von Blitzlicht, Stativen und Selfie-Sticks ist ... strengstens verboten.',
    explanation_ru: 'На табличке в музее прямо написано: фотографировать разрешено только без вспышки («ohne Blitzlicht erlaubt»), а использование вспышки строго запрещено («Benutzung von Blitzlicht ... strengstens verboten»). Утверждение неверно (Falsch).',
    explanation_en: 'The use of flash photography is strictly prohibited in the museum ("Die Benutzung von Blitzlicht ... ist strengstens verboten"). The statement is False.',
    explanation_de: 'Das Fotografieren mit Blitz ist strengstens verboten.',
    vocabulary_notes: [
      { word: 'das Blitzlicht', translation: 'фотовспышка', translation_en: 'flash (photography)' },
      { word: 'strengstens verboten', translation: 'строжайше запрещено', translation_en: 'strictly forbidden' },
      { word: 'das Gemälde', translation: 'картина / полотно', translation_en: 'painting' }
    ]
  }
];
