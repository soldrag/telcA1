export const exam = {
  id: 'modellsatz-6',
  title: 'telc Deutsch A1 — Modellsatz 6',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Шестой официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: поездка в аэропорт, детский сад, бытовые услуги, транспортные билеты и городские правила.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 6 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: Nachricht von Lukas an Thomas (Aufgaben 1-2)
  {
    id: 'm6-q1',
    exam_id: 'modellsatz-6',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Lukas an Thomas',
    context_header: 'Von: Lukas Weber <lukas.w@web.de>\nAn: Thomas Koch <t.koch@gmx.net>\nDatum: 8. Juni, 20:10 Uhr\nBetreff: Unser Flug nach Barcelona am Montag',
    context_body: `Hallo Thomas,

unser Flug nach Barcelona startet am Montagmorgen um 08:30 Uhr am Flughafen BER. Wir sollten spätestens um 06:45 Uhr am Check-in-Schalter sein.

Da die S-Bahn so früh am Morgen oft unzuverlässig ist, habe ich für uns ein Großraumtaxi bestellt. Es holt uns um 06:15 Uhr direkt vor deinem Haus ab. Wir teilen uns einfach die Kosten (ca. 25 Euro pro Person).

Du brauchst dich um nichts weiter zu kümmern, pack einfach deinen Koffer und deinen Reisepass ein!

Bis Montag früh
Lukas`,
    statement: 'Lukas hat das Taxi zum Flughafen bereits bestellt.',
    correct_answer: 'richtig',
    clue_quote: 'habe ich für uns ein Großraumtaxi bestellt. Es holt uns um 06:15 Uhr direkt vor deinem Haus ab.',
    explanation_ru: 'Лукас сообщает: «habe ich für uns ein Großraumtaxi bestellt» («я уже заказал для нас большое такси»). То есть такси уже заказано Лукасом, Томасу ничего делать не нужно. Утверждение верно (Richtig).',
    explanation_de: 'Lukas hat das Taxi bereits bestellt („habe ich ... bestellt").',
    vocabulary_notes: [
      { word: 'bestellen', translation: 'заказывать' },
      { word: 'der Abflug / starten', translation: 'вылет / взлетать' },
      { word: 'die Kosten teilen', translation: 'разделить расходы' }
    ]
  },
  {
    id: 'm6-q2',
    exam_id: 'modellsatz-6',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Lukas an Thomas',
    context_header: 'Von: Lukas Weber <lukas.w@web.de>\nAn: Thomas Koch <t.koch@gmx.net>\nDatum: 8. Juni, 20:10 Uhr\nBetreff: Unser Flug nach Barcelona am Montag',
    context_body: `Hallo Thomas,

unser Flug nach Barcelona startet am Montagmorgen um 08:30 Uhr am Flughafen BER. Wir sollten spätestens um 06:45 Uhr am Check-in-Schalter sein.

Da die S-Bahn so früh am Morgen oft unzuverlässig ist, habe ich für uns ein Großraumtaxi bestellt. Es holt uns um 06:15 Uhr direkt vor deinem Haus ab. Wir teilen uns einfach die Kosten (ca. 25 Euro pro Person).

Du brauchst dich um nichts weiter zu kümmern, pack einfach deinen Koffer und deinen Reisepass ein!

Bis Montag früh
Lukas`,
    statement: 'Lukas bezahlt die gesamten Taxikosten alleine.',
    correct_answer: 'falsch',
    clue_quote: 'Wir teilen uns einfach die Kosten (ca. 25 Euro pro Person).',
    explanation_ru: 'Лукас пишет: «Wir teilen uns einfach die Kosten (ca. 25 Euro pro Person)» («Мы просто разделим расходы — около 25 евро с человека»). Значит, платят оба пополам, а не Лукас один. Утверждение неверно (Falsch).',
    explanation_de: 'Sie teilen die Kosten untereinander auf (ca. 25 € pro Person).',
    vocabulary_notes: [
      { word: 'die Kosten teilen', translation: 'делить расходы' },
      { word: 'pro Person', translation: 'с человека' },
      { word: 'alleine bezahlen', translation: 'платить в одиночку' }
    ]
  },

  // Text 2: Kita Sonnenschein (Aufgaben 3-5)
  {
    id: 'm6-q3',
    exam_id: 'modellsatz-6',
    teil: 1,
    question_number: 3,
    title: 'Elternbrief der Kindertagesstätte Sonnenschein',
    context_header: 'Kindertagesstätte Sonnenschein München — Sommerfest',
    context_body: `Liebe Eltern,

am kommenden Freitagnachmittag, den 14. Juli, findet unser großes Sommerfest statt! Wir starten um 15:30 Uhr in unserem Kindergartengarten.

Bei schlechtem Wetter oder Regen weichen wir einfach in die große Turnhalle der benachbarten Grundschule aus.

Für das bunte Kuchenbuffet bitten wir jede Familie um eine kleine Spende: Bitte bringen Sie einen selbstgebackenen Kuchen oder Obst mit. Kühle Getränke (Wasser, Apfelschorle und Kaffee) stellt der Kindergarten für alle kostenlos bereit.

Wir freuen uns auf ein fröhliches Fest mit Ihnen und den Kindern!
Ihr Kita-Team`,
    statement: 'Wenn es am Freitag regnet, findet das Fest in der Turnhalle statt.',
    correct_answer: 'richtig',
    clue_quote: 'Bei schlechtem Wetter oder Regen weichen wir einfach in die große Turnhalle der benachbarten Grundschule aus.',
    explanation_ru: 'В письме родителям прямо написано: в случае плохой погоды или дождя праздник переносится в спортзал соседней школы («Bei schlechtem Wetter oder Regen ... in die große Turnhalle ausweichen»). Утверждение верно (Richtig).',
    explanation_de: 'Bei Regen weicht die Feier in die Turnhalle aus.',
    vocabulary_notes: [
      { word: 'bei schlechtem Wetter', translation: 'при плохой погоде' },
      { word: 'die Turnhalle', translation: 'спортивный зал' },
      { word: 'ausweichen', translation: 'перебазироваться / перейти' }
    ]
  },
  {
    id: 'm6-q4',
    exam_id: 'modellsatz-6',
    teil: 1,
    question_number: 4,
    title: 'Elternbrief der Kindertagesstätte Sonnenschein',
    context_header: 'Kindertagesstätte Sonnenschein München — Sommerfest',
    context_body: `Liebe Eltern,

am kommenden Freitagnachmittag, den 14. Juli, findet unser großes Sommerfest statt! Wir starten um 15:30 Uhr in unserem Kindergartengarten.

Bei schlechtem Wetter oder Regen weichen wir einfach in die große Turnhalle der benachbarten Grundschule aus.

Für das bunte Kuchenbuffet bitten wir jede Familie um eine kleine Spende: Bitte bringen Sie einen selbstgebackenen Kuchen oder Obst mit. Kühle Getränke (Wasser, Apfelschorle und Kaffee) stellt der Kindergarten für alle kostenlos bereit.

Wir freuen uns auf ein fröhliches Fest mit Ihnen und den Kindern!
Ihr Kita-Team`,
    statement: 'Die Eltern müssen für die Getränke auf dem Fest bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'Kühle Getränke (Wasser, Apfelschorle und Kaffee) stellt der Kindergarten für alle kostenlos bereit.',
    explanation_ru: 'В тексте указано: прохладительные напитки детский сад предоставляет для всех бесплатно («stellt der Kindergarten für alle kostenlos bereit»). Платить за них не нужно. Утверждение неверно (Falsch).',
    explanation_de: 'Die Getränke werden von der Kita kostenlos bereitgestellt.',
    vocabulary_notes: [
      { word: 'kostenlos bereitstellen', translation: 'предоставлять бесплатно' },
      { word: 'die Getränke (pl.)', translation: 'напитки' },
      { word: 'das Kuchenbuffet', translation: 'сладкий стол / пирожные' }
    ]
  },
  {
    id: 'm6-q5',
    exam_id: 'modellsatz-6',
    teil: 1,
    question_number: 5,
    title: 'Elternbrief der Kindertagesstätte Sonnenschein',
    context_header: 'Kindertagesstätte Sonnenschein München — Sommerfest',
    context_body: `Liebe Eltern,

am kommenden Freitagnachmittag, den 14. Juli, findet unser großes Sommerfest statt! Wir starten um 15:30 Uhr in unserem Kindergartengarten.

Bei schlechtem Wetter oder Regen weichen wir einfach in die große Turnhalle der benachbarten Grundschule aus.

Für das bunte Kuchenbuffet bitten wir jede Familie um eine kleine Spende: Bitte bringen Sie einen selbstgebackenen Kuchen oder Obst mit. Kühle Getränke (Wasser, Apfelschorle und Kaffee) stellt der Kindergarten für alle kostenlos bereit.

Wir freuen uns auf ein fröhliches Fest mit Ihnen und den Kindern!
Ihr Kita-Team`,
    statement: 'Das Sommerfest beginnt erst am Nachmittag.',
    correct_answer: 'richtig',
    clue_quote: 'am kommenden Freitagnachmittag, den 14. Juli ... Wir starten um 15:30 Uhr',
    explanation_ru: 'В объявлении написано: «Freitagnachmittag ... Wir starten um 15:30 Uhr» (пятница вторая половина дня, начало в 15:30). 15:30 — это после полудня (am Nachmittag). Утверждение верно (Richtig).',
    explanation_de: '15:30 Uhr ist am Nachmittag, das Fest beginnt am Nachmittag.',
    vocabulary_notes: [
      { word: 'der Nachmittag', translation: 'вторая половина дня (после полудня)' },
      { word: 'starten / beginnen', translation: 'начинать(ся)' },
      { word: 'selbstgebacken', translation: 'домашней выпечки' }
    ]
  },

  // ==========================================
  // MODELLSATZ 6 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm6-q6',
    exam_id: 'modellsatz-6',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie suchen eine zuverlässige Haushaltshilfe für Ihre private 2-Zimmer-Wohnung (zweimal im Monat vormittags).',
    options_json: [
      {
        id: 'a',
        badge: 'www.industriereinigung-pro.de',
        title: 'CleanCorp GmbH — Gebäude- und Industriereinigung',
        text: 'Professionelle Reinigung von Fabrikhallen, Großraumbüros und Krankenhäusern. Nur Großaufträge für Unternehmen ab 500 qm Fläche. Keine Reinigung von privaten Privathaushalten.',
        details: 'Kunden: Ausschließlich Großbetriebe • Keine Privatwohnungen'
      },
      {
        id: 'b',
        badge: 'www.haushaltshilfe-agentur-sauber.de',
        title: 'HaushaltsFee: Zuverlässige Putzhilfen für Privathaushalte',
        text: 'Erfahrene und versicherte Reinigungskräfte für Ihre Wohnung. Regelmäßiges Putzen, Fensterputzen und Bügeln nach Ihren Wunschzeiten (z. B. alle 2 Wochen am Vormittag).',
        details: 'Kunden: Private Haushalte & Wohnungen • Flexible Termine'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'HaushaltsFee: Zuverlässige Putzhilfen für Privathaushalte ... Regelmäßiges Putzen ... nach Ihren Wunschzeiten (z. B. alle 2 Wochen am Vormittag).',
    explanation_ru: 'Вам нужна: 1) уборка частной квартиры (private Wohnung), 2) 2 раза в месяц по утрам. Вариант «a» убирает только заводы и огромные офисы от 500 кв.м («Keine Reinigung von Privathaushalten»). Вариант «b» предоставляет помощниц по уборке частных квартир с гибким графиком (раз в 2 недели по утрам). Правильный ответ: b.',
    explanation_de: 'Gesucht wird eine Reinigungskraft für eine Privatwohnung. Anzeige b bietet Putzhilfen für Privathaushalte.',
    vocabulary_notes: [
      { word: 'die Haushaltshilfe / Putzhilfe', translation: 'помощница по хозяйству / уборщица' },
      { word: 'der Privathaushalt', translation: 'частное домашнее хозяйство' },
      { word: 'vormittags', translation: 'в первой половине дня' }
    ]
  },
  {
    id: 'm6-q7',
    exam_id: 'modellsatz-6',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie möchten einen spannenden Tagesausflug in einen Freizeitpark mit schnellen Achterbahnen und Shows machen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.actionpark-abenteuerland.de',
        title: 'Erlebnispark ActionLand: Spaß und Nervenkitzel',
        text: 'Über 40 Fahrgeschäfte und spektakuläre Achterbahnen für Jugendliche und Erwachsene! Live-Stuntshows, Wildwasserbahn und Gastronomie. Geöffnet täglich von 09:00 bis 18:30 Uhr.',
        details: 'Attraktionen: Spektakuläre Achterbahnen & Shows • Geöffnet 9–18:30'
      },
      {
        id: 'b',
        badge: 'www.botanischer-garten-ruhe.de',
        title: 'Botanischer Stadtgarten — Oase der Stille',
        text: 'Genießen Sie seltene Pflanzen, Rosenbeete und Vogelgesang. Entspannte Spaziergänge im Grünen. Ballspiele, laute Musik und Sportgeräte sind auf dem gesamten Gelände nicht gestattet.',
        details: 'Thema: Natur & Ruhe • Keine Fahrgeschäfte oder Achterbahnen'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Erlebnispark ActionLand ... Über 40 Fahrgeschäfte und spektakuläre Achterbahnen ... Live-Stuntshows',
    explanation_ru: 'Вы хотите поехать в парк развлечений с американскими горками (Freizeitpark mit Achterbahnen). Вариант «b» — тихий ботанический сад для спокойных прогулок («Oase der Stille, keine Fahrgeschäfte»). Вариант «a» — парк с 40 аттракционами и скоростными американскими горками. Правильный ответ: a.',
    explanation_de: 'Gesucht wird ein Freizeitpark mit Achterbahnen. Anzeige a bietet über 40 Fahrgeschäfte und Achterbahnen.',
    vocabulary_notes: [
      { word: 'die Achterbahn (-en)', translation: 'американские (русские) горки' },
      { word: 'der Freizeitpark / Erlebnispark', translation: 'парк развлечений' },
      { word: 'die Fahrgeschäfte (pl.)', translation: 'аттракционы' }
    ]
  },
  {
    id: 'm6-q8',
    exam_id: 'modellsatz-6',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie suchen gut erhaltene gebrauchte Kinderkleidung und Holzspielzeug zu günstigen Preisen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.couture-damenmode-exklusiv.de',
        title: 'Haute Couture Boutique „Elegance"',
        text: 'Exklusive Designermode und Abendkleider für anspruchsvolle Damen. Handgefertigte italienische Seidenschals und Taschen. Keine Kinderartikel, keine Second-Hand-Ware.',
        details: 'Angebot: Luxus-Damenmode • Keine Kinderkleidung'
      },
      {
        id: 'b',
        badge: 'www.kinder-secondhand-kiste.de',
        title: 'Kinderkiste: Second-Hand für Babys & Kids',
        text: 'Gebrauchte Kindermode von Größe 56 bis 152 in hervorragendem Zustand! Schöne Holzspielsachen, Puzzles und Kinderbücher schon ab 2 €. Sparen Sie Geld und schonen Sie die Umwelt.',
        details: 'Angebot: Gebrauchte Kinderkleidung & Holzspielzeug • Günstig'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Kinderkiste: Second-Hand für Babys & Kids ... Gebrauchte Kindermode ... Schöne Holzspielsachen ... ab 2 €.',
    explanation_ru: 'Вам нужны: 1) подержанная детская одежда (gebrauchte Kinderkleidung), 2) деревянные игрушки (Holzspielzeug), 3) недорого. Вариант «a» — бутик люксовой женской одежды без детских товаров («Keine Kinderartikel»). Вариант «b» — детский секонд-хенд с одеждой и деревянными игрушками от 2 €. Правильный ответ: b.',
    explanation_de: 'Gesucht wird gebrauchte Kinderkleidung und Holzspielzeug. Anzeige b bietet genau dieses Sortiment an.',
    vocabulary_notes: [
      { word: 'die Kinderkleidung', translation: 'детская одежда' },
      { word: 'das Holzspielzeug', translation: 'деревянные игрушки' },
      { word: 'gut erhalten', translation: 'в хорошем состоянии' }
    ]
  },
  {
    id: 'm6-q9',
    exam_id: 'modellsatz-6',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten online eine Zugfahrkarte von München nach Wien mit fester Sitzplatzreservierung buchen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.oebb-bahn-tickets.de',
        title: 'ÖBB & Deutsche Bahn: Railjet Zugtickets nach Österreich',
        text: 'Bequem mit dem Railjet-Express von München nach Wien reisen. Günstige Sparpreise ab 29 € buchen. Sitzplatzreservierung direkt bei der Online-Fahrkartenbuchung auswählen.',
        details: 'Angebot: Zugtickets & Sitzplatzreservierung • München nach Wien'
      },
      {
        id: 'b',
        badge: 'www.autovermietung-muenchen-city.de',
        title: 'Rent-a-Car München: Mietwagen für Reisen ins Ausland',
        text: 'Mieten Sie günstige Kombis und Limousinen für Ihre Urlaubsfahrt. Vollkaskoschutz und unbegrenzte Kilometer inklusive. Keine Zug- oder Bahntickets im Verkauf.',
        details: 'Angebot: Autovermietung / Mietwagen • Keine Zugtickets'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Railjet Zugtickets nach Österreich ... München nach Wien reisen ... Sitzplatzreservierung direkt bei der Online-Fahrkartenbuchung auswählen.',
    explanation_ru: 'Критерии: 1) билет на поезд из Мюнхена в Вену (Zugfahrkarte von München nach Wien), 2) онлайн с бронированием места (Sitzplatzreservierung). Сайт «b» — прокат автомобилей («Autovermietung / Mietwagen»). Сайт «a» продаёт билеты на поезд Railjet с возможностью выбора места онлайн. Правильный ответ: a.',
    explanation_de: 'Gesucht wird ein Zugticket von München nach Wien mit Sitzplatzreservierung. Anzeige a bietet Bahnfahrkarten mit Sitzplatzwahl.',
    vocabulary_notes: [
      { word: 'das Zugticket / die Zugfahrkarte', translation: 'билет на поезд' },
      { word: 'die Sitzplatzreservierung', translation: 'бронирование места' },
      { word: 'der Sparpreis', translation: 'скидочный / эконом-тариф' }
    ]
  },
  {
    id: 'm6-q10',
    exam_id: 'modellsatz-6',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie möchten als Erwachsener Akustikgitarre lernen und suchen wöchentlichen Einzelunterricht bei einem Lehrer zu Hause.',
    options_json: [
      {
        id: 'a',
        badge: 'www.rock-band-workshop.de',
        title: 'Rock- & Pop-Schule: Band-Workshops für Schlagzeuger',
        text: 'Spielen Sie Schlagzeug und E-Bass in einer echten Rockband! Nur Gruppenunterricht für Fortgeschrittene in unserem schalldichten Studio im Industriegebiet. Kein Gitarren-Einzelunterricht.',
        details: 'Format: Nur Gruppenunterricht • Instrumente: Schlagzeug & Bass'
      },
      {
        id: 'b',
        badge: 'www.gitarrenunterricht-privat-berlin.de',
        title: 'Privater Gitarrenunterricht Markus Schneider',
        text: 'Gitarre lernen mit Freude! Qualifizierter Einzelunterricht für Akustik- und Konzertgitarre für Anfänger und Erwachsene. Unterricht gemütlich in meinem Musikzimmer in Berlin-Mitte.',
        details: 'Format: Einzelunterricht zu Hause beim Lehrer • Akustikgitarre'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Qualifizierter Einzelunterricht für Akustik- und Konzertgitarre für Anfänger und Erwachsene. Unterricht gemütlich in meinem Musikzimmer',
    explanation_ru: 'Вам нужны: 1) уроки акустической гитары (Akustikgitarre), 2) индивидуально (Einzelunterricht), 3) дома у преподавателя (beim Lehrer zu Hause). Сайт «a» обучает игре на ударных и бас-гитаре в группе. Сайт «b» предлагает индивидуальные уроки акустической гитары дома у преподавателя в его комнате. Правильный ответ: b.',
    explanation_de: 'Gesucht ist Einzelunterricht für Akustikgitarre beim Lehrer zu Hause. Anzeige b entspricht genau der Situation.',
    vocabulary_notes: [
      { word: 'der Einzelunterricht', translation: 'индивидуальное занятие' },
      { word: 'die Akustikgitarre', translation: 'акустическая гитара' },
      { word: 'der Gruppenunterricht', translation: 'групповое занятие' }
    ]
  },

  // ==========================================
  // MODELLSATZ 6 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm6-q11',
    exam_id: 'modellsatz-6',
    teil: 3,
    question_number: 11,
    title: 'Schild am Eingang des Stadtparks',
    context_header: 'Grünflächenamt — Parkordnung',
    context_body: `Herzlich willkommen im Stadtpark!

Zu Ihrer und aller Besucher Sicherheit gilt:
- Hunde sind auf allen Parkwegen an der kurzen Leine zu führen.
- Das Fahren mit Fahrrädern und E-Scootern ist auf den Fußwegen verboten. Bitte schieben Sie Ihr Rad.`,
    statement: 'Man muss Hunde im Park an der Leine führen.',
    correct_answer: 'richtig',
    clue_quote: 'Hunde sind auf allen Parkwegen an der kurzen Leine zu führen.',
    explanation_ru: 'В правилах парка написано: собак на всех дорожках нужно держать на коротком поводке («Hunde sind ... an der kurzen Leine zu führen»). Утверждение верно (Richtig).',
    explanation_de: 'Hunde müssen an der Leine geführt werden.',
    vocabulary_notes: [
      { word: 'an der Leine führen', translation: 'водить на поводке' },
      { word: 'das Fahrrad schieben', translation: 'вести велосипед пешком (рядом)' },
      { word: 'der Fußweg', translation: 'пешеходная дорожка' }
    ]
  },
  {
    id: 'm6-q12',
    exam_id: 'modellsatz-6',
    teil: 3,
    question_number: 12,
    title: 'Hinweisschild in der Postfiliale',
    context_header: 'Deutsche Post & DHL — Schalterhinweis',
    context_body: `Liebe Kundinnen und Kunden,

zur Verkürzung der Wartezeiten:
- Briefe, Einschreiben und Briefmarken: Schalter 1 und 2
- Paketabgabe und Retouren: nur an Schalter 3 und 4

Vielen Dank für Ihre Mithilfe!`,
    statement: 'Man kann Pakete an Schalter 1 abgeben.',
    correct_answer: 'falsch',
    clue_quote: 'Paketabgabe und Retouren: nur an Schalter 3 und 4',
    explanation_ru: 'На табличке в почтовом отделении написано: сдача посылок происходит только в окнах 3 и 4 («nur an Schalter 3 und 4»). Окно 1 предназначено только для писем и марок. Утверждение неверно (Falsch).',
    explanation_de: 'Pakete werden nur an Schalter 3 und 4 angenommen, nicht an Schalter 1.',
    vocabulary_notes: [
      { word: 'der Schalter', translation: 'операционное окно / стойка' },
      { word: 'nur an Schalter...', translation: 'только в окне...' },
      { word: 'die Paketabgabe', translation: 'сдача посылок' }
    ]
  },
  {
    id: 'm6-q13',
    exam_id: 'modellsatz-6',
    teil: 3,
    question_number: 13,
    title: 'Aushang an der Mensa der Universität',
    context_header: 'Studentenwerk — Mensa am Campus',
    context_body: `Achtung Änderung der Öffnungszeiten!

Wegen einer internen Personalversammlung schließt die Mensa am heutigen Donnerstag bereits um 13:45 Uhr (Essensausgabe bis 13:30 Uhr).

Die Cafeteria im Erdgeschoss bleibt bis 17:00 Uhr geöffnet.`,
    statement: 'Man kann heute um 15:00 Uhr noch ein warmes Mittagessen in der Mensa bekommen.',
    correct_answer: 'falsch',
    clue_quote: 'schließt die Mensa am heutigen Donnerstag bereits um 13:45 Uhr (Essensausgabe bis 13:30 Uhr).',
    explanation_ru: 'Столовая закрывается сегодня уже в 13:45 («bereits um 13:45 Uhr»), а раздача еды заканчивается в 13:30. В 15:00 пообедать в столовой уже нельзя (работает только кафетерий). Утверждение неверно (Falsch).',
    explanation_de: 'Die Mensa schließt um 13:45 Uhr, um 15:00 Uhr gibt es kein Essen mehr.',
    vocabulary_notes: [
      { word: 'die Mensa', translation: 'студенческая столовая' },
      { word: 'die Essensausgabe', translation: 'раздача блюд' },
      { word: 'bereits / schon', translation: 'уже' }
    ]
  },
  {
    id: 'm6-q14',
    exam_id: 'modellsatz-6',
    teil: 3,
    question_number: 14,
    title: 'Schild an einem Badesee im Naherholungsgebiet',
    context_header: 'Gemeindeverwaltung — Waldsee',
    context_body: `Hinweis für Badegäste:

Baden auf eigene Gefahr!
An diesem See gibt es keine Badeaufsicht und keine Rettungsschwimmer der DLRG.

Eltern haften für ihre Kinder. Bitte achten Sie stets auf Nichtschwimmer.`,
    statement: 'Am See gibt es keinen Rettungsschwimmer, der die Badenden beaufsichtigt.',
    correct_answer: 'richtig',
    clue_quote: 'An diesem See gibt es keine Badeaufsicht und keine Rettungsschwimmer',
    explanation_ru: 'На знаке у озера прямо сказано: спасателей и дежурных у водоема нет («keine Badeaufsicht und keine Rettungsschwimmer»), купание под собственную ответственность. Утверждение верно (Richtig).',
    explanation_de: 'Es gibt keinen Rettungsschwimmer an diesem See.',
    vocabulary_notes: [
      { word: 'auf eigene Gefahr', translation: 'на свой страх и риск / под свою ответственность' },
      { word: 'der Rettungsschwimmer', translation: 'спасатель на воде' },
      { word: 'die Badeaufsicht', translation: 'надзор / наблюдение за купающимися' }
    ]
  },
  {
    id: 'm6-q15',
    exam_id: 'modellsatz-6',
    teil: 3,
    question_number: 15,
    title: 'Zettel an der Wohnungstür von Frau Schmidt',
    context_header: 'Paketzustellung DHL',
    context_body: `Hallo Frau Schmidt,

ich konnte Sie leider nicht antreffen.
Ihr Paket von Zalando habe ich bei Ihrem Nachbarn Herrn Meier im 1. Stock (Wohnung rechts) abgegeben.

Viele Grüße
Ihr DHL-Zusteller`,
    statement: 'Frau Schmidt kann ihr Paket beim Nachbarn im ersten Stock abholen.',
    correct_answer: 'richtig',
    clue_quote: 'Ihr Paket von Zalando habe ich bei Ihrem Nachbarn Herrn Meier im 1. Stock (Wohnung rechts) abgegeben.',
    explanation_ru: 'Курьер оставил записку: так как хозяйки не было дома, посылка была отдана соседу господину Майеру на 1 этаже («bei Ihrem Nachbarn Herrn Meier im 1. Stock abgegeben»). Фрау Шмидт может забрать её у соседа. Утверждение верно (Richtig).',
    explanation_de: 'Das Paket wurde beim Nachbarn im ersten Stock hinterlegt.',
    vocabulary_notes: [
      { word: 'der Nachbar (-n)', translation: 'сосед' },
      { word: 'im ersten Stock', translation: 'на первом этаже (европейский 2-й этаж)' },
      { word: 'abgeben bei...', translation: 'оставить у...' }
    ]
  }
];
