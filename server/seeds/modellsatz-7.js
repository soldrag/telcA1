export const exam = {
  id: 'modellsatz-7',
  title: 'telc Deutsch A1 — Modellsatz 7',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Седьмой официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: помощь соседей в отпуске, осмотр квартиры, аренда транспорта и музыкальных инструментов, городские службы.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 7 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: Zettel von Susanne an Frau Müller (Aufgaben 1-2)
  {
    id: 'm7-q1',
    exam_id: 'modellsatz-7',
    teil: 1,
    question_number: 1,
    title: 'Zettel von Susanne an ihre Nachbarin',
    context_header: 'Notiz für: Frau Müller (Wohnung 3. OG links)\nVon: Susanne Keller\nDatum: 9. August',
    context_body: `Liebe Frau Müller,

wie gestern kurz besprochen, fahre ich morgen früh für zwei Wochen nach Italien in den Urlaub (vom 10. bis zum 24. August).

Könnten Sie bitte alle zwei bis drei Tage meine Tomaten und Blumen auf dem Balkon gießen und die Post aus dem Briefkasten holen?

Den Wohnungsschlüssel habe ich Ihnen in den Briefkasten geworfen. Als kleines Dankeschön bringe ich Ihnen feines Olivenöl aus der Toskana mit!

Herzlichen Dank für Ihre Hilfe und bis bald
Susanne Keller`,
    statement: 'Frau Müller soll in Susannes Urlaub die Blumen gießen.',
    correct_answer: 'richtig',
    clue_quote: 'Könnten Sie bitte alle zwei bis drei Tage meine Tomaten und Blumen auf dem Balkon gießen',
    explanation_ru: 'Сюзанна прямо просит соседку: «Könnten Sie bitte alle zwei bis drei Tage meine Tomaten und Blumen auf dem Balkon gießen» («Не могли бы вы каждые два-три дня поливать мои помидоры и цветы на балконе»). Утверждение верно (Richtig).',
    explanation_en: 'Susanne asks Frau Müller to water the tomatoes and flowers on her balcony while she is away (\'Könnten Sie bitte ... meine Tomaten und Blumen auf dem Balkon gießen\'). The statement is True.',
    explanation_de: 'Susanne bittet Frau Müller, die Blumen auf dem Balkon zu gießen.',
    vocabulary_notes: [
      { word: 'Blumen gießen', translation: 'поливать цветы' },
      { word: 'der Balkon', translation: 'балкон' },
      { word: 'der Briefkasten', translation: 'почтовый ящик' }
    ]
  },
  {
    id: 'm7-q2',
    exam_id: 'modellsatz-7',
    teil: 1,
    question_number: 2,
    title: 'Zettel von Susanne an ihre Nachbarin',
    context_header: 'Notiz für: Frau Müller (Wohnung 3. OG links)\nVon: Susanne Keller\nDatum: 9. August',
    context_body: `Liebe Frau Müller,

wie gestern kurz besprochen, fahre ich morgen früh für zwei Wochen nach Italien in den Urlaub (vom 10. bis zum 24. August).

Könnten Sie bitte alle zwei bis drei Tage meine Tomaten und Blumen auf dem Balkon gießen und die Post aus dem Briefkasten holen?

Den Wohnungsschlüssel habe ich Ihnen in den Briefkasten geworfen. Als kleines Dankeschön bringe ich Ihnen feines Olivenöl aus der Toskana mit!

Herzlichen Dank für Ihre Hilfe und bis bald
Susanne Keller`,
    statement: 'Susanne bleibt nur ein Wochenende in Italien.',
    correct_answer: 'falsch',
    clue_quote: 'fahre ich morgen früh für zwei Wochen nach Italien in den Urlaub (vom 10. bis zum 24. August).',
    explanation_ru: 'Сюзанна пишет, что уезжает на две недели («für zwei Wochen», с 10 по 24 августа), а не на один уикенд («ein Wochenende»). Утверждение неверно (Falsch).',
    explanation_en: 'Susanne writes that she is traveling to Italy for two weeks (\'für zwei Wochen\'), from August 10 to 24, not just for a weekend. The statement is False.',
    explanation_de: 'Susanne bleibt zwei Wochen in Italien, nicht nur ein Wochenende.',
    vocabulary_notes: [
      { word: 'zwei Wochen', translation: 'две недели' },
      { word: 'der Urlaub', translation: 'отпуск' },
      { word: 'das Wochenende', translation: 'выходные' }
    ]
  },

  // Text 2: Einladung zur Wohnungsbesichtigung (Aufgaben 3-5)
  {
    id: 'm7-q3',
    exam_id: 'modellsatz-7',
    teil: 1,
    question_number: 3,
    title: 'E-Mail der Immobilienverwaltung ImmoNord',
    context_header: 'Von: ImmoNord Hausverwaltung <service@immonord-hamburg.de>\nAn: Bewerber Herr Al-Mansur\nBetreff: Einladung zur Besichtigung — 2-Zimmer-Wohnung Goethestraße 4',
    context_body: `Sehr geehrter Herr Al-Mansur,

vielen Dank für Ihr Interesse an der 2-Zimmer-Wohnung in Hamburg-Altona.

Wir laden Sie herzlich zum Besichtigungstermin ein:
- Termin: Dienstag, 18. September, pünktlich um 17:30 Uhr
- Treffpunkt: Vor dem Hauseingang der Goethestraße 4 (bitte bei „Hausmeister Schmidt" klingeln)

Bitte bringen Sie folgende Papiere mit:
1. Eine Kopie von Ihrem Personalausweis oder Pass
2. Die letzten drei Gehaltsabrechnungen von Ihrer Arbeit

Wichtig: Haustiere (Hunde und Katzen) sind in diesem Haus leider nicht erlaubt.

Mit freundlichen Grüßen
Ihre Hausverwaltung ImmoNord`,
    statement: 'Interessenten müssen Nachweise über ihr Gehalt zum Termin mitbringen.',
    correct_answer: 'richtig',
    clue_quote: 'Die letzten drei Gehaltsabrechnungen von Ihrer Arbeit',
    explanation_ru: 'В письме указано принести с собой подтверждение зарплаты за последние три месяца («Die letzten drei Gehaltsabrechnungen von Ihrer Arbeit»). Утверждение верно (Richtig).',
    explanation_en: 'The viewing invitation requires applicants to bring their last three salary statements to the appointment (\'Die letzten drei Gehaltsabrechnungen von Ihrer Arbeit\'). The statement is True.',
    explanation_de: 'Gehaltsnachweise müssen zur Besichtigung mitgebracht werden.',
    vocabulary_notes: [
      { word: 'die Gehaltsabrechnung (-en)', translation: 'расчетный листок / справка о зарплате' },
      { word: 'die Papiere (pl.) / Unterlagen', translation: 'документы' },
      { word: 'die Besichtigung', translation: 'осмотр (квартиры)' }
    ]
  },
  {
    id: 'm7-q4',
    exam_id: 'modellsatz-7',
    teil: 1,
    question_number: 4,
    title: 'E-Mail der Immobilienverwaltung ImmoNord',
    context_header: 'Von: ImmoNord Hausverwaltung <service@immonord-hamburg.de>\nAn: Bewerber Herr Al-Mansur\nBetreff: Einladung zur Besichtigung — 2-Zimmer-Wohnung Goethestraße 4',
    context_body: `Sehr geehrter Herr Al-Mansur,

vielen Dank für Ihr Interesse an der 2-Zimmer-Wohnung in Hamburg-Altona.

Wir laden Sie herzlich zum Besichtigungstermin ein:
- Termin: Dienstag, 18. September, pünktlich um 17:30 Uhr
- Treffpunkt: Vor dem Hauseingang der Goethestraße 4 (bitte bei „Hausmeister Schmidt" klingeln)

Bitte bringen Sie folgende Papiere mit:
1. Eine Kopie von Ihrem Personalausweis oder Pass
2. Die letzten drei Gehaltsabrechnungen von Ihrer Arbeit

Wichtig: Haustiere (Hunde und Katzen) sind in diesem Haus leider nicht erlaubt.

Mit freundlichen Grüßen
Ihre Hausverwaltung ImmoNord`,
    statement: 'Die Besichtigung der Wohnung findet am Dienstagmorgen statt.',
    correct_answer: 'falsch',
    clue_quote: 'Termin: Dienstag, 18. September, pünktlich um 17:30 Uhr',
    explanation_ru: 'Осмотр назначен на вторник в 17:30 («Dienstag ... um 17:30 Uhr»). 17:30 — это вечер/вторая половина дня, а не утро («Dienstagmorgen»). Утверждение неверно (Falsch).',
    explanation_en: 'The viewing appointment is scheduled for Tuesday at 17:30 (\'Dienstag ... um 17:30 Uhr\'), which is late afternoon, not in the morning. The statement is False.',
    explanation_de: 'Der Termin ist um 17:30 Uhr am Nachmittag, nicht am Morgen.',
    vocabulary_notes: [
      { word: 'am Morgen / morgens', translation: 'утром' },
      { word: 'am Nachmittag / Nachmittags', translation: 'днем / после полудня' },
      { word: 'pünktlich', translation: 'вовремя / пунктуально' }
    ]
  },
  {
    id: 'm7-q5',
    exam_id: 'modellsatz-7',
    teil: 1,
    question_number: 5,
    title: 'E-Mail der Immobilienverwaltung ImmoNord',
    context_header: 'Von: ImmoNord Hausverwaltung <service@immonord-hamburg.de>\nAn: Bewerber Herr Al-Mansur\nBetreff: Einladung zur Besichtigung — 2-Zimmer-Wohnung Goethestraße 4',
    context_body: `Sehr geehrter Herr Al-Mansur,

vielen Dank für Ihr Interesse an der 2-Zimmer-Wohnung in Hamburg-Altona.

Wir laden Sie herzlich zum Besichtigungstermin ein:
- Termin: Dienstag, 18. September, pünktlich um 17:30 Uhr
- Treffpunkt: Vor dem Hauseingang der Goethestraße 4 (bitte bei „Hausmeister Schmidt" klingeln)

Bitte bringen Sie folgende Papiere mit:
1. Eine Kopie von Ihrem Personalausweis oder Pass
2. Die letzten drei Gehaltsabrechnungen von Ihrer Arbeit

Wichtig: Haustiere (Hunde und Katzen) sind in diesem Haus leider nicht erlaubt.

Mit freundlichen Grüßen
Ihre Hausverwaltung ImmoNord`,
    statement: 'Mieter dürfen in dieser Wohnung Hunde und Katzen halten.',
    correct_answer: 'falsch',
    clue_quote: 'Haustiere (Hunde und Katzen) sind in diesem Haus leider nicht erlaubt.',
    explanation_ru: 'В примечании прямо указано: домашние животные (собаки и кошки) в этом доме запрещены («Haustiere ... sind in diesem Haus leider nicht erlaubt»). Утверждение неверно (Falsch).',
    explanation_en: 'The text states that pets, specifically dogs and cats, are not permitted in the building (\'Haustiere (Hunde und Katzen) sind in diesem Haus leider nicht erlaubt\'). The statement is False.',
    explanation_de: 'Haustiere wie Hunde und Katzen sind verboten („nicht erlaubt").',
    vocabulary_notes: [
      { word: 'das Haustier (-e)', translation: 'домашнее животное' },
      { word: 'nicht erlaubt / verboten', translation: 'не разрешено / запрещено' },
      { word: 'die Katze (-n)', translation: 'кошка' }
    ]
  },

  // ==========================================
  // MODELLSATZ 7 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm7-q6',
    exam_id: 'modellsatz-7',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie möchten für Ihre Wohnung ein Klavier mieten und später eventuell kaufen (Mietkauf).',
    options_json: [
      {
        id: 'a',
        badge: 'www.klavierhaus-muenchen-miete.de',
        title: 'Klaviergalerie Stein: Klaviere mieten mit Kaufoption',
        text: 'Mieten Sie hochwertige Klaviere und E-Pianos schon ab 45 € im Monat! Die bezahlten Monatsmieten werden beim späteren Kauf zu 100% auf den Kaufpreis angerechnet.',
        details: 'Angebot: Klaviermiete mit Mietkauf-Option • Ab 45 €/Monat'
      },
      {
        id: 'b',
        badge: 'www.konzertfluegel-kauf-profis.de',
        title: 'ConcertPianos: Nur Direktverkauf von Konzertflügeln',
        text: 'Exklusive Konzertflügel für Opernhäuser, Theater und Pianisten ab 35.000 €. Ausschließlich Sofortkauf. Keine Vermietung an Privatpersonen, kein Mietkauf.',
        details: 'Angebot: Nur Sofortkauf ab 35.000 € • Keine Miete'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Klaviere mieten mit Kaufoption ... Die bezahlten Monatsmieten werden beim späteren Kauf zu 100% angerechnet.',
    explanation_ru: 'Вам нужно: 1) аренда пианино (Klavier mieten), 2) аренда с правом выкупа (später eventuell kaufen / Mietkauf). Вариант «b» продаёт только концертные рояли от 35.000 € без аренды («Keine Vermietung»). Вариант «a» предлагает аренду с зачетом всех платежей в покупку. Правильный ответ: a.',
    explanation_en: 'You want to rent a piano with an option to buy it later. Option a offers piano rentals where 100% of monthly rent payments are credited toward purchase, whereas option b only sells grand pianos outright and does not offer rentals or hire-purchase.',
    explanation_de: 'Gesucht wird ein Klavier zur Miete mit Kaufoption (Mietkauf). Anzeige a bietet genau das.',
    vocabulary_notes: [
      { word: 'das Klavier (-e)', translation: 'фортепиано / пианино' },
      { word: 'die Kaufoption / der Mietkauf', translation: 'право выкупа / аренда с выкупом' },
      { word: 'anrechnen', translation: 'засчитывать (в счет оплаты)' }
    ]
  },
  {
    id: 'm7-q7',
    exam_id: 'modellsatz-7',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie essen kein Fleisch und möchten am Wochenende in Stuttgart einen Kochkurs für vegetarische Gerichte besuchen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.bbq-steak-grillschule.de',
        title: 'MeatMaster: Die Grillschule für Fleischliebhaber',
        text: 'Lernen Sie das perfekte Grillen von Rindersteaks, Spareribs und Pulled Pork! Wochenend-Workshops für echte Fleisch-Fans. Vegetarische Alternativen bieten wir nicht an.',
        details: 'Thema: Grillen von Fleisch • Keine vegetarischen Gerichte'
      },
      {
        id: 'b',
        badge: 'www.veggie-kochkurs-stuttgart.de',
        title: 'Kochschule GrünGenuss: Vegetarische Küche am Samstag',
        text: 'Kreativ, gesund und ohne Fleisch kochen! Unser beliebter Samstags-Workshop (10:00–14:00 Uhr) zeigt leckere mediterrane und asiatische Gemüsegerichte. Frische Bio-Zutaten inklusive.',
        details: 'Thema: 100% Vegetarisch • Samstag 10–14 Uhr in Stuttgart'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Vegetarische Küche am Samstag ... ohne Fleisch kochen! Unser beliebter Samstags-Workshop ... leckere Gemüsegerichte',
    explanation_ru: 'Критерии: 1) без мяса / вегетарианский (vegetarische Gerichte, kein Fleisch), 2) в выходные (am Samstag). Вариант «a» специализируется на жарке стейков («vegetarische Alternativen bieten wir nicht an»). Вариант «b» — 100% вегетарианский курс по субботам в Штутгарте. Правильный ответ: b.',
    explanation_en: 'You are looking for a weekend vegetarian cooking class. Option b offers a Saturday workshop dedicated to creative meatless cuisine, whereas option a is a barbecue school for meat lovers that does not offer vegetarian options.',
    explanation_de: 'Gesucht ist ein vegetarischer Kochkurs am Wochenende. Anzeige b kocht vegetarisch am Samstag.',
    vocabulary_notes: [
      { word: 'vegetarisch / ohne Fleisch', translation: 'вегетарианский / без мяса' },
      { word: 'der Kochkurs', translation: 'кулинарный курс' },
      { word: 'die Zutat (-en)', translation: 'ингредиент' }
    ]
  },
  {
    id: 'm7-q8',
    exam_id: 'modellsatz-7',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie ziehen am Samstag um und möchten einen großen Transporter (Sprinter) für einen ganzen Tag mieten.',
    options_json: [
      {
        id: 'a',
        badge: 'www.transporter-verleih-umzug.de',
        title: 'MietTransporter24: LKW & Umzugswagen mieten',
        text: 'Ideal für den Umzug! Geräumige Mercedes Sprinter und Transporter mit Führerscheinklasse B mieten. Tagespauschale für Samstag nur 79 € inkl. 100 Freikilometern und Sackkarre.',
        details: 'Fahrzeuge: Transporter & Sprinter • Ganztägig am Samstag'
      },
      {
        id: 'b',
        badge: 'www.city-roller-verleih.de',
        title: 'E-Scooter & City-Bikes Verleihstation',
        text: 'Flitzen Sie emissionsfrei durch die Innenstadt! Mieten Sie wendige Elektroroller und Tourenräder für einen sonnigen Ausflug. Keine Autos oder Transporter im Fuhrpark.',
        details: 'Fahrzeuge: Nur E-Scooter & Fahrräder • Keine Transporter'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Geräumige Mercedes Sprinter und Transporter mit Führerscheinklasse B mieten. Tagespauschale für Samstag nur 79 €',
    explanation_ru: 'Вам нужен грузовой фургон на день субботы для переезда (Transporter für einen Umzug am Samstag). Вариант «b» сдает только самокаты и велосипеды. Вариант «a» сдает вместительные спринтеры и фургоны на субботу по суточному тарифу. Правильный ответ: a.',
    explanation_en: 'You need to rent a large van (Sprinter) for a full Saturday to move house. Option a rents spacious Mercedes Sprinters with a special Saturday day rate, whereas option b only rents e-scooters and city bikes.',
    explanation_de: 'Gesucht wird ein Transporter für einen Umzug am Samstag. Anzeige a vermietet Transporter und Sprinter.',
    vocabulary_notes: [
      { word: 'der Transporter / Umzugswagen', translation: 'грузовой фургон для переезда' },
      { word: 'die Tagespauschale', translation: 'суточный фиксированный тариф' },
      { word: 'geräumig', translation: 'просторный / вместительный' }
    ]
  },
  {
    id: 'm7-q9',
    exam_id: 'modellsatz-7',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten ein Ferienhaus an der Ostsee mit eingezäuntem Garten mieten, in dem Ihr Hund herzlich willkommen ist.',
    options_json: [
      {
        id: 'a',
        badge: 'www.ostsee-urlaub-mit-hund.de',
        title: 'Ferienhäuser Seeblick: Urlaub mit Vierbeiner',
        text: 'Gemütliche Reetdach-Ferienhäuser nur 200 m vom Ostseestrand! Großes Grundstück mit sicher eingezäuntem Garten. Hunde aller Rassen sind bei uns herzlich willkommen (ohne Aufpreis).',
        details: 'Lage: Ostsee • Garten eingezäunt • Hunde willkommen'
      },
      {
        id: 'b',
        badge: 'www.ostsee-allergiker-ferien.de',
        title: 'Villa Meeresbrise: Zertifizierte Allergiker-Apartments',
        text: 'Reine und allergenfreie Ferienwohnungen an der Ostsee. Spezielle Luftfilter und Bettwäsche. Haustiere wie Hunde und Katzen sind im gesamten Haus strengstens verboten!',
        details: 'Konzept: Nur für Allergiker • Haustiere strengstens verboten'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Ferienhäuser Seeblick: Urlaub mit Vierbeiner ... sicher eingezäuntem Garten. Hunde aller Rassen sind bei uns herzlich willkommen',
    explanation_ru: 'Критерии: 1) домик у Балтийского моря (an der Ostsee), 2) огороженный сад (eingezäunter Garten), 3) с собакой (Hund willkommen). В варианте «b» (для аллергиков) животные категорически запрещены («strengstens verboten»). Вариант «a» предлагает огороженный участок у моря, где собаки приветствуются. Правильный ответ: a.',
    explanation_en: 'You want a holiday home by the Baltic Sea with a fenced garden that welcomes your dog. Option a offers holiday homes with securely fenced gardens where dogs are welcome, whereas option b strictly prohibits pets.',
    explanation_de: 'Gesucht ist ein Ferienhaus an der Ostsee mit Garten, wo Hunde erlaubt sind. Anzeige a passt perfekt.',
    vocabulary_notes: [
      { word: 'der Vierbeiner / Hund', translation: 'четвероногий друг / собака' },
      { word: 'eingezäunter Garten', translation: 'огороженный забором сад' },
      { word: 'herzlich willkommen', translation: 'добро пожаловать' }
    ]
  },
  {
    id: 'm7-q10',
    exam_id: 'modellsatz-7',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie suchen einen Nebenjob als Servicekraft / Kellner im Café am Wochenende (Minijob auf 538-Euro-Basis).',
    options_json: [
      {
        id: 'a',
        badge: 'www.sterne-restaurant-jobs.de',
        title: 'Gourmet-Restaurant „Kaiserhof": Küchenchef gesucht',
        text: 'Wir suchen einen festangestellten Küchenchef (m/w/d) in Vollzeit (40 Std./Woche). Abgeschlossene Ausbildung als Koch und mehrjährige Erfahrung in der Sternegastronomie erforderlich.',
        details: 'Stelle: Küchenchef Vollzeit (40 Std.) • Keine Minijobs'
      },
      {
        id: 'b',
        badge: 'www.cafe-glockenspiel-jobs.de',
        title: 'Café Glockenspiel: Aushilfe im Service gesucht',
        text: 'Verstärke unser junges Team! Wir suchen freundliche Servicekräfte für Samstage und Sonntage. Kuchen und Kaffee servieren, Bestellungen aufnehmen. Minijob (538 €), ideal für Studenten.',
        details: 'Stelle: Kellner/Service am Wochenende • Minijob (538 €)'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Café Glockenspiel: Aushilfe im Service gesucht ... freundliche Servicekräfte für Samstage und Sonntage ... Minijob (538 €)',
    explanation_ru: 'Вам нужна: 1) подработка официантом в кафе (Servicekraft im Café), 2) на выходных (am Wochenende), 3) мини-джоб (Minijob 538 €). Вариант «a» ищет шеф-повара на полный день (40 часов). Вариант «b» ищет официантов в кафе по субботам и воскресеньям на мини-джоб 538 €. Правильный ответ: b.',
    explanation_en: 'You are looking for a weekend minijob as a café server. Option b seeks friendly weekend service staff for a 538-euro minijob, whereas option a is looking for a full-time head chef.',
    explanation_de: 'Gesucht wird ein Wochenend-Minijob im Service eines Cafés. Anzeige b sucht Servicekräfte für Sa & So als Minijob.',
    vocabulary_notes: [
      { word: 'die Aushilfe / der Minijob', translation: 'подсобный работник / подработка с лимитом дохода' },
      { word: 'die Servicekraft / der Kellner', translation: 'официант / работник зала' },
      { word: 'in Vollzeit', translation: 'на полную ставку' }
    ]
  },

  // ==========================================
  // MODELLSATZ 7 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm7-q11',
    exam_id: 'modellsatz-7',
    teil: 3,
    question_number: 11,
    title: 'Schild am Eingang des Historischen Museums',
    context_header: 'Städtisches Museum für Stadtgeschichte',
    context_body: `Öffnungszeiten und Eintrittspreise:

Dienstag bis Sonntag: 10:00 – 18:00 Uhr
Montags bleibt das Museum grundsätzlich geschlossen.

Eintritt: Erwachsene 8 €, Ermäßigt 4 €.
Jeden ersten Freitag im Monat ab 15:00 Uhr ist der Eintritt für alle Besucher frei!`,
    statement: 'Am ersten Freitag im Monat muss man ab 15:00 Uhr keinen Eintritt bezahlen.',
    correct_answer: 'richtig',
    clue_quote: 'Jeden ersten Freitag im Monat ab 15:00 Uhr ist der Eintritt für alle Besucher frei!',
    explanation_ru: 'Фраза «Eintritt frei» означает «вход бесплатный». По первым пятницам месяца после 15:00 вход для всех бесплатный, платить не требуется. Утверждение верно (Richtig).',
    explanation_en: 'The notice announces that admission is free for all visitors every first Friday of the month starting at 15:00 (\'Eintritt für alle Besucher frei\'). The statement is True.',
    explanation_de: 'Ab 15:00 Uhr am ersten Freitag im Monat ist der Eintritt frei (kostenlos).',
    vocabulary_notes: [
      { word: 'Eintritt frei', translation: 'вход бесплатный' },
      { word: 'grundsätzlich geschlossen', translation: 'принципиально / всегда закрыто' },
      { word: 'ermäßigt', translation: 'по льготной цене' }
    ]
  },
  {
    id: 'm7-q12',
    exam_id: 'modellsatz-7',
    teil: 3,
    question_number: 12,
    title: 'Hinweisschild an der Automatentankstelle',
    context_header: 'Aral Tankstelle Westpark — Nachtdienst',
    context_body: `Liebe Kunden,

unser Verkaufsraum schließt um 22:00 Uhr.

Von 22:00 bis 06:00 Uhr morgens bedienen wir Sie gerne an unserem Nachtschalter rechts neben der Tür.

Zahlung an der Nachtkasse mit allen gängigen Karten oder passendem Bargeld.`,
    statement: 'Nachts zwischen 22:00 und 06:00 Uhr kann man am Nachtschalter bezahlen.',
    correct_answer: 'richtig',
    clue_quote: 'Von 22:00 bis 06:00 Uhr morgens bedienen wir Sie gerne an unserem Nachtschalter rechts neben der Tür.',
    explanation_ru: 'В объявлении написано: торговый зал закрывается в 22:00, но с 22:00 до 06:00 клиентов обслуживают в ночном окне справа от двери («bedienen wir Sie gerne an unserem Nachtschalter»). Утверждение верно (Richtig).',
    explanation_en: 'The sign states that between 22:00 and 06:00 customers are served and pay at the night window next to the entrance (\'bedienen wir Sie gerne an unserem Nachtschalter\'). The statement is True.',
    explanation_de: 'Nachts erfolgt die Bezahlung am Nachtschalter.',
    vocabulary_notes: [
      { word: 'der Nachtschalter', translation: 'ночное окно обслуживания' },
      { word: 'der Verkaufsraum', translation: 'торговый зал' },
      { word: 'bedienen', translation: 'обслуживать' }
    ]
  },
  {
    id: 'm7-q13',
    exam_id: 'modellsatz-7',
    teil: 3,
    question_number: 13,
    title: 'Aushang am Schwarzen Brett im Hausflur',
    context_header: 'Hausverwaltung — Fundsache',
    context_body: `Schlüsselbund gefunden!

Im Fahrradkeller wurde am Dienstagabend ein Schlüsselbund mit drei Schlüsseln und einem roten Anhänger („Berlin") gefunden.

Der Eigentümer kann den Schlüssel beim Hausmeister (Herr Krause, EG links) gegen Nachweis abholen.`,
    statement: 'Der gefundene Schlüsselbund liegt beim Hausmeister.',
    correct_answer: 'richtig',
    clue_quote: 'Der Eigentümer kann den Schlüssel beim Hausmeister (Herr Krause, EG links) ... abholen.',
    explanation_ru: 'В объявлении о находке сказано, что владелец может забрать найденные ключи у хаусмастера господина Краузе на первом этаже («beim Hausmeister abholen»). Утверждение верно (Richtig).',
    explanation_en: 'The lost-and-found notice tells the owner to collect the found bunch of keys from the caretaker Mr. Krause (\'beim Hausmeister ... abholen\'). The statement is True.',
    explanation_de: 'Die Schlüssel können beim Hausmeister abgeholt werden.',
    vocabulary_notes: [
      { word: 'der Schlüsselbund', translation: 'связка ключей' },
      { word: 'der Hausmeister', translation: 'управляющий домом / комендант' },
      { word: 'die Fundsache', translation: 'найденная вещь' }
    ]
  },
  {
    id: 'm7-q14',
    exam_id: 'modellsatz-7',
    teil: 3,
    question_number: 14,
    title: 'Piktogramm und Hinweistext in der S-Bahn',
    context_header: 'S-Bahn Berlin — Beförderungsbedingungen',
    context_body: `Bitte freihalten!

Sitze sind für Fahrgäste da.
Bitte stellen Sie Ihr Reisegepäck, Einkaufstaschen und schmutzige Rucksäcke nicht auf die Sitzpolster, sondern auf den Boden oder in die Gepäckablage.`,
    statement: 'Fahrgäste dürfen ihre Koffer auf die Sitze stellen.',
    correct_answer: 'falsch',
    clue_quote: 'Bitte stellen Sie Ihr Reisegepäck ... nicht auf die Sitzpolster, sondern auf den Boden oder in die Gepäckablage.',
    explanation_ru: 'Правила проезда в электричке запрещают ставить чемоданы и сумки на сиденья: «stellen Sie Ihr Reisegepäck ... nicht auf die Sitzpolster» (ставьте вещи на пол или багажную полку, но не на сиденья). Утверждение неверно (Falsch).',
    explanation_en: 'Passengers are instructed not to place luggage on the seats, but rather on the floor or luggage racks (\'nicht auf die Sitzpolster\'). The statement is False.',
    explanation_de: 'Gepäck auf die Sitze zu stellen ist nicht erlaubt.',
    vocabulary_notes: [
      { word: 'das Reisegepäck', translation: 'багаж' },
      { word: 'die Sitzpolster / Sitze', translation: 'сиденья' },
      { word: 'die Gepäckablage', translation: 'багажная полка' }
    ]
  },
  {
    id: 'm7-q15',
    exam_id: 'modellsatz-7',
    teil: 3,
    question_number: 15,
    title: 'Hinweisschild im Schaufenster einer Apotheke',
    context_header: 'Löwen-Apotheke — Notdienst-Hinweis',
    context_body: `Liebe Kundinnen und Kunden,

unsere Apotheke hat heute ab 18:30 Uhr geschlossen.

Den heutigen Nacht- und Notdienst übernimmt:
Engel-Apotheke
Bahnhofstraße 22, 50667 Köln
Telefon: 0221 / 44 55 66
(24 Stunden geöffnet bis morgen früh 08:00 Uhr)`,
    statement: 'Die Löwen-Apotheke ist heute die ganze Nacht geöffnet.',
    correct_answer: 'falsch',
    clue_quote: 'unsere Apotheke hat heute ab 18:30 Uhr geschlossen. Den heutigen Nacht- und Notdienst übernimmt: Engel-Apotheke',
    explanation_ru: 'В объявлении написано: «Львиная аптека» закрывается сегодня в 18:30 («hat ab 18:30 Uhr geschlossen»), а ночное дежурство несёт другая аптека — «Engel-Apotheke». Утверждение, что эта аптека открыта всю ночь, неверно (Falsch).',
    explanation_en: 'The notice states that the Löwen-Apotheke closes at 18:30 (\'hat heute ab 18:30 Uhr geschlossen\') and night emergency duty is handled by the Engel-Apotheke instead. The statement is False.',
    explanation_de: 'Die Löwen-Apotheke ist ab 18:30 Uhr geschlossen. Den Notdienst hat die Engel-Apotheke.',
    vocabulary_notes: [
      { word: 'die Apotheke (-n)', translation: 'аптека' },
      { word: 'der Notdienst', translation: 'ночное дежурство' },
      { word: 'übernehmen', translation: 'брать на себя' }
    ]
  }
];
