export const exam = {
  id: 'modellsatz-3',
  title: 'telc Deutsch A1 — Modellsatz 3',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Третий официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Аутентичные темы: переезд и новоселье, фитнес-клуб, поиск жилья и городские объявления.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 3 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: E-Mail von Stefan an Michael (Aufgaben 1-2)
  {
    id: 'm3-q1',
    exam_id: 'modellsatz-3',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Stefan an Michael',
    context_header: 'Von: Stefan Wagner <stefan.wagner@webmail.de>\nAn: Michael Klein <m.klein@berlin-online.de>\nDatum: 12. Mai, 17:40 Uhr\nBetreff: Meine neue Wohnung und Einweihungsparty',
    context_body: `Lieber Michael,

endlich habe ich den Umzug geschafft! Meine neue Wohnung liegt sehr zentral in der Schillerstraße 15, direkt an der U-Bahn-Station.

Am Freitagabend möchte ich eine kleine Küchenparty feiern und für ein paar Freunde kochen. Es gibt leckere Lasagne und Salat. Du musst nichts zu essen mitbringen. Aber bring bitte ein paar Flaschen Orangensaft oder Cola mit, denn ich habe keine alkoholfreien Getränke mehr.

Wir fangen um 19:30 Uhr an. Hast du Zeit? Bitte antworte mir bis Mittwochabend.

Viele Grüße
Stefan`,
    statement: 'Michael soll alkoholfreie Getränke mitbringen.',
    correct_answer: 'richtig',
    clue_quote: 'bring bitte ein paar Flaschen Orangensaft oder Cola mit, denn ich habe keine alkoholfreien Getränke mehr.',
    explanation_ru: 'Штефан прямо просит: «bring bitte ein paar Flaschen Orangensaft oder Cola mit, denn ich habe keine alkoholfreien Getränke mehr» («принеси, пожалуйста, пару бутылок апельсинового сока или колы, потому что у меня больше нет безалкогольных напитков»). Сок и кола — это и есть безалкогольные напитки. Утверждение верно (Richtig).',
    explanation_en: 'Stefan explicitly asks Michael to bring orange juice or cola because he has no non-alcoholic drinks left ("keine alkoholfreien Getränke mehr"). The statement is True.',
    explanation_de: 'Stefan bittet Michael, Saft oder Cola mitzubringen, da er keine alkoholfreien Getränke mehr hat.',
    vocabulary_notes: [
      { word: 'alkoholfreie Getränke', translation: 'безалкогольные напитки', translation_en: 'non-alcoholic drinks' },
      { word: 'der Umzug', translation: 'переезд', translation_en: 'moving / relocation' },
      { word: 'mitbringen', translation: 'приносить с собой', translation_en: 'to bring along' }
    ]
  },
  {
    id: 'm3-q2',
    exam_id: 'modellsatz-3',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Stefan an Michael',
    context_header: 'Von: Stefan Wagner <stefan.wagner@webmail.de>\nAn: Michael Klein <m.klein@berlin-online.de>\nDatum: 12. Mai, 17:40 Uhr\nBetreff: Meine neue Wohnung und Einweihungsparty',
    context_body: `Lieber Michael,

endlich habe ich den Umzug geschafft! Meine neue Wohnung liegt sehr zentral in der Schillerstraße 15, direkt an der U-Bahn-Station.

Am Freitagabend möchte ich eine kleine Küchenparty feiern und für ein paar Freunde kochen. Es gibt leckere Lasagne und Salat. Du musst nichts zu essen mitbringen. Aber bring bitte ein paar Flaschen Orangensaft oder Cola mit, denn ich habe keine alkoholfreien Getränke mehr.

Wir fangen um 19:30 Uhr an. Hast du Zeit? Bitte antworte mir bis Mittwochabend.

Viele Grüße
Stefan`,
    statement: 'Die Party findet am Mittwochabend statt.',
    correct_answer: 'falsch',
    clue_quote: 'Am Freitagabend möchte ich eine kleine Küchenparty feiern ... Bitte antworte mir bis Mittwochabend.',
    explanation_ru: 'Штефан устраивает вечеринку в пятницу вечером («Am Freitagabend möchte ich eine kleine Küchenparty feiern»). Среда — это лишь крайний срок, до которого нужно дать ответ («Bitte antworte mir bis Mittwochabend»). Утверждение неверно (Falsch).',
    explanation_en: 'The party takes place on Friday evening ("Am Freitagabend"), while Wednesday evening is merely the deadline to RSVP. The statement is False.',
    explanation_de: 'Die Feier ist am Freitagabend. Am Mittwoch soll Michael nur Bescheid sagen.',
    vocabulary_notes: [
      { word: 'am Freitagabend', translation: 'в пятницу вечером', translation_en: 'on Friday evening' },
      { word: 'stattfinden', translation: 'проходить / иметь место', translation_en: 'to take place' },
      { word: 'antworten bis...', translation: 'ответить до...', translation_en: 'reply by / reply before...' }
    ]
  },

  // Text 2: Information Fitnessstudio „Fit & Aktiv" (Aufgaben 3-5)
  {
    id: 'm3-q3',
    exam_id: 'modellsatz-3',
    teil: 1,
    question_number: 3,
    title: 'Information des Fitnessstudios „Fit & Aktiv"',
    context_header: 'Fitnessstudio Fit & Aktiv Köln — Wichtige Mitgliederinformation',
    context_body: `Liebe Mitglieder und Gäste,

ab dem 1. Juni ändern sich unsere Öffnungszeiten für den Sommer:
Montag bis Freitag: 06:30 – 22:00 Uhr
Samstag und Sonntag: 08:00 – 20:00 Uhr

Hinweise zu unseren Kursen:
Unsere Yoga- und Rückenkurse sind für alle Mitglieder kostenlos. Sie müssen sich aber mindestens 24 Stunden vorher online auf unserer Website anmelden, da die Teilnehmerzahl auf 15 Personen begrenzt ist.

Wichtig für Ihren Trainingsbesuch:
Bitte bringen Sie immer saubere Hallenturnschuhe und ein eigenes Handtuch mit. Das Trainieren ohne Handtuch ist im Gerätebereich nicht erlaubt.

Wir freuen uns auf Sie!
Ihr Fit & Aktiv-Team`,
    statement: 'Am Wochenende öffnet das Fitnessstudio schon um 06:30 Uhr.',
    correct_answer: 'falsch',
    clue_quote: 'Montag bis Freitag: 06:30 – 22:00 Uhr / Samstag und Sonntag: 08:00 – 20:00 Uhr',
    explanation_ru: 'В расписании указано: с понедельника по пятницу клуб открывается в 06:30, а в субботу и воскресенье (am Wochenende) — только в 08:00 («Samstag und Sonntag: 08:00 – 20:00 Uhr»). Утверждение неверно (Falsch).',
    explanation_en: 'The fitness studio opens at 06:30 on weekdays, but on weekends ("Samstag und Sonntag") it only opens at 08:00. The statement is False.',
    explanation_de: 'Am Wochenende öffnet das Studio erst um 08:00 Uhr, nicht um 06:30 Uhr.',
    vocabulary_notes: [
      { word: 'das Wochenende', translation: 'выходные (суббота и воскресенье)', translation_en: 'weekend' },
      { word: 'die Öffnungszeiten', translation: 'часы работы', translation_en: 'opening hours' },
      { word: 'öffnen', translation: 'открываться', translation_en: 'to open' }
    ]
  },
  {
    id: 'm3-q4',
    exam_id: 'modellsatz-3',
    teil: 1,
    question_number: 4,
    title: 'Information des Fitnessstudios „Fit & Aktiv"',
    context_header: 'Fitnessstudio Fit & Aktiv Köln — Wichtige Mitgliederinformation',
    context_body: `Liebe Mitglieder und Gäste,

ab dem 1. Juni ändern sich unsere Öffnungszeiten für den Sommer:
Montag bis Freitag: 06:30 – 22:00 Uhr
Samstag und Sonntag: 08:00 – 20:00 Uhr

Hinweise zu unseren Kursen:
Unsere Yoga- und Rückenkurse sind für alle Mitglieder kostenlos. Sie müssen sich aber mindestens 24 Stunden vorher online auf unserer Website anmelden, da die Teilnehmerzahl auf 15 Personen begrenzt ist.

Wichtig für Ihren Trainingsbesuch:
Bitte bringen Sie immer saubere Hallenturnschuhe und ein eigenes Handtuch mit. Das Trainieren ohne Handtuch ist im Gerätebereich nicht erlaubt.

Wir freuen uns auf Sie!
Ihr Fit & Aktiv-Team`,
    statement: 'Mitglieder müssen für die Yoga-Kurse extra bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'Unsere Yoga- und Rückenkurse sind für alle Mitglieder kostenlos.',
    explanation_ru: 'В тексте сказано: «Unsere Yoga- und Rückenkurse sind für alle Mitglieder kostenlos» («Наши курсы йоги и спины бесплатны для всех членов клуба»). Слово «kostenlos» означает «бесплатно», поэтому платить дополнительно не требуется. Утверждение неверно (Falsch).',
    explanation_en: 'Yoga and back training courses are free for all members ("für alle Mitglieder kostenlos"), so no additional payment is required. The statement is False.',
    explanation_de: 'Die Kurse sind kostenlos für Mitglieder („für alle Mitglieder kostenlos").',
    vocabulary_notes: [
      { word: 'kostenlos', translation: 'бесплатно', translation_en: 'free of charge' },
      { word: 'extra bezahlen', translation: 'доплачивать дополнительно', translation_en: 'to pay extra' },
      { word: 'das Mitglied (-er)', translation: 'член клуба / участник', translation_en: 'member(s)' }
    ]
  },
  {
    id: 'm3-q5',
    exam_id: 'modellsatz-3',
    teil: 1,
    question_number: 5,
    title: 'Information des Fitnessstudios „Fit & Aktiv"',
    context_header: 'Fitnessstudio Fit & Aktiv Köln — Wichtige Mitgliederinformation',
    context_body: `Liebe Mitglieder und Gäste,

ab dem 1. Juni ändern sich unsere Öffnungszeiten für den Sommer:
Montag bis Freitag: 06:30 – 22:00 Uhr
Samstag und Sonntag: 08:00 – 20:00 Uhr

Hinweise zu unseren Kursen:
Unsere Yoga- und Rückenkurse sind für alle Mitglieder kostenlos. Sie müssen sich aber mindestens 24 Stunden vorher online auf unserer Website anmelden, da die Teilnehmerzahl auf 15 Personen begrenzt ist.

Wichtig für Ihren Trainingsbesuch:
Bitte bringen Sie immer saubere Hallenturnschuhe und ein eigenes Handtuch mit. Das Trainieren ohne Handtuch ist im Gerätebereich nicht erlaubt.

Wir freuen uns auf Sie!
Ihr Fit & Aktiv-Team`,
    statement: 'Man darf im Gerätebereich nicht ohne Handtuch trainieren.',
    correct_answer: 'richtig',
    clue_quote: 'Das Trainieren ohne Handtuch ist im Gerätebereich nicht erlaubt.',
    explanation_ru: 'В правилах написано: «Das Trainieren ohne Handtuch ist im Gerätebereich nicht erlaubt» («Тренироваться без полотенца в тренажерной зоне не разрешено»). Это означает, что без полотенца заниматься нельзя. Утверждение верно (Richtig).',
    explanation_en: 'Training without a towel in the equipment area is not permitted ("nicht erlaubt"). The statement is True.',
    explanation_de: 'Ohne Handtuch darf man nicht trainieren („nicht erlaubt").',
    vocabulary_notes: [
      { word: 'nicht erlaubt / verboten', translation: 'не разрешено / запрещено', translation_en: 'not allowed / forbidden' },
      { word: 'das Handtuch', translation: 'полотенце', translation_en: 'towel' },
      { word: 'der Gerätebereich', translation: 'зона тренажеров', translation_en: 'gym equipment area' }
    ]
  },

  // ==========================================
  // MODELLSATZ 3 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm3-q6',
    exam_id: 'modellsatz-3',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie studieren in Frankfurt und suchen ein bezahlbares Zimmer in einer Wohngemeinschaft (WG).',
    options_json: [
      {
        id: 'a',
        badge: 'www.luxus-business-apartments-ffm.de',
        title: 'Exklusive 3-Zimmer-Penthouse-Wohnungen im Bankenviertel',
        text: 'Hochwertige Neubauwohnungen für Geschäftsleute und Führungskräfte. Kaltmiete ab 2.400 € pro Monat. Mindestmietdauer 2 Jahre. Keine Vermietung an Studenten oder WGs.',
        details: 'Zielgruppe: Geschäftsleute • Miete ab 2.400 € • Keine WGs'
      },
      {
        id: 'b',
        badge: 'www.wg-gesucht-frankfurt-campus.de',
        title: 'WG-Zimmerbörse Frankfurt: Günstige Zimmer für Studierende',
        text: 'Finde dein neues Zuhause in Uni-Nähe! Helle Zimmer in netten 2er- und 3er-WGs ab 350 € warm. Küche, Bad und WLAN werden geteilt. Sofort bezugsfrei von privat.',
        details: 'Zielgruppe: Studenten • Zimmer in WGs ab 350 € • Uni-Nähe'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'WG-Zimmerbörse Frankfurt: Günstige Zimmer für Studierende ... Helle Zimmer in netten 2er- und 3er-WGs ab 350 €',
    explanation_ru: 'Вам нужно: 1) комната в коммуналке/WG (Zimmer in einer Wohngemeinschaft), 2) для студента (studieren in Frankfurt), 3) доступная по цене (bezahlbar). Сайт «a» сдает дорогие элитные квартиры от 2400 € и прямо запрещает сдачу студентам и коммуналкам («Keine Vermietung an Studenten oder WGs»). Сайт «b» предлагает студенческие комнаты в WG от 350 €. Правильный ответ: b.',
    explanation_en: 'Option b offers affordable rooms in shared flats for students starting at 350 €, whereas option a rents luxury apartments and explicitly forbids students and flat shares.',
    explanation_de: 'Gesucht wird ein WG-Zimmer für Studenten. Anzeige a verbietet WGs und Studenten. Anzeige b bietet günstige WG-Zimmer.',
    vocabulary_notes: [
      { word: 'die Wohngemeinschaft (WG)', translation: 'совместная аренда квартиры несколькими людьми', translation_en: 'shared apartment / flatshare (WG)' },
      { word: 'bezahlbar / günstig', translation: 'доступный по цене / недорогой', translation_en: 'affordable / inexpensive' },
      { word: 'die Miete', translation: 'арендная плата', translation_en: 'rent' }
    ]
  },
  {
    id: 'm3-q7',
    exam_id: 'modellsatz-3',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie möchten am Samstagnachmittag einen gemütlichen Ausflug mit dem Schiff auf dem Rhein machen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.kd-rheinschifffahrt.de',
        title: 'Köln-Düsseldorfer Rheinschifffahrt: Panoramafahrten',
        text: 'Erleben Sie das Rheintal vom Wasser aus! Romantische 2-stündige Rundfahrten jeden Samstag und Sonntag um 14:00 und 16:30 Uhr. Bordrestaurant mit Kaffee und Kuchen. Tickets online buchbar.',
        details: 'Angebot: Schiffsausflug auf dem Rhein • Sa & So 14:00 und 16:30'
      },
      {
        id: 'b',
        badge: 'www.kanu-wildwasser-verleih.de',
        title: 'Kanusport & Wildwasser-Rafting auf der Ruhr',
        text: 'Sportliche Abenteuer für Profis! Sportkanu- und Kajakverleih für anstrengende Tagestouren. Nur für geübte Schwimmer mit eigener Schutzausrüstung. Keine gemütlichen Ausflugsschiffe.',
        details: 'Angebot: Sport-Kanu & Wildwasser • Keine Rundfahrtschiffe'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Romantische 2-stündige Rundfahrten jeden Samstag und Sonntag um 14:00 und 16:30 Uhr.',
    explanation_ru: 'Вам нужна: 1) прогулка на теплоходе (Ausflug mit dem Schiff), 2) на Рейне (auf dem Rhein), 3) в субботу днём (am Samstagnachmittag). Вариант «b» — это экстремальный сплав на байдарках по другой реке (Kanu/Kajak auf der Ruhr). Вариант «a» — обзорные прогулки на корабле по Рейну в субботу в 14:00 и 16:30. Правильный ответ: a.',
    explanation_en: 'Option a offers relaxing 2-hour sightseeing boat tours on the Rhine on Saturday afternoon at 14:00 and 16:30, whereas option b is strenuous whitewater rafting and kayaking on the Ruhr.',
    explanation_de: 'Gesucht ist eine Schifffahrt auf dem Rhein am Samstagnachmittag. Anzeige a bietet Panorama-Rundfahrten mit dem Schiff an.',
    vocabulary_notes: [
      { word: 'das Schiff (-e)', translation: 'корабль / теплоход', translation_en: 'ship / boat' },
      { word: 'die Rundfahrt', translation: 'круговая экскурсия / тур', translation_en: 'round trip / sightseeing boat tour' },
      { word: 'der Ausflug', translation: 'загородная прогулка / экскурсия', translation_en: 'excursion / outing' }
    ]
  },
  {
    id: 'm3-q8',
    exam_id: 'modellsatz-3',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie arbeiten tagsüber bis 18:00 Uhr und suchen einen Deutsch-Sprachkurs am Abend in München.',
    options_json: [
      {
        id: 'a',
        badge: 'www.deutsch-intensiv-vormittag.de',
        title: 'Münchner Sprachkolleg: Intensivkurs Deutsch A1–B1',
        text: 'Schnell Deutsch lernen im Vormittagskurs! Montag bis Freitag täglich von 09:00 bis 13:00 Uhr. Kleine Gruppen, motivierte Lehrkräfte. Keine Abendkurse im Programm.',
        details: 'Zeiten: Täglich 09:00–13:00 Uhr vormittags • Keine Abendkurse'
      },
      {
        id: 'b',
        badge: 'www.vhs-muenchen-abendkurse.de',
        title: 'Münchner Volkshochschule: Deutsch für den Beruf am Abend',
        text: 'Lernen nach der Arbeit! Abendkurse Deutsch A1 und A2 für Berufstätige. Unterricht zweimal pro Woche: montags und mittwochs von 18:45 bis 20:45 Uhr im Stadtzentrum.',
        details: 'Zeiten: Mo & Mi 18:45–20:45 Uhr abends • Für Berufstätige'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Abendkurse Deutsch ... für Berufstätige. Unterricht zweimal pro Woche: montags und mittwochs von 18:45 bis 20:45 Uhr',
    explanation_ru: 'Вы работаете днем до 18:00, поэтому вам нужен вечерний курс (am Abend / nach 18:00 Uhr). Вариант «a» — это утренний курс с 09:00 до 13:00 («Vormittagskurs, keine Abendkurse»). Вариант «b» — вечерние занятия в 18:45 («montags und mittwochs von 18:45 bis 20:45 Uhr»). Правильный ответ: b.',
    explanation_en: 'Option b offers evening German classes for working professionals twice a week starting at 18:45, whereas option a is a morning course with no evening classes.',
    explanation_de: 'Gesucht ist ein Deutschkurs am Abend. Anzeige b bietet Abendkurse von 18:45 bis 20:45 Uhr an.',
    vocabulary_notes: [
      { word: 'am Abend / abends', translation: 'вечером', translation_en: 'in the evening' },
      { word: 'nach der Arbeit', translation: 'после работы', translation_en: 'after work' },
      { word: 'der Vormittag', translation: 'первая половина дня', translation_en: 'morning / before noon' }
    ]
  },
  {
    id: 'm3-q9',
    exam_id: 'modellsatz-3',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie haben montags frei und suchen einen Friseur, zu dem man spontan ohne vorherigen Termin gehen kann.',
    options_json: [
      {
        id: 'a',
        badge: 'www.city-cut-walkin.de',
        title: 'CityCut Express: Ihr Friseursalon ohne Termin',
        text: 'Einfach vorbeikommen und drankommen! Damen-, Herren- und Kinderschnitte ohne Wartezeit. Geöffnet von Montag bis Samstag durchgehend von 09:00 bis 19:00 Uhr.',
        details: 'Service: Ohne Termin • Geöffnet: Montag bis Samstag ab 9 Uhr'
      },
      {
        id: 'b',
        badge: 'www.haardesign-exklusiv.de',
        title: 'HaarDesign Exklusiv — Stylist für besondere Anlässe',
        text: 'Individuelle Beratung und Styling. Achtung: Bedienung ausschließlich nach vorheriger telefonischer Terminvereinbarung! Montags Ruhetag (geschlossen).',
        details: 'Service: Nur mit Termin • Montags Ruhetag (geschlossen)'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'CityCut Express: Ihr Friseursalon ohne Termin ... Geöffnet von Montag bis Samstag durchgehend',
    explanation_ru: 'Вам нужно: 1) в понедельник (montags), 2) без записи (ohne vorherigen Termin). Сайт «b» закрыт по понедельникам («Montags Ruhetag») и работает только по предварительной записи («ausschließlich nach Terminvereinbarung»). Сайт «a» открыт с понедельника по субботу и принимает без записи («ohne Termin»). Правильный ответ: a.',
    explanation_en: 'Option a is open on Mondays and welcomes walk-in customers without an appointment, whereas option b is closed on Mondays and requires advance telephone booking.',
    explanation_de: 'Gesucht wird ein Friseur, der montags ohne Termin geöffnet hat. Anzeige a erfüllt beide Kriterien.',
    vocabulary_notes: [
      { word: 'ohne Termin', translation: 'без записи', translation_en: 'without appointment' },
      { word: 'der Ruhetag', translation: 'выходной день заведения', translation_en: 'rest day / day off (closed)' },
      { word: 'vorbeikommen', translation: 'зайти / подойти', translation_en: 'to drop by / come over' }
    ]
  },
  {
    id: 'm3-q10',
    exam_id: 'modellsatz-3',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie möchten frisches Obst, Gemüse und Eier direkt vom Bauern auf einem Wochenmarkt unter freiem Himmel kaufen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.metro-grossmarkt-food.de',
        title: 'METRO Großmarkt: Alles für Gastronomie und Betriebe',
        text: 'Großpackungen und Tiefkühlkost in unserer riesigen Halle im Gewerbegebiet. Einkauf nur mit gewerblichem Metro-Kundenpass möglich. Kein Verkauf an private Endverbraucher.',
        details: 'Angebot: Großhandel & Tiefkühlung • Nur mit Gewerbeschein'
      },
      {
        id: 'b',
        badge: 'www.wochenmarkt-regional-frisch.de',
        title: 'Traditioneller Wochenmarkt am Marktplatz',
        text: 'Frische Lebensmittel aus der Region! Regionale Bauernhöfe verkaufen knackige Äpfel, frisches Bio-Gemüse, Eier und Käse an Marktständen im Freien. Jeden Dienstag und Freitag von 07:30 bis 13:00 Uhr.',
        details: 'Angebot: Frisches Obst & Gemüse vom Bauern • Markt im Freien'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Frische Lebensmittel aus der Region! Regionale Bauernhöfe verkaufen knackige Äpfel, frisches Bio-Gemüse, Eier und Käse an Marktständen im Freien.',
    explanation_ru: 'Вам нужен: 1) еженедельный рынок под открытым небом (Wochenmarkt im Freien), 2) свежие овощи, фрукты и яйца от фермеров (vom Bauern). Сайт «a» — это оптовый гипермаркет только для юридических лиц («nur mit gewerblichem Kundenpass»). Сайт «b» — традиционный уличный рынок с фермерскими продуктами. Правильный ответ: b.',
    explanation_en: 'Option b is an outdoor weekly market where regional farmers sell fresh produce, eggs, and cheese, whereas option a is a wholesale warehouse restricted to commercial businesses.',
    explanation_de: 'Gesucht wird ein Wochenmarkt mit frischen Lebensmitteln vom Bauern. Anzeige b passt genau.',
    vocabulary_notes: [
      { word: 'der Wochenmarkt', translation: 'еженедельный рынок', translation_en: 'weekly farmers market' },
      { word: 'der Bauernhof', translation: 'ферма / крестьянское хозяйство', translation_en: 'farm' },
      { word: 'unter freiem Himmel / im Freien', translation: 'под открытым небом', translation_en: 'outdoors / in the open air' }
    ]
  },

  // ==========================================
  // MODELLSATZ 3 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm3-q11',
    exam_id: 'modellsatz-3',
    teil: 3,
    question_number: 11,
    title: 'Schild an der Tür einer Stadtteilbibliothek',
    context_header: 'Stadtbibliothek Westend',
    context_body: `Liebe Besucherinnen und Besucher,

Bücherrückgabe während der Ferien:
Vom 1. bis 20. Juli ist die Ausleihe im Gebäude wegen Umbauarbeiten geschlossen.

Bücher und DVDs können Sie jedoch rund um die Uhr in die Rückgabebox am Haupteingang einwerfen.

Wir öffnen wieder am 21. Juli ab 10:00 Uhr.`,
    statement: 'Man kann Bücher auch abgeben, wenn die Bibliothek geschlossen ist.',
    correct_answer: 'richtig',
    clue_quote: 'Bücher und DVDs können Sie jedoch rund um die Uhr in die Rückgabebox am Haupteingang einwerfen.',
    explanation_ru: 'Хотя само здание закрыто на ремонт, в объявлении подчеркивается: книги и DVD можно круглосуточно сдать через специальный ящик у главного входа («rund um die Uhr in die Rückgabebox einwerfen»). Утверждение верно (Richtig).',
    explanation_en: 'Books and DVDs can be returned 24/7 using the return box at the main entrance ("rund um die Uhr in die Rückgabebox einwerfen"), even when the library is closed. The statement is True.',
    explanation_de: 'Die Rückgabebox am Eingang ist rund um die Uhr geöffnet.',
    vocabulary_notes: [
      { word: 'die Rückgabebox', translation: 'ящик для возврата', translation_en: 'return drop box' },
      { word: 'rund um die Uhr', translation: 'круглосуточно', translation_en: 'around the clock / 24/7' },
      { word: 'einwerfen', translation: 'бросать / опускать (в ящик)', translation_en: 'to drop in / insert' }
    ]
  },
  {
    id: 'm3-q12',
    exam_id: 'modellsatz-3',
    teil: 3,
    question_number: 12,
    title: 'Aushang an der Bushaltestelle Goetheplatz',
    context_header: 'Stadtwerke Busverkehr — Fahrplanänderung',
    context_body: `Achtung Fahrgäste der Linie 12!

Wegen Straßenbauarbeiten wird die Haltestelle „Goetheplatz" am Samstag und Sonntag (14. und 15. September) nicht angefahren.

Die Ersatzhaltestelle befindet sich 200 Meter entfernt in der Bismarckstraße vor der Post.

Ab Montagmorgen fahren alle Busse wieder die normale Route.`,
    statement: 'Der Bus der Linie 12 hält am Sonntag ganz normal am Goetheplatz.',
    correct_answer: 'falsch',
    clue_quote: 'wird die Haltestelle „Goetheplatz" am Samstag und Sonntag ... nicht angefahren.',
    explanation_ru: 'На объявлении сказано: в субботу и воскресенье остановка «Гётеплац» обслуживаться не будет («wird am Samstag und Sonntag nicht angefahren»). Вместо этого нужно идти на временную остановку в 200 метрах. Утверждение «автобус останавливается как обычно» неверно (Falsch).',
    explanation_en: 'Bus line 12 does not stop at Goetheplatz on Saturday and Sunday ("wird am Samstag und Sonntag nicht angefahren"), so passengers must use an alternative stop. The statement is False.',
    explanation_de: 'Am Sonntag hält der Bus dort nicht („wird nicht angefahren").',
    vocabulary_notes: [
      { word: 'nicht angefahren', translation: 'не обслуживается / автобус не заезжает', translation_en: 'not served / bypassed' },
      { word: 'die Ersatzhaltestelle', translation: 'временная заменяющая остановка', translation_en: 'temporary replacement stop' },
      { word: 'die Straßenbauarbeiten', translation: 'дорожные работы', translation_en: 'road construction works' }
    ]
  },
  {
    id: 'm3-q13',
    exam_id: 'modellsatz-3',
    teil: 3,
    question_number: 13,
    title: 'Schild an der Kasse einer Traditionsbäckerei',
    context_header: 'Bäckerei Hoffmann — Zahlungshinweis',
    context_body: `Sehr geehrte Kundschaft,

bitte halten Sie nach Möglichkeit passendes Bargeld bereit.

Aus technischen Gründen können wir an dieser Kasse keine Kredit- oder EC-Karten annehmen.

Zahlung ist nur in bar möglich. Ein Geldautomat befindet sich bei der Sparkasse gegenüber.`,
    statement: 'Man kann die Brötchen an dieser Kasse mit der EC-Karte bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'können wir an dieser Kasse keine Kredit- oder EC-Karten annehmen. Zahlung ist nur in bar möglich.',
    explanation_ru: 'На табличке возле кассы написано: карты не принимаются («keine Kredit- oder EC-Karten annehmen»), оплата возможна только наличными («Zahlung ist nur in bar möglich»). Утверждение неверно (Falsch).',
    explanation_en: 'This checkout counter cannot accept EC or credit cards, and payment is only possible in cash ("Zahlung ist nur in bar möglich"). The statement is False.',
    explanation_de: 'Kartenzahlung ist nicht möglich, nur Barzahlung („nur in bar").',
    vocabulary_notes: [
      { word: 'nur in bar', translation: 'только наличными', translation_en: 'in cash only' },
      { word: 'annehmen', translation: 'принимать', translation_en: 'to accept' },
      { word: 'der Geldautomat', translation: 'банкомат', translation_en: 'ATM / cash machine' }
    ]
  },
  {
    id: 'm3-q14',
    exam_id: 'modellsatz-3',
    teil: 3,
    question_number: 14,
    title: 'Hinweisschild am Aufzug eines Kaufhauses',
    context_header: 'Warenhaus Karstadt — Kundeninformation',
    context_body: `Aufzug vorübergehend außer Betrieb!

Sehr geehrte Kundinnen und Kunden,
wegen Wartungsarbeiten funktioniert dieser Aufzug heute leider nicht.

Zur Kinderabteilung und zum Restaurant im 3. OG gelangen Sie über die Rolltreppen im Zentrum der Halle oder über das Treppenhaus A.

Vielen Dank für Ihre Geduld!`,
    statement: 'Der Aufzug kann heute wegen Wartungsarbeiten nicht benutzt werden.',
    correct_answer: 'richtig',
    clue_quote: 'wegen Wartungsarbeiten funktioniert dieser Aufzug heute leider nicht.',
    explanation_ru: 'Надпись «außer Betrieb» и текст «funktioniert dieser Aufzug heute leider nicht» подтверждают, что лифт сегодня не работает из-за сервисных работ. Утверждение верно (Richtig).',
    explanation_en: 'The notice states that the elevator does not work today due to maintenance work ("wegen Wartungsarbeiten funktioniert dieser Aufzug heute leider nicht"). The statement is True.',
    explanation_de: 'Der Aufzug ist außer Betrieb und funktioniert heute nicht.',
    vocabulary_notes: [
      { word: 'außer Betrieb', translation: 'не работает / выведен из эксплуатации', translation_en: 'out of order / out of service' },
      { word: 'die Wartungsarbeiten', translation: 'техобслуживание', translation_en: 'maintenance work' },
      { word: 'die Rolltreppe', translation: 'эскалатор', translation_en: 'escalator' }
    ]
  },
  {
    id: 'm3-q15',
    exam_id: 'modellsatz-3',
    teil: 3,
    question_number: 15,
    title: 'Hinweisschild an der Tür zum Kinosaal',
    context_header: 'Cinestar Kino — Hausordnung Saaleinlass',
    context_body: `Herzlich willkommen im Kinosaal 4!

Wir bitten Sie um Beachtung folgender Regeln:
- Bitte schalten Sie Ihre Mobiltelefone vor Beginn des Films stumm.
- Das Mitbringen von eigenen Speisen und Getränken (wie Pizza, Döner oder Dosenbier) ist nicht erlaubt.
- Frische Snacks und Popcorn erhalten Sie an unserer Kinosnack-Bar im Foyer.`,
    statement: 'Zuschauer dürfen eigene Pizza und Getränke in den Kinosaal mitnehmen.',
    correct_answer: 'falsch',
    clue_quote: 'Das Mitbringen von eigenen Speisen und Getränken (wie Pizza, Döner oder Dosenbier) ist nicht erlaubt.',
    explanation_ru: 'В правилах кинозала четко написано: «Das Mitbringen von eigenen Speisen und Getränken ... ist nicht erlaubt» («Проносить свои блюда и напитки не разрешено»). Утверждение, что зрителям разрешено брать пиццу, неверно (Falsch).',
    explanation_en: 'Bringing outside food and drinks into the cinema hall is strictly not allowed ("ist nicht erlaubt"). The statement is False.',
    explanation_de: 'Eigene Speisen mitzubringen ist verboten („nicht erlaubt").',
    vocabulary_notes: [
      { word: 'das Mitbringen', translation: 'принос с собой', translation_en: 'bringing along (food/drinks)' },
      { word: 'nicht erlaubt / verboten', translation: 'не разрешено / запрещено', translation_en: 'not allowed / forbidden' },
      { word: 'stumm schalten', translation: 'ставить на беззвучный режим', translation_en: 'to mute / switch to silent' }
    ]
  }
];
