/**
 * Orthography and Capitalization checker for German A1 nouns.
 * All German nouns must be capitalized.
 * Bundles multiple lowercased nouns into a cohesive, non-punitive pedagogical notice.
 */

const FREQUENT_A1_NOUNS = [
  'Termin', 'Termine', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag',
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  'Deutschkurs', 'Kurs', 'Kurse', 'Sprachschule', 'Unterricht',
  'Überstunden', 'Woche', 'Wochen', 'Zeit', 'Damen', 'Herren',
  'Gebühr', 'Gebühren', 'Preis', 'Preise', 'Anmeldung', 'Information', 'Informationen',
  'Zimmer', 'Hotel', 'Arzt', 'Praxis', 'Fieber', 'Krankheit', 'Urlaub', 'Vormittag', 'Nachmittag'
];

export function checkOrthographyRules(text = '') {
  const errors = [];
  const tokens = text.split(/\s+/).map(t => t.replace(/[.,!?;:()«»"„“]/g, ''));
  const foundNouns = [];

  for (const noun of FREQUENT_A1_NOUNS) {
    const lower = noun.toLowerCase();
    if (tokens.includes(lower)) {
      foundNouns.push(noun);
    }
  }

  if (foundNouns.length > 0) {
    errors.push({
      original: foundNouns.map(n => n.toLowerCase()).join(', '),
      correction: foundNouns.join(', '),
      category: 'orthography',
      explanation: `Groß-/Kleinschreibung: Nomen im Deutschen werden großgeschrieben: ${foundNouns.map(n => `„${n}“`).join(', ')}.`
    });
  }

  // Common spelling typos
  if (/\bgrusse\b/i.test(text)) {
    errors.push({
      original: 'Grusse',
      correction: 'Grüße',
      category: 'orthography',
      explanation: 'Rechtschreibung: Im Deutschen mit Umlaut „Grüße“ (oder „Gruesse“).'
    });
  }

  // Capitalization after salutation comma: e.g. "Sehr geehrte Damen und Herren, Ich" or with newline
  const salutationCommaMatch = text.match(/([^\n,]+),\s*(?:\n+\s*|\s+)(Ich|Wir|Mein|Meine|Es|Da|Bitte|Vielen)\b/);
  if (salutationCommaMatch) {
    const [full, greeting, capitalizedWord] = salutationCommaMatch;
    const lowerWord = capitalizedWord.toLowerCase();
    errors.push({
      original: `${greeting}, ${capitalizedWord}`,
      correction: `${greeting}, ${lowerWord}`,
      category: 'orthography',
      explanation: `Groß-/Kleinschreibung nach der Anrede: Nach einem Komma in der Anrede schreibt man klein weiter: „${lowerWord}“ (nicht „${capitalizedWord}“)`
    });
  }

  // Disallowed comma after German closing formulas: "Mit freundlichen Gruß," / "Liebe Grüße," -> remove comma
  const closingCommaMatch = text.match(/\b(mit\s+freundliche[nm]?\s+gr[uü](?:ß|ss)(?:en)?|liebe\s+gr[uü](?:ß|ss)e?|viele\s+gr[uü](?:ß|ss)e?|herzliche\s+gr[uü](?:ß|ss)e?|beste\s+gr[uü](?:ß|ss)e?)\s*,/i);
  if (closingCommaMatch) {
    const [full, formula] = closingCommaMatch;
    errors.push({
      original: full.trim(),
      correction: formula.trim(),
      category: 'orthography',
      explanation: `Kommasetzung bei der Grußformel: Im Deutschen steht nach der Grußformel kein Komma: „${formula.trim()}“ (nicht „${full.trim()}“)`
    });
  }

  return errors;
}
