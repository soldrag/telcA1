/**
 * Structural evaluation cases: Golden standards, Anrede, Gruß & sender names.
 */

export const structuralCases = [
  {
    id: 'case-01-golden-modellsatz-1',
    category: 'structure',
    title: 'Modellsatz 1 Perfect Standard',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs A1 an Ihrer Sprachschule besuchen. Ich habe vier Wochen Zeit und möchte gern am Vormittag lernen. Wie viel kostet der Kurs und wie kann ich mich anmelden?\nMit freundlichen Grüßen\nMaximilian Becker`,
    expected: { anrede: 2, leitpunkte: 6, gruss: 2, minScore: 10, maxScore: 10, minErrors: 0, maxErrors: 0 }
  },
  {
    id: 'case-02-golden-doctor-cancellation',
    category: 'structure',
    title: 'Modellsatz 2 Doctor Perfect Standard',
    examId: 'schreiben-modellsatz-2',
    text: `Sehr geehrte Frau Dr. Schneider,\nich habe am Montag um 14 Uhr einen Termin bei Ihnen. Leider kann ich nicht kommen, weil ich arbeiten muss. Können wir den Termin auf nächsten Dienstag verschieben?\nMit freundlichen Grüßen\nMax Mustermann`,
    expected: { anrede: 2, leitpunkte: 6, gruss: 2, minScore: 10, maxScore: 10, minErrors: 0, maxErrors: 0 }
  },
  {
    id: 'case-03-missing-anrede',
    category: 'structure',
    title: 'Missing Salutation (Starts immediately with body)',
    examId: 'schreiben-modellsatz-1',
    text: `Ich möchte im August einen Deutschkurs A1 besuchen. Ich habe vier Wochen Zeit und möchte am Vormittag lernen. Wie viel kostet der Kurs?\nViele Grüße\nAnna Müller`,
    expected: { anrede: 0, leitpunkte: 6, gruss: 2, minScore: 7, maxScore: 8 }
  },
  {
    id: 'case-04-register-mismatch-informal',
    category: 'structure',
    title: 'Informal Salutation in Formal Context',
    examId: 'schreiben-modellsatz-2',
    text: `Hallo Frau Dr. Schneider,\nich muss meinen Termin am Montag absagen, weil ich arbeiten muss. Haben Sie am nächsten Dienstag Zeit?\nMit freundlichen Grüßen\nThomas Mann`,
    expected: { anrede: 1, leitpunkte: 6, gruss: 2, minScore: 8, maxScore: 9 }
  },
  {
    id: 'case-05-salutation-declension-typo',
    category: 'structure',
    title: 'Salutation with Adjective Ending Error (Liebe Herr)',
    examId: 'schreiben-modellsatz-2',
    text: `Liebe Herr Schneider,\nich kann am Montag um 14 Uhr nicht kommen. Ich bin krank. Können wir den Termin verschieben auf Mittwoch?\nMit freundlichen Grüßen\nLukas Weber`,
    expected: { anrede: 1, leitpunkte: 6, gruss: 2, minErrors: 1 }
  },
  {
    id: 'case-06-missing-closing',
    category: 'structure',
    title: 'Missing Closing Formula and Signature',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich möchte einen Deutschkurs im August machen. Ich habe vier Wochen Zeit am Vormittag. Wie viel kostet der Kurs und wie kann ich mich anmelden?`,
    expected: { anrede: 2, gruss: 0, maxScore: 8 }
  },
  {
    id: 'case-07-closing-without-name',
    category: 'structure',
    title: 'Closing Formula Present but Missing Sender Name',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs machen. Ich habe vier Wochen Zeit am Vormittag. Wie viel kostet der Kurs?\nMit freundlichen Grüßen`,
    expected: { anrede: 2, gruss: 1, minScore: 7, maxScore: 9 }
  },
  {
    id: 'case-08-name-without-closing',
    category: 'structure',
    title: 'Sender Name Present without Closing Formula',
    examId: 'schreiben-modellsatz-2',
    text: `Sehr geehrte Frau Dr. Schneider,\nich muss meinen Termin am Montag absagen, da ich krank bin. Geht Dienstag?\nArtem Smirnov`,
    expected: { anrede: 2, gruss: 0, minScore: 6, maxScore: 8 }
  },
  {
    id: 'case-09-closing-english-comma-trap',
    category: 'structure',
    title: 'English Comma after Closing Formula (False Positive Trap)',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs A1 machen. Ich habe vier Wochen Zeit und lerne am Vormittag. Wie viel kostet der Kurs?\nMit freundlichen Grüßen,\nMaria Ivanova`,
    expected: { anrede: 2, gruss: 2, minScore: 9, maxScore: 10 }
  }
];
