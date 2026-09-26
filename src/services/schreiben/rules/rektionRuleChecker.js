/**
 * Verb rection, prepositions and case checker for German A1.
 * Composed of focused, single-responsibility micro-rules (<= 25 lines each).
 */


function checkClosingDative(text) {
  const match = text.match(/\bmit\s+(freundliche[nm]?)\s+(gr[uü]ß(?:en)?|gr[uü]ss(?:en)?)(?=[.!?,;\s\n]|$)/i);
  if (!match) return [];
  const full = match[0].trim();
  if (/mit\s+freundliche\s+gr[uü]ßen/i.test(full)) {
    return [{
      original: full,
      correction: 'Mit freundlichen Grüßen',
      category: 'rektion',
      explanation: 'Dativ-Plural-Endung nach „mit“: Das Adjektiv benötigt die Endung „-en“: „Mit freundlichen Grüßen“ (nicht „Mit freundliche Grüßen“).'
    }];
  }
  if (/mit\s+freundlichen\s+gr[uü]ß(?=[.!?,;\s\n]|$)/i.test(full)) {
    return [{
      original: full,
      correction: 'Mit freundlichem Gruß / Mit freundlichen Grüßen',
      category: 'rektion',
      explanation: 'Dativ-Endung: „Mit freundlichem Gruß“ (Singular) oder „Mit freundlichen Grüßen“ (Plural).'
    }];
  }
  return [];
}

export function checkRektionRules(text = '') {
  return [
    ...checkClosingDative(text),
  ];
}
