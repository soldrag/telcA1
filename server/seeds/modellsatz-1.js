export const exam = {
  id: 'modellsatz-1',
  title: 'telc Deutsch A1 — Modellsatz 1',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Полная эмуляция официального экзамена telc Deutsch A1 / Start Deutsch 1. 15 заданий, лимит времени 25 минут, проходной балл 9 из 15 (60%).',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 1 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: Email from Sarah to Anna (Aufgaben 1-2)
  {
    id: 'm1-q1',
    exam_id: 'modellsatz-1',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Sarah an Anna',
    context_header: 'Von: Sarah Müller <sarah.m@webmail.de>\nAn: Anna Schmidt <anna.schmidt@berlin-mail.de>\nDatum: 14. Oktober, 18:30 Uhr\nBetreff: Meine Geburtstagsparty am Samstag',
    context_body: `Liebe Anna,

wie geht es dir? Ich hoffe, alles ist gut.
Am kommenden Samstag habe ich Geburtstag und möchte feiern! Die Party beginnt um 19:00 Uhr bei mir zu Hause (Goethestraße 12). Wir grillen im Garten, wenn das Wetter schön ist.

Du musst nichts zu essen mitbringen, ich kaufe Fleisch, Salate und Brot. Aber bring bitte deine Lieblingsmusik auf dem Handy mit! Markus und Elena kommen auch. Sie bringen Getränke mit.

Kannst du kommen? Bitte gib mir bis Donnerstag Bescheid.

Liebe Grüße
Sarah`,
    statement: 'Sarah möchte ihren Geburtstag im Restaurant feiern.',
    correct_answer: 'falsch',
    clue_quote: 'Die Party beginnt um 19:00 Uhr bei mir zu Hause (Goethestraße 12).',
    explanation_ru: 'В тексте письма Сара прямо пишет: «Die Party beginnt um 19:00 Uhr bei mir zu Hause» («Вечеринка начинается в 19:00 у меня дома»). Она не собирается идти в ресторан. Утверждение неверно (Falsch).',
    explanation_de: 'Sarah feiert zu Hause („bei mir zu Hause"), nicht im Restaurant.',
    vocabulary_notes: [
      { word: 'bei mir zu Hause', translation: 'у меня дома' },
      { word: 'feiern', translation: 'праздновать' },
      { word: 'Bescheid geben', translation: 'сообщить / дать знать' }
    ]
  },
  {
    id: 'm1-q2',
    exam_id: 'modellsatz-1',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Sarah an Anna',
    context_header: 'Von: Sarah Müller <sarah.m@webmail.de>\nAn: Anna Schmidt <anna.schmidt@berlin-mail.de>\nDatum: 14. Oktober, 18:30 Uhr\nBetreff: Meine Geburtstagsparty am Samstag',
    context_body: `Liebe Anna,

wie geht es dir? Ich hoffe, alles ist gut.
Am kommenden Samstag habe ich Geburtstag und möchte feiern! Die Party beginnt um 19:00 Uhr bei mir zu Hause (Goethestraße 12). Wir grillen im Garten, wenn das Wetter schön ist.

Du musst nichts zu essen mitbringen, ich kaufe Fleisch, Salate und Brot. Aber bring bitte deine Lieblingsmusik auf dem Handy mit! Markus und Elena kommen auch. Sie bringen Getränke mit.

Kannst du kommen? Bitte gib mir bis Donnerstag Bescheid.

Liebe Grüße
Sarah`,
    statement: 'Anna soll Essen für die Party mitbringen.',
    correct_answer: 'falsch',
    clue_quote: 'Du musst nichts zu essen mitbringen, ich kaufe Fleisch, Salate und Brot.',
    explanation_ru: 'Сара пишет: «Du musst nichts zu essen mitbringen» («Тебе ничего из еды приносить не нужно»), так как она сама покупает мясо, салаты и хлеб. А принести просит музыку («bring bitte deine Lieblingsmusik... mit»). Утверждение неверно (Falsch).',
    explanation_de: 'Anna muss kein Essen mitbringen („Du musst nichts zu essen mitbringen").',
    vocabulary_notes: [
      { word: 'nichts zu essen', translation: 'ничего из еды' },
      { word: 'mitbringen', translation: 'приносить с собой' },
      { word: 'Getränke', translation: 'напитки' }
    ]
  },

  // Text 2: Sprachschule Aktiv (Aufgaben 3-5)
  {
    id: 'm1-q3',
    exam_id: 'modellsatz-1',
    teil: 1,
    question_number: 3,
    title: 'Information der Sprachschule Aktiv München',
    context_header: 'Sprachschule Aktiv München — Information für neue Kursteilnehmer',
    context_body: `Sehr geehrte Kursteilnehmerinnen und Kursteilnehmer,

herzlich willkommen an der Sprachschule Aktiv!
Ihr Deutschkurs Deutsch A1 beginnt am Montag, den 4. November.

Unterrichtszeiten:
Montag bis Donnerstag: 9:00 – 12:15 Uhr.
Freitags findet kein Unterricht statt.

Das Lehrbuch „Schritte Plus Neu A1" kaufen Sie bitte vor Kursbeginn in der Buchhandlung am Marienplatz oder online. Im Sekretariat kann man das Buch leider nicht kaufen.

Am ersten Tag treffen wir uns um 8:45 Uhr im Raum 204 (2. Stock) für einen kurzen Einführungstest und Kaffee.

Mit freundlichen Grüßen
Ihr Sprachschul-Team`,
    statement: 'Der Deutschkurs hat von Montag bis Freitag Unterricht.',
    correct_answer: 'falsch',
    clue_quote: 'Montag bis Donnerstag: 9:00 – 12:15 Uhr. Freitags findet kein Unterricht statt.',
    explanation_ru: 'В расписании чётко указано: «Montag bis Donnerstag: 9:00 – 12:15 Uhr. Freitags findet kein Unterricht statt» (По пятницам занятий нет). Поэтому курс проходит 4 дня в неделю, а не с понедельника по пятницу. Утверждение неверно (Falsch).',
    explanation_de: 'Der Unterricht findet nur von Montag bis Donnerstag statt. Am Freitag ist kein Unterricht.',
    vocabulary_notes: [
      { word: 'stattfinden', translation: 'состояться / проходить' },
      { word: 'kein Unterricht', translation: 'нет занятий' },
      { word: 'Kursteilnehmer', translation: 'участник курса' }
    ]
  },
  {
    id: 'm1-q4',
    exam_id: 'modellsatz-1',
    teil: 1,
    question_number: 4,
    title: 'Information der Sprachschule Aktiv München',
    context_header: 'Sprachschule Aktiv München — Information für neue Kursteilnehmer',
    context_body: `Sehr geehrte Kursteilnehmerinnen und Kursteilnehmer,

herzlich willkommen an der Sprachschule Aktiv!
Ihr Deutschkurs Deutsch A1 beginnt am Montag, den 4. November.

Unterrichtszeiten:
Montag bis Donnerstag: 9:00 – 12:15 Uhr.
Freitags findet kein Unterricht statt.

Das Lehrbuch „Schritte Plus Neu A1" kaufen Sie bitte vor Kursbeginn in der Buchhandlung am Marienplatz oder online. Im Sekretariat kann man das Buch leider nicht kaufen.

Am ersten Tag treffen wir uns um 8:45 Uhr im Raum 204 (2. Stock) für einen kurzen Einführungstest und Kaffee.

Mit freundlichen Grüßen
Ihr Sprachschul-Team`,
    statement: 'Man kann das Kursbuch direkt im Sekretariat der Sprachschule kaufen.',
    correct_answer: 'falsch',
    clue_quote: 'Im Sekretariat kann man das Buch leider nicht kaufen.',
    explanation_ru: 'В тексте прямо сказано: «Im Sekretariat kann man das Buch leider nicht kaufen» («В секретариате, к сожалению, купить книгу нельзя»). Её нужно купить в книжном магазине или онлайн. Утверждение неверно (Falsch).',
    explanation_de: 'Im Sekretariat gibt es das Buch nicht („leider nicht kaufen").',
    vocabulary_notes: [
      { word: 'das Lehrbuch / Kursbuch', translation: 'учебник' },
      { word: 'die Buchhandlung', translation: 'книжный магазин' },
      { word: 'leider nicht', translation: 'к сожалению, нет' }
    ]
  },
  {
    id: 'm1-q5',
    exam_id: 'modellsatz-1',
    teil: 1,
    question_number: 5,
    title: 'Information der Sprachschule Aktiv München',
    context_header: 'Sprachschule Aktiv München — Information für neue Kursteilnehmer',
    context_body: `Sehr geehrte Kursteilnehmerinnen und Kursteilnehmer,

herzlich willkommen an der Sprachschule Aktiv!
Ihr Deutschkurs Deutsch A1 beginnt am Montag, den 4. November.

Unterrichtszeiten:
Montag bis Donnerstag: 9:00 – 12:15 Uhr.
Freitags findet kein Unterricht statt.

Das Lehrbuch „Schritte Plus Neu A1" kaufen Sie bitte vor Kursbeginn in der Buchhandlung am Marienplatz oder online. Im Sekretariat kann man das Buch leider nicht kaufen.

Am ersten Tag treffen wir uns um 8:45 Uhr im Raum 204 (2. Stock) für einen kurzen Einführungstest und Kaffee.

Mit freundlichen Grüßen
Ihr Sprachschul-Team`,
    statement: 'Die Teilnehmer treffen sich am ersten Tag schon vor 9:00 Uhr.',
    correct_answer: 'richtig',
    clue_quote: 'Am ersten Tag treffen wir uns um 8:45 Uhr im Raum 204 (2. Stock)',
    explanation_ru: 'Занятия начинаются в 9:00, но в первый день сбор назначен на 8:45 («um 8:45 Uhr im Raum 204»). 8:45 — это до 9:00 («vor 9:00 Uhr»). Утверждение верно (Richtig).',
    explanation_de: '8:45 Uhr ist vor 9:00 Uhr, daher ist die Aussage richtig.',
    vocabulary_notes: [
      { word: 'vor 9:00 Uhr', translation: 'до 9:00 часов' },
      { word: 'sich treffen', translation: 'встречаться' },
      { word: 'am ersten Tag', translation: 'в первый день' }
    ]
  },

  // ==========================================
  // MODELLSATZ 1 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm1-q6',
    exam_id: 'modellsatz-1',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie möchten am Sonntagabend in Köln essen gehen und suchen ein Restaurant mit vegetarischem Essen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.brauhaus-koeln-zentrum.de',
        title: 'Traditionelles Kölner Brauhaus „Zum Dom"',
        text: 'Echte rheinische Spezialitäten: Deftiger Sauerbraten, knusprige Schweinshaxe und Würste mit Sauerkraut. Täglich geöffnet 11:00 – 23:00 Uhr. Große Auswahl an frischem Kölsch.',
        details: 'Küche: Fleischgerichte, Deftig • Öffnungszeiten: Mo–So'
      },
      {
        id: 'b',
        badge: 'www.veggie-green-koeln.de',
        title: 'Bio-Restaurant & Café „Grüne Oase"',
        text: '100% vegetarische und vegane Speisen! Frische Bio-Salate, hausgemachte Gemüsequiches, Tofu-Currys und gesunde Desserts. Sonntag geöffnet von 12:00 bis 22:00 Uhr.',
        details: 'Küche: Vegetarisch & Vegan • Öffnungszeiten: Di–So bis 22:00'
      }
    ],
    correct_answer: 'b',
    clue_quote: '100% vegetarische und vegane Speisen! ... Sonntag geöffnet von 12:00 bis 22:00 Uhr.',
    explanation_ru: 'Вам нужно: 1) вегетарианская еда (vegetarisches Essen), 2) в воскресенье вечером (Sonntagabend). Сайт «a» предлагает мясные блюда (Schweinshaxe, Fleischgerichte). Сайт «b» специализируется на 100% вегетарианских блюдах и открыт в воскресенье до 22:00. Правильный ответ: b.',
    explanation_de: 'Gesucht wird vegetarisches Essen am Sonntagabend. Anzeige b bietet 100% vegetarische Speisen und hat sonntags geöffnet.',
    vocabulary_notes: [
      { word: 'vegetarisch', translation: 'вегетарианский' },
      { word: 'Schweinshaxe / Fleisch', translation: 'свиная рулька / мясо' },
      { word: 'geöffnet', translation: 'открыто' }
    ]
  },
  {
    id: 'm1-q7',
    exam_id: 'modellsatz-1',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie möchten ein gebrauchtes Fahrrad für wenig Geld kaufen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.citybike-verleih-berlin.de',
        title: 'CityBike Berlin — Fahrradverleih für Touristen',
        text: 'Entdecken Sie die Hauptstadt auf zwei Rädern! Mieten Sie topaktuelle Fahrräder und E-Bikes. Tagesmiete ab 15 € pro Tag. Keine Verkäufe, nur kurzzeitiger Verleih.',
        details: 'Angebot: Verleih / Miete • Keine Verkäufe'
      },
      {
        id: 'b',
        badge: 'www.secondhand-velo-berlin.de',
        title: 'Zweirad-Börse: Gebrauchte Fahrräder & Ersatzteile',
        text: 'Große Auswahl an geprüften Second-Hand-Rädern für Damen, Herren und Kinder schon ab 45 €. Alle Räder verkehrssicher repariert. Günstig kaufen mit 6 Monaten Garantie!',
        details: 'Angebot: Verkauf von Gebrauchträdern • Günstige Preise'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Große Auswahl an geprüften Second-Hand-Rädern ... Günstig kaufen',
    explanation_ru: 'Вы хотите купить (kaufen) подержанный велосипед (gebrauchtes Fahrrad). На сайте «a» велосипеды только сдают в аренду («Fahrradverleih», «nur kurzzeitiger Verleih, keine Verkäufe»). На сайте «b» продаются подержанные велосипеды («Second-Hand-Räder», «gebrauchte Fahrräder», «günstig kaufen»). Правильный ответ: b.',
    explanation_de: 'Gesucht wird der Kauf eines gebrauchten Fahrrads. Anzeige a ist nur ein Verleih, Anzeige b verkauft gebrauchte Räder („Second-Hand").',
    vocabulary_notes: [
      { word: 'gebraucht', translation: 'подержанный / б/у' },
      { word: 'kaufen', translation: 'покупать' },
      { word: 'der Verleih / mieten', translation: 'прокат / арендовать' }
    ]
  },
  {
    id: 'm1-q8',
    exam_id: 'modellsatz-1',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie arbeiten tagsüber und möchten abends online Deutsch lernen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.deutsch-intensiv-praesenz.de',
        title: 'Intensivkurse Deutsch am Vormittag',
        text: 'Lernen Sie Deutsch in kleinen Gruppen direkt in unserer Schule in Frankfurt. Montag bis Freitag, täglich von 8:30 bis 12:30 Uhr. Präsenzunterricht im Schulgebäude.',
        details: 'Zeit: 8:30–12:30 Vormittags • Format: Nur Präsenz'
      },
      {
        id: 'b',
        badge: 'www.online-deutsch-abend.de',
        title: 'Flexibel Deutsch lernen: Online-Abendkurse',
        text: 'Der ideale Kurs für Berufstätige! Live-Unterricht per Zoom bequem von zu Hause. Dienstags und donnerstags von 19:00 bis 20:30 Uhr. Einstieg jederzeit möglich.',
        details: 'Zeit: 19:00–20:30 Uhr abends • Format: Online per Zoom'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Online-Abendkurse ... Dienstags und donnerstags von 19:00 bis 20:30 Uhr. Live-Unterricht per Zoom',
    explanation_ru: 'Ключевые условия: 1) вечером (abends), 2) онлайн (online). Вариант «a» — это очные занятия утром («am Vormittag, 8:30–12:30 Uhr, Präsenzunterricht»). Вариант «b» — онлайн-курс по вечерам с 19:00 («Online-Abendkurse, abends, per Zoom»). Правильный ответ: b.',
    explanation_de: 'Gesucht ist ein Online-Kurs am Abend. Anzeige b bietet Online-Unterricht um 19:00 Uhr an.',
    vocabulary_notes: [
      { word: 'abends', translation: 'по вечерам' },
      { word: 'vormittags', translation: 'в первой половине дня' },
      { word: 'berufstätig', translation: 'работающий' }
    ]
  },
  {
    id: 'm1-q9',
    exam_id: 'modellsatz-1',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten am Samstag mit dem Zug nach Hamburg fahren und Ihr Fahrrad mitnehmen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.bahn-service-reisen.de/fahrrad',
        title: 'Deutsche Bahn: Fahrradmitnahme im Nah- und Fernverkehr',
        text: 'Reisen mit Fahrrad: Informationen zur Fahrradkarte und Reservierung im ICE und IC. Fahrradmitnahme am Wochenende in Regionalzügen möglich. Jetzt Ticket online buchen.',
        details: 'Thema: Fahrradmitnahme im Zug • Ticket online buchen'
      },
      {
        id: 'b',
        badge: 'www.flixbus-hamburg-express.de',
        title: 'Fernbusreisen nach Hamburg',
        text: 'Günstig von Stadt zu Stadt reisen. Bequeme Sitze und kostenloses WLAN im Bus. Achtung: Auf der Strecke nach Hamburg ist die Mitnahme von Fahrrädern leider nicht möglich.',
        details: 'Thema: Fernbus • Keine Fahrradmitnahme'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Informationen zur Fahrradkarte und Reservierung im ICE und IC. Fahrradmitnahme am Wochenende',
    explanation_ru: 'Вы хотите ехать на поезде (mit dem Zug) и взять велосипед (Fahrrad mitnehmen). На сайте «b» предлагается автобус (Fernbus), где провоз велосипедов невозможен («Mitnahme von Fahrrädern leider nicht möglich»). На сайте «a» (Deutsche Bahn) есть информация и покупка билетов с велосипедом в поезде. Правильный ответ: a.',
    explanation_de: 'Gesucht wird eine Zugreise mit Fahrradmitnahme. Anzeige a informiert über Fahrradmitnahme im Zug. Bei Anzeige b (Bus) ist das nicht möglich.',
    vocabulary_notes: [
      { word: 'der Zug / die Bahn', translation: 'поезд / железная дорога' },
      { word: 'Fahrradmitnahme', translation: 'провоз велосипеда' },
      { word: 'Fernbus', translation: 'междугородный автобус' }
    ]
  },
  {
    id: 'm1-q10',
    exam_id: 'modellsatz-1',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie suchen eine kleine möblierte 1-Zimmer-Wohnung zur Miete für 6 Monate.',
    options_json: [
      {
        id: 'a',
        badge: 'www.zeitwohnen-moebliert.de',
        title: 'Wohnen auf Zeit: Möblierte 1- bis 2-Zimmer-Apartments',
        text: 'Voll ausgestattete Apartments für befristetes Wohnen (ab 1 Monat bis 1 Jahr). Inklusive Küche, Bett, WLAN und Nebenkosten. Ideal für Berufstätige und Praktikanten.',
        details: 'Miete: Möbliert auf Zeit (1–12 Monate) • 1-Zimmer'
      },
      {
        id: 'b',
        badge: 'www.immobilien-kauf-portal.de',
        title: 'Eigentumswohnungen und Häuser kaufen',
        text: 'Finden Sie Ihre Traumimmobilie zum Kauf. Große 3- und 4-Zimmer-Wohnungen sowie Einfamilienhäuser ohne Möbel. Vereinbaren Sie einen Besichtigungstermin mit unserem Makler.',
        details: 'Angebot: Nur Verkauf / Kauf • Große unmöblierte Wohnungen'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Voll ausgestattete Apartments für befristetes Wohnen (ab 1 Monat bis 1 Jahr)',
    explanation_ru: 'Вам нужна: 1) аренда (Miete / zur Miete), 2) меблированная (möbliert), 3) 1-комнатная квартира на 6 месяцев. Сайт «b» продаёт большие квартиры без мебели («zum Kauf», «ohne Möbel»). Сайт «a» сдает меблированные 1-комнатные апартаменты на срок от 1 месяца до 1 года («Möblierte 1- bis 2-Zimmer-Apartments», «ab 1 Monat bis 1 Jahr»). Правильный ответ: a.',
    explanation_de: 'Gesucht wird eine möblierte Mietwohnung für 6 Monate. Anzeige a bietet möblierte Apartments auf Zeit (1-12 Monate). Anzeige b verkauft nur.',
    vocabulary_notes: [
      { word: 'die Miete / mieten', translation: 'аренда / снимать' },
      { word: 'möbliert', translation: 'меблированный' },
      { word: 'zum Kauf / kaufen', translation: 'к покупке / покупать' }
    ]
  },

  // ==========================================
  // MODELLSATZ 1 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm1-q11',
    exam_id: 'modellsatz-1',
    teil: 3,
    question_number: 11,
    title: 'Schild an der Tür einer Arztpraxis',
    context_header: 'Hausarztpraxis Dr. med. Thomas Weber',
    context_body: `Urlaub!
Unsere Praxis bleibt vom 1. bis einschließlich 19. August geschlossen.

In dringenden Notfällen wenden Sie sich bitte an unsere Vertretung:
Praxis Dr. med. Sabine Krause
Bahnhofstraße 14, 80335 München
Telefon: 089 / 55 44 33
(Sprechzeiten: Mo–Fr 8:00 – 12:00 Uhr)

Ab Montag, 22. August, sind wir wieder wie gewohnt für Sie da.`,
    statement: 'Man kann am 10. August zu Dr. Weber in die Praxis gehen.',
    correct_answer: 'falsch',
    clue_quote: 'Unsere Praxis bleibt vom 1. bis einschließlich 19. August geschlossen.',
    explanation_ru: 'Объявление гласит, что практика закрыта в отпуск с 1 по 19 августа («vom 1. bis einschließlich 19. August geschlossen»). 10 августа попадает в этот период, поэтому пойти к доктору Веберу нельзя (нужно идти к заместителю Dr. Krause). Утверждение неверно (Falsch).',
    explanation_de: 'Die Praxis von Dr. Weber ist bis 19. August geschlossen. Am 10. August kann man nicht zu ihm gehen.',
    vocabulary_notes: [
      { word: 'geschlossen', translation: 'закрыто' },
      { word: 'die Vertretung', translation: 'замещение / дежурный врач' },
      { word: 'Notfall', translation: 'экстренный случай' }
    ]
  },
  {
    id: 'm1-q12',
    exam_id: 'modellsatz-1',
    teil: 3,
    question_number: 12,
    title: 'Aushang im Kaufhaus am Aufzug',
    context_header: 'Kaufhaus Galeria — Information',
    context_body: `Achtung Kunden!

Wegen Reparaturarbeiten ist dieser Aufzug heute außer Betrieb.

Bitte benutzen Sie die Rolltreppe in der Mitte der Halle oder die Treppe neben dem Ausgang.

Die Damenmode im 2. Obergeschoss erreichen Sie auch über den Aufzug im Parkhaus.

Vielen Dank für Ihr Verständnis!`,
    statement: 'Der Aufzug funktioniert heute nicht.',
    correct_answer: 'richtig',
    clue_quote: 'Wegen Reparaturarbeiten ist dieser Aufzug heute außer Betrieb.',
    explanation_ru: 'Фраза «außer Betrieb» в немецком языке означает «не работает / отключён». На табличке сказано: лифт сегодня не работает из-за ремонта («außer Betrieb»), просят пользоваться эскалатором или лестницей. Утверждение верно (Richtig).',
    explanation_de: '„Außer Betrieb" bedeutet, dass der Aufzug nicht funktioniert. Die Aussage ist richtig.',
    vocabulary_notes: [
      { word: 'außer Betrieb', translation: 'не работает / отключён' },
      { word: 'die Rolltreppe', translation: 'эскалатор' },
      { word: 'der Aufzug', translation: 'лифт' }
    ]
  },
  {
    id: 'm1-q13',
    exam_id: 'modellsatz-1',
    teil: 3,
    question_number: 13,
    title: 'Zettel an der Eingangstür einer Bäckerei',
    context_header: 'Bäckerei & Konditorei Müller',
    context_body: `Liebe Kundinnen und Kunden,

frische Sonntagsbrötchen gibt es bei uns jeden Sonntag von 7:30 bis 11:00 Uhr.

Bitte beachten Sie:
Aus technischen Gründen ist an Sonntagen leider keine Kartenzahlung möglich.
Bitte zahlen Sie sonntags nur bar!`,
    statement: 'Am Sonntag kann man in der Bäckerei mit Karte bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'an Sonntagen leider keine Kartenzahlung möglich. Bitte zahlen Sie sonntags nur bar!',
    explanation_ru: 'На дверях пекарни висит предупреждение: «an Sonntagen leider keine Kartenzahlung möglich. Bitte zahlen Sie sonntags nur bar!» (по воскресеньям оплата картой невозможна, только наличными!). Утверждение «можно платить картой» неверно (Falsch).',
    explanation_de: 'Sonntags kann man nur bar bezahlen („keine Kartenzahlung möglich"). Die Aussage ist falsch.',
    vocabulary_notes: [
      { word: 'keine Kartenzahlung', translation: 'оплата картой невозможна' },
      { word: 'bar zahlen', translation: 'платить наличными' },
      { word: 'frische Brötchen', translation: 'свежие булочки' }
    ]
  },
  {
    id: 'm1-q14',
    exam_id: 'modellsatz-1',
    teil: 3,
    question_number: 14,
    title: 'Hinweisschild in der Stadtbibliothek',
    context_header: 'Stadtbibliothek — Rückgabe-Zone',
    context_body: `Bücherrückgabe außerhalb der Öffnungszeiten:

Ist die Bibliothek geschlossen?
Kein Problem! Sie können ausgeliehene Bücher und Medien jederzeit in den Rückgabeautomaten rechts neben der Eingangstür einwerfen.

Der Automat ist 24 Stunden an allen 7 Wochentagen für Sie geöffnet.`,
    statement: 'Man kann auch nachts Bücher in der Bibliothek abgeben.',
    correct_answer: 'richtig',
    clue_quote: 'Der Automat ist 24 Stunden an allen 7 Wochentagen für Sie geöffnet.',
    explanation_ru: 'В объявлении написано, что автомат возврата книг работает круглосуточно все 7 дней в неделю («24 Stunden an allen 7 Wochentagen geöffnet»). Значит, сдать книги можно в том числе ночью. Утверждение верно (Richtig).',
    explanation_de: 'Der Rückgabeautomat ist 24 Stunden geöffnet, also auch nachts.',
    vocabulary_notes: [
      { word: 'Bücherrückgabe', translation: 'возврат книг' },
      { word: 'außerhalb der Öffnungszeiten', translation: 'в нерабочие часы' },
      { word: 'jederzeit / 24 Stunden', translation: 'в любое время / 24 часа' }
    ]
  },
  {
    id: 'm1-q15',
    exam_id: 'modellsatz-1',
    teil: 3,
    question_number: 15,
    title: 'Hinweis im Treppenhaus eines Mehrfamilienhauses',
    context_header: 'Hausverwaltung Becker — Hausordnung',
    context_body: `Liebe Hausbewohner,

wir bitten Sie dringend um Einhaltung der gesetzlichen Ruhezeiten:
Mittagsruhe: 13:00 – 15:00 Uhr
Nachtruhe: ab 22:00 bis 07:00 Uhr morgens

In diesen Zeiten ist lautes Musikhören, Bohren und Hämmern in den Wohnungen nicht erlaubt.

Vielen Dank für Ihre Rücksichtnahme!`,
    statement: 'Um 14:00 Uhr darf man in der Wohnung laute Musik hören.',
    correct_answer: 'falsch',
    clue_quote: 'Mittagsruhe: 13:00 – 15:00 Uhr ... In diesen Zeiten ist lautes Musikhören ... nicht erlaubt.',
    explanation_ru: 'С 13:00 до 15:00 действует тихий час («Mittagsruhe»). В это время громко слушать музыку запрещено («lautes Musikhören ... nicht erlaubt»). 14:00 как раз входит в этот интервал. Утверждение неверно (Falsch).',
    explanation_de: 'Von 13:00 bis 15:00 Uhr ist Mittagsruhe. Lautes Musikhören ist verboten.',
    vocabulary_notes: [
      { word: 'die Ruhezeit', translation: 'время тишины' },
      { word: 'nicht erlaubt / verboten', translation: 'не разрешено / запрещено' },
      { word: 'Mittagsruhe', translation: 'обеденный перерыв на тишину' }
    ]
  }
];
