/**
 * Schreiben Leitpunkte benchmark: 3 tasks x 10 letters.
 * expectedLp is an agent annotation derived from each letter type, not a teacher rating;
 * null marks letters whose rating is ambiguous (telegraphic style). See todo P2: teacher-rated corpus.
 */

export const BENCHMARK_TASKS = [
  {
    id: 'task_1',
    title: 'Task 1: Entschuldigung Deutschkurs',
    question: {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Grund für Ihr Schreiben', intent: 'REASON_EXPLANATION', keywords: ['krank', 'arzt', 'fieber', 'kopfschmerz', 'termin'], requiredMatches: 1 },
            { id: 'lp2', label: 'Wie lange Sie fehlen', intent: 'GENERAL', evidence: 'temporal', keywords: ['tage', 'woche', 'freitag', 'montag', 'dauer'], requiredMatches: 1 },
            { id: 'lp3', label: 'Hausaufgaben', intent: 'ACTION_REQUEST', keywords: ['hausaufgabe', 'hausaufgaben', 'schicken', 'senden', 'aufgabe'], requiredMatches: 1 },
          ],
        },
      },
    },
    letters: [
      { id: 'T1_01', type: 'Gold Standard', expectedLp: [2, 2, 2], text: `Sehr geehrte Frau Müller,\nich kann heute leider nicht zum Deutschkurs kommen, weil ich krank bin und hohes Fieber habe. Ich muss zwei Tage im Bett bleiben. Können Sie mir bitte die Hausaufgaben per E-Mail schicken?\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_02', type: 'Missing Zeitraum', expectedLp: [2, 0, 2], text: `Sehr geehrte Frau Müller,\nich kann nicht zum Unterricht kommen, weil mein Sohn krank ist. Bitte schicken Sie mir die Hausaufgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_03', type: 'Missing Hausaufgaben', expectedLp: [2, 2, 0], text: `Sehr geehrte Frau Müller,\nich habe starke Kopfschmerzen und kann nicht zum Kurs kommen. Ich bleibe bis Montag zu Hause.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_04', type: 'V2 Syntax Violation', expectedLp: [2, 2, 2], text: `Sehr geehrte Frau Müller,\nheute ich kann nicht kommen, weil ich bin sehr krank. Ich fehle zwei Tage. Bitte Sie schicken mir die Hausaufgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_05', type: 'Severe A1 Typos', expectedLp: [2, 2, 2], text: `Sehr geehrte Frau Müller,\nich binn ser krangk und gehe zum artzt. Ich bleibe drey tage zuhause. Bitte senden Sie mir di hausafgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_06', type: 'Informal Salutation', expectedLp: [2, 2, 2], text: `Hallo Frau Müller,\nich bin krank und kann nicht zum Kurs kommen. Ich fehle bis Freitag. Schicken Sie mir bitte die Hausaufgaben.\nViele Grüße\nAnna Schmidt` },
      { id: 'T1_07', type: 'Semantic Negation (No HW)', expectedLp: [2, 2, 0], text: `Sehr geehrte Frau Müller,\nich bin krank und kann nicht kommen. Ich fehle drei Tage. Ich habe hohes Fieber und kann keine Hausaufgaben machen.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_08', type: 'Missing Grund', expectedLp: [0, 2, 2], text: `Sehr geehrte Frau Müller,\nich bin bis Freitag nicht da und fehle zwei Tage. Bitte schicken Sie mir die Hausaufgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_09', type: 'Telegraphic Minimal', expectedLp: null, text: `Frau Müller,\nkrank. Zwei Tage weg. Hausaufgabe bitte.\nGrüße Anna` },
      { id: 'T1_10', type: 'Completely Off-topic', expectedLp: [0, 0, 0], text: `Sehr geehrte Frau Müller,\ndas Wetter in Berlin ist sehr schön und ich esse gern Pizza im Restaurant mit Freunden.\nMit freundlichen Grüßen\nAnna Schmidt` },
    ],
  },
  {
    id: 'task_2',
    title: 'Task 2: Wohnungsanzeige & Besichtigung',
    question: {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Grund des Schreibens', intent: 'REASON_EXPLANATION', keywords: ['wohnung', 'anzeige', 'mieten', 'interessiere'], requiredMatches: 1 },
            { id: 'lp2', label: 'Personen und Beruf', intent: 'GENERAL', aspects: [{ label: 'Personen', evidence: 'personCount' }, { label: 'Beruf' }], keywords: ['personen', 'person', 'frau', 'mann', 'beruf', 'arbeit', 'ingenieur', 'arzt'], requiredMatches: 1 },
            { id: 'lp3', label: 'Termin für die Besichtigung', intent: 'APPOINTMENT_PROPOSAL', evidence: 'temporal', keywords: ['termin', 'besichtigung', 'besichtigen', 'sehen', 'samstag'], requiredMatches: 1 },
          ],
        },
      },
    },
    letters: [
      { id: 'T2_01', type: 'Gold Standard', expectedLp: [2, 2, 2], text: `Sehr geehrter Herr Schneider,\nich interessiere mich sehr für Ihre 2-Zimmer-Wohnung. Wir sind zwei Personen, meine Frau und ich, und ich arbeite als Ingenieur. Wann können wir die Wohnung besichtigen?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_02', type: 'Trap: Personen without Beruf', expectedLp: [2, 1, 2], text: `Sehr geehrter Herr Schneider,\nich interessiere mich für Ihre Wohnung. Wir sind drei Personen, meine Frau und mein Kind. Wann haben Sie Zeit für einen Termin zur Besichtigung?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_03', type: 'Trap: Beruf without Personen', expectedLp: [2, 1, 2], text: `Sehr geehrter Herr Schneider,\nich habe Ihre Anzeige gelesen und möchte die Wohnung mieten. Ich arbeite als Arzt im Krankenhaus. Können wir am Samstag einen Termin machen?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_04', type: 'Missing Besichtigung', expectedLp: [2, 2, 0], text: `Sehr geehrter Herr Schneider,\nich möchte gern Ihre Wohnung mieten. Wir sind zwei Personen und ich arbeite als Verkäufer.\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_05', type: 'V2 Syntax Violations', expectedLp: [2, 2, 2], text: `Sehr geehrter Herr Schneider,\ngestern ich habe Ihre Anzeige gesehen und ich möchte die Wohnung. Wir sind zwei Personen und ich arbeite bei Siemens. Wann wir können machen einen Termin?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_06', type: 'Severe A1 Typos', expectedLp: [2, 2, 2], text: `Sehr geehrter Herr Schneider,\nich intehresire mich fur di vonung. Wir sint 2 personen und ich arbeite als koch. Wan kan man di vonung sehn?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_07', type: 'Informal Salutation', expectedLp: [2, 1, 2], text: `Hallo Herr Schneider,\nich interessiere mich für die Wohnung. Wir sind zwei Personen und arbeiten beide. Wann ist ein Termin möglich?\nViele Grüße\nDmitri Ivanov` },
      { id: 'T2_08', type: 'Semantic Negation (Too expensive)', expectedLp: [2, 1, 0], text: `Sehr geehrter Herr Schneider,\nich habe Ihre Anzeige gesehen. Wir sind zwei Personen und arbeiten hier. Aber die Wohnung ist zu teuer, ich möchte keine Besichtigung machen.\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_09', type: 'Telegraphic Minimal', expectedLp: null, text: `Interesse an Wohnung. Zwei Personen, Ingenieur. Termin morgen 14 Uhr?\nDmitri` },
      { id: 'T2_10', type: 'Completely Off-topic', expectedLp: [0, 0, 0], text: `Sehr geehrter Herr Schneider,\nich möchte mein Auto verkaufen für 5000 Euro. Rufen Sie mich bitte an.\nMit freundlichen Grüßen\nDmitri Ivanov` },
    ],
  },
  {
    id: 'task_3',
    title: 'Task 3: Antwort auf Geburtstagseinladung',
    question: {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Dank und Zusage', intent: 'GENERAL', keywords: ['dank', 'danke', 'einladung', 'komme', 'gern'], requiredMatches: 1 },
            { id: 'lp2', label: 'Begleitperson', intent: 'GENERAL', evidence: 'personCount', keywords: ['mann', 'freund', 'schwester', 'kind', 'mit'], requiredMatches: 1 },
            { id: 'lp3', label: 'Mitbringen oder Hilfe', intent: 'ACTION_REQUEST', keywords: ['mitbringen', 'kuchen', 'salat', 'getränk', 'wein', 'hilfe'], requiredMatches: 1 },
          ],
        },
      },
    },
    letters: [
      { id: 'T3_01', type: 'Gold Standard', expectedLp: [2, 2, 2], text: `Liebe Maria,\nvielen Dank für deine Einladung zum Geburtstag! Ich komme sehr gern zu deiner Party. Mein Mann kommt auch mit. Soll ich einen Kuchen oder Getränke mitbringen?\nHerzliche Grüße\nOlga` },
      { id: 'T3_02', type: 'Trap: Dank without explicit Zusage', expectedLp: [1, 2, 2], text: `Liebe Maria,\nvielen Dank für die Einladung. Mein Mann und ich haben uns sehr gefreut. Wir bringen einen Salat mit.\nHerzliche Grüße\nOlga` },
      { id: 'T3_03', type: 'Missing Begleitperson', expectedLp: [2, 0, 2], text: `Liebe Maria,\ndanke für die Einladung, ich komme gern zu deiner Feier! Ich kann einen leckeren Schokoladenkuchen mitbringen.\nHerzliche Grüße\nOlga` },
      { id: 'T3_04', type: 'Missing Mitbringen/Hilfe', expectedLp: [2, 2, 0], text: `Liebe Maria,\nvielen Dank für die Einladung, ich komme sehr gern. Meine Schwester kommt auch mit.\nHerzliche Grüße\nOlga` },
      { id: 'T3_05', type: 'V2 Syntax Violations', expectedLp: [2, 2, 2], text: `Liebe Maria,\ndanke für Einladung, ich komme gern. Mein Mann er kommt auch mit. Ich kann mitbringen einen Salat.\nHerzliche Grüße\nOlga` },
      { id: 'T3_06', type: 'Severe A1 Typos', expectedLp: [2, 2, 2], text: `Libe Maria,\nfilen dank fur di einladunk, ich kome gern. Mein man komt mit. Ich kan kuhen mitbrengen.\nGrusse\nOlga` },
      { id: 'T3_07', type: 'Hyper-formal in Casual Context', expectedLp: [2, 2, 2], text: `Sehr geehrte Frau Maria,\nvielen Dank für Ihre Einladung, ich komme gern. Mein Mann kommt mit und wir bringen Wein mit.\nMit freundlichen Grüßen\nOlga` },
      { id: 'T3_08', type: 'Absage (Semantic Negation)', expectedLp: [1, 0, 0], text: `Liebe Maria,\nvielen Dank für die Einladung, aber ich kann leider nicht kommen, weil ich arbeiten muss. Mein Mann kann auch nicht kommen. Tut mir leid!\nHerzliche Grüße\nOlga` },
      { id: 'T3_09', type: 'Telegraphic Minimal', expectedLp: null, text: `Hallo Maria,\nkomme gern. Mann kommt mit. Bringe Bier mit.\nOlga` },
      { id: 'T3_10', type: 'Completely Off-topic', expectedLp: [0, 0, 0], text: `Liebe Maria,\nich habe gestern einen neuen Computer gekauft und das Internet funktioniert nicht gut.\nViele Grüße\nOlga` },
    ],
  },
];
