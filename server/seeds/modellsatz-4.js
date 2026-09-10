export const exam = {
  id: 'modellsatz-4',
  title: 'telc Deutsch A1 — Modellsatz 4',
  subtitle: 'Leseverstehen (Teil 1, 2 und 3)',
  description: 'Четвертый официальный тренировочный вариант экзамена telc Deutsch A1 / Start Deutsch 1. Темы: болезнь и работа, семейный отель, кемпинг, детские мероприятия и правила проживания.',
  time_limit_minutes: 25,
  total_questions: 15,
  pass_score: 9,
};

export const questions = [
  // ==========================================
  // MODELLSATZ 4 - TEIL 1 (Aufgaben 1-5)
  // ==========================================
  // Text 1: E-Mail von Katja an David (Aufgaben 1-2)
  {
    id: 'm4-q1',
    exam_id: 'modellsatz-4',
    teil: 1,
    question_number: 1,
    title: 'E-Mail von Katja an David',
    context_header: 'Von: Katja Lindner <k.lindner@firma-nord.de>\nAn: David Berger <d.berger@firma-nord.de>\nDatum: 18. November, 07:45 Uhr\nBetreff: Krankmeldung und Meeting heute',
    context_body: `Guten Morgen David,

leider bin ich heute krank aufgewacht. Ich habe hohes Fieber und starke Halsschmerzen und gehe um 09:00 Uhr gleich zum Hausarzt. Daher kann ich heute leider nicht ins Büro kommen.

Kannst du bitte heute um 11:00 Uhr das Kundengespräch mit Herrn Müller für mich übernehmen? Die Unterlagen und das Angebot liegen fertig ausgedruckt auf meinem Schreibtisch.

Ich melde mich heute Nachmittag bei dir, sobald ich vom Arzt zurück bin.

Vielen Dank für deine Hilfe!
Katja`,
    statement: 'Katja kann heute wegen Krankheit nicht zur Arbeit kommen.',
    correct_answer: 'richtig',
    clue_quote: 'Ich habe hohes Fieber und starke Halsschmerzen ... Daher kann ich heute leider nicht ins Büro kommen.',
    explanation_ru: 'Катя пишет коллеге Давиду: «Ich habe hohes Fieber ... Daher kann ich heute leider nicht ins Büro kommen» («У меня высокая температура ... Поэтому я сегодня, к сожалению, не могу прийти в офис»). Утверждение верно (Richtig).',
    explanation_de: 'Katja ist krank und kann heute nicht ins Büro kommen.',
    vocabulary_notes: [
      { word: 'krank', translation: 'больной' },
      { word: 'das Fieber', translation: 'высокая температура / жар' },
      { word: 'die Krankmeldung', translation: 'уведомление о болезни' }
    ]
  },
  {
    id: 'm4-q2',
    exam_id: 'modellsatz-4',
    teil: 1,
    question_number: 2,
    title: 'E-Mail von Katja an David',
    context_header: 'Von: Katja Lindner <k.lindner@firma-nord.de>\nAn: David Berger <d.berger@firma-nord.de>\nDatum: 18. November, 07:45 Uhr\nBetreff: Krankmeldung und Meeting heute',
    context_body: `Guten Morgen David,

leider bin ich heute krank aufgewacht. Ich habe hohes Fieber und starke Halsschmerzen und gehe um 09:00 Uhr gleich zum Hausarzt. Daher kann ich heute leider nicht ins Büro kommen.

Kannst du bitte heute um 11:00 Uhr das Kundengespräch mit Herrn Müller für mich übernehmen? Die Unterlagen und das Angebot liegen fertig ausgedruckt auf meinem Schreibtisch.

Ich melde mich heute Nachmittag bei dir, sobald ich vom Arzt zurück bin.

Vielen Dank für deine Hilfe!
Katja`,
    statement: 'David muss die Unterlagen für das Gespräch mit Herrn Müller erst noch ausdrucken.',
    correct_answer: 'falsch',
    clue_quote: 'Die Unterlagen und das Angebot liegen fertig ausgedruckt auf meinem Schreibtisch.',
    explanation_ru: 'Катя сообщает, что документы уже лежат распечатанными на её столе: «Die Unterlagen und das Angebot liegen fertig ausgedruckt auf meinem Schreibtisch». Давиду не нужно ничего распечатывать. Утверждение неверно (Falsch).',
    explanation_de: 'Die Dokumente sind bereits fertig ausgedruckt auf Katjas Schreibtisch.',
    vocabulary_notes: [
      { word: 'fertig ausgedruckt', translation: 'готовый в распечатанном виде' },
      { word: 'die Unterlagen (pl.)', translation: 'документы / материалы' },
      { word: 'der Schreibtisch', translation: 'письменный стол' }
    ]
  },

  // Text 2: Hotel Bergblick im Schwarzwald (Aufgaben 3-5)
  {
    id: 'm4-q3',
    exam_id: 'modellsatz-4',
    teil: 1,
    question_number: 3,
    title: 'Gäste-Information im Familienhotel Bergblick',
    context_header: 'Familienhotel Bergblick — Information für unsere Hotelgäste',
    context_body: `Liebe Urlaubsgäste,

herzlich willkommen im Schwarzwald! Wir möchten, dass Ihr Aufenthalt erholsam wird.

Wichtige Informationen zu Ihrem Hotelaufenthalt:
- Rezeption: Täglich von 07:00 bis 21:00 Uhr besetzt. Bei späterer Anreise nach 21:00 Uhr informieren Sie uns bitte telefonisch.
- Frühstück: Unser großes Schwarzwälder Frühstücksbuffet servieren wir von 07:30 bis 10:00 Uhr im Panoramarestaurant.
- Wellnessbereich & Schwimmbad: Kostenlos nutzbar von 08:00 bis 20:00 Uhr für Hotelgäste.
- Haustiere: Hunde sind in den Hotelzimmern nach Voranmeldung erlaubt (Reinigungsgebühr: 10 € pro Nacht). Im Restaurantbereich sind Hunde jedoch nicht gestattet.

Einen schönen Urlaub wünscht Ihnen
Familie Huber`,
    statement: 'Hotelgäste dürfen das Schwimmbad ohne Aufpreis benutzen.',
    correct_answer: 'richtig',
    clue_quote: 'Wellnessbereich & Schwimmbad: Kostenlos nutzbar von 08:00 bis 20:00 Uhr für Hotelgäste.',
    explanation_ru: 'В памятке отеля прямо сказано: «Wellnessbereich & Schwimmbad: Kostenlos nutzbar ... für Hotelgäste» («Зона велнес и бассейн бесплатны для гостей отеля»). «Ohne Aufpreis» означает «без доплаты». Утверждение верно (Richtig).',
    explanation_de: 'Das Schwimmbad ist für Hotelgäste kostenlos nutzbar.',
    vocabulary_notes: [
      { word: 'ohne Aufpreis / kostenlos', translation: 'без доплаты / бесплатно' },
      { word: 'das Schwimmbad', translation: 'бассейн' },
      { word: 'der Aufenthalt', translation: 'пребывание' }
    ]
  },
  {
    id: 'm4-q4',
    exam_id: 'modellsatz-4',
    teil: 1,
    question_number: 4,
    title: 'Gäste-Information im Familienhotel Bergblick',
    context_header: 'Familienhotel Bergblick — Information für unsere Hotelgäste',
    context_body: `Liebe Urlaubsgäste,

herzlich willkommen im Schwarzwald! Wir möchten, dass Ihr Aufenthalt erholsam wird.

Wichtige Informationen zu Ihrem Hotelaufenthalt:
- Rezeption: Täglich von 07:00 bis 21:00 Uhr besetzt. Bei späterer Anreise nach 21:00 Uhr informieren Sie uns bitte telefonisch.
- Frühstück: Unser großes Schwarzwälder Frühstücksbuffet servieren wir von 07:30 bis 10:00 Uhr im Panoramarestaurant.
- Wellnessbereich & Schwimmbad: Kostenlos nutzbar von 08:00 bis 20:00 Uhr für Hotelgäste.
- Haustiere: Hunde sind in den Hotelzimmern nach Voranmeldung erlaubt (Reinigungsgebühr: 10 € pro Nacht). Im Restaurantbereich sind Hunde jedoch nicht gestattet.

Einen schönen Urlaub wünscht Ihnen
Familie Huber`,
    statement: 'Die Hotelrezeption ist die ganze Nacht geöffnet.',
    correct_answer: 'falsch',
    clue_quote: 'Rezeption: Täglich von 07:00 bis 21:00 Uhr besetzt. Bei späterer Anreise nach 21:00 Uhr informieren Sie uns bitte telefonisch.',
    explanation_ru: 'В тексте указано: стойка регистрации работает только с 07:00 до 21:00 («Täglich von 07:00 bis 21:00 Uhr besetzt»). Если гость прибывает после 21:00, нужно предупредить по телефону. Всю ночь она не работает. Утверждение неверно (Falsch).',
    explanation_de: 'Die Rezeption schließt um 21:00 Uhr und ist nachts nicht besetzt.',
    vocabulary_notes: [
      { word: 'die Rezeption', translation: 'стойка регистрации / рецепция' },
      { word: 'die ganze Nacht', translation: 'всю ночь' },
      { word: 'besetzt', translation: 'работает (есть сотрудник на месте)' }
    ]
  },
  {
    id: 'm4-q5',
    exam_id: 'modellsatz-4',
    teil: 1,
    question_number: 5,
    title: 'Gäste-Information im Familienhotel Bergblick',
    context_header: 'Familienhotel Bergblick — Information für unsere Hotelgäste',
    context_body: `Liebe Urlaubsgäste,

herzlich willkommen im Schwarzwald! Wir möchten, dass Ihr Aufenthalt erholsam wird.

Wichtige Informationen zu Ihrem Hotelaufenthalt:
- Rezeption: Täglich von 07:00 bis 21:00 Uhr besetzt. Bei späterer Anreise nach 21:00 Uhr informieren Sie uns bitte telefonisch.
- Frühstück: Unser großes Schwarzwälder Frühstücksbuffet servieren wir von 07:30 bis 10:00 Uhr im Panoramarestaurant.
- Wellnessbereich & Schwimmbad: Kostenlos nutzbar von 08:00 bis 20:00 Uhr für Hotelgäste.
- Haustiere: Hunde sind in den Hotelzimmern nach Voranmeldung erlaubt (Reinigungsgebühr: 10 € pro Nacht). Im Restaurantbereich sind Hunde jedoch nicht gestattet.

Einen schönen Urlaub wünscht Ihnen
Familie Huber`,
    statement: 'Man darf den Hund mit ins Zimmer nehmen, aber nicht ins Restaurant.',
    correct_answer: 'richtig',
    clue_quote: 'Hunde sind in den Hotelzimmern nach Voranmeldung erlaubt ... Im Restaurantbereich sind Hunde jedoch nicht gestattet.',
    explanation_ru: 'Правила отеля гласят: собаки в номерах разрешены по предварительной заявке («in den Hotelzimmern nach Voranmeldung erlaubt»), но в ресторан с собаками нельзя («Im Restaurantbereich jedoch nicht gestattet»). Утверждение верно (Richtig).',
    explanation_de: 'Hunde sind im Zimmer erlaubt, aber im Restaurant verboten.',
    vocabulary_notes: [
      { word: 'nach Voranmeldung', translation: 'по предварительному уведомлению' },
      { word: 'nicht gestattet', translation: 'не разрешено' },
      { word: 'der Restaurantbereich', translation: 'зона ресторана' }
    ]
  },

  // ==========================================
  // MODELLSATZ 4 - TEIL 2 (Aufgaben 6-10)
  // ==========================================
  {
    id: 'm4-q6',
    exam_id: 'modellsatz-4',
    teil: 2,
    question_number: 6,
    title: 'Aufgabe 6',
    situation: 'Sie sind nach Berlin gezogen und suchen günstige gebrauchte Möbel (Tisch und Stühle) zum Selbstabholen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.design-moebel-luxus24.de',
        title: 'Designermöbel Berlin: Italienische Luxustische',
        text: 'Exklusive Designertische aus Marmor und Echtholz neu bestellen. Preise ab 1.800 €. Bundesweite Lieferung frei Haus mit Spedition. Keine Gebrauchtmöbel, kein Direktverkauf ab Lager.',
        details: 'Angebot: Nur Neumöbel im Luxussegment • Keine Gebrauchtware'
      },
      {
        id: 'b',
        badge: 'www.kleinanzeigen-moebel-berlin.de',
        title: 'Berliner Gebrauchtmöbelmarkt & Second-Hand-Börse',
        text: 'Große Auswahl an gut erhaltenen Tischen, Stühlen und Schränken von privat für kleines Geld (ab 20 €). Alle Möbel sofort bereit zur Selbstabholung im Lager Berlin-Neukölln.',
        details: 'Angebot: Gebrauchte Möbel • Günstig • Zur Selbstabholung'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Berliner Gebrauchtmöbelmarkt ... gut erhaltenen Tischen, Stühlen ... für kleines Geld ... sofort bereit zur Selbstabholung',
    explanation_ru: 'Вам нужны: 1) подержанная мебель (gebrauchte Möbel), 2) недорого (günstig / für kleines Geld), 3) самовывоз (Selbstabholung). Сайт «a» продаёт новую элитную мебель от 1800 € с доставкой («ab 1.800 €, keine Gebrauchtmöbel»). Сайт «b» предлагает подержанные столы и стулья от 20 € для самовывоза. Правильный ответ: b.',
    explanation_de: 'Gesucht werden günstige gebrauchte Möbel zur Selbstabholung. Anzeige b bietet genau das.',
    vocabulary_notes: [
      { word: 'gebrauchte Möbel', translation: 'подержанная мебель' },
      { word: 'die Selbstabholung', translation: 'самовывоз' },
      { word: 'für kleines Geld', translation: 'за небольшие деньги / недорого' }
    ]
  },
  {
    id: 'm4-q7',
    exam_id: 'modellsatz-4',
    teil: 2,
    question_number: 7,
    title: 'Aufgabe 7',
    situation: 'Sie möchten mit Ihren Kindern (5 und 7 Jahre alt) am Sonntagnachmittag ein Theaterstück besuchen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.puppentheater-regenbogen.de',
        title: 'Kinder- und Puppentheater Regenbogen',
        text: 'Märchen und lustige Geschichten für Kinder von 4 bis 10 Jahren! Jeden Sonntag um 15:00 Uhr: „Das Zauberwald-Abenteuer". Kindgerechte Spieldauer von 50 Minuten. Eintritt: 6 € für Kinder.',
        details: 'Zielgruppe: Kinder 4–10 Jahre • Sonntags um 15:00 Uhr'
      },
      {
        id: 'b',
        badge: 'www.schauspielhaus-abend.de',
        title: 'Stadttheater Schauspielhaus — Große Bühne',
        text: 'Klassische Dramen und moderne Theaterstücke. Heute Abend um 20:00 Uhr: Goethes „Faust". Spieldauer: 3 Stunden. Altersfreigabe: Erst ab 16 Jahren geeignet. Keine Kindervorstellungen.',
        details: 'Zielgruppe: Erwachsene (ab 16) • Vorstellungsbeginn: 20:00 Uhr'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Märchen und lustige Geschichten für Kinder von 4 bis 10 Jahren! Jeden Sonntag um 15:00 Uhr',
    explanation_ru: 'Критерии: 1) для детей 5 и 7 лет (Kinder 4–10 Jahre), 2) в воскресенье днем (Sonntag um 15:00 Uhr). Вариант «b» — вечерний спектакль для взрослых в 20:00 с возрастным ограничением 16+ («Erst ab 16 Jahren»). Вариант «a» — кукольный детский театр в воскресенье в 15:00. Правильный ответ: a.',
    explanation_de: 'Gesucht ist ein Kindertheater am Sonntagnachmittag. Anzeige a ist für Kinder von 4-10 Jahren sonntags um 15:00 Uhr.',
    vocabulary_notes: [
      { word: 'das Theaterstück', translation: 'пьеса / спектакль' },
      { word: 'das Kindertheater / Puppentheater', translation: 'детский / кукольный театр' },
      { word: 'geeignet ab... Jahren', translation: 'подходит с... лет' }
    ]
  },
  {
    id: 'm4-q8',
    exam_id: 'modellsatz-4',
    teil: 2,
    question_number: 8,
    title: 'Aufgabe 8',
    situation: 'Sie möchten heute Abend nicht kochen und suchen ein italienisches Restaurant, das Pizza direkt zu Ihnen nach Hause bringt.',
    options_json: [
      {
        id: 'a',
        badge: 'www.ristorante-da-vinci.de',
        title: 'Ristorante Pizzeria Da Vinci — Feines Ambiente',
        text: 'Genießen Sie hausgemachte Steinofenpizza und Pasta in unserem gemütlichen Speisesaal. Bitte reservieren Sie Ihren Tisch telefonisch. Kein Lieferservice, kein Außer-Haus-Verkauf.',
        details: 'Service: Nur Essen im Restaurant vor Ort • Kein Lieferservice'
      },
      {
        id: 'b',
        badge: 'www.pizza-express-lieferservice.de',
        title: 'Pizza Pronto: Italienischer Lieferservice',
        text: 'Heiße Steinofen-Pizza, knackige Salate und Tiramisu schnell geliefert! Online bestellen und innerhalb von 30 Minuten frisch an die Haustür bringen lassen. Täglich von 17:00 bis 23:00 Uhr.',
        details: 'Service: Schnelle Lieferung nach Hause • Täglich 17–23 Uhr'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Italienischer Lieferservice ... innerhalb von 30 Minuten frisch an die Haustür bringen lassen.',
    explanation_ru: 'Вы хотите доставку пиццы на дом (direkt nach Hause bringt). В ресторане «a» прямо написано: «Kein Lieferservice, kein Außer-Haus-Verkauf» (доставки нет, только в зале). Вариант «b» — специализированная доставка пиццы до двери дома («Lieferservice ... an die Haustür bringen lassen»). Правильный ответ: b.',
    explanation_de: 'Gesucht ist ein Pizzalieferservice nach Hause. Anzeige a hat keinen Lieferdienst, Anzeige b liefert direkt an die Tür.',
    vocabulary_notes: [
      { word: 'der Lieferservice', translation: 'служба доставки' },
      { word: 'nach Hause bringen / liefern', translation: 'привозить / доставлять на дом' },
      { word: 'kein Außer-Haus-Verkauf', translation: 'на вынос не продается' }
    ]
  },
  {
    id: 'm4-q9',
    exam_id: 'modellsatz-4',
    teil: 2,
    question_number: 9,
    title: 'Aufgabe 9',
    situation: 'Sie möchten Ihren Sommerurlaub an der Nordsee mit Ihrem eigenen Zelt auf einem Campingplatz direkt am Strand verbringen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.nordsee-strand-camping.de',
        title: 'Dünencamping Nordsee: Zelten direkt am Meer',
        text: 'Wunderschöner Naturcampingplatz direkt hinter dem Deich am Sandstrand! Große Wiesen für Zelte und Wohnwagen. Moderne Sanitäranlagen, kleiner Minimarkt und Lagerfeuerplätze.',
        details: 'Angebot: Zeltplatz am Strand • Eigene Zelte willkommen'
      },
      {
        id: 'b',
        badge: 'www.nordsee-wellness-grandhotel.de',
        title: 'Grand Hotel Nordseebad — 5-Sterne-Luxusurlaub',
        text: 'Exklusive Suiten mit Meerblick, Privatstrand und Thermalbad. 24-Stunden-Zimmerservice und Gourmetküche. Auf unserem Hotelgelände ist Camping oder Zelten streng untersagt.',
        details: 'Angebot: Luxushotel • Camping streng untersagt'
      }
    ],
    correct_answer: 'a',
    clue_quote: 'Dünencamping Nordsee: Zelten direkt am Meer ... Naturcampingplatz direkt hinter dem Deich am Sandstrand! Große Wiesen für Zelte',
    explanation_ru: 'Вам нужен: 1) отдых с палаткой (mit dem eigenen Zelt), 2) кемпинг у пляжа на Северном море (Campingplatz am Strand an der Nordsee). На сайте «b» (отель) кемпинг строго запрещен («Camping oder Zelten streng untersagt»). На сайте «a» предлагается кемпинг для палаток прямо у пляжа. Правильный ответ: a.',
    explanation_de: 'Gesucht wird ein Zeltplatz am Nordseestrand. Anzeige a bietet Zelten direkt am Meer an.',
    vocabulary_notes: [
      { word: 'das Zelt (-e) / zelten', translation: 'палатка / жить в палатке' },
      { word: 'der Campingplatz', translation: 'кемпинг' },
      { word: 'streng untersagt / verboten', translation: 'строго запрещено' }
    ]
  },
  {
    id: 'm4-q10',
    exam_id: 'modellsatz-4',
    teil: 2,
    question_number: 10,
    title: 'Aufgabe 10',
    situation: 'Sie können noch nicht schwimmen und möchten einen Anfänger-Schwimmkurs für Erwachsene am Samstagvormittag buchen.',
    options_json: [
      {
        id: 'a',
        badge: 'www.triathlon-training-pro.de',
        title: 'Triathlon Club: Intensives Kraulschwimmen für Profis',
        text: 'Schnelligkeitstraining für Wettkampf-Schwimmer und Marathon-Athleten. Anspruchsvolle Technikeinheiten dienstags und donnerstags von 20:00 bis 22:00 Uhr. Keine Anfängerkurse.',
        details: 'Niveau: Nur für Profis & Wettkämpfer • Di & Do abends'
      },
      {
        id: 'b',
        badge: 'www.baeder-schwimmkurs-erwachsene.de',
        title: 'Stadtbad Mitte: Schwimmen lernen für Erwachsene',
        text: 'Sicher und entspannt schwimmen lernen in einer kleinen, verständnisvollen Gruppe! Spezieller Kurs für erwachsene Nichtschwimmer. Samstags von 09:30 bis 10:45 Uhr im Lehrschwimmbecken.',
        details: 'Zielgruppe: Erwachsene Nichtschwimmer • Samstag 09:30 Uhr'
      }
    ],
    correct_answer: 'b',
    clue_quote: 'Spezieller Kurs für erwachsene Nichtschwimmer. Samstags von 09:30 bis 10:45 Uhr',
    explanation_ru: 'Критерии: 1) для взрослых, не умеющих плавать (Anfänger / Nichtschwimmer), 2) в субботу утром (Samstagvormittag, 09:30). Вариант «a» — профессиональные тренировки для триатлонистов по вечерам («keine Anfängerkurse»). Вариант «b» обучает взрослых с нуля по субботам с 09:30. Правильный ответ: b.',
    explanation_de: 'Gesucht ist ein Schwimmkurs für Erwachsene am Samstagvormittag. Anzeige b passt genau.',
    vocabulary_notes: [
      { word: 'der Nichtschwimmer', translation: 'человек, не умеющий плавать' },
      { word: 'der Anfänger', translation: 'начинающий' },
      { word: 'am Vormittag', translation: 'в первой половине дня' }
    ]
  },

  // ==========================================
  // MODELLSATZ 4 - TEIL 3 (Aufgaben 11-15)
  // ==========================================
  {
    id: 'm4-q11',
    exam_id: 'modellsatz-4',
    teil: 3,
    question_number: 11,
    title: 'Aushang an der Eingangstür des Bürgeramts',
    context_header: 'Bürgeramt Stadtzentrum — Wichtige Information',
    context_body: `Sehr geehrte Bürgerinnen und Bürger,

Besuche im Bürgeramt sind nur nach vorheriger Terminvereinbarung möglich!

Bitte buchen Sie Ihren Termin online unter www.buergeramt-termine.de oder telefonisch über die Servicenummer 115.

Kunden ohne Termin können leider nicht bedient werden.`,
    statement: 'Man muss vorher einen Termin machen, um das Bürgeramt zu besuchen.',
    correct_answer: 'richtig',
    clue_quote: 'Besuche im Bürgeramt sind nur nach vorheriger Terminvereinbarung möglich! Kunden ohne Termin können leider nicht bedient werden.',
    explanation_ru: 'В объявлении написано: прием граждан возможен только по предварительной записи («nur nach vorheriger Terminvereinbarung möglich»). Без записи никого не принимают. Утверждение верно (Richtig).',
    explanation_de: 'Ein Besuch ist nur mit Terminvereinbarung möglich.',
    vocabulary_notes: [
      { word: 'die Terminvereinbarung', translation: 'запись на прием' },
      { word: 'vorherig', translation: 'предварительный' },
      { word: 'bedienen', translation: 'обслуживать' }
    ]
  },
  {
    id: 'm4-q12',
    exam_id: 'modellsatz-4',
    teil: 3,
    question_number: 12,
    title: 'Aushang an der Pinnwand im Mietshaus',
    context_header: 'Hausordnung — Ruhezeiten im Gebäude',
    context_body: `Liebe Mieterinnen und Mieter,

bitte nehmen Sie Rücksicht auf Nachbarn und Familien mit kleinen Kindern:
Die gesetzliche Mittagsruhe gilt täglich von 13:00 bis 15:00 Uhr.

Während dieser Zeit sind Renovierungsarbeiten, lautes Bohren und Rasenmähen im Innenhof verboten.

Wir danken für Ihr Verständnis!`,
    statement: 'Man darf um 14:00 Uhr im Innenhof den Rasen mähen.',
    correct_answer: 'falsch',
    clue_quote: 'Mittagsruhe gilt täglich von 13:00 bis 15:00 Uhr ... Rasenmähen im Innenhof verboten.',
    explanation_ru: 'В правилах дома написано: тихий час действует с 13:00 до 15:00 («Mittagsruhe: 13:00 bis 15:00 Uhr»). Косить газон во дворе в это время запрещено («Rasenmähen im Innenhof verboten»). В 14:00 косить нельзя. Утверждение неверно (Falsch).',
    explanation_de: 'Um 14:00 Uhr ist Mittagsruhe, Rasenmähen ist verboten.',
    vocabulary_notes: [
      { word: 'die Mittagsruhe', translation: 'обеденный тихий час' },
      { word: 'verboten', translation: 'запрещено' },
      { word: 'der Innenhof', translation: 'внутренний двор дома' }
    ]
  },
  {
    id: 'm4-q13',
    exam_id: 'modellsatz-4',
    teil: 3,
    question_number: 13,
    title: 'Hinweisschild im Ruhewagen eines ICE-Zuges',
    context_header: 'Deutsche Bahn — Ruhebereich / Quiet Zone',
    context_body: `Willkommen im Ruhebereich!

In diesem Wagen möchten Fahrgäste entspannt reisen, lesen oder schlafen.

Bitte beachten Sie:
- Führen Sie Telefongespräche bitte im Vorraum oder im Bistrowagen.
- Bitte stellen Sie elektronische Geräte auf lautlos und hören Sie Musik nur mit Kopfhörern in leiser Lautstärke.`,
    statement: 'Man darf im Ruhebereich laut mit dem Handy telefonieren.',
    correct_answer: 'falsch',
    clue_quote: 'Führen Sie Telefongespräche bitte im Vorraum oder im Bistrowagen.',
    explanation_ru: 'В зоне тишины (Ruhebereich) разговаривать по телефону прямо в вагоне запрещено: пассажиров просят выходить для разговоров в тамбур или вагон-бистро («im Vorraum oder im Bistrowagen»). Утверждение неверно (Falsch).',
    explanation_de: 'Telefongespräche sind im Ruhewagen nicht gestattet, sondern nur im Vorraum/Bistro.',
    vocabulary_notes: [
      { word: 'der Ruhebereich', translation: 'зона тишины' },
      { word: 'auf lautlos stellen', translation: 'поставить на беззвучный режим' },
      { word: 'Telefongespräche führen', translation: 'разговаривать по телефону' }
    ]
  },
  {
    id: 'm4-q14',
    exam_id: 'modellsatz-4',
    teil: 3,
    question_number: 14,
    title: 'Schild an den Umkleidekabinen im Modegeschäft',
    context_header: 'H&M Filiale — Kabinenordnung',
    context_body: `Liebe Kundinnen und Kunden,

zur Vermeidung von langen Wartezeiten bitten wir um Verständnis:
Bitte nehmen Sie maximal 4 Kleidungsstücke gleichzeitig mit in die Umkleidekabine.

Weitere Teile können Sie an der Sammelstange vor der Kabine deponieren.`,
    statement: 'Man darf höchstens 4 Kleidungsstücke auf einmal in die Kabine mitnehmen.',
    correct_answer: 'richtig',
    clue_quote: 'Bitte nehmen Sie maximal 4 Kleidungsstücke gleichzeitig mit in die Umkleidekabine.',
    explanation_ru: 'Надпись гласит: разрешается брать максимум 4 вещи одновременно («maximal 4 Kleidungsstücke gleichzeitig»). Слово «höchstens» в немецком является синонимом «maximal» (не более, самое большее). Утверждение верно (Richtig).',
    explanation_de: 'Maximal 4 Kleidungsstücke bedeutet höchstens 4 Teile.',
    vocabulary_notes: [
      { word: 'maximal / höchstens', translation: 'максимум / не более' },
      { word: 'die Umkleidekabine', translation: 'примерочная кабина' },
      { word: 'das Kleidungsstück (-e)', translation: 'предмет одежды' }
    ]
  },
  {
    id: 'm4-q15',
    exam_id: 'modellsatz-4',
    teil: 3,
    question_number: 15,
    title: 'Zettel an der Eingangstür einer Tierarztpraxis',
    context_header: 'Kleintierpraxis Dr. med. vet. Helga Brandt',
    context_body: `Achtung Notdienst am Wochenende!

Unsere Praxis ist am Samstag und Sonntag regulär geschlossen.

In lebensbedrohlichen Notfällen für Hund oder Katze erreichen Sie die Tierklinik Westend rund um die Uhr unter Tel. 089 / 99 88 77.

Unsere normalen Sprechstunden beginnen wieder am Montag ab 08:30 Uhr.`,
    statement: 'Die Kleintierpraxis von Dr. Brandt ist am Sonntag für normale Sprechstunden geöffnet.',
    correct_answer: 'falsch',
    clue_quote: 'Unsere Praxis ist am Samstag und Sonntag regulär geschlossen. Unsere normalen Sprechstunden beginnen wieder am Montag ab 08:30 Uhr.',
    explanation_ru: 'В объявлении написано: практика в субботу и воскресенье закрыта («Samstag und Sonntag regulär geschlossen»), а обычные приемы начнутся только в понедельник («beginnen wieder am Montag ab 08:30 Uhr»). В экстренных случаях обращаться в дежурную клинику. Утверждение неверно (Falsch).',
    explanation_de: 'Die Praxis ist am Sonntag geschlossen, Sprechstunden gibt es erst wieder am Montag.',
    vocabulary_notes: [
      { word: 'geschlossen', translation: 'закрыто' },
      { word: 'die Sprechstunde', translation: 'часы приёма врача' },
      { word: 'der Notdienst', translation: 'экстренная / дежурная служба' }
    ]
  }
];
