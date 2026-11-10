/**
 * Example banks of the three MERLIN evaluation tasks for the keyword-free evidence head, in the shape of
 * src/data/exams/example-bank/<task>.json: per Leitpunkt fulfilling phrases and near misses by type, phrases of
 * another purpose to the same friend, and prototype letters on and off the task. Written from the task prompts only
 * (2026-11-09), before any grader read these tasks' letters; no MERLIN letter was read by the author.
 */

export const merlinEvidenceBanks = {
  'merlin-a1-wohnung': {
    units: {
      lp1: {
        fulfils: ['Ich brauche ab dem 1. Mai eine Wohnung in Neuburg.', 'Ich ziehe im Juni nach Neuburg.', 'Nächsten Monat fange ich mit der Arbeit an, dann brauche ich eine Wohnung.', 'Die neue Wohnung brauche ich schon im März.', 'Ich möchte so schnell wie möglich umziehen, am besten in zwei Wochen.', 'Ab Oktober wohne ich in Neuburg.', 'ich brauch wohnung ab erste april', 'Meine Arbeit beginnt am 15. August, bis dahin brauche ich eine Wohnung.'],
        misses: {
          refusal: ['Ich brauche keine Wohnung, ich wohne bei meiner Firma.', 'Eine Wohnung brauche ich nicht.'],
          opposite: ['Ich ziehe aus Neuburg weg.', 'Ich habe schon eine Wohnung in Neuburg gefunden.'],
          past: ['Letztes Jahr habe ich in Neuburg gewohnt.', 'Vor zwei Jahren habe ich eine Wohnung gesucht.'],
          vague: ['Ich brauche irgendwann eine Wohnung.', 'Das mit der Wohnung ist ein Problem.'],
          otherTopic: ['Meine Schwester sucht eine Wohnung in Berlin.', 'Ich habe eine neue Arbeit in Neuburg.'],
        },
      },
      lp2: {
        fulfils: ['Die Wohnung soll zwei Zimmer haben.', 'Ich brauche nur ein kleines Zimmer mit Küche.', 'Sie muss ungefähr 60 Quadratmeter groß sein.', 'Wir sind drei Personen, wir brauchen drei Zimmer.', 'Eine Einzimmerwohnung ist genug für mich.', 'Die Wohnung darf nicht zu klein sein, mindestens 50 m².', 'wohnung mit 2 zimmer und balkon bitte', 'Ich möchte eine große Wohnung mit Garten.'],
        misses: {
          refusal: ['Die Größe ist egal.', 'Wie groß, das ist nicht wichtig.'],
          opposite: ['Ich brauche keine große Wohnung, ich brauche ein Haus.', 'Ich will kein Zimmer, nur ein Bett.'],
          past: ['Meine alte Wohnung hatte drei Zimmer.', 'Früher hatte ich eine große Wohnung.'],
          vague: ['Die Wohnung soll schön sein.', 'Sie soll nicht so teuer sein.'],
          otherTopic: ['Neuburg ist eine kleine Stadt.', 'Meine neue Firma ist sehr groß.'],
        },
      },
      lp3: {
        fulfils: ['Kannst du mir bei der Wohnungssuche helfen?', 'Bitte hilf mir, eine Wohnung zu finden.', 'Kannst du in der Zeitung nach Wohnungen schauen?', 'Weißt du eine freie Wohnung in Neuburg?', 'Kannst du für mich einen Vermieter fragen?', 'Hast du Zeit, mit mir Wohnungen anzusehen?', 'hilfst du mir bitte wohnung suchen', 'Vielleicht kennst du jemanden, der eine Wohnung vermietet?'],
        misses: {
          refusal: ['Ich brauche keine Hilfe, ich finde allein eine Wohnung.', 'Du musst mir nicht helfen.'],
          opposite: ['Ich kann dir bei deiner Wohnung helfen.', 'Ich helfe dir gern beim Umzug.'],
          past: ['Danke für deine Hilfe letztes Jahr.', 'Du hast mir damals sehr geholfen.'],
          vague: ['Was meinst du?', 'Das ist alles nicht so einfach.'],
          otherTopic: ['Kannst du mir mit meinem Computer helfen?', 'Kannst du mir Geld leihen?'],
        },
      },
    },
    otherPurpose: ['Hast du am Samstag Zeit für einen Kaffee?', 'Herzlichen Glückwunsch zum Geburtstag!', 'Ich lade dich zu meiner Party ein.', 'Danke für das schöne Geschenk.', 'Wie geht es deiner Familie?', 'Ich bin krank und kann morgen nicht kommen.', 'Kannst du mir dein Auto leihen?', 'Ich war im Urlaub in Spanien, es war super.', 'Wollen wir zusammen ins Kino gehen?', 'Ich suche eine neue Arbeit, hast du eine Idee?', 'Kannst du am Wochenende auf meine Katze aufpassen?', 'Meine neue Wohnung ist fertig, komm mich besuchen!'],
    purposeLetters: {
      onTask: [
        'Lieber Ingo,\nich habe eine Arbeit in Neuburg gefunden und brauche ab Mai eine Wohnung. Sie soll zwei Zimmer haben. Kannst du mir bei der Suche helfen?\nViele Grüße\nAnna',
        'Hallo Ingo,\nich ziehe im Juni nach Neuburg, meine neue Arbeit beginnt dann. Ich suche eine kleine Wohnung, ein Zimmer reicht. Weißt du vielleicht etwas? Bitte hilf mir!\nBis bald\nTom',
        'Lieber Ingo,\nweißt du schon? Ich arbeite bald in Neuburg! Ich brauche schnell eine Wohnung, am besten nächsten Monat. 50 Quadratmeter sind gut. Kannst du in der Zeitung schauen?\nLiebe Grüße\nMaria',
        'Hallo Ingo,\nich brauche eine Wohnung in Neuburg ab 1. Oktober. Groß muss sie nicht sein, aber mit Küche. Kannst du mit mir Wohnungen ansehen?\nDein Ali',
      ],
      offTask: [
        'Lieber Ingo,\nherzlichen Glückwunsch zum Geburtstag! Ich wünsche dir alles Gute. Am Samstag mache ich eine Party, kommst du?\nViele Grüße\nAnna',
        'Hallo Ingo,\nich bin jetzt in meiner neuen Wohnung in Neuburg. Sie hat drei Zimmer und einen Balkon. Komm mich doch am Sonntag besuchen!\nBis bald\nTom',
        'Lieber Ingo,\nich fahre im Juli in Urlaub nach Italien. Kannst du in dieser Zeit meine Blumen gießen? Ich gebe dir den Schlüssel.\nLiebe Grüße\nMaria',
        'Hallo Ingo,\nwie geht es dir? Ich bin krank und kann am Freitag nicht zum Fußball kommen. Wir sehen uns nächste Woche.\nDein Ali',
        'Lieber Ingo,\nvielen Dank für deine Hilfe beim Umzug! Die neue Wohnung ist sehr schön. Ich lade dich zum Essen ein.\nViele Grüße\nAnna',
        'Hallo Ingo,\nmeine Schwester sucht eine Arbeit in Neuburg. Weißt du eine Firma? Sie ist Köchin.\nBis bald\nTom',
      ],
    },
  },
  'merlin-a1-schwimmen': {
    units: {
      lp1: {
        fulfils: ['Wir können ins Hallenbad in der Stadt gehen.', 'Ich möchte mit dir zum See fahren.', 'Gehen wir ins Freibad am Park?', 'Wir treffen uns vor dem Schwimmbad.', 'Komm mit an den Strand!', 'Das neue Schwimmbad in der Bahnhofstraße ist toll.', 'wir gehen in schwimmbad im zentrum', 'Wir können im Fluss hinter meinem Haus schwimmen.'],
        misses: {
          refusal: ['Ich weiß nicht, wo wir schwimmen können.', 'Wohin, ist mir egal.'],
          opposite: ['Wir gehen nicht ins Schwimmbad, wir gehen ins Kino.', 'Das Schwimmbad ist zu, wir bleiben zu Hause.'],
          past: ['Letzte Woche war ich im Hallenbad.', 'Früher bin ich oft im See geschwommen.'],
          vague: ['Wir können irgendwo schwimmen.', 'Schwimmen ist super.'],
          otherTopic: ['Ich wohne in der Bahnhofstraße.', 'Wir gehen in ein Restaurant essen.'],
        },
      },
      lp2: {
        fulfils: ['Hast du am Samstag um 10 Uhr Zeit?', 'Wir können morgen Nachmittag gehen.', 'Ich möchte am Sonntag schwimmen gehen.', 'Treffen wir uns um drei Uhr?', 'Am Wochenende habe ich frei, dann können wir gehen.', 'Wie wäre es am Freitag nach der Arbeit?', 'wir gehen mittwoch um 4', 'Nächsten Dienstag um 18 Uhr passt mir gut.'],
        misses: {
          refusal: ['Ich habe keine Zeit.', 'Wann, weiß ich noch nicht.'],
          opposite: ['Am Samstag kann ich nicht schwimmen gehen.', 'Diese Woche geht es leider gar nicht.'],
          past: ['Letzten Sonntag war ich schwimmen.', 'Gestern war das Wetter schön.'],
          vague: ['Wir gehen bald zusammen.', 'Irgendwann im Sommer.'],
          otherTopic: ['Ich arbeite jeden Tag bis 18 Uhr.', 'Wann hast du Geburtstag?'],
        },
      },
      lp3: {
        fulfils: ['Bring bitte ein Handtuch mit.', 'Vergiss deinen Badeanzug nicht!', 'Nimm Sonnencreme und etwas zu trinken mit.', 'Du musst Geld für den Eintritt mitbringen.', 'Bitte bring auch deine Badekappe.', 'Du brauchst ein Handtuch und einen Bikini.', 'bring bitte handtuch und essen', 'Pack bitte deine Badesachen ein.'],
        misses: {
          refusal: ['Du musst nichts mitbringen.', 'Bring bitte nichts mit.'],
          opposite: ['Ich bringe einen Kuchen mit.', 'Ich nehme mein Handtuch mit.'],
          past: ['Letztes Mal hast du dein Handtuch vergessen.', 'Ich habe einen neuen Badeanzug gekauft.'],
          vague: ['Du weißt schon, was du brauchst.', 'Wir brauchen viele Sachen.'],
          otherTopic: ['Kannst du mir dein Buch zurückgeben?', 'Das Wasser ist sehr kalt.'],
        },
      },
    },
    otherPurpose: ['Herzlichen Glückwunsch zum Geburtstag!', 'Kannst du mir bei der Wohnungssuche helfen?', 'Ich bin krank und bleibe heute im Bett.', 'Danke für den schönen Abend gestern.', 'Wollen wir zusammen kochen?', 'Ich lade dich zu meiner Hochzeit ein.', 'Kannst du mir dein Fahrrad leihen?', 'Wie war dein Urlaub in Spanien?', 'Ich habe eine neue Arbeit gefunden.', 'Wollen wir am Samstag ins Kino gehen?', 'Mein Bruder besucht mich nächste Woche.', 'Ich kann leider nicht zu deiner Party kommen.'],
    purposeLetters: {
      onTask: [
        'Liebe Daniela,\nmöchtest du mit mir schwimmen gehen? Wir können ins Hallenbad in der Stadt gehen. Hast du am Samstag um 10 Uhr Zeit? Bring bitte ein Handtuch mit.\nLiebe Grüße\nAnna',
        'Hallo Daniela,\nes ist so heiß! Wollen wir am Sonntag zum See fahren und schwimmen? Ich hole dich um 14 Uhr ab. Vergiss deinen Badeanzug nicht!\nBis dann\nTom',
        'Liebe Daniela,\nich gehe am Mittwoch nach der Arbeit ins Freibad. Kommst du mit? Wir treffen uns um 17 Uhr am Eingang. Nimm Sonnencreme und Geld mit.\nViele Grüße\nMaria',
        'Hallo Daniela,\nhast du Lust zu schwimmen? Das neue Schwimmbad ist super. Gehen wir morgen um 4? Bring bitte deine Badekappe, die braucht man dort.\nDein Ali',
      ],
      offTask: [
        'Liebe Daniela,\nherzlichen Glückwunsch zum Geburtstag! Ich wünsche dir alles Gute und viel Glück. Wir feiern am Samstag, oder?\nLiebe Grüße\nAnna',
        'Hallo Daniela,\nwollen wir am Samstag ins Kino gehen? Der neue Film beginnt um 20 Uhr. Bring bitte Geld für Popcorn mit.\nBis dann\nTom',
        'Liebe Daniela,\nich kann am Sonntag leider nicht mit zum Schwimmen kommen, ich bin krank. Viel Spaß im Schwimmbad!\nViele Grüße\nMaria',
        'Hallo Daniela,\ndanke für den schönen Tag am See gestern. Das Wasser war toll. Ich habe dein Handtuch noch, ich bringe es dir morgen.\nDein Ali',
        'Liebe Daniela,\nich lade dich zum Essen ein. Komm am Freitag um 19 Uhr zu mir. Bring bitte einen Salat mit.\nLiebe Grüße\nAnna',
        'Hallo Daniela,\nich suche eine neue Wohnung. Kannst du mir helfen? Vielleicht weißt du etwas in deiner Straße.\nBis bald\nTom',
      ],
    },
  },
  'merlin-a1-baby': {
    units: {
      lp1: {
        fulfils: ['Herzlichen Glückwunsch zur Geburt deines Babys!', 'Ich gratuliere dir, jetzt bist du Vater!', 'Ich freue mich so für dich und deine Familie!', 'Alles Gute für euch und das Baby!', 'Toll, dass euer Kind da ist!', 'Ich wünsche euch viel Glück mit dem Baby.', 'herzliche glückwunsch zu baby', 'Super, du bist Papa! Das ist wunderbar.'],
        misses: {
          refusal: ['Ich gratuliere nicht gern.', 'Ein Baby ist nichts für mich.'],
          opposite: ['Schade, dass ihr kein Baby bekommt.', 'Das ist eine schlechte Nachricht.'],
          past: ['Letztes Jahr hat meine Schwester ein Baby bekommen.', 'Ich habe dir zur Hochzeit gratuliert.'],
          vague: ['Ich habe deine Nachricht bekommen.', 'Da ist ja viel passiert.'],
          otherTopic: ['Herzlichen Glückwunsch zum Geburtstag!', 'Ich gratuliere dir zur neuen Arbeit.'],
        },
      },
      lp2: {
        fulfils: ['Wie heißt das Baby?', 'Wie ist der Name von deinem Sohn?', 'Habt ihr schon einen Namen für eure Tochter?', 'Sag mir bitte, wie das Baby heißt.', 'Wie heißt deine kleine Tochter?', 'Welchen Namen hat euer Kind?', 'wie heist dein baby', 'Ist es ein Junge oder ein Mädchen und wie heißt es?'],
        misses: {
          refusal: ['Der Name ist mir egal.', 'Den Namen musst du mir nicht sagen.'],
          opposite: ['Ich heiße Anna.', 'Mein Sohn heißt Max.'],
          past: ['Wie hieß dein Hund früher?', 'Ich habe den Namen vergessen.'],
          vague: ['Erzähl mir alles.', 'Wie ist das Baby?'],
          otherTopic: ['Wie alt ist das Baby?', 'Wie heißt deine neue Stadt?'],
        },
      },
      lp3: {
        fulfils: ['Wie geht es deiner Frau?', 'Ist die Mutter gesund?', 'Geht es Maria und dem Baby gut?', 'Wie geht es der Mama nach der Geburt?', 'Ist deine Frau noch im Krankenhaus?', 'Ich hoffe, deiner Frau geht es gut.', 'wie geht dein frau', 'Wie fühlt sich deine Freundin jetzt?'],
        misses: {
          refusal: ['Wie es deiner Frau geht, ist mir egal.', 'Deine Frau interessiert mich nicht.'],
          opposite: ['Meiner Frau geht es gut.', 'Meine Mutter ist gesund.'],
          past: ['Wie war die Hochzeit mit deiner Frau?', 'Letztes Jahr war deine Frau krank.'],
          vague: ['Wie geht es euch?', 'Alles gut bei euch?'],
          otherTopic: ['Wie geht es deinen Eltern?', 'Grüß deine Mutter von mir.'],
        },
      },
    },
    otherPurpose: ['Herzlichen Glückwunsch zum Geburtstag!', 'Ich lade dich zu meiner Hochzeit ein.', 'Kannst du mir beim Umzug helfen?', 'Wollen wir am Samstag Fußball spielen?', 'Danke für dein Geschenk.', 'Ich bin krank und kann nicht kommen.', 'Ich habe eine neue Arbeit gefunden.', 'Wie war dein Urlaub?', 'Kannst du mir dein Auto leihen?', 'Ich gratuliere dir zur neuen Wohnung.', 'Wir bekommen auch bald ein Baby.', 'Ich ziehe nächsten Monat nach Berlin.'],
    purposeLetters: {
      onTask: [
        'Lieber Jens,\nherzlichen Glückwunsch, du bist Vater! Ich freue mich sehr für euch. Wie heißt das Baby? Und wie geht es deiner Frau?\nViele Grüße\nAnna',
        'Hallo Jens,\nich habe gehört, euer Kind ist da. Super! Alles Gute für euch drei. Ist es ein Junge oder ein Mädchen und wie heißt es? Geht es der Mama gut?\nBis bald\nTom',
        'Lieber Jens,\ntoll, du bist jetzt Papa! Ich gratuliere dir. Sag mir bitte, wie das Baby heißt. Ist deine Frau noch im Krankenhaus?\nLiebe Grüße\nMaria',
        'Hallo Jens,\nalles Gute zur Geburt! Wie ist der Name von eurer Tochter? Ich hoffe, Sabine geht es gut.\nDein Ali',
      ],
      offTask: [
        'Lieber Jens,\nherzlichen Glückwunsch zum Geburtstag! Ich wünsche dir alles Gute. Was machst du am Samstag?\nViele Grüße\nAnna',
        'Hallo Jens,\nich gratuliere dir zur neuen Arbeit! Wie ist dein Chef? Wann beginnst du?\nBis bald\nTom',
        'Lieber Jens,\nwir bekommen im Mai ein Baby! Ich bin so glücklich. Kannst du uns dein altes Kinderbett geben?\nLiebe Grüße\nMaria',
        'Hallo Jens,\nich lade dich und deine Frau zu meiner Hochzeit ein. Sie ist am 12. Juni. Kommt ihr?\nDein Ali',
        'Lieber Jens,\nwie geht es dir? Ich war krank, aber jetzt geht es mir besser. Wollen wir am Sonntag spazieren gehen?\nViele Grüße\nAnna',
        'Hallo Jens,\nkannst du mir beim Umzug helfen? Ich ziehe am Samstag in eine neue Wohnung.\nBis bald\nTom',
      ],
    },
  },
};
