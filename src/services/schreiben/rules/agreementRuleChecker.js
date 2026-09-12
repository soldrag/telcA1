/**
 * Subject-Verb Agreement (Kongruenz) checker for German A1.
 */

export function checkAgreementRules(text = '') {
  const errors = [];

  // Question: "Was/Wie viel kosten der Kurs / der Termin" (Singular requires 'kostet')
  const costPluralWithSingular = text.match(/\b(was|wie\s+viel)\s+kosten\s+(der|dieser|ein)\s+([a-zäöüß]+)\b/i);
  if (costPluralWithSingular) {
    const full = costPluralWithSingular[0];
    const subject = costPluralWithSingular[3];
    errors.push({
      original: full,
      correction: full.replace(/\bkosten\b/i, 'kostet'),
      category: 'agreement',
      explanation: `Subjekt-Verb-Kongruenz: „${subject}“ steht im Singular, daher muss das Verb „kostet“ heißen (nicht „kosten“)`
    });
  }

  // "ich" + double verb / wrong infinitive (e.g., "ich besuche wollen", "ich lernen")
  const doubleVerbMatch = text.match(/\bich\s+([a-zäöüß]{3,}e)\s+(wollen|m[öo]chten)\b/i);
  if (doubleVerbMatch) {
    const [full, verb, modal] = doubleVerbMatch;
    const modalForm = modal.toLowerCase().startsWith('woll') ? 'will' : 'möchte';
    errors.push({
      original: full,
      correction: `ich ${modalForm} ... ${verb}n`,
      category: 'agreement',
      explanation: `Modalverb-Konstruktion: Das Modalverb wird konjugiert und der Hauptverb-Infinitiv steht am Satzende: „ich ${modalForm} ... ${verb}n“`
    });
  }

  // Salutation declension: "Sehr geehrte Herr" -> "Sehr geehrter Herr", "Sehr geehrter Frau" -> "Sehr geehrte Frau"
  const salutationCaseMatch = text.match(/\bsehr\s+geehrte\s+herr\b|\bsehr\s+geehrter\s+frau\b/i);
  if (salutationCaseMatch) {
    const full = salutationCaseMatch[0];
    const correction = /geehrte\s+herr/i.test(full) ? 'Sehr geehrter Herr' : 'Sehr geehrte Frau';
    errors.push({
      original: full,
      correction,
      category: 'agreement',
      explanation: `Deklination der Anrede: „${correction} …“ (nicht „${full}“)`
    });
  }

  // Plural after numerals: e.g. "vier Woche" -> "vier Wochen"
  const pluralMap = {
    woche: 'Wochen',
    tag: 'Tage',
    monat: 'Monate',
    jahr: 'Jahre',
    stunde: 'Stunden',
    person: 'Personen',
    kind: 'Kinder'
  };
  const numRegex = /\b(\d{1,2}|zwei|drei|vier|f[üu]nf|sechs|sieben|acht|neun|zehn|viele|mehrere)\s+(woche|tag|monat|jahr|stunde|person|kind)\b/i;
  const pluralMatch = text.match(numRegex);
  if (pluralMatch) {
    const [full, num, noun] = pluralMatch;
    const correctPlural = pluralMap[noun.toLowerCase()] || `${noun}n`;
    errors.push({
      original: full,
      correction: `${num} ${correctPlural}`,
      category: 'agreement',
      explanation: `Plural nach Zahlen: Nach „${num}“ steht der Plural: „${num} ${correctPlural}“ (nicht „${full}“)`
    });
  }

  return errors;
}
