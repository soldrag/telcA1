export const exam = {
  id: 'modellsatz-9',
  title: 'telc Deutsch A1 — Modellsatz 9',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Девятый официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: собеседование при приеме на работу, правила общежития, поиск услуг для детей и автосервис.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 9 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: E-Mail von Julia an Herrn Bergmann (Aufgaben 1-2)
  {
    id: 'm9-q1',
    exam_id: 'modellsatz-9',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Julia an Herrn Bergmann',
    context_header: 'Von: Julia Neumann <j.neumann@mailservice.de>\nAn: Michael Bergmann <bergmann@media-agentur.de>\nDatum: 14. September, 13:10 Uhr\nBetreff: Unser Vorstellungsgespräch heute um 14:00 Uhr',
    context_body: `Sehr geehrter Herr Bergmann,

ich sitze momentan im Regionalexpress von Augsburg nach München, um zu unserem vereinbarten Vorstellungsgespräch um 14:00 Uhr zu kommen.

Leider hat unser Zug wegen einer Weichenstörung ca. 45 Minuten Verspätung. Ich werde es daher pünktlich um 14:00 Uhr nicht schaffen und erst voraussichtlich um 14:35 Uhr in Ihrem Büro sein können.

Ich bitte diese Unannehmlichkeit vielmals zu entschuldigen. Wäre es möglich, unser Gespräch heute um eine halbe Stunde nach hinten zu verschieben?

Mit freundlichen Grüßen
Julia Neumann`,
    statement: 'Julia kommt später zum Gespräch, weil ihr Zug Verspätung hat.',
    correct_answer: 'richtig',
    clue_quote: 'Leider hat unser Zug wegen einer Weichenstörung ca. 45 Minuten Verspätung. Ich werde es daher pünktlich um 14:00 Uhr nicht schaffen',
    explanation_ru: 'Юлия пишет: поезд задерживается на 45 минут из-за поломки стрелки («Zug ... ca. 45 Minuten Verspätung»), поэтому она приедет позже назначенного времени. Утверждение верно (Richtig).',
    explanation_en: 'Julia writes that her train is delayed by about 45 minutes due to a switch malfunction (\'Zug ... ca. 45 Minuten Verspätung\'), so she cannot arrive on time. The statement is True.',
    explanation_de: 'Julia verspätet sich, weil ihr Zug Verspätung hat.',
    vocabulary_notes: [
      { word: 'die Verspätung', translation: 'опоздание / задержка' },
      { word: 'das Vorstellungsgespräch', translation: 'собеседование при приеме на работу' },
      { word: 'pünktlich', translation: 'вовремя' }
    ]
  },
  {
    id: 'm9-q2',
    exam_id: 'modellsatz-9',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Julia an Herrn Bergmann',
    context_header: 'Von: Julia Neumann <j.neumann@mailservice.de>\nAn: Michael Bergmann <bergmann@media-agentur.de>\nDatum: 14. September, 13:10 Uhr\nBetreff: Unser Vorstellungsgespräch heute um 14:00 Uhr',
    context_body: `Sehr geehrter Herr Bergmann,

ich sitze momentan im Regionalexpress von Augsburg nach München, um zu unserem vereinbarten Vorstellungsgespräch um 14:00 Uhr zu kommen.

Leider hat unser Zug wegen einer Weichenstörung ca. 45 Minuten Verspätung. Ich werde es daher pünktlich um 14:00 Uhr nicht schaffen und erst voraussichtlich um 14:35 Uhr in Ihrem Büro sein können.

Ich bitte diese Unannehmlichkeit vielmals zu entschuldigen. Wäre es möglich, unser Gespräch heute um eine halbe Stunde nach hinten zu verschieben?

Mit freundlichen Grüßen
Julia Neumann`,
    statement: 'Julia möchte das Gespräch auf die nächste Woche verlegen.',
    correct_answer: 'falsch',
    clue_quote: 'Wäre es möglich, unser Gespräch heute um eine halbe Stunde nach hinten zu verschieben?',
    explanation_ru: 'Юлия просит сдвинуть встречу всего на полчаса сегодня же: «unser Gespräch heute um eine halbe Stunde nach hinten zu verschieben». Она не переносит его на следующую неделю. Утверждение неверно (Falsch).',
    explanation_en: 'Julia asks whether they could push today\'s interview back by half an hour (\'heute um eine halbe Stunde nach hinten zu verschieben\'), rather than rescheduling it for next week. The statement is False.',
    explanation_de: 'Julia möchte den Termin heute um 30 Minuten verschieben, nicht auf nächste Woche.',
    vocabulary_notes: [
      { word: 'verschieben / verlegen', translation: 'переносить (по времени)' },
      { word: 'eine halbe Stunde', translation: 'полчаса' },
      { word: 'heute', translation: 'сегодня' }
    ]
  },

  // Text 2: Studentenwohnheim Campus Nord (Aufgaben 3-5)
  {
    id: 'm9-q3',
    exam_id: 'modellsatz-9',
    teil: 1,
    question_number: 3,
    title: 'Hausordnung im Studentenwohnheim Campus Nord',
    context_header: 'Studentenwerk München — Merkblatt für neue Bewohner',
    context_body: `Liebe Studentinnen und Studenten,

herzlich willkommen im Wohnheim Campus Nord! Zur Sicherheit aller Bewohner bitten wir um Beachtung folgender Regeln:

1. Fahrräder:
Fahrräder dürfen nur im Fahrradkeller oder an den Fahrradständern im Hof stehen. Das Abstellen im Treppenhaus oder auf den Fluren ist aus Brandschutzgründen streng verboten!

2. Mülltrennung:
Bitte trennen Sie Ihren Müll sorgfältig! Im Innenhof finden Sie getrennte Tonnen für Altpapier (blau), Plastik/Verpackungen (gelb) und Restmüll (schwarz).

3. Ruhezeiten:
Ab 22:00 Uhr gilt gesetzliche Nachtruhe. Musik im Zimmer bitte auf Zimmerlautstärke stellen.

Ihre Wohnheimverwaltung`,
    statement: 'Studenten dürfen ihre Fahrräder auf dem Flur vor ihrer Zimmertür parken.',
    correct_answer: 'falsch',
    clue_quote: 'Das Abstellen im Treppenhaus oder auf den Fluren ist ... streng verboten',
    explanation_ru: 'В правилах общежития четко написано: оставлять велосипеды на лестнице или в коридорах строго запрещено («auf den Fluren ... streng verboten»). Их нужно ставить в подвал или во двор. Утверждение неверно (Falsch).',
    explanation_en: 'The dormitory house rules state that leaving bicycles in stairwells or hallways is strictly forbidden (\'auf den Fluren ist ... streng verboten\'). The statement is False.',
    explanation_de: 'Fahrräder auf dem Flur abzustellen ist streng verboten.',
    vocabulary_notes: [
      { word: 'der Flur (-e)', translation: 'коридор' },
      { word: 'streng verboten', translation: 'строго запрещено' },
      { word: 'der Fahrradkeller', translation: 'подвал для велосипедов' }
    ]
  },
  {
    id: 'm9-q4',
    exam_id: 'modellsatz-9',
    teil: 1,
    question_number: 4,
    title: 'Hausordnung im Studentenwohnheim Campus Nord',
    context_header: 'Studentenwerk München — Merkblatt für neue Bewohner',
    context_body: `Liebe Studentinnen und Studenten,

herzlich willkommen im Wohnheim Campus Nord! Zur Sicherheit aller Bewohner bitten wir um Beachtung folgender Regeln:

1. Fahrräder:
Fahrräder dürfen nur im Fahrradkeller oder an den Fahrradständern im Hof stehen. Das Abstellen im Treppenhaus oder auf den Fluren ist aus Brandschutzgründen streng verboten!

2. Mülltrennung:
Bitte trennen Sie Ihren Müll sorgfältig! Im Innenhof finden Sie getrennte Tonnen für Altpapier (blau), Plastik/Verpackungen (gelb) und Restmüll (schwarz).

3. Ruhezeiten:
Ab 22:00 Uhr gilt gesetzliche Nachtruhe. Musik im Zimmer bitte auf Zimmerlautstärke stellen.

Ihre Wohnheimverwaltung`,
    statement: 'Der Müll wird im Innenhof in verschiedenen Tonnen getrennt gesammelt.',
    correct_answer: 'richtig',
    clue_quote: 'Im Innenhof finden Sie getrennte Tonnen für Altpapier (blau), Plastik/Verpackungen (gelb) und Restmüll (schwarz).',
    explanation_ru: 'В тексте сказано: во дворе стоят отдельные контейнеры для бумаги, пластика и остаточного мусора («getrennte Tonnen für Altpapier, Plastik und Restmüll»). Утверждение верно (Richtig).',
    explanation_en: 'The dormitory regulations state that separated bins for waste paper, plastics, and general waste are in the courtyard (\'getrennte Tonnen für Altpapier, Plastik ... und Restmüll\'). The statement is True.',
    explanation_de: 'Der Müll wird im Innenhof getrennt in verschiedenen Tonnen entsorgt.',
    vocabulary_notes: [
      { word: 'die Mülltrennung', translation: 'сортировка мусора' },
      { word: 'die Tonne (-n)', translation: 'мусорный бак / контейнер' },
      { word: 'der Innenhof', translation: 'внутренний двор' }
    ]
  },
  {
    id: 'm9-q5',
    exam_id: 'modellsatz-9',
    teil: 1,
    question_number: 5,
    title: 'Hausordnung im Studentenwohnheim Campus Nord',
    context_header: 'Studentenwerk München — Merkblatt für neue Bewohner',
    context_body: `Liebe Studentinnen und Studenten,

herzlich willkommen im Wohnheim Campus Nord! Zur Sicherheit aller Bewohner bitten wir um Beachtung folgender Regeln:

1. Fahrräder:
Fahrräder dürfen nur im Fahrradkeller oder an den Fahrradständern im Hof stehen. Das Abstellen im Treppenhaus oder auf den Fluren ist aus Brandschutzgründen streng verboten!

2. Mülltrennung:
Bitte trennen Sie Ihren Müll sorgfältig! Im Innenhof finden Sie getrennte Tonnen für Altpapier (blau), Plastik/Verpackungen (gelb) und Restmüll (schwarz).

3. Ruhezeiten:
Ab 22:00 Uhr gilt gesetzliche Nachtruhe. Musik im Zimmer bitte auf Zimmerlautstärke stellen.

Ihre Wohnheimverwaltung`,
    statement: 'Ab 22:00 Uhr muss man im Zimmer leise sein.',
    correct_answer: 'richtig',
    clue_quote: 'Ab 22:00 Uhr gilt gesetzliche Nachtruhe. Musik im Zimmer bitte auf Zimmerlautstärke stellen.',
    explanation_ru: 'С 22:00 начинается ночной покой («Ab 22:00 Uhr gilt gesetzliche Nachtruhe»), музыку разрешено слушать только на пониженной громкости (Zimmerlautstärke). Это значит, что в комнате нужно вести себя тихо. Утверждение верно (Richtig).',
    explanation_en: 'From 22:00 quiet hours apply by law and music must be kept at room volume (\'Ab 22:00 Uhr gilt gesetzliche Nachtruhe\'), meaning residents must keep quiet. The statement is True.',
    explanation_de: 'Ab 22:00 Uhr gilt Nachtruhe, man muss leise sein.',
    vocabulary_notes: [
      { word: 'die Nachtruhe', translation: 'ночной покой / время тишины' },
      { word: 'Zimmerlautstärke', translation: 'комнатная (негромкая) громкость' },
      { word: 'leise', translation: 'тихий / тихо' }
    ]
  },

  // ==========================================
  // MODELLSATZ 9 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm9-q6',
    exam_id: 'modellsatz-9',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie suchen eine erfahrene Tagesmutter für Ihre 2-jährige Tochter (Montag bis Donnerstag jeweils von 08:00 bis 13:00 Uhr).',
    options_json: [
      {
        id: 'a',
        badge: 'www.tagesmutter-strolche-koeln.de',
        title: 'Tagesmutter Sabine: Liebevolle Kleinkindbetreuung',
        text: 'Zertifizierte Tagesmutter mit gemütlicher Wohnung und Garten betreut bis zu 5 Kleinkinder im Alter von 1 bis 3 Jahren. Betreuungszeiten: Mo–Do von 08:00 bis 14:00 Uhr. Freie Plätze!',
        details: 'Zielgruppe: Kleinkinder (1–3 Jahre) • Mo–Do 08:00–14:00 Uhr'
      },
      {
        id: 'b',
        badge: 'www.jugendinternat-gymnasium.de',
        title: 'Schlossinternat Sankt Georgen: Ganztagsschule',
        text: 'Staatlich anerkanntes Internat und Gymnasium für Jugendliche von 12 bis 19 Jahren. Intensive Abiturvorbereitung und Vollzeit-Unterbringung auf dem Campus. Keine Kleinkinder.',
        details: 'Zielgruppe: Jugendliche ab 12 Jahren • Abiturinternat'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Tagesmutter Sabine: Liebevolle Kleinkindbetreuung ... Kleinkinder im Alter von 1 bis 3 Jahren. Betreuungszeiten: Mo–Do von 08:00 bis 14:00 Uhr.',
    explanation_ru: 'Вам нужна: 1) няня / воспитатель для 2-летнего ребенка (Tagesmutter für Kleinkind, 2 Jahre), 2) с пн по чт в первой половине дня (Mo–Do 08:00–13:00). Вариант «b» — закрытая школа-интернат для старшеклассников от 12 лет. Вариант «a» — сертифицированная няня для детей 1–3 лет с пн по чт с 8 до 14. Правильный ответ: a.',
    explanation_en: 'You are looking for a childminder for a two-year-old on weekday mornings. Option a provides morning childcare for toddlers aged 1 to 3 from Monday to Thursday, whereas option b is an afternoon homework club for older teenagers.',
    explanation_de: 'Gesucht wird eine Tagesmutter für ein 2-jähriges Kind am Vormittag. Anzeige a bietet Betreuung für 1-3-Jährige von Mo-Do vormittags an.',
    vocabulary_notes: [
      { word: 'die Tagesmutter', translation: 'частная няня / воспитательница на дому' },
      { word: 'das Kleinkind', translation: 'ребенок младшего возраста (ясельного)' },
      { word: 'die Betreuungszeit', translation: 'время присмотра за ребенком' }
    ]
  },
  {
    id: 'm9-q7',
    exam_id: 'modellsatz-9',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie möchten an einem Wochenende das Malen mit Aquarellfarben lernen und suchen einen Kurs für Anfänger.',
    options_json: [
      {
        id: 'a',
        badge: 'www.keramik-ton-werkstatt.de',
        title: 'Töpferwerkstatt & Tonmodellieren an der Drehscheibe',
        text: 'Formen Sie Tassen, Schalen und Vasen aus echtem Ton! Wochenendseminar für Fortgeschrittene mit Vorkenntnissen im Glasieren. Kein Malunterricht mit Pinsel oder Farben.',
        details: 'Handwerk: Töpfern & Ton • Keine Malerei oder Aquarell'
      },
      {
        id: 'b',
        badge: 'www.atelier-aquarell-wochenende.de',
        title: 'KunstAtelier Pinselstrich: Aquarellmalen für Anfänger',
        text: 'Entdecken Sie die Welt der Wasserfarben! Samstags und sonntags von 11:00 bis 15:00 Uhr: Farben mischen, Papierkunde und schöne Naturmotive malen. Pinsel und Farben inklusive.',
        details: 'Thema: Aquarellfarben • Für Anfänger • Sa & So 11–15 Uhr'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Aquarellmalen für Anfänger ... Entdecken Sie die Welt der Wasserfarben! Samstags und sonntags ... Pinsel und Farben inklusive.',
    explanation_ru: 'Критерии: 1) живопись акварелью (Aquarellmalen), 2) для начинающих (für Anfänger), 3) на выходных (am Wochenende). Вариант «a» учит гончарному делу из глины («Töpferwerkstatt, kein Malunterricht»). Вариант «b» обучает рисованию акварелью с нуля по субботам и воскресеньям. Правильный ответ: b.',
    explanation_en: 'You want a beginner weekend workshop on watercolour painting. Option b offers a weekend watercolour course for beginners on Saturdays and Sundays, whereas option a is a pottery and clay sculpting workshop.',
    explanation_de: 'Gesucht ist ein Aquarellkurs für Anfänger am Wochenende. Anzeige b passt perfekt.',
    vocabulary_notes: [
      { word: 'das Aquarell / die Wasserfarben', translation: 'акварель / водяные краски' },
      { word: 'das Malen / malen', translation: 'рисование / рисовать' },
      { word: 'der Pinsel', translation: 'кисточка' }
    ]
  },
  {
    id: 'm9-q8',
    exam_id: 'modellsatz-9',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie möchten an Ihrem Auto von Winter- auf Sommerreifen wechseln und die Winterräder bis zum Herbst in der Werkstatt einlagern lassen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.reifenprofi-kfz-service.de',
        title: 'ReifenService Müller: Räderwechsel & Reifeneinlagerung',
        text: 'Komplettservice für Ihr Auto! Professioneller Wechsel von Winter- auf Sommerreifen für 39 €. Auf Wunsch waschen und lagern wir Ihre Winterräder sicher in unserem Reifenhotel ein.',
        details: 'Leistung: Reifenwechsel PKW & professionelle Einlagerung'
      },
      {
        id: 'b',
        badge: 'www.fahrrad-schlaeuche-versand.de',
        title: 'VeloParts: Fahrradschläuche und Mountainbike-Reifen',
        text: 'Riesiger Onlineshop für Fahrradbereifung, Flickzeug und Luftpumpen. Schnelle Lieferung nach Hause. Keine Kfz-Dienstleistungen, keine Reifenwechsel für Autos.',
        details: 'Angebot: Nur Zubehör für Fahrräder • Keine Autos'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'ReifenService Müller: Räderwechsel & Reifeneinlagerung ... Wechsel von Winter- auf Sommerreifen ... lagern wir Ihre Winterräder sicher in unserem Reifenhotel ein.',
    explanation_ru: 'Вам нужны: 1) шиномонтаж автомобиля (Auto von Winter- auf Sommerreifen wechseln), 2) хранение шин в мастерской (Reifen einlagern). Сайт «b» продаёт только велосипедные покрышки. Сайт «a» меняет автопокрышки и хранит зимние колеса на складе («Reifeneinlagerung»). Правильный ответ: a.',
    explanation_en: 'You need a seasonal tyre change and winter tyre storage for your car. Option a changes car tyres and stores winter wheels safely in their warehouse, whereas option b only sells bicycle tyres and puncture kits.',
    explanation_de: 'Gesucht wird ein Reifenwechsel mit Einlagerung fürs Auto. Anzeige a bietet Räderwechsel und Reifeneinlagerung an.',
    vocabulary_notes: [
      { word: 'der Reifenwechsel', translation: 'смена автомобильных колес / резины' },
      { word: 'die Reifeneinlagerung', translation: 'сезонное хранение шин' },
      { word: 'die Werkstatt', translation: 'автомастерская' }
    ]
  },
  {
    id: 'm9-q9',
    exam_id: 'modellsatz-9',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten eine günstige Stadtführung zu Fuß durch die historische Altstadt von Nürnberg buchen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.nuernberg-altstadt-rundgang.de',
        title: 'Historischer Stadtrundgang Nürnberg: Zu Fuß erleben',
        text: 'Erkunden Sie die Nürnberger Altstadt, Kaiserburg und Handwerkerhöfe bei einem gemütlichen 2-stündigen Rundgang zu Fuß mit zertifiziertem Stadtführer. Tickets schon ab 9 €.',
        details: 'Format: Stadtrundgang zu Fuß • Historische Altstadt • Ab 9 €'
      },
      {
        id: 'b',
        badge: 'www.helikopter-rundflug-bayern.de',
        title: 'HelikopterRundflüge Franken: Nürnberg von oben',
        text: 'Spektakuläre Hubschrauberflüge über Franken ab dem Nürnberger Flughafen! 30 Minuten Flugerlebnis für 240 € pro Person. Keine Führungen zu Fuß am Boden.',
        details: 'Format: Helikopterflug in der Luft • Preis: 240 €'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Historischer Stadtrundgang Nürnberg: Zu Fuß erleben ... Nürnberger Altstadt ... 2-stündigen Rundgang zu Fuß ... Tickets schon ab 9 €.',
    explanation_ru: 'Критерии: 1) пешеходная экскурсия (zu Fuß / Rundgang), 2) исторический старый город Нюрнберга (Altstadt von Nürnberg), 3) недорого (günstig / ab 9 €). Вариант «b» — вертолетная прогулка в воздухе за 240 €. Вариант «a» — пешеходный гид по старому городу всего за 9 €. Правильный ответ: a.',
    explanation_en: 'You want an affordable walking tour of Nuremberg\'s historic Old Town. Option a provides a guided walking tour through the Old Town starting from €9, whereas option b offers expensive sightseeing flights by helicopter.',
    explanation_de: 'Gesucht ist ein historischer Stadtrundgang zu Fuß in Nürnberg. Anzeige a bietet eine Fußführung für 9 € an.',
    vocabulary_notes: [
      { word: 'die Stadtführung / der Stadtrundgang', translation: 'экскурсия по городу' },
      { word: 'zu Fuß', translation: 'пешком' },
      { word: 'die Altstadt', translation: 'старый город (исторический центр)' }
    ]
  },
  {
    id: 'm9-q10',
    exam_id: 'modellsatz-9',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie möchten thailändisch kochen und suchen einen Supermarkt mit frischem asiatischen Gemüse, Kräutern und Sojasoßen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.landmetzgerei-huber.de',
        title: 'Traditionelle Landmetzgerei Huber — Frisches Fleisch',
        text: 'Frische Wurst- und Fleischwaren aus bayerischer Schlachtung: Leberkäse, Bratwürste, Rind- und Schweinefleisch. Keine ausländischen Lebensmittel oder Gewürze.',
        details: 'Sortiment: Nur bayerisches Fleisch & Wurst • Keine Asia-Produkte'
      },
      {
        id: 'b',
        badge: 'www.asia-supermarkt-bangkok.de',
        title: 'Asia Markt Mekong: Frische Spezialitäten aus Fernost',
        text: 'Riesiges asiatisches Lebensmittelsortiment! Täglich frisches Thai-Basilikum, Zitronengras, Koriander, Tofu sowie über 50 verschiedene asiatische Saucen, Pasten und Reis.',
        details: 'Sortiment: Frisches asiatisches Gemüse, Kräuter & Sojasaucen'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Asia Markt Mekong ... Täglich frisches Thai-Basilikum, Zitronengras, Koriander, Tofu sowie über 50 verschiedene asiatische Saucen',
    explanation_ru: 'Вам нужны: 1) азиатские продукты для тайской кухни (thailändisch kochen), 2) свежие азиатские травы и овощи (Gemüse, Kräuter), 3) соусы (Sojasoßen). Вариант «a» — традиционная мясная лавка со свининой и колбасами. Вариант «b» — специализированный азиатский супермаркет со свежими травами и соусами. Правильный ответ: b.',
    explanation_en: 'You need fresh Asian herbs, vegetables, and sauces for Thai cooking. Option b is an Asian supermarket stocking fresh Thai basil, lemongrass, and numerous sauces, whereas option a is a traditional Bavarian butcher shop selling meat.',
    explanation_de: 'Gesucht werden asiatische Zutaten für thailändisches Essen. Anzeige b ist ein Asia-Supermarkt.',
    vocabulary_notes: [
      { word: 'die Lebensmittel (pl.)', translation: 'продукты питания' },
      { word: 'die Kräuter (pl.)', translation: 'зелень / пряные травы' },
      { word: 'asiatisch', translation: 'азиатский' }
    ]
  },

  // ==========================================
  // MODELLSATZ 9 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm9-q11',
    exam_id: 'modellsatz-9',
    teil: 3,
    question_number: 11,
    title: 'Schild am Eingang des Stadtbads',
    context_header: 'Hallenbad Süd — Öffnungszeiten am Mittwoch',
    context_body: `Liebe Badegäste,

bitte beachten Sie unsere Belegungszeiten:
Jeden Mittwochnachmittag von 14:00 bis 16:30 Uhr ist das Hallenbad nur für den Schul- und Vereinssport reserviert.

Kein Eintritt für andere Gäste während dieser Zeit!`,
    statement: 'Man kann am Mittwochnachmittag um 15:00 Uhr ganz normal zum Schwimmen kommen.',
    correct_answer: 'falsch',
    clue_quote: 'Jeden Mittwochnachmittag von 14:00 bis 16:30 Uhr ist das Hallenbad nur für den Schul- und Vereinssport reserviert. Kein Eintritt',
    explanation_ru: 'На табличке в бассейне четко написано: по средам с 14:00 до 16:30 вход открыт только для школьников и секций («nur für den Schul- und Vereinssport reserviert»). Обычные посетители в 15:00 плавать не могут. Утверждение неверно (Falsch).',
    explanation_en: 'On Wednesday afternoons between 14:00 and 16:30 the indoor pool is exclusively reserved for schools and clubs with no general public admission (\'Kein Eintritt für den allgemeinen Badebetrieb\'). The statement is False.',
    explanation_de: 'Von 14:00 bis 16:30 Uhr ist am Mittwoch kein Eintritt für andere Gäste.',
    vocabulary_notes: [
      { word: 'nur für...', translation: 'только для...' },
      { word: 'der Eintritt', translation: 'вход' },
      { word: 'reserviert für...', translation: 'забронировано для...' }
    ]
  },
  {
    id: 'm9-q12',
    exam_id: 'modellsatz-9',
    teil: 3,
    question_number: 12,
    title: 'Aushang an einer zentralen Bushaltestelle',
    context_header: 'Verkehrsbetriebe Dresden — Fahrplanänderung',
    context_body: `Achtung Fahrgäste der Linie 62!

Aufgrund einer angemeldeten Großdemonstration in der Innenstadt können heute zwischen 12:00 und 17:00 Uhr folgende Haltestellen nicht bedient werden:
- „Rathausplatz"
- „Staatstheater"

Bitte nutzen Sie die Haltestelle „Hauptbahnhof" als Ausweichmöglichkeit.`,
    statement: 'Der Bus hält heute um 14:00 Uhr nicht an der Haltestelle „Rathausplatz".',
    correct_answer: 'richtig',
    clue_quote: 'können heute zwischen 12:00 und 17:00 Uhr folgende Haltestellen nicht bedient werden: - „Rathausplatz"',
    explanation_ru: 'В объявлении написано, что из-за демонстрации с 12:00 до 17:00 остановка «Ратхаусплац» обслуживаться не будет («kann nicht bedient werden»). 14:00 входит в этот промежуток, значит, автобус там не останавливается. Утверждение верно (Richtig).',
    explanation_en: 'The bus company announced that due to a demonstration, the Rathausplatz stop will not be served between 12:00 and 17:00 (\'Haltestellen nicht bedient werden: Rathausplatz\'). The statement is True.',
    explanation_de: 'Die Haltestelle Rathausplatz entfällt zwischen 12:00 und 17:00 Uhr.',
    vocabulary_notes: [
      { word: 'nicht bedient werden', translation: 'не обслуживаться (о транспорте)' },
      { word: 'die Ausweichmöglichkeit', translation: 'альтернативный вариант' },
      { word: 'die Demonstration', translation: 'демонстрация / митинг' }
    ]
  },
  {
    id: 'm9-q13',
    exam_id: 'modellsatz-9',
    teil: 3,
    question_number: 13,
    title: 'Aufsteller auf den Tischen eines Stadtcafés',
    context_header: 'Café Central — Kostenloses Gäste-WLAN',
    context_body: `Liebe Gäste,

wir bieten Ihnen kostenloses Internet an!
Netzwerk: Cafe_Central_Gast
Passwort: kaffee_und_kuchen

Hinweis: Die Nutzungsdauer ist auf maximal 2 Stunden pro Gast begrenzt. Nach Ablauf von zwei Stunden wird die Verbindung automatisch getrennt.`,
    statement: 'Gäste können das Internet im Café kostenlos nutzen.',
    correct_answer: 'richtig',
    clue_quote: 'wir bieten Ihnen kostenloses Internet an!',
    explanation_ru: 'На столике в кафе стоит табличка: «wir bieten Ihnen kostenloses Internet an» («мы предлагаем вам бесплатный интернет»). Утверждение верно (Richtig).',
    explanation_en: 'The table card indicates that the café offers free wireless internet access to customers (\'kostenloses Internet\'). The statement is True.',
    explanation_de: 'Das Internet ist für Gäste kostenlos („kostenloses Internet").',
    vocabulary_notes: [
      { word: 'kostenlos', translation: 'бесплатно' },
      { word: 'das WLAN / Internet', translation: 'беспроводной интернет' },
      { word: 'begrenzt auf...', translation: 'ограничен (по времени)...' }
    ]
  },
  {
    id: 'm9-q14',
    exam_id: 'modellsatz-9',
    teil: 3,
    question_number: 14,
    title: 'Aushang an den Türen der Volkshochschule',
    context_header: 'Volkshochschule — Osterferien',
    context_body: `Liebe Dozenten und Kursteilnehmer,

während der Osterferien (vom 25. März bis einschließlich 6. April) bleibt das VHS-Gebäude geschlossen.

In diesem Zeitraum finden keine Kurse oder Prüfungen statt!

Ab Montag, den 7. April, sind wir wieder wie gewohnt für Sie da. Schöne Feiertage!`,
    statement: 'In den Osterferien kann man an der Volkshochschule Deutschkurse besuchen.',
    correct_answer: 'falsch',
    clue_quote: 'In diesem Zeitraum finden keine Kurse oder Prüfungen statt!',
    explanation_ru: 'В объявлении ясно написано: в пасхальные каникулы здание закрыто, и никакие курсы и экзамены не проводятся («In diesem Zeitraum finden keine Kurse oder Prüfungen statt!»). Утверждение неверно (Falsch).',
    explanation_en: 'The notice states that the adult education center is closed during Easter break and no courses or exams take place (\'finden keine Kurse oder Prüfungen statt\'). The statement is False.',
    explanation_de: 'In den Osterferien finden keine Kurse statt, das Gebäude ist geschlossen.',
    vocabulary_notes: [
      { word: 'die Osterferien', translation: 'пасхальные каникулы' },
      { word: 'keine Kurse', translation: 'нет занятий' },
      { word: 'geschlossen', translation: 'закрыто' }
    ]
  },
  {
    id: 'm9-q15',
    exam_id: 'modellsatz-9',
    teil: 3,
    question_number: 15,
    title: 'Schild an der Eingangstür einer Sprachschule',
    context_header: 'Sprachakademie Europa — Schulordnung',
    context_body: `Rauchverbot!

Aus Rücksicht auf unsere Schülerinnen und Schüler:
Das Rauchen von Zigaretten und E-Zigaretten ist im gesamten Schulgebäude, auf dem Schulhof sowie direkt vor der Haupteingangstür verboten!

Raucher nutzen bitte die gekennzeichnete Zone hinten am Parkplatz.`,
    statement: 'Man darf direkt vor dem Haupteingang der Sprachschule rauchen.',
    correct_answer: 'falsch',
    clue_quote: 'Das Rauchen ... direkt vor der Haupteingangstür verboten!',
    explanation_ru: 'На знаке у входа написано: курение запрещено во всем здании, во дворе, а также прямо перед главным входом («direkt vor der Haupteingangstür verboten!»). Курильщикам выделена зона у парковки. Утверждение неверно (Falsch).',
    explanation_en: 'Smoking is strictly prohibited directly in front of the main entrance door (\'Das Rauchen ... direkt vor der Haupteingangstür verboten!\'). The statement is False.',
    explanation_de: 'Das Rauchen vor dem Haupteingang ist verboten.',
    vocabulary_notes: [
      { word: 'das Rauchverbot / Rauchen verboten', translation: 'запрет на курение' },
      { word: 'die Haupteingangstür', translation: 'дверь главного входа' },
      { word: 'gekennzeichnete Zone', translation: 'обозначенная зона' }
    ]
  }
];
