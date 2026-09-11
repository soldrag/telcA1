export const exam = {
  id: 'modellsatz-8',
  title: 'telc Deutsch A1 — Modellsatz 8',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Восьмой официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: велопрогулка, спортивный клуб, услуги химчистки, доставка цветов и правила в общественных зонах.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 8 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: E-Mail von Jonas an Felix (Aufgaben 1-2)
  {
    id: 'm8-q1',
    exam_id: 'modellsatz-8',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Jonas an Felix',
    context_header: 'Von: Jonas Bergmann <jonas.b@post.de>\nAn: Felix Schulz <felix.schulz@gmx.de>\nDatum: 22. Mai, 18:15 Uhr\nBetreff: Radtour am Sonntag an den See',
    context_body: `Hallo Felix,

das Wetter am Sonntag wird super: 25 Grad und viel Sonne! Wollen wir unsere Fahrradtour zum Wannsee machen?

Wir treffen uns um 10:00 Uhr morgens am S-Bahnhof Wannsee vor der Bäckerei. Die Tour dauert ungefähr drei Stunden.

Ich bringe eine Luftpumpe und Werkzeug mit, wenn an den Fahrrädern etwas kaputt ist. Bring du bitte dein Fahrradschloss und eine große Flasche Wasser mit. Am See schließen wir unsere Fahrräder ab.

Gib mir kurz Bescheid, ob 10:00 Uhr für dich passt.

Viele Grüße
Jonas`,
    statement: 'Felix soll ein Fahrradschloss mitbringen.',
    correct_answer: 'richtig',
    clue_quote: 'Bring du bitte dein Fahrradschloss und eine große Flasche Wasser mit.',
    explanation_ru: 'Йонас прямо просит Феликса: «Bring du bitte dein Fahrradschloss ... mit» («Принеси, пожалуйста, свой велосипедный замок»). Утверждение верно (Richtig).',
    explanation_en: 'Jonas explicitly asks Felix to bring along his bicycle lock (\'Bring du bitte dein Fahrradschloss ... mit\'). The statement is True.',
    explanation_de: 'Jonas bittet Felix, ein Fahrradschloss mitzubringen.',
    vocabulary_notes: [
      { word: 'das Fahrradschloss', translation: 'велосипедный замок', translation_en: 'bicycle lock' },
      { word: 'die Fahrradtour', translation: 'велопрогулка', translation_en: 'bike tour / bicycle excursion' },
      { word: 'abschließen', translation: 'запирать на замок', translation_en: 'to lock up' }
    ]
  },
  {
    id: 'm8-q2',
    exam_id: 'modellsatz-8',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Jonas an Felix',
    context_header: 'Von: Jonas Bergmann <jonas.b@post.de>\nAn: Felix Schulz <felix.schulz@gmx.de>\nDatum: 22. Mai, 18:15 Uhr\nBetreff: Radtour am Sonntag an den See',
    context_body: `Hallo Felix,

das Wetter am Sonntag wird super: 25 Grad und viel Sonne! Wollen wir unsere Fahrradtour zum Wannsee machen?

Wir treffen uns um 10:00 Uhr morgens am S-Bahnhof Wannsee vor der Bäckerei. Die Tour dauert ungefähr drei Stunden.

Ich bringe eine Luftpumpe und Werkzeug mit, wenn an den Fahrrädern etwas kaputt ist. Bring du bitte dein Fahrradschloss und eine große Flasche Wasser mit. Am See schließen wir unsere Fahrräder ab.

Gib mir kurz Bescheid, ob 10:00 Uhr für dich passt.

Viele Grüße
Jonas`,
    statement: 'Die beiden Freunde treffen sich erst am Nachmittag.',
    correct_answer: 'falsch',
    clue_quote: 'Wir treffen uns um 10:00 Uhr morgens am S-Bahnhof Wannsee vor der Bäckerei.',
    explanation_ru: 'Йонас назначает встречу на 10:00 утра («um 10:00 Uhr morgens»). Это первая половина дня/утро, а не день после полудня («am Nachmittag»). Утверждение неверно (Falsch).',
    explanation_en: 'They are meeting at 10:00 in the morning (\'um 10:00 Uhr morgens\'), not in the afternoon. The statement is False.',
    explanation_de: 'Sie treffen sich um 10:00 Uhr morgens, nicht am Nachmittag.',
    vocabulary_notes: [
      { word: 'morgens / am Morgen', translation: 'утром', translation_en: 'in the morning' },
      { word: 'nachmittags', translation: 'во второй половине дня', translation_en: 'in the afternoon' },
      { word: 'sich treffen', translation: 'встречаться', translation_en: 'to meet' }
    ]
  },

  // Text 2: Sportverein TSV Grün-Weiß (Aufgaben 3-5)
  {
    id: 'm8-q3',
    exam_id: 'modellsatz-8',
    teil: 1,
    question_number: 3,
    title: 'Information des Sportvereins TSV Grün-Weiß',
    context_header: 'TSV Grün-Weiß e.V. — Neue Sportangebote ab April',
    context_body: `Liebe Sportfreunde,

ab Montag, dem 1. April, starten unsere neuen Sportkurse in der Stadtsporthalle:
- Badminton: Montags von 18:30 bis 20:00 Uhr
- Tischtennis: Mittwochs von 19:00 bis 20:30 Uhr

Probetraining:
Sie sind noch kein Mitglied? Kein Problem! Sie können zweimal kostenlos beim Training mitmachen. Bitte schreiben Sie uns vorher eine kurze E-Mail.

Wichtige Hallenordnung:
In der Sporthalle darf man nur mit sauberen Sportschuhen trainieren. Bitte bringen Sie Schuhe mit heller Sohle mit. Straßenschuhe sind streng verboten!

Sportliche Grüße
Ihr Sportverein TSV Grün-Weiß`,
    statement: 'Nicht-Mitglieder können zweimal kostenlos beim Training mitmachen.',
    correct_answer: 'richtig',
    clue_quote: 'Sie können zweimal kostenlos beim Training mitmachen.',
    explanation_ru: 'В объявлении клуба написано: те, кто еще не являются членами клуба, могут два раза бесплатно участвовать в тренировке («Sie können zweimal kostenlos beim Training mitmachen»). Утверждение верно (Richtig).',
    explanation_en: 'The club notice states that interested non-members may join training twice for free (\'zweimal kostenlos beim Training mitmachen\'). The statement is True.',
    explanation_de: 'Nicht-Mitglieder dürfen zweimal kostenlos zum Probetraining kommen.',
    vocabulary_notes: [
      { word: 'das Probetraining', translation: 'пробная тренировка', translation_en: 'trial training session' },
      { word: 'das Mitglied (-er)', translation: 'член клуба', translation_en: 'member(s)' },
      { word: 'mitmachen', translation: 'принимать участие', translation_en: 'to take part / join in' }
    ]
  },
  {
    id: 'm8-q4',
    exam_id: 'modellsatz-8',
    teil: 1,
    question_number: 4,
    title: 'Information des Sportvereins TSV Grün-Weiß',
    context_header: 'TSV Grün-Weiß e.V. — Neue Sportangebote ab April',
    context_body: `Liebe Sportfreunde,

ab Montag, dem 1. April, starten unsere neuen Sportkurse in der Stadtsporthalle:
- Badminton: Montags von 18:30 bis 20:00 Uhr
- Tischtennis: Mittwochs von 19:00 bis 20:30 Uhr

Probetraining:
Sie sind noch kein Mitglied? Kein Problem! Sie können zweimal kostenlos beim Training mitmachen. Bitte schreiben Sie uns vorher eine kurze E-Mail.

Wichtige Hallenordnung:
In der Sporthalle darf man nur mit sauberen Sportschuhen trainieren. Bitte bringen Sie Schuhe mit heller Sohle mit. Straßenschuhe sind streng verboten!

Sportliche Grüße
Ihr Sportverein TSV Grün-Weiß`,
    statement: 'Man darf mit normalen Straßenschuhen in die Sporthalle gehen.',
    correct_answer: 'falsch',
    clue_quote: 'Straßenschuhe sind streng verboten!',
    explanation_ru: 'Правила спортзала категоричны: вход разрешен только в чистой спортивной обуви, уличная обувь строго запрещена («Straßenschuhe sind streng verboten!»). Утверждение неверно (Falsch).',
    explanation_en: 'The rules strictly forbid wearing regular street shoes inside the sports hall (\'Straßenschuhe sind streng verboten!\'). The statement is False.',
    explanation_de: 'Straßenschuhe sind streng verboten in der Halle.',
    vocabulary_notes: [
      { word: 'die Straßenschuhe (pl.)', translation: 'уличная обувь', translation_en: 'outdoor street shoes' },
      { word: 'die Sportschuhe (pl.)', translation: 'спортивная обувь', translation_en: 'sports shoes / sneakers' },
      { word: 'streng verboten', translation: 'строго запрещено', translation_en: 'strictly forbidden' }
    ]
  },
  {
    id: 'm8-q5',
    exam_id: 'modellsatz-8',
    teil: 1,
    question_number: 5,
    title: 'Information des Sportvereins TSV Grün-Weiß',
    context_header: 'TSV Grün-Weiß e.V. — Neue Sportangebote ab April',
    context_body: `Liebe Sportfreunde,

ab Montag, dem 1. April, starten unsere neuen Sportkurse in der Stadtsporthalle:
- Badminton: Montags von 18:30 bis 20:00 Uhr
- Tischtennis: Mittwochs von 19:00 bis 20:30 Uhr

Probetraining:
Sie sind noch kein Mitglied? Kein Problem! Sie können zweimal kostenlos beim Training mitmachen. Bitte schreiben Sie uns vorher eine kurze E-Mail.

Wichtige Hallenordnung:
In der Sporthalle darf man nur mit sauberen Sportschuhen trainieren. Bitte bringen Sie Schuhe mit heller Sohle mit. Straßenschuhe sind streng verboten!

Sportliche Grüße
Ihr Sportverein TSV Grün-Weiß`,
    statement: 'Die neuen Sportkurse fangen im April an.',
    correct_answer: 'richtig',
    clue_quote: 'ab Montag, dem 1. April, starten unsere neuen Sportkurse in der Stadtsporthalle',
    explanation_ru: 'В самом начале текста указано: «ab Montag, dem 1. April, starten unsere neuen Sportkurse» (с понедельника, 1 апреля, начинаются наши новые спортивные курсы). Утверждение верно (Richtig).',
    explanation_en: 'The announcement states that the new sports courses start on Monday, April 1 (\'ab Montag, dem 1. April, starten unsere neuen Sportkurse\'). The statement is True.',
    explanation_de: 'Die Kurse beginnen am 1. April.',
    vocabulary_notes: [
      { word: 'anfangen / starten', translation: 'начинаться', translation_en: 'to start / begin' },
      { word: 'die Sporthalle', translation: 'спортивный зал', translation_en: 'gym / sports hall' },
      { word: 'der Sportverein', translation: 'спортивный клуб', translation_en: 'sports club' }
    ]
  },

  // ==========================================
  // MODELLSATZ 8 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm8-q6',
    exam_id: 'modellsatz-8',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie müssen morgen auf eine wichtige Hochzeit und brauchen eine Express-Textilreinigung für Ihren Anzug innerhalb von 24 Stunden.',
    options_json: [
      {
        id: 'a',
        badge: 'www.blitz-reinigung-24h.de',
        title: 'BlitzBlank Textilreinigung: Express-Service in 24 Stunden',
        text: 'Schonende chemische Reinigung für Anzüge, Abendkleider und Mäntel. Heute bis 10:00 Uhr abgeben, morgen abholbereit! Express-Zuschlag nur 5 €. Professionell gebügelt.',
        details: 'Service: Express-Reinigung in 24h • Anzüge & Abendkleider'
      },
      {
        id: 'b',
        badge: 'www.teppich-waescherei-spezial.de',
        title: 'OrientTeppich-Wäscherei & Lederpflege',
        text: 'Spezialwäsche für handgeknüpfte Orientteppiche und schwere Lederjacken. Bearbeitungszeit ca. 2 bis 3 Wochen. Keine Kleidung wie Anzüge oder Hemden im Sortiment.',
        details: 'Dauer: 2–3 Wochen • Nur Teppiche & Leder • Keine Anzüge'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'BlitzBlank Textilreinigung: Express-Service in 24 Stunden ... Heute bis 10:00 Uhr abgeben, morgen abholbereit! ... Anzüge',
    explanation_ru: 'Вам нужна: 1) химчистка для костюма (Anzug), 2) срочно за 24 часа (innerhalb von 24 Stunden). Вариант «b» стирает ковры 2-3 недели и не принимает костюмы. Вариант «a» чистит костюмы за 24 часа («Express-Service in 24 Stunden, morgen abholbereit»). Правильный ответ: a.',
    explanation_en: 'You need 24-hour express dry cleaning for a suit. Option a offers a 24-hour express cleaning service for suits ready the next day, whereas option b cleans carpets and upholstered furniture over several weeks and does not accept suits.',
    explanation_de: 'Gesucht ist eine Express-Reinigung für einen Anzug innerhalb von 24 Stunden. Anzeige a bietet Express-Service in 24h.',
    vocabulary_notes: [
      { word: 'die Textilreinigung', translation: 'химчистка одежды', translation_en: 'dry cleaner' },
      { word: 'abholbereit', translation: 'готово к выдаче', translation_en: 'ready for pickup' },
      { word: 'der Anzug', translation: 'мужской костюм', translation_en: 'suit' }
    ]
  },
  {
    id: 'm8-q7',
    exam_id: 'modellsatz-8',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie möchten am Wochenende eine geführte Bergwanderung mit einem erfahrenen Bergführer in den bayerischen Alpen machen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.kletterhalle-cityclimb.de',
        title: 'CityClimb: Indoor-Kletterhalle im Stadtzentrum',
        text: 'Klettern und Bouldern an künstlichen Wänden in der Halle. Kurse für Kinder und Erwachsene bei jedem Wetter mitten in der Stadt. Keine Bergtouren im Freien.',
        details: 'Ort: Kletterhalle drinnen in der Stadt • Keine Bergwanderungen'
      },
      {
        id: 'b',
        badge: 'www.alpen-bergfuehrer-touren.de',
        title: 'AlpinTours: Geführte Bergwanderungen in den Alpen',
        text: 'Sicher die schönsten Berggipfel Bayerns entdecken! Staatlich geprüfte Bergführer begleiten Sie auf leichten bis mittelschweren Wochenendtouren. Samstag ab Garmisch.',
        details: 'Angebot: Geführte Bergtouren mit Bergführer in den Alpen • Sa'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Geführte Bergwanderungen in den Alpen ... Staatlich geprüfte Bergführer begleiten Sie auf leichten bis mittelschweren Wochenendtouren.',
    explanation_ru: 'Критерии: 1) поход в Альпах (in den bayerischen Alpen), 2) с опытным гидом-проводником (geführte Bergwanderung mit Bergführer). Вариант «a» — это закрытый скалодром в центре города («Indoor-Kletterhalle mitten in der Stadt»). Вариант «b» — горные походы с дипломированными гидами по выходным. Правильный ответ: b.',
    explanation_en: 'You want a guided mountain hike in the Bavarian Alps with an experienced guide. Option b provides guided alpine weekend tours with certified mountain guides, whereas option a is an indoor climbing gym located in the city.',
    explanation_de: 'Gesucht wird eine geführte Bergwanderung mit Bergführer in den Alpen. Anzeige b bietet Bergtouren mit Bergführern.',
    vocabulary_notes: [
      { word: 'die Bergwanderung', translation: 'горный поход', translation_en: 'mountain hike' },
      { word: 'der Bergführer', translation: 'горный гид / проводник', translation_en: 'mountain guide' },
      { word: 'die Alpen', translation: 'Альпы', translation_en: 'the Alps' }
    ]
  },
  {
    id: 'm8-q8',
    exam_id: 'modellsatz-8',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Ihre Mutter hat heute Geburtstag. Sie möchten ihr einen frischen Blumenstrauß mit garantierter Lieferung noch am selben Tag schicken.',
    options_json: [
      {
        id: 'a',
        badge: 'www.blumen-sofort-bote.de',
        title: 'BlumenExpress: Frische Blumenlieferung am gleichen Tag',
        text: 'Überraschen Sie Ihre Liebsten! Bei Bestellung bis 14:00 Uhr liefert unser Kurier bunte Sträuße noch heute direkt an die Haustür der Empfängerin. Frische-Garantie inklusive.',
        details: 'Service: Blumenlieferung noch heute am selben Tag • Bis 14 Uhr'
      },
      {
        id: 'b',
        badge: 'www.garten-saatgut-versand.de',
        title: 'BioGarten: Samen und Blumenzwiebeln online bestellen',
        text: 'Große Auswahl an Pflanzensamen, Gemüsesaatgut und Zwiebeln für Ihren Garten. Postversand per Paket innerhalb von 3 bis 5 Werktagen. Keine frischen Schnittblumensträuße.',
        details: 'Lieferzeit: 3–5 Werktage • Nur Samen • Keine frischen Blumen'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'BlumenExpress: Frische Blumenlieferung am gleichen Tag ... liefert unser Kurier bunte Sträuße noch heute direkt an die Haustür',
    explanation_ru: 'Вам нужны: 1) букет свежих цветов (frischer Blumenstrauß), 2) доставка сегодня в день заказа (Lieferung noch am selben Tag). Вариант «b» высылает по почте семена за 3-5 дней и не продаёт букеты. Вариант «a» доставляет свежие букеты курьером в тот же день при заказе до 14:00. Правильный ответ: a.',
    explanation_en: 'You need a fresh bouquet of flowers delivered today for a birthday. Option a guarantees same-day courier delivery of fresh flower bouquets for orders placed before 14:00, whereas option b sells plant seeds by mail and does not offer fresh bouquets.',
    explanation_de: 'Gesucht wird eine Blumenstrauß-Lieferung am selben Tag. Anzeige a liefert noch am gleichen Tag aus.',
    vocabulary_notes: [
      { word: 'der Blumenstrauß', translation: 'букет цветов', translation_en: 'flower bouquet' },
      { word: 'am selben Tag / am gleichen Tag', translation: 'в тот же день', translation_en: 'on the same day' },
      { word: 'der Kurier / Bote', translation: 'курьер', translation_en: 'courier / messenger' }
    ]
  },
  {
    id: 'm8-q9',
    exam_id: 'modellsatz-8',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten sanftes Yoga lernen und suchen ein Studio, das Kurse für Anfänger am Vormittag anbietet.',
    options_json: [
      {
        id: 'a',
        badge: 'www.power-crossfit-night.de',
        title: 'Extreme Crossfit & Power Yoga Night',
        text: 'Harte Workouts für Hochleistungssportler. Intensives Ashtanga-Yoga ausschließlich spät abends ab 21:30 Uhr. Keine Anfängerkurse, nur für Personen mit langjähriger Praxis.',
        details: 'Zeiten: Nur spät abends ab 21:30 Uhr • Nur Profis, keine Anfänger'
      },
      {
        id: 'b',
        badge: 'www.yoga-sanft-morgen.de',
        title: 'YogaOase: Entspannung & Hatha-Yoga für Einsteiger',
        text: 'Entspannt in den Tag starten! Unsere Hatha-Yoga-Kurse für Anfänger ohne Vorkenntnisse finden dienstags und donnerstags jeweils von 09:30 bis 11:00 Uhr vormittags statt.',
        details: 'Zeiten: Di & Do 09:30–11:00 Uhr vormittags • Für Anfänger'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Yoga-Kurse für Anfänger ohne Vorkenntnisse finden dienstags und donnerstags jeweils von 09:30 bis 11:00 Uhr vormittags statt.',
    explanation_ru: 'Критерии: 1) йога для начинающих (Yoga für Einsteiger / Anfänger), 2) в первой половине дня (am Vormittag, 09:30). Вариант «a» проводит жесткие ночные тренировки для профи с 21:30 («Keine Anfängerkurse»). Вариант «b» обучает новичков по утрам с 09:30. Правильный ответ: b.',
    explanation_en: 'You want gentle yoga classes for beginners in the morning. Option b offers beginner Hatha yoga classes on Tuesday and Thursday mornings at 09:30, whereas option a is an intense late-night crossfit and power yoga studio with no beginner classes.',
    explanation_de: 'Gesucht ist ein Anfänger-Yogakurs am Vormittag. Anzeige b bietet Kurse für Einsteiger um 09:30 Uhr an.',
    vocabulary_notes: [
      { word: 'der Vormittag', translation: 'первая половина дня', translation_en: 'morning / before noon' },
      { word: 'die Entspannung', translation: 'расслабление / отдых', translation_en: 'relaxation' },
      { word: 'ohne Vorkenntnisse', translation: 'без предварительных знаний', translation_en: 'no previous experience required' }
    ]
  },
  {
    id: 'm8-q10',
    exam_id: 'modellsatz-8',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie lernen Deutsch auf Niveau A1/A2 und suchen einen lockeren, kostenlosen Stammtisch zum Deutschsprechen am Abend.',
    options_json: [
      {
        id: 'a',
        badge: 'www.sprachen-stammtisch-berlin.de',
        title: 'Café Dialog: Kostenloser Deutsch-Sprachstammtisch',
        text: 'Einfach Deutsch sprechen und neue Leute kennenlernen! Unser offenes Sprachtreffen findet jeden Donnerstag ab 19:00 Uhr in lockerer Bar-Atmosphäre statt. Eintritt frei, keine Anmeldung.',
        details: 'Angebot: Kostenloser Stammtisch • Do ab 19:00 Uhr • Eintritt frei'
      },
      {
        id: 'b',
        badge: 'www.akademie-grammatik-pruefung.de',
        title: 'Institut für Fachsprache & Prüfungszertifikate',
        text: 'Vorbereitung auf schwere C1/C2-Hochschulprüfungen. Strenger wissenschaftlicher Einzelunterricht mit Grammatiktests. Monatlicher Beitrag: 380 €. Nicht für Anfänger geeignet.',
        details: 'Kosten: 380 € pro Monat • Nur C1/C2 Wissenschaftssprache'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Café Dialog: Kostenloser Deutsch-Sprachstammtisch ... jeden Donnerstag ab 19:00 Uhr ... Eintritt frei',
    explanation_ru: 'Вам нужны: 1) разговорный клуб / общение (Sprachstammtisch zum Deutschsprechen), 2) бесплатно (kostenlos / Eintritt frei), 3) вечером (abends ab 19:00 Uhr). Вариант «b» — академический платный курс за 380 € уровня C1/C2. Вариант «a» — бесплатный разговорный клуб по четвергам в 19:00. Правильный ответ: a.',
    explanation_en: 'You are looking for a free, casual German conversation meet-up in the evening. Option a hosts a free weekly conversation get-together every Thursday evening from 19:00, whereas option b is an expensive advanced academic exam preparation institute.',
    explanation_de: 'Gesucht ist ein kostenloser Sprachstammtisch am Abend. Anzeige a bietet ein kostenloses Sprachtreffen donnerstags ab 19:00 Uhr an.',
    vocabulary_notes: [
      { word: 'der Stammtisch / das Sprachtreffen', translation: 'регулярная встреча клуба по интересам', translation_en: 'regular meetup / language exchange' },
      { word: 'Eintritt frei / kostenlos', translation: 'вход свободный / бесплатно', translation_en: 'free admission / free of charge' },
      { word: 'Leute kennenlernen', translation: 'знакомиться с людьми', translation_en: 'to get to know people' }
    ]
  },

  // ==========================================
  // MODELLSATZ 8 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm8-q11',
    exam_id: 'modellsatz-8',
    teil: 3,
    question_number: 11,
    title: 'Schild an der automatischen PKW-Waschstraße',
    context_header: 'CleanCar Waschstraße — Einfahrthinweis',
    context_body: `Wichtige Kundenanweisung vor der Einfahrt:

1. Antenne abschrauben oder einschieben
2. Alle Fenster und das Schiebedach fest schließen
3. Scheibenwischer auf „Aus" stellen
4. Gang rausnehmen und Handbremse nicht anziehen!

Für Schäden durch Nichtbeachtung wird keine Haftung übernommen.`,
    statement: 'Autofahrer müssen vor dem Waschen die Fenster fest zumachen.',
    correct_answer: 'richtig',
    clue_quote: 'Alle Fenster und das Schiebedach fest schließen',
    explanation_ru: 'В инструкции перед въездом на автомойку написано: «Alle Fenster ... fest schließen» («плотно закрыть все окна»). Утверждение верно (Richtig).',
    explanation_en: 'The car wash safety instructions tell drivers to close all windows and the sunroof tightly before entry (\'Alle Fenster ... fest schließen\'). The statement is True.',
    explanation_de: 'Die Fenster müssen vor dem Waschen fest geschlossen werden.',
    vocabulary_notes: [
      { word: 'fest schließen / zumachen', translation: 'плотно закрыть', translation_en: 'to close tightly' },
      { word: 'die Autowaschstraße', translation: 'автомойка', translation_en: 'car wash' },
      { word: 'die Einfahrt', translation: 'въезд', translation_en: 'entrance / driveway' }
    ]
  },
  {
    id: 'm8-q12',
    exam_id: 'modellsatz-8',
    teil: 3,
    question_number: 12,
    title: 'Hinweisschild am städtischen Wertstoffhof',
    context_header: 'Stadtwerke Entsorgung — Wertstoffhof Süd',
    context_body: `Elektroschrott & Batterien:

Alte Haushaltsgeräte (wie Toaster, Föhns, Kaffeemaschinen) und Batterien gehören nicht in den normalen Restmüll!

Bitte werfen Sie Elektrokleingeräte und Akkus getrennt in den grünen Sammelcontainer Nr. 4.`,
    statement: 'Alte Elektrogeräte darf man in Container 4 abgeben.',
    correct_answer: 'richtig',
    clue_quote: 'Bitte werfen Sie Elektrokleingeräte und Akkus getrennt in den grünen Sammelcontainer Nr. 4.',
    explanation_ru: 'На табличке написано: выбрасывать бытовые приборы в обычный мусор нельзя, их нужно сдавать отдельно в контейнер № 4 («in den grünen Sammelcontainer Nr. 4»). Утверждение верно (Richtig).',
    explanation_en: 'The waste disposal notice directs small electrical appliances and batteries into green collection container number 4 (\'in den grünen Sammelcontainer Nr. 4\'). The statement is True.',
    explanation_de: 'Elektrogeräte gehören in Container 4.',
    vocabulary_notes: [
      { word: 'der Wertstoffhof / Recyclinghof', translation: 'пункт сбора вторсырья', translation_en: 'recycling center' },
      { word: 'der Elektroschrott', translation: 'электронные отходы', translation_en: 'electronic waste / e-waste' },
      { word: 'getrennt werfen', translation: 'выбрасывать раздельно', translation_en: 'to dispose of separately' }
    ]
  },
  {
    id: 'm8-q13',
    exam_id: 'modellsatz-8',
    teil: 3,
    question_number: 13,
    title: 'Aushang an der Praxistür für Physiotherapie',
    context_header: 'Physiotherapie & Massagepraxis Franke',
    context_body: `Liebe Patientinnen und Patienten,

bitte sagen Sie Ihren Termin mindestens 24 Stunden vorher telefonisch ab, wenn Sie nicht kommen können.

Wenn Sie zu spät absagen oder nicht kommen, müssen Sie die Behandlungszeit leider privat bezahlen.`,
    statement: 'Man kann einen Termin eine Stunde vorher absagen und muss nichts bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'bitte sagen Sie Ihren Termin mindestens 24 Stunden vorher telefonisch ab ... sonst müssen Sie die Behandlungszeit leider privat bezahlen.',
    explanation_ru: 'В объявлении сказано: отменять прием нужно как минимум за 24 часа. Если отменить слишком поздно, придется оплатить назначенное время. Бесплатно за 1 час отменить нельзя. Утверждение неверно (Falsch).',
    explanation_en: 'Appointments must be cancelled at least 24 hours in advance, otherwise the treatment time will be billed (\'mindestens 24 Stunden vorher telefonisch ab ... sonst ... privat bezahlen\'). The statement is False.',
    explanation_de: 'Man muss mindestens 24 Stunden vorher absagen, sonst muss man die Stunde bezahlen.',
    vocabulary_notes: [
      { word: 'den Termin absagen', translation: 'отменять запись / прием', translation_en: 'to cancel the appointment' },
      { word: 'bezahlen', translation: 'платить', translation_en: 'to pay' },
      { word: 'mindestens 24 Stunden vorher', translation: 'как минимум за 24 часа', translation_en: 'at least 24 hours in advance' }
    ]
  },
  {
    id: 'm8-q14',
    exam_id: 'modellsatz-8',
    teil: 3,
    question_number: 14,
    title: 'Hinweisschild am Hotel-Frühstücksbuffet',
    context_header: 'Hotel am Park — Frühstücksrestaurant',
    context_body: `Sehr geehrte Gäste,

unser Frühstücksbuffet ist täglich von 07:00 bis 10:30 Uhr im Speisesaal geöffnet.

Bitte beachten Sie:
Essen und Getränke sind nur für den Frühstücksraum. Sie dürfen keine Brötchen oder Obst mit auf das Zimmer nehmen oder für Ausflüge einpacken.`,
    statement: 'Hotelgäste dürfen belegte Brötchen vom Buffet für Ausflüge einpacken und mitnehmen.',
    correct_answer: 'falsch',
    clue_quote: 'Sie dürfen keine Brötchen oder Obst mit auf das Zimmer nehmen oder für Ausflüge einpacken.',
    explanation_ru: 'В правилах ресторана отеля строго указано: еда только для завтрака в зале («nur für den Frühstücksraum»), уносить с собой бутерброды и фрукты нельзя. Утверждение неверно (Falsch).',
    explanation_en: 'The hotel breakfast rules explicitly state that guests are not allowed to pack rolls or fruit for trips (\'keine Brötchen oder Obst ... für Ausflüge einpacken\'). The statement is False.',
    explanation_de: 'Das Mitnehmen von Speisen für unterwegs ist nicht erlaubt.',
    vocabulary_notes: [
      { word: 'das Frühstücksbuffet', translation: 'шведский стол на завтрак', translation_en: 'breakfast buffet' },
      { word: 'nicht mitnehmen dürfen', translation: 'запрещено уносить с собой', translation_en: 'not allowed to take away' },
      { word: 'der Ausflug (Ausflüge)', translation: 'поездка / экскурсия', translation_en: 'excursion (excursions)' }
    ]
  },
  {
    id: 'm8-q15',
    exam_id: 'modellsatz-8',
    teil: 3,
    question_number: 15,
    title: 'Hinweisschild vor der Ausfahrtschranke im Parkhaus',
    context_header: 'City-Parkhaus Markt — Ausfahrt',
    context_body: `Achtung Autofahrer!

Keine Kartenzahlung an der Schranke möglich!

Bitte bezahlen Sie Ihr Parkticket vor dem Einsteigen an den Kassenautomaten im Erdgeschoss (neben dem Kundencenter).

Die Schranke öffnet sich nur mit einem bereits bezahlten Ticket.`,
    statement: 'Man muss das Parkticket vor dem Ausfahren am Kassenautomaten bezahlen.',
    correct_answer: 'richtig',
    clue_quote: 'Bitte bezahlen Sie Ihr Parkticket vor dem Einsteigen an den Kassenautomaten im Erdgeschoss ... Die Schranke öffnet sich nur mit einem bereits bezahlten Ticket.',
    explanation_ru: 'На табло написано: на самой выездной стойке оплата невозможна, билет нужно оплатить в автомате до посадки в машину («an den Kassenautomaten bezahlen»), иначе шлагбаум не откроется. Утверждение верно (Richtig).',
    explanation_en: 'The sign instructs drivers to pay at the pay machine before getting into the car, as the exit barrier opens only with a prepaid ticket (\'bezahlen Sie Ihr Parkticket vor dem Einsteigen an den Kassenautomaten\'). The statement is True.',
    explanation_de: 'Das Ticket muss vorher am Kassenautomaten bezahlt werden.',
    vocabulary_notes: [
      { word: 'die Schranke', translation: 'выездной шлагбаум', translation_en: 'boom barrier / barrier gate' },
      { word: 'der Kassenautomat', translation: 'парковочный автомат оплаты', translation_en: 'pay station / parking ticket machine' },
      { word: 'bezahlen', translation: 'оплачивать', translation_en: 'to pay' }
    ]
  }
];
