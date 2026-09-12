/**
 * Leitpunkte evaluation cases: Coverage, semantic paraphrasing, traps & false positives.
 */

export const leitpunkteCases = [
  {
    id: 'case-10-negation-trap',
    category: 'leitpunkte',
    title: 'Negation Trap (Negating guide points rather than fulfilling)',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich will keinen Deutschkurs im August machen. Ich habe keine Zeit für vier Wochen. Ich frage nicht nach Kosten.\nMit freundlichen Grüßen\nMax Müller`,
    expected: { anrede: 2, gruss: 2, algorithmicLeitpunkte: 6, aiMaxLeitpunkte: 2, minScore: 6 }
  },
  {
    id: 'case-11-condensed-single-sentence',
    category: 'leitpunkte',
    title: 'Condensed 3-in-1 Sentence (All 3 points in single complex sentence)',
    examId: 'schreiben-modellsatz-2',
    text: `Sehr geehrte Frau Dr. Schneider,\nweil ich am Montag um 14 Uhr krank bin, muss ich leider meinen Termin absagen und frage nach einem neuen Termin am nächsten Dienstag.\nMit freundlichen Grüßen\nStefan Müller`,
    expected: { anrede: 2, leitpunkte: 6, gruss: 2, minScore: 9, maxScore: 10 }
  },
  {
    id: 'case-12-reverse-order',
    category: 'leitpunkte',
    title: 'Reverse Order Fulfillment (LP3 -> LP2 -> LP1)',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nwie viel kostet der Kurs und wie kann ich mich anmelden? Ich habe vier Wochen Zeit am Vormittag. Ich möchte im August einen Deutschkurs A1 machen.\nMit freundlichen Grüßen\nJulia Meyer`,
    expected: { anrede: 2, leitpunkte: 6, gruss: 2, minScore: 9, maxScore: 10 }
  },
  {
    id: 'case-13-off-topic-rambling',
    category: 'leitpunkte',
    title: 'Off-Topic Rambling (Zero guide points addressed)',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nheute ist das Wetter in Berlin sehr schön und sonnig. Ich mag Fußball spielen und meine Katze schläft auf dem Sofa.\nMit freundlichen Grüßen\nPeter Schmidt`,
    expected: { anrede: 2, leitpunkte: 0, gruss: 2, maxScore: 4 }
  },
  {
    id: 'case-14-partial-coverage-single-lp',
    category: 'leitpunkte',
    title: 'Partial Coverage (Only LP1 addressed, missing LP2 and LP3)',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich möchte im August einen Deutschkurs an Ihrer Schule machen.\nMit freundlichen Grüßen\nArtem Smirnov`,
    expected: { anrede: 2, minLeitpunkte: 2, maxLeitpunkte: 2, gruss: 2, maxScore: 6 }
  },
  {
    id: 'case-15-semantic-paraphrase-trap',
    category: 'leitpunkte',
    title: 'Semantic Paraphrasing (Synonyms requiring LLM semantic arbitration)',
    examId: 'schreiben-modellsatz-1',
    text: `Sehr geehrte Damen und Herren,\nich interessiere mich sehr für den Sprachunterricht im Spätsommer. Einen vollen Monat am Vormittag habe ich freie Zeit. Welche Gebühren fallen an und wo trage ich mich ein?\nMit freundlichen Grüßen\nElena Rostova`,
    expected: { anrede: 2, gruss: 2, minScore: 7, maxScore: 10 }
  },
  {
    id: 'case-16-false-positive-dates-and-abbreviations',
    category: 'leitpunkte',
    title: 'False Positive Trap: Abbreviations and Ordinal Dates (Dr. / 14. August)',
    examId: 'schreiben-modellsatz-2',
    text: `Sehr geehrte Frau Dr. Schneider,\nich habe am Montag, 14. August, um 14 Uhr einen Termin bei Dr. Schneider. Leider muss ich länger arbeiten und muss den Termin absagen. Haben Sie nächsten Dienstag Zeit?\nMit freundlichen Grüßen\nStefan Müller`,
    expected: { anrede: 2, leitpunkte: 6, gruss: 2, minScore: 9, maxScore: 10 }
  }
];
