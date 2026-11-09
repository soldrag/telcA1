/**
 * Schreiben Teil 2 tasks of the MERLIN corpus (telc A1, German), used only to evaluate the grader on real exam letters
 * (`npm run eval:merlin`). Not part of the app. Task texts: MERLIN tasks v1.2 (CC BY-SA 4.0, see CREDITS.md).
 * Rubrics and example phrases are written from the task text only, before any letter was read; keywords hold task
 * words only, no general words ("geht", "wann"), and a point is compound only where `aspects` says so.
 */

const INSTRUCTION = 'Schreiben Sie zu jedem Punkt ein bis zwei Sätze (circa 30 Wörter). Vergessen Sie nicht den passenden Anfang und den Gruß am Schluss.';

function task({ id, title, situation, leitpunkte, criteria, sampleSolution }) {
  return {
    id,
    teil: 2,
    level: 'A1',
    title,
    situation,
    context_body: leitpunkte.map((lp, i) => `${i + 1}. ${lp}`).join('\n'),
    statement: INSTRUCTION,
    options_json: {
      type: 'essay',
      min_words: 30,
      leitpunkte,
      rubric: { addresseeRegister: 'informal', leitpunkte_criteria: criteria },
      sample_solution: sampleSolution,
    },
  };
}

export const merlinTasks = [
  task({
    id: 'merlin-a1-wohnung',
    title: 'MERLIN 1071_020200 • Wohnung in Neuburg',
    situation: 'Sie haben eine Arbeit in Neuburg gefunden. Sie brauchen eine Wohnung in Neuburg. Ihr Freund Ingo wohnt in Neuburg. Schreiben Sie Ihrem Freund Ingo eine E-Mail.',
    leitpunkte: ['Neue Wohnung – wann?', 'Größe der Wohnung', 'Hilfe bei der Wohnungssuche'],
    criteria: [
      {
        id: 'lp1', label: 'Neue Wohnung – wann?', intent: 'GENERAL', evidence: 'temporal',
        keywords: ['wohnung', 'brauche', 'umziehen', 'einziehen'], requiredMatches: 1,
        examples: {
          fulfils: ['Ich brauche ab 1. Mai eine Wohnung in Neuburg.', 'Ich möchte im Juni nach Neuburg umziehen.', 'Nächsten Monat brauche ich eine neue Wohnung.', 'Die Wohnung brauche ich ab März.', 'Ab August arbeite ich in Neuburg und brauche dann eine Wohnung.', 'Ich brauch Wohnung in zwei Woche.'],
          misses: ['Ich brauche keine Wohnung.', 'Ich habe schon eine Wohnung in Neuburg gefunden.', 'Letztes Jahr habe ich eine Wohnung gesucht.', 'Meine Wohnung in Berlin ist sehr schön.', 'Ich habe eine Arbeit in Neuburg gefunden.'],
        },
      },
      {
        id: 'lp2', label: 'Größe der Wohnung', intent: 'GENERAL',
        keywords: ['zimmer', 'quadratmeter', 'qm', 'küche', 'balkon', 'groß', 'klein'], requiredMatches: 1,
        examples: {
          fulfils: ['Die Wohnung soll zwei Zimmer haben.', 'Ich suche eine kleine Wohnung mit Küche und Bad.', 'Sie muss etwa 50 Quadratmeter groß sein.', 'Ein Zimmer reicht für mich.', 'Ich brauche drei Zimmer, wir sind vier Personen.', 'Die Wohnung nicht so groß, 40 qm.'],
          misses: ['Die Größe ist mir egal.', 'Die Wohnung soll billig sein.', 'Neuburg ist eine große Stadt.', 'Meine Firma ist sehr groß.', 'Die Wohnung soll im Zentrum sein.'],
        },
      },
      {
        id: 'lp3', label: 'Hilfe bei der Wohnungssuche', intent: 'ACTION_REQUEST',
        keywords: ['hilfe', 'helfen', 'hilfst', 'wohnungssuche', 'anzeige', 'suchen'], requiredMatches: 1,
        examples: {
          fulfils: ['Kannst du mir bei der Wohnungssuche helfen?', 'Bitte hilf mir, eine Wohnung zu finden.', 'Kannst du in der Zeitung nach Anzeigen schauen?', 'Weißt du vielleicht eine freie Wohnung?', 'Kannst du für mich eine Wohnung suchen?', 'Hilfst du mir bitte Wohnung suche?'],
          misses: ['Ich brauche keine Hilfe, ich finde allein eine Wohnung.', 'Ich kann dir beim Umzug helfen.', 'Danke für deine Hilfe letztes Jahr.', 'Kannst du mir mit meinem Computer helfen?', 'Ich suche eine neue Arbeit.'],
        },
      },
    ],
    sampleSolution: 'Lieber Ingo,\n\nich habe eine Arbeit in Neuburg gefunden und brauche ab 1. Mai eine Wohnung. Die Wohnung soll zwei Zimmer und eine Küche haben. Kannst du mir bitte bei der Wohnungssuche helfen?\n\nViele Grüße\nAnna',
  }),
  task({
    id: 'merlin-a1-schwimmen',
    title: 'MERLIN 1071_120302 • Schwimmen mit Daniela',
    situation: 'Sie möchten mit Ihrer Freundin Daniela schwimmen gehen. Schreiben Sie Ihrer Freundin eine E-Mail.',
    leitpunkte: ['Wo', 'Wann', 'Was Ihre Freundin mitbringen soll'],
    criteria: [
      {
        id: 'lp1', label: 'Wo', intent: 'GENERAL',
        keywords: ['schwimmbad', 'hallenbad', 'freibad', 'see', 'strand', 'meer', 'fluss'], requiredMatches: 1,
        examples: {
          fulfils: ['Wir können im Hallenbad schwimmen.', 'Ich möchte mit dir zum See fahren.', 'Gehen wir ins Freibad in der Parkstraße?', 'Wir treffen uns am Schwimmbad.', 'Komm mit an den Strand!', 'Wir gehe in Schwimmbad.'],
          misses: ['Ich weiß nicht, wo wir schwimmen können.', 'Ich war gestern im Kino.', 'Das Schwimmbad ist heute geschlossen, wir gehen nicht.', 'Ich wohne in der Bahnhofstraße.', 'Wir gehen in ein Restaurant.'],
        },
      },
      {
        id: 'lp2', label: 'Wann', intent: 'GENERAL', evidence: 'temporal',
        keywords: ['uhr', 'samstag', 'sonntag', 'morgen', 'wochenende', 'nachmittag'], requiredMatches: 1,
        examples: {
          fulfils: ['Hast du am Samstag um 10 Uhr Zeit?', 'Wir können morgen Nachmittag gehen.', 'Ich möchte am Sonntag schwimmen gehen.', 'Treffen wir uns um drei Uhr?', 'Am Wochenende habe ich frei, gehen wir dann?', 'Wir gehen Freitag um 4.'],
          misses: ['Ich habe keine Zeit.', 'Letzten Sonntag war ich schwimmen.', 'Wann hast du Geburtstag?', 'Ich arbeite jeden Tag bis 18 Uhr.', 'Das Wetter ist heute schön.'],
        },
      },
      {
        id: 'lp3', label: 'Was Ihre Freundin mitbringen soll', intent: 'ACTION_REQUEST',
        keywords: ['mitbringen', 'mitnehmen', 'handtuch', 'badeanzug', 'bikini', 'badehose', 'sonnencreme', 'badekappe'], requiredMatches: 1,
        examples: {
          fulfils: ['Bring bitte ein Handtuch mit.', 'Vergiss deinen Badeanzug nicht!', 'Nimm Sonnencreme und etwas zu trinken mit.', 'Du musst Geld für den Eintritt mitbringen.', 'Bitte bring auch deine Badekappe.', 'Du brauchst Handtuch und Bikini.'],
          misses: ['Du musst nichts mitbringen, ich habe alles.', 'Ich bringe einen Kuchen mit.', 'Ich habe ein neues Handtuch gekauft.', 'Kannst du mir dein Buch zurückgeben?', 'Das Wasser ist sehr kalt.'],
        },
      },
    ],
    sampleSolution: 'Liebe Daniela,\n\nmöchtest du mit mir schwimmen gehen? Wir können ins Hallenbad in der Stadt gehen. Hast du am Samstag um 10 Uhr Zeit? Bring bitte ein Handtuch und deinen Badeanzug mit.\n\nLiebe Grüße\nAnna',
  }),
  task({
    id: 'merlin-a1-baby',
    title: 'MERLIN 1071_030101 • Jens ist Vater geworden',
    situation: 'Ihr Freund Jens ist Vater geworden. Schreiben Sie Ihrem Freund einen Brief.',
    leitpunkte: ['Glückwünsche', 'Name des Babys?', 'Wie es der Mutter des Babys geht?'],
    criteria: [
      {
        id: 'lp1', label: 'Glückwünsche', intent: 'GENERAL',
        keywords: ['glückwunsch', 'glückwünsche', 'gratuliere', 'gratulieren', 'gratulation'], requiredMatches: 1,
        examples: {
          fulfils: ['Herzlichen Glückwunsch zur Geburt deines Babys!', 'Ich gratuliere dir, du bist Vater!', 'Ich freue mich so für dich und deine Familie!', 'Alles Gute für euch und das Baby!', 'Toll, dass du Vater bist, ich gratuliere!', 'Herzliche Gluckwunsch zu Baby!'],
          misses: ['Herzlichen Glückwunsch zum Geburtstag!', 'Ich gratuliere dir zur neuen Arbeit.', 'Ich habe von deinem Baby gehört.', 'Ich bin auch Vater von zwei Kindern.', 'Viele Grüße an deine Familie.'],
        },
      },
      {
        id: 'lp2', label: 'Name des Babys?', intent: 'INFORMATION_REQUEST',
        keywords: ['name', 'heißt', 'heisst', 'heißen'], requiredMatches: 1,
        examples: {
          fulfils: ['Wie heißt das Baby?', 'Wie ist der Name von deinem Sohn?', 'Habt ihr schon einen Namen für eure Tochter?', 'Sag mir bitte, wie das Baby heißt.', 'Wie heißt deine kleine Tochter?', 'Wie heist dein Baby?'],
          misses: ['Ich heiße Anna.', 'Der Name ist mir nicht wichtig.', 'Wie heißt deine neue Stadt?', 'Wie alt ist das Baby?', 'Wie groß ist das Baby?'],
        },
      },
      {
        id: 'lp3', label: 'Wie es der Mutter des Babys geht?', intent: 'INFORMATION_REQUEST',
        keywords: ['mutter', 'frau', 'freundin', 'partnerin', 'mama'], requiredMatches: 1,
        examples: {
          fulfils: ['Wie geht es deiner Frau?', 'Ist die Mutter gesund?', 'Geht es Maria und dem Baby gut?', 'Wie geht es der Mama nach der Geburt?', 'Ist deine Frau noch im Krankenhaus?', 'Wie geht dein Frau?'],
          misses: ['Wie geht es dir?', 'Meine Mutter ist krank.', 'Wie geht es deinen Eltern?', 'Grüß deine Mutter von mir.', 'Wie war die Arbeit heute?'],
        },
      },
    ],
    sampleSolution: 'Lieber Jens,\n\nherzlichen Glückwunsch, du bist Vater! Wie heißt das Baby? Und wie geht es deiner Frau?\n\nViele Grüße\nAnna',
  }),
];

export const MERLIN_TASK_IDS = Object.freeze(merlinTasks.map((t) => t.id));
