/**
 * Verb rection, prepositions and case checker for German A1.
 * Composed of focused, single-responsibility micro-rules (<= 25 lines each).
 */

const MONTHS = ['januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
const COPULAS = ['ist', 'bin', 'bist', 'sind', 'war', 'waren', 'seid'];
const DATIVE_PREPS = ['zu', 'mit', 'bei', 'nach', 'von', 'aus', 'seit'];

function checkMonthPreposition(text) {
  const monthRegex = new RegExp(`\\b(in|für)\\s+(${MONTHS.join('|')})\\b`, 'i');
  const monthMatch = text.match(monthRegex);
  if (!monthMatch) return [];
  const month = monthMatch[2];
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return [{
    original: monthMatch[0],
    correction: `im ${capitalized}`,
    category: 'rektion',
    explanation: `Zeitangaben mit Monaten stehen mit „im“: „im ${capitalized}“ (nicht „${monthMatch[0]}“)`
  }];
}

function checkMasculineAkkusativ(text) {
  const match = text.match(/\bein\s+(deutschkurs|kurs|termin|ausweis)\b/i);
  if (!match) return [];
  const noun = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  return [{
    original: `ein ${match[1]}`,
    correction: `einen ${noun}`,
    category: 'rektion',
    explanation: `Maskuline Nomen im Akkusativ benötigen „einen“: „einen ${noun}“ (nicht „ein ${match[1]}“)`
  }];
}

function checkMissingArticle(text) {
  const match = text.match(/(?<!\b(?:einen|ein|den|dem|zum|für|keinen)\s+)\b(deutschkurs(?:\s+a1)?|sprachkurs|termin)((?:\s+[a-zäöüß0-9]+){0,3})\s+(machen|besuchen|haben)\b/i);
  if (!match) return [];
  const [full, targetNoun, middle = '', verb] = match;
  const cleanNoun = targetNoun.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return [{
    original: full.trim(),
    correction: `einen ${cleanNoun}${middle} ${verb}`,
    category: 'rektion',
    explanation: `Fehlender unbestimmter Artikel im Akkusativ: „einen ${cleanNoun}${middle} ${verb}“ (nicht „${full.trim()}“)`
  }];
}

function checkReflexiveAnmelden(text) {
  const hasAnmelden = /\banmeld(?:e|en)\b/i.test(text);
  const hasMich = /\bmich\b/i.test(text);
  if (!hasAnmelden || hasMich) return [];
  return [{
    original: 'anmelden',
    correction: 'mich anmelden',
    category: 'rektion',
    explanation: 'Das Verb „sich anmelden“ ist reflexiv: „Wie kann ich mich anmelden?“ (Reflexivpronomen „mich“ fehlt)'
  }];
}

function checkAnmeldenPreposition(text) {
  const match = text.match(/\bauf\s+(den|einen|diesen)\s+(kurs|deutschkurs)(?:[a-zäöüß0-9\s]{0,20})\s+anmeld(?:en|e)?\b/i) ||
                text.match(/\bmich\s+auf\s+(den|einen|diesen)\s+(kurs|deutschkurs)\s+anmeld(?:en|e)?\b/i);
  if (!match) return [];
  return [{
    original: match[0].trim(),
    correction: match[0].trim().replace(/\bauf\b/i, 'für'),
    category: 'rektion',
    explanation: 'Präposition bei „anmelden“: Man meldet sich „für einen Kurs“ an (oder „zu einem Kurs“), nicht „auf den Kurs“.'
  }];
}

function checkDativeIndirectObject(text) {
  const match = text.match(/\b(antworten|helfen|danken|schreiben|telefonieren)\s+(sie|du|ich|er|sie|wir|ihr)\s+(mich|dich)\b/i);
  if (!match) return [];
  const [, verb, person, acc] = match;
  const dative = acc.toLowerCase() === 'mich' ? 'mir' : 'dir';
  return [{
    original: match[0],
    correction: `${verb} ${person} ${dative}`,
    category: 'rektion',
    explanation: `Der indirekte Gegenstand steht im Dativ: „${verb} ${person} ${dative}“ (nicht „${match[0]}“)`
  }];
}

function checkPossessiveDeclension(text) {
  const match = text.match(/\b(mein|dein|kein)\s+(Termin|Kurs|Zimmer|Ticket|Ausweis|Urlaub)\b/i);
  if (!match) return [];
  const matchIndex = match.index || 0;
  const before = text.slice(0, matchIndex);
  const after = text.slice(matchIndex + match[0].length);
  const prevWord = ((before.match(/\S+\s*$/) || [''])[0]).replace(/[.,!?;:]/g, '').trim().toLowerCase();
  const nextWord = ((after.match(/^\s*\S+/) || [''])[0]).replace(/[.,!?;:]/g, '').trim().toLowerCase();
  if (matchIndex === 0 || COPULAS.includes(prevWord) || COPULAS.includes(nextWord)) return [];

  const poss = match[1];
  const noun = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  if (DATIVE_PREPS.includes(prevWord)) {
    return [{
      original: `${prevWord} ${match[0]}`,
      correction: `${prevWord} ${poss}em ${noun}`,
      category: 'rektion',
      explanation: `Dativ nach Präposition „${prevWord}“: Das maskuline Possessivpronomen erhält im Dativ die Endung „-em“: „${prevWord} ${poss}em ${noun}“ (nicht „${prevWord} ${match[0]}“).`
    }];
  }
  return [{
    original: match[0],
    correction: `${poss}en ${noun}`,
    category: 'rektion',
    explanation: `Maskulines Nomen im Akkusativ: Das Possessivpronomen erhält die Endung „-en“: „${poss}en ${noun}“ (nicht „${match[0]}“).`
  }];
}

function checkWeekdayPreposition(text) {
  const match = text.match(/\ban\s+(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\b/i);
  if (!match) return [];
  const day = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  return [{
    original: match[0],
    correction: `am ${day}`,
    category: 'rektion',
    explanation: `Falsche Präposition bei Wochentagen: Bei Tagen der Woche verwendet man „am“ (an + dem): „am ${day}“ (nicht „${match[0]}“).`
  }];
}

function checkWegenPreposition(text) {
  const match = text.match(/\bwegen\s+die\s+([A-ZÄÖÜa-zäöüß]+)\b/i);
  if (!match) return [];
  const noun = match[1];
  return [{
    original: match[0],
    correction: `wegen der ${noun}`,
    category: 'rektion',
    explanation: `Kasus nach der Präposition „wegen“: „wegen“ verlangt den Genitiv (oder Dativ): „wegen der ${noun}“ (nicht „${match[0]}“).`
  }];
}

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
    ...checkMonthPreposition(text),
    ...checkMasculineAkkusativ(text),
    ...checkMissingArticle(text),
    ...checkReflexiveAnmelden(text),
    ...checkAnmeldenPreposition(text),
    ...checkDativeIndirectObject(text),
    ...checkPossessiveDeclension(text),
    ...checkWeekdayPreposition(text),
    ...checkWegenPreposition(text),
    ...checkClosingDative(text),
  ];
}
