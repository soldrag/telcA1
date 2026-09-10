export const exam = {
  id: 'modellsatz-10',
  title: 'telc Deutsch A1 — Modellsatz 10',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Десятый официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: футбольный вечер дома, скалодром, репетиторство, ремонт ноутбуков и правила в гостинице и на вокзале.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 10 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: E-Mail von Martin an Florian (Aufgaben 1-2)
  {
    id: 'm10-q1',
    exam_id: 'modellsatz-10',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Martin an Florian',
    context_header: 'Von: Martin Seidel <m.seidel@webmail.de>\nAn: Florian Bauer <florian.b@gmx.de>\nDatum: 19. Oktober, 16:20 Uhr\nBetreff: Fußballabend am Samstag bei mir',
    context_body: `Hallo Florian,

am Samstag ist das große Champions-League-Finale! Ich habe einen neuen großen Fernseher im Wohnzimmer und lade ein paar Freunde zu mir nach Hause ein.

Das Spiel beginnt um 20:45 Uhr, aber kommt am besten schon ab 19:30 Uhr vorbei. Ich bestelle für alle große Pizzen beim Italiener und bezahle das Essen als Geburtstagsgeschenk für euch.

Könntest du bitte ein paar Tüten Kartoffelchips oder Erdnüsse und ein Eis als Dessert mitbringen? Getränke habe ich schon im Kühlschrank.

Sag mir bitte bis Freitag Bescheid!

Bis Samstag
Martin`,
    statement: 'Martin möchte am Samstag mit Freunden das Fußballspiel gucken.',
    correct_answer: 'richtig',
    clue_quote: 'am Samstag ist das große Champions-League-Finale! ... lade ein paar Freunde zu mir nach Hause ein.',
    explanation_ru: 'Мартин пишет, что в субботу финал Лиги Чемпионов, и приглашает друзей к себе домой посмотреть игру на большом телевизоре («lade ein paar Freunde zu mir nach Hause ein»). Утверждение верно (Richtig).',
    explanation_de: 'Martin lädt Freunde zum gemeinsamen Fußballschauen am Samstag ein.',
    vocabulary_notes: [
      { word: 'das Fußballspiel / Finale', translation: 'футбольный матч / финал' },
      { word: 'einladen', translation: 'приглашать' },
      { word: 'das Wohnzimmer', translation: 'гостиная' }
    ]
  },
  {
    id: 'm10-q2',
    exam_id: 'modellsatz-10',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Martin an Florian',
    context_header: 'Von: Martin Seidel <m.seidel@webmail.de>\nAn: Florian Bauer <florian.b@gmx.de>\nDatum: 19. Oktober, 16:20 Uhr\nBetreff: Fußballabend am Samstag bei mir',
    context_body: `Hallo Florian,

am Samstag ist das große Champions-League-Finale! Ich habe einen neuen großen Fernseher im Wohnzimmer und lade ein paar Freunde zu mir nach Hause ein.

Das Spiel beginnt um 20:45 Uhr, aber kommt am besten schon ab 19:30 Uhr vorbei. Ich bestelle für alle große Pizzen beim Italiener und bezahle das Essen als Geburtstagsgeschenk für euch.

Könntest du bitte ein paar Tüten Kartoffelchips oder Erdnüsse und ein Eis als Dessert mitbringen? Getränke habe ich schon im Kühlschrank.

Sag mir bitte bis Freitag Bescheid!

Bis Samstag
Martin`,
    statement: 'Florian soll Geld für die Pizza mitbringen.',
    correct_answer: 'falsch',
    clue_quote: 'Ich bestelle für alle große Pizzen beim Italiener und bezahle das Essen als Geburtstagsgeschenk für euch.',
    explanation_ru: 'Мартин прямо говорит, что сам заказывает и оплачивает пиццу для всех в честь своего дня рождения («und bezahle das Essen als Geburtstagsgeschenk für euch»). Флориана просят принести лишь чипсы и мороженое. Платить за пиццу не нужно. Утверждение неверно (Falsch).',
    explanation_de: 'Martin bezahlt die Pizzen komplett selbst.',
    vocabulary_notes: [
      { word: 'bezahlen', translation: 'оплачивать' },
      { word: 'das Geschenk', translation: 'подарок' },
      { word: 'mitbringen', translation: 'приносить с собой' }
    ]
  },

  // Text 2: Sport- und Kletterarena (Aufgaben 3-5)
  {
    id: 'm10-q3',
    exam_id: 'modellsatz-10',
    teil: 1,
    question_number: 3,
    title: 'Information der Sport- und Kletterarena',
    context_header: 'SportArena Stuttgart — Kletterhalle & Bouldern',
    context_body: `Herzlich willkommen in der SportArena!

Öffnungszeiten:
Täglich von 10:00 bis 22:30 Uhr (auch an Sonn- und Feiertagen).

Sicherheitshinweise für neue Klettergäste:
Bevor Sie zum ersten Mal an unseren hohen Seilwänden klettern, müssen alle Personen an einer 15-minütigen Sicherheitsunterweisung durch unsere Trainer teilnehmen. Diese Einweisung findet zu jeder vollen Stunde statt und ist kostenlos.

Ausrüstung und Alter:
Passende Kletterschuhe und Sicherungsgurte können Sie für 5 € Leihgebühr an der Kasse mieten. Kinder unter 14 Jahren dürfen die Kletterhalle nur in Begleitung einer volljährigen Aufsichtsperson betreten.

Viel Spaß beim Klettern wünscht
Ihr Trainerteam`,
    statement: 'Neue Kletterer müssen vor dem Klettern an einer kurzen Sicherheitseinweisung teilnehmen.',
    correct_answer: 'richtig',
    clue_quote: 'Bevor Sie zum ersten Mal an unseren hohen Seilwänden klettern, müssen alle Personen an einer 15-minütigen Sicherheitsunterweisung ... teilnehmen.',
    explanation_ru: 'В правилах безопасности написано: перед первым восхождением все новички обязаны пройти 15-минутный инструктаж по безопасности («müssen ... an einer 15-minütigen Sicherheitsunterweisung teilnehmen»). Утверждение верно (Richtig).',
    explanation_de: 'Eine 15-minütige Sicherheitsunterweisung ist für neue Kletterer Pflicht.',
    vocabulary_notes: [
      { word: 'die Sicherheitsunterweisung / Einweisung', translation: 'инструктаж по безопасности' },
      { word: 'teilnehmen müssen', translation: 'обязан принять участие' },
      { word: 'zum ersten Mal', translation: 'в первый раз' }
    ]
  },
  {
    id: 'm10-q4',
    exam_id: 'modellsatz-10',
    teil: 1,
    question_number: 4,
    title: 'Information der Sport- und Kletterarena',
    context_header: 'SportArena Stuttgart — Kletterhalle & Bouldern',
    context_body: `Herzlich willkommen in der SportArena!

Öffnungszeiten:
Täglich von 10:00 bis 22:30 Uhr (auch an Sonn- und Feiertagen).

Sicherheitshinweise für neue Klettergäste:
Bevor Sie zum ersten Mal an unseren hohen Seilwänden klettern, müssen alle Personen an einer 15-minütigen Sicherheitsunterweisung durch unsere Trainer teilnehmen. Diese Einweisung findet zu jeder vollen Stunde statt und ist kostenlos.

Ausrüstung und Alter:
Passende Kletterschuhe und Sicherungsgurte können Sie für 5 € Leihgebühr an der Kasse mieten. Kinder unter 14 Jahren dürfen die Kletterhalle nur in Begleitung einer volljährigen Aufsichtsperson betreten.

Viel Spaß beim Klettern wünscht
Ihr Trainerteam`,
    statement: 'Kinder unter 14 Jahren dürfen ganz ohne Erwachsene in die Halle.',
    correct_answer: 'falsch',
    clue_quote: 'Kinder unter 14 Jahren dürfen die Kletterhalle nur in Begleitung einer volljährigen Aufsichtsperson betreten.',
    explanation_ru: 'Правила четко гласят: детям до 14 лет разрешено входить только в сопровождении совершеннолетнего сопровождающего («nur in Begleitung einer volljährigen Aufsichtsperson»). Одним без взрослых находиться в зале нельзя. Утверждение неверно (Falsch).',
    explanation_de: 'Kinder unter 14 Jahren dürfen nur mit einer volljährigen Begleitperson in die Halle.',
    vocabulary_notes: [
      { word: 'in Begleitung', translation: 'в сопровождении' },
      { word: 'volljährig', translation: 'совершеннолетний (18+)' },
      { word: 'die Aufsichtsperson', translation: 'ответственное сопровождающее лицо' }
    ]
  },
  {
    id: 'm10-q5',
    exam_id: 'modellsatz-10',
    teil: 1,
    question_number: 5,
    title: 'Information der Sport- und Kletterarena',
    context_header: 'SportArena Stuttgart — Kletterhalle & Bouldern',
    context_body: `Herzlich willkommen in der SportArena!

Öffnungszeiten:
Täglich von 10:00 bis 22:30 Uhr (auch an Sonn- und Feiertagen).

Sicherheitshinweise für neue Klettergäste:
Bevor Sie zum ersten Mal an unseren hohen Seilwänden klettern, müssen alle Personen an einer 15-minütigen Sicherheitsunterweisung durch unsere Trainer teilnehmen. Diese Einweisung findet zu jeder vollen Stunde statt und ist kostenlos.

Ausrüstung und Alter:
Passende Kletterschuhe und Sicherungsgurte können Sie für 5 € Leihgebühr an der Kasse mieten. Kinder unter 14 Jahren dürfen die Kletterhalle nur in Begleitung einer volljährigen Aufsichtsperson betreten.

Viel Spaß beim Klettern wünscht
Ihr Trainerteam`,
    statement: 'Man kann Kletterschuhe gegen eine Gebühr an der Kasse leihen.',
    correct_answer: 'richtig',
    clue_quote: 'Passende Kletterschuhe und Sicherungsgurte können Sie für 5 € Leihgebühr an der Kasse mieten.',
    explanation_ru: 'В тексте прямо указано: специальную обувь и страховочные пояса можно арендовать на кассе за 5 € («für 5 € Leihgebühr an der Kasse mieten»). Утверждение верно (Richtig).',
    explanation_de: 'Kletterschuhe können für 5 € Leihgebühr gemietet werden.',
    vocabulary_notes: [
      { word: 'leihen / mieten', translation: 'брать напрокат / арендовать' },
      { word: 'die Leihgebühr', translation: 'плата за прокат' },
      { word: 'die Kletterschuhe (pl.)', translation: 'обувь для скалолазания' }
    ]
  },

  // ==========================================
  // MODELLSATZ 10 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm10-q6',
    exam_id: 'modellsatz-10',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Ihr 12-jähriger Sohn geht in die 6. Klasse und braucht wöchentliche Nachhilfe in Mathematik bei Ihnen zu Hause.',
    options_json: [
      {
        id: 'a',
        badge: 'www.uni-mathe-vorlesung.de',
        title: 'Akademie für Höhere Mathematik & Quantenphysik',
        text: 'Vorbereitungskurse auf Hochschulprüfungen für Physik- und Ingenieurstudenten. Lineare Algebra und Differentialgleichungen. Kein Schulunterricht für Kinder oder Jugendliche.',
        details: 'Niveau: Nur Universitäts-Niveau • Keine Schülernachhilfe'
      },
      {
        id: 'b',
        badge: 'www.schueler-nachhilfe-zuhause.de',
        title: 'LernFreude: Private Schüler-Nachhilfe zu Hause',
        text: 'Geduldige Nachhilfelehrer für alle Schulfächer (Klasse 1 bis 10)! Individuelle Mathe-Förderung für Realschüler und Gymnasiasten direkt bei Ihnen am Schreibtisch zu Hause.',
        details: 'Zielgruppe: Schüler (Klasse 1–10) • Mathe-Nachhilfe zu Hause'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'LernFreude: Private Schüler-Nachhilfe zu Hause ... Individuelle Mathe-Förderung für Realschüler und Gymnasiasten direkt bei Ihnen am Schreibtisch zu Hause.',
    explanation_ru: 'Вам нужен: 1) репетитор по математике для школьника 6 класса (Schüler, 6. Klasse, Mathe-Nachhilfe), 2) на дому (bei Ihnen zu Hause). Вариант «a» — высшая математика для студентов вузов («Kein Schulunterricht für Kinder»). Вариант «b» предлагает репетитора по математике для школьников 1-10 классов прямо дома. Правильный ответ: b.',
    explanation_de: 'Gesucht ist Mathe-Nachhilfe für die 6. Klasse zu Hause. Anzeige b bietet Schülernachhilfe für Klassen 1-10 zu Hause an.',
    vocabulary_notes: [
      { word: 'die Nachhilfe', translation: 'репетиторство / дополнительные занятия' },
      { word: 'der Schüler / die Klasse', translation: 'школьник / класс' },
      { word: 'zu Hause', translation: 'дома' }
    ]
  },
  {
    id: 'm10-q7',
    exam_id: 'modellsatz-10',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Der Akku Ihres Arbeitslaptops ist kaputt. Sie suchen eine Werkstatt, die den Akku noch heute austauscht.',
    options_json: [
      {
        id: 'a',
        badge: 'www.pc-laptop-express-service.de',
        title: 'PC & Notebook Doc: Sofort-Reparatur am selben Tag',
        text: 'Schneller Akku- und Displaytausch für alle gängigen Laptops (Apple, Lenovo, HP, Dell). Akkuwechsel innerhalb von 2 Stunden in unserer Werkstatt im Stadtzentrum. Ohne Termin.',
        details: 'Service: Laptop-Akkutausch innerhalb 2h noch heute • Ohne Termin'
      },
      {
        id: 'b',
        badge: 'www.waschmaschinen-reparatur-notruf.de',
        title: 'Kältegeräte & Waschmaschinen Kundendienst',
        text: 'Vor-Ort-Reparatur von Kühlschränken, Herden, Trocknern und Geschirrspülern bekannter Haushaltsmarken. Wir reparieren keine Computer, Handys oder IT-Geräte.',
        details: 'Geräte: Nur weiße Ware (Waschmaschinen) • Keine Laptops'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'PC & Notebook Doc: Sofort-Reparatur am selben Tag ... Akkuwechsel innerhalb von 2 Stunden in unserer Werkstatt',
    explanation_ru: 'Вам нужно: 1) замена аккумулятора ноутбука (Laptop-Akku defekt), 2) срочно в тот же день (noch heute / Sofort-Reparatur). Вариант «b» ремонтирует только стиральные машины и холодильники. Вариант «a» меняет батареи ноутбуков за 2 часа прямо в день обращения. Правильный ответ: a.',
    explanation_de: 'Gesucht wird ein schneller Akkutausch für einen Laptop am selben Tag. Anzeige a tauscht Laptop-Akkus in 2 Stunden.',
    vocabulary_notes: [
      { word: 'der Akkutausch / Akkuwechsel', translation: 'замена аккумулятора' },
      { word: 'am selben Tag', translation: 'в тот же день' },
      { word: 'austauschen / wechseln', translation: 'заменять / менять' }
    ]
  },
  {
    id: 'm10-q8',
    exam_id: 'modellsatz-10',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie möchten im Urlaub in Bayern mit dem Zelt campen und suchen einen Platz am See mit Tretbootverleih und Angelmöglichkeit.',
    options_json: [
      {
        id: 'a',
        badge: 'www.luxus-alpen-palace.de',
        title: 'Alpenresort König Ludwig — 5-Sterne-Wellness',
        text: 'Elegantes Schlosshotel mit Suiten und Gourmetrestaurant am Fuße der Berge. Champagner-Frühstück und Spa. Kein Seezugang, keine Campingplätze oder Zeltwiesen auf dem Areal.',
        details: 'Konzept: 5-Sterne-Luxushotel • Kein Camping, kein See'
      },
      {
        id: 'b',
        badge: 'www.seecamping-bayern-natur.de',
        title: 'SeeCamping Chiemgau: Naturparadies direkt am Badesee',
        text: 'Zeltplätze direkt am Ufer! Ruhige Stellplätze im Grünen, eigener Tret- und Ruderbootverleih sowie wunderschöne Angelplätze mit Gästekarte. Sanitärgebäude und Kiosk vorhanden.',
        details: 'Angebot: Camping am See • Tretbootverleih & Angelplätze'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'SeeCamping Chiemgau: Naturparadies direkt am Badesee ... Zeltplätze direkt am Ufer! ... Tret- und Ruderbootverleih sowie wunderschöne Angelplätze',
    explanation_ru: 'Критерии: 1) кемпинг с палаткой в Баварии (in Bayern mit dem Zelt campen), 2) на берегу озера (am See), 3) с прокатом лодок и рыбалкой (Tretbootverleih, Angelmöglichkeit). Вариант «a» — пятизвездочный отель без кемпинга и озера. Вариант «b» — кемпинг на озере с лодками и рыбалкой. Правильный ответ: b.',
    explanation_de: 'Gesucht ist ein Campingplatz am See in Bayern mit Bootsverleih und Angeln. Anzeige b bietet alles.',
    vocabulary_notes: [
      { word: 'der Campingplatz / campen', translation: 'кемпинг / отдыхать в кемпинге' },
      { word: 'der Bootsverleih', translation: 'прокат лодок' },
      { word: 'die Angelplätze / angeln', translation: 'места для рыбалки / рыбачить' }
    ]
  },
  {
    id: 'm10-q9',
    exam_id: 'modellsatz-10',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie machen Ihren Führerschein und müssen am Samstag einen offiziellen Erste-Hilfe-Kurs absolvieren.',
    options_json: [
      {
        id: 'a',
        badge: 'www.erste-hilfe-fuehrerschein-sa.de',
        title: 'NotfallSchulung: Erste Hilfe für den Führerschein',
        text: 'Anerkannter Erste-Hilfe-Kurs für alle Führerscheinklassen (PKW und Motorrad)! Jeden Samstag von 09:00 bis 16:30 Uhr. Amtliche Bescheinigung und Sehtest direkt vor Ort mitnehmen.',
        details: 'Kurs: Erste Hilfe Führerschein • Jeden Samstag • Mit Sehtest'
      },
      {
        id: 'b',
        badge: 'www.fachfortbildung-notfallmedizin.de',
        title: 'Akademie für Notärzte und Rettungssanitäter',
        text: 'Fortbildungskurse für Mediziner und Rettungsdienstpersonal. Intensivtraining Notfallchirurgie nur werktags von montags bis mittwochs. Nicht für Führerscheinbewerber zugelassen.',
        details: 'Zielgruppe: Nur Notärzte & Sanitäter • Nicht für Führerschein'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'NotfallSchulung: Erste Hilfe für den Führerschein ... Jeden Samstag von 09:00 bis 16:30 Uhr. Amtliche Bescheinigung direkt vor Ort',
    explanation_ru: 'Вам нужен: 1) курс первой помощи для водительских прав (Erste-Hilfe-Kurs für den Führerschein), 2) в субботу (am Samstag). Вариант «b» предназначен только для дипломированных врачей скорой помощи в будни. Вариант «a» проводит курсы первой помощи для получения прав по субботам. Правильный ответ: a.',
    explanation_de: 'Gesucht ist ein Erste-Hilfe-Kurs für den Führerschein an einem Samstag. Anzeige a führt diesen Kurs samstags durch.',
    vocabulary_notes: [
      { word: 'der Erste-Hilfe-Kurs', translation: 'курс первой медицинской помощи' },
      { word: 'der Führerschein', translation: 'водительское удостоверение' },
      { word: 'die amtliche Bescheinigung', translation: 'официальное свидетельство / справка' }
    ]
  },
  {
    id: 'm10-q10',
    exam_id: 'modellsatz-10',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie müssen geschäftlich von Freitag bis Sonntag verreisen und suchen eine liebevolle Betreuung für Ihren Hund.',
    options_json: [
      {
        id: 'a',
        badge: 'www.reptilien-aquarien-pension.de',
        title: 'ExotenHome: Urlaubsbetreuung für Schlangen & Fische',
        text: 'Professionelle Pflege für Echsen, Schildkröten und Aquarienfische während Ihrer Abwesenheit. Eigene Terrarien vorhanden. Wir nehmen keine Hunde, Katzen oder Säugetiere auf.',
        details: 'Tiere: Nur Fische & Reptilien • Keine Hunde'
      },
      {
        id: 'b',
        badge: 'www.hunde-hotel-vierpfoten.de',
        title: 'Hundepension VierPfoten: Urlaub für den besten Freund',
        text: 'Liebevolle Wochenend- und Ferienbetreuung für Hunde mit Familienanschluss und großem Auslauf im Grünen. Erfahrene Tierpfleger, gemütliche Hundezimmer. Von Freitag bis Sonntag buchbar.',
        details: 'Tiere: Hunde • Wochenendbetreuung Fr–So mit Auslauf'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Hundepension VierPfoten ... Wochenend- und Ferienbetreuung für Hunde ... Von Freitag bis Sonntag buchbar.',
    explanation_ru: 'Критерии: 1) присмотр за собакой (Hundebetreuung), 2) с пятницы по воскресенье на выходные (von Freitag bis Sonntag). Сайт «a» заботится только о рыбах и черепахах («Keine Hunde»). Сайт «b» — гостиница для собак с проживанием на выходные с пятницы по воскресенье. Правильный ответ: b.',
    explanation_de: 'Gesucht ist eine Wochenendbetreuung für einen Hund von Fr bis So. Anzeige b bietet Hundepension am Wochenende an.',
    vocabulary_notes: [
      { word: 'die Hundepension / der Hundesitter', translation: 'гостиница для собак / догситтер' },
      { word: 'die Betreuung', translation: 'уход / присмотр' },
      { word: 'der Auslauf', translation: 'выгул / площадка для бега' }
    ]
  },

  // ==========================================
  // MODELLSATZ 10 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm10-q11',
    exam_id: 'modellsatz-10',
    teil: 3,
    question_number: 11,
    title: 'Hinweiskarte im Badezimmer eines Hotels',
    context_header: 'Hotel Sonnengarten — Umwelthinweis für Handtücher',
    context_body: `Schützen Sie gemeinsam mit uns die Umwelt:

Täglich werden in Hotels tonnenweise Handtücher unnötig gewaschen. Sie entscheiden:
- Handtuch auf dem Boden bedeutet: Bitte austauschen und frisch waschen.
- Handtuch am Haken bedeutet: Ich benutze es noch einmal.`,
    statement: 'Wenn das Handtuch auf dem Boden liegt, bringt das Zimmerpersonal ein frisches Handtuch.',
    correct_answer: 'richtig',
    clue_quote: 'Handtuch auf dem Boden bedeutet: Bitte austauschen und frisch waschen.',
    explanation_ru: 'В экологической памятке гостиницы четко указано: полотенце на полу означает «пожалуйста, замените и постирайте» («Bitte austauschen und frisch waschen»). Значит, горничная заменит его на чистое. Утверждение верно (Richtig).',
    explanation_de: 'Handtücher auf dem Boden werden vom Personal gegen frische ausgetauscht.',
    vocabulary_notes: [
      { word: 'das Handtuch', translation: 'полотенце' },
      { word: 'auf dem Boden', translation: 'на полу' },
      { word: 'austauschen', translation: 'заменять / менять' }
    ]
  },
  {
    id: 'm10-q12',
    exam_id: 'modellsatz-10',
    teil: 3,
    question_number: 12,
    title: 'Aushang an der Haustür eines Mehrfamilienhauses',
    context_header: 'Stadtwerke Wasserversorgung — Reparaturankündigung',
    context_body: `Wichtige Information an alle Bewohner!

Wegen dringender Reparaturarbeiten an der Hauptwasserleitung muss das Trinkwasser am Donnerstag, 24. Oktober, von 08:30 bis 11:30 Uhr im gesamten Gebäude abgestellt werden.

Bitte sorgen Sie vorab für ausreichend Trinkwasser.`,
    statement: 'Am Donnerstag um 10:00 Uhr kann man ganz normal in der Wohnung duschen.',
    correct_answer: 'falsch',
    clue_quote: 'muss das Trinkwasser am Donnerstag ... von 08:30 bis 11:30 Uhr im gesamten Gebäude abgestellt werden.',
    explanation_ru: 'В объявлении написано: водоснабжение в четверг с 08:30 до 11:30 будет отключено во всем доме («Wasser ... abgestellt werden»). В 10:00 воды не будет, поэтому принять душ нельзя. Утверждение неверно (Falsch).',
    explanation_de: 'Von 08:30 bis 11:30 Uhr ist das Wasser abgestellt, man kann um 10:00 Uhr nicht duschen.',
    vocabulary_notes: [
      { word: 'das Wasser abstellen', translation: 'перекрывать / отключать воду' },
      { word: 'die Wasserleitung', translation: 'водопровод' },
      { word: 'ausreichend', translation: 'достаточный' }
    ]
  },
  {
    id: 'm10-q13',
    exam_id: 'modellsatz-10',
    teil: 3,
    question_number: 13,
    title: 'Schild an der Schnellkasse eines Supermarkts',
    context_header: 'Supermarkt Rewe — Expresskasse',
    context_body: `Schnellkasse / Express:

Nur für Kunden mit einem kleinen Einkauf von maximal 5 Artikeln!

An dieser Kasse ist aus Zeitgründen nur bargeldlose Zahlung mit EC- oder Kreditkarte möglich. Keine Barzahlung!`,
    statement: 'An dieser Schnellkasse kann man einen vollen Einkaufswagen mit 20 Artikeln in bar bezahlen.',
    correct_answer: 'falsch',
    clue_quote: 'Nur für Kunden mit einem kleinen Einkauf von maximal 5 Artikeln! ... Keine Barzahlung!',
    explanation_ru: 'На экспресс-кассе написано: максимум 5 товаров («maximal 5 Artikel») и никакой оплаты наличными («Keine Barzahlung!»). Оплатить тележку с 20 товарами наличными здесь нельзя. Утверждение неверно (Falsch).',
    explanation_de: 'Erlaubt sind maximal 5 Artikel und nur Kartenzahlung, keine Barzahlung.',
    vocabulary_notes: [
      { word: 'die Schnellkasse / Expresskasse', translation: 'экспресс-касса' },
      { word: 'maximal 5 Artikel', translation: 'максимум 5 товаров' },
      { word: 'keine Barzahlung', translation: 'оплата наличными не принимается' }
    ]
  },
  {
    id: 'm10-q14',
    exam_id: 'modellsatz-10',
    teil: 3,
    question_number: 14,
    title: 'Schild am Zaun des Elefanten- und Affengeheges im Zoo',
    context_header: 'Zoologischer Garten — Fütterungshinweis',
    context_body: `Achtung Besucher!

Das Füttern der Tiere ist strengstens verboten!

Viele Tiere werden von mitgebrachtem Brot, Keksen oder Obst schwer krank oder sterben. Unsere Tierpfleger versorgen alle Tiere nach speziellem Diätplan.`,
    statement: 'Besucher dürfen den Zootieren mitgebrachtes Brot und Obst zum Fressen geben.',
    correct_answer: 'falsch',
    clue_quote: 'Das Füttern der Tiere ist strengstens verboten! Viele Tiere werden von mitgebrachtem Brot ... krank',
    explanation_ru: 'Табличка у вольеров в зоопарке гласит: кормление животных строго запрещено («Das Füttern der Tiere ist strengstens verboten!»), от принесенного хлеба и фруктов они болеют. Давать еду животным запрещено. Утверждение неверно (Falsch).',
    explanation_de: 'Das Füttern der Tiere ist strengstens verboten.',
    vocabulary_notes: [
      { word: 'das Füttern / füttern', translation: 'кормление / кормить' },
      { word: 'strengstens verboten', translation: 'строжайше запрещено' },
      { word: 'das Gehege', translation: 'вольер для животных' }
    ]
  },
  {
    id: 'm10-q15',
    exam_id: 'modellsatz-10',
    teil: 3,
    question_number: 15,
    title: 'Hinweisschild am Schalter des Hauptbahnhofs',
    context_header: 'Deutsche Bahn — Fundsachen-Information',
    context_body: `Fundsachen / Lost & Found:

Sehr geehrte Fahrgäste,
das Fundbüro im Empfangsgebäude ist ab sofort umgezogen!

Sie finden das neue Fundbüro im Servicegebäude B direkt gegenüber von Gleis 1 (neben der Bundespolizei). Geöffnet Mo–Fr 08:00–18:00 Uhr.`,
    statement: 'Das Fundbüro befindet sich nicht mehr an seinem alten Platz im Empfangsgebäude.',
    correct_answer: 'richtig',
    clue_quote: 'das Fundbüro im Empfangsgebäude ist ab sofort umgezogen! Sie finden das neue Fundbüro im Servicegebäude B',
    explanation_ru: 'В объявлении написано, что бюро находок переехало («ist ab sofort umgezogen») и теперь находится в другом корпусе B напротив платформы 1. Значит, на старом месте его больше нет. Утверждение верно (Richtig).',
    explanation_de: 'Das Fundbüro ist umgezogen und befindet sich an einem neuen Ort.',
    vocabulary_notes: [
      { word: 'das Fundbüro / Fundsachen', translation: 'бюро находок / найденные вещи' },
      { word: 'umziehen / umgezogen', translation: 'переезжать / переехал' },
      { word: 'gegenüber von Gleis 1', translation: 'напротив пути 1' }
    ]
  }
];
