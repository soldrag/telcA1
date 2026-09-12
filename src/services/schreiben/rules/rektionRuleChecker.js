/**
 * Verb rection, prepositions and case checker for German A1.
 */

const MONTHS = ['januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];

export function checkRektionRules(text = '') {
  const errors = [];

  // "in/für August" -> "im August"
  const monthRegex = new RegExp(`\\b(in|für)\\s+(${MONTHS.join('|')})\\b`, 'i');
  const monthMatch = text.match(monthRegex);
  if (monthMatch) {
    const month = monthMatch[2];
    const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
    errors.push({
      original: monthMatch[0],
      correction: `im ${capitalized}`,
      category: 'rektion',
      explanation: `Zeitangaben mit Monaten stehen mit „im“: „im ${capitalized}“ (nicht „${monthMatch[0]}“)`
    });
  }

  // Masculine Akkusativ: "ein Deutschkurs" -> "einen Deutschkurs"
  const akkusativMatch = text.match(/\bein\s+(deutschkurs|kurs|termin|ausweis)\b/i);
  if (akkusativMatch) {
    const noun = akkusativMatch[1].charAt(0).toUpperCase() + akkusativMatch[1].slice(1);
    errors.push({
      original: `ein ${akkusativMatch[1]}`,
      correction: `einen ${noun}`,
      category: 'rektion',
      explanation: `Maskuline Nomen im Akkusativ benötigen „einen“: „einen ${noun}“ (nicht „ein ${akkusativMatch[1]}“)`
    });
  }

  // Missing article: "Deutschkurs A1 machen" or "Deutschkurs A1 im August machen"
  const missingArtMatch = text.match(/(?<!\b(?:einen|ein|den|dem|zum|für|keinen)\s+)\b(deutschkurs(?:\s+a1)?|sprachkurs|termin)((?:\s+[a-zäöüß0-9]+){0,3})\s+(machen|besuchen|haben)\b/i);
  if (missingArtMatch) {
    const [full, targetNoun, middle = '', verb] = missingArtMatch;
    const cleanNoun = targetNoun.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    errors.push({
      original: full.trim(),
      correction: `einen ${cleanNoun}${middle} ${verb}`,
      category: 'rektion',
      explanation: `Fehlender unbestimmter Artikel im Akkusativ: „einen ${cleanNoun}${middle} ${verb}“ (nicht „${full.trim()}“)`
    });
  }

  // Reflexive verb "sich anmelden"
  const hasAnmelden = /\banmeld(?:e|en)\b/i.test(text);
  const hasMich = /\bmich\b/i.test(text);
  if (hasAnmelden && !hasMich) {
    errors.push({
      original: 'anmelden',
      correction: 'mich anmelden',
      category: 'rektion',
      explanation: 'Das Verb „sich anmelden“ ist reflexiv: „Wie kann ich mich anmelden?“ (Reflexivpronomen „mich“ fehlt)'
    });
  }

  // Preposition with "anmelden": "auf den Kurs anmelden" -> "für den Kurs anmelden"
  const aufAnmeldenMatch = text.match(/\bauf\s+(den|einen|diesen)\s+(kurs|deutschkurs)(?:[a-zäöüß0-9\s]{0,20})\s+anmeld(?:en|e)?\b/i) ||
                           text.match(/\bmich\s+auf\s+(den|einen|diesen)\s+(kurs|deutschkurs)\s+anmeld(?:en|e)?\b/i);
  if (aufAnmeldenMatch) {
    errors.push({
      original: aufAnmeldenMatch[0].trim(),
      correction: aufAnmeldenMatch[0].trim().replace(/\bauf\b/i, 'für'),
      category: 'rektion',
      explanation: 'Präposition bei „anmelden“: Man meldet sich „für einen Kurs“ an (oder „zu einem Kurs“), nicht „auf den Kurs“.'
    });
  }

  // Dative indirect object: "antworten Sie mich" -> "antworten Sie mir"
  const dativeIndirectMatch = text.match(/\b(antworten|helfen|danken|schreiben|telefonieren)\s+(sie|du|ich|er|sie|wir|ihr)\s+(mich|dich)\b/i);
  if (dativeIndirectMatch) {
    const [, verb, person, acc] = dativeIndirectMatch;
    const dative = acc.toLowerCase() === 'mich' ? 'mir' : 'dir';
    errors.push({
      original: dativeIndirectMatch[0],
      correction: `${verb} ${person} ${dative}`,
      category: 'rektion',
      explanation: `Der indirekte Gegenstand steht im Dativ: „${verb} ${person} ${dative}“ (nicht „${dativeIndirectMatch[0]}“)`
    });
  }

  // Possessive before masculine noun (Dativ after prepositions or Akkusativ as object):
  const accPossessiveMatch = text.match(/\b(mein|dein|kein)\s+(Termin|Kurs|Zimmer|Ticket|Ausweis|Urlaub)\b/i);
  if (accPossessiveMatch) {
    const matchIndex = accPossessiveMatch.index || 0;
    const before = text.slice(0, matchIndex);
    const after = text.slice(matchIndex + accPossessiveMatch[0].length);
    const prevWord = ((before.match(/\S+\s*$/) || [''])[0]).replace(/[.,!?;:]/g, '').trim().toLowerCase();
    const nextWord = ((after.match(/^\s*\S+/) || [''])[0]).replace(/[.,!?;:]/g, '').trim().toLowerCase();
    const copulas = ['ist', 'bin', 'bist', 'sind', 'war', 'waren', 'seid'];
    const dativePreps = ['zu', 'mit', 'bei', 'nach', 'von', 'aus', 'seit'];
    const isNominative = matchIndex === 0 || copulas.includes(prevWord) || copulas.includes(nextWord);

    if (!isNominative) {
      const poss = accPossessiveMatch[1];
      const noun = accPossessiveMatch[2].charAt(0).toUpperCase() + accPossessiveMatch[2].slice(1);
      if (dativePreps.includes(prevWord)) {
        errors.push({
          original: `${prevWord} ${accPossessiveMatch[0]}`,
          correction: `${prevWord} ${poss}em ${noun}`,
          category: 'rektion',
          explanation: `Dativ nach Präposition „${prevWord}“: Das maskuline Possessivpronomen erhält im Dativ die Endung „-em“: „${prevWord} ${poss}em ${noun}“ (nicht „${prevWord} ${accPossessiveMatch[0]}“).`
        });
      } else {
        errors.push({
          original: accPossessiveMatch[0],
          correction: `${poss}en ${noun}`,
          category: 'rektion',
          explanation: `Maskulines Nomen im Akkusativ: Das Possessivpronomen erhält die Endung „-en“: „${poss}en ${noun}“ (nicht „${accPossessiveMatch[0]}“).`
        });
      }
    }
  }

  // Preposition with day of week: "an Dienstag" -> "am Dienstag"
  const weekdayMatch = text.match(/\ban\s+(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\b/i);
  if (weekdayMatch) {
    const day = weekdayMatch[1].charAt(0).toUpperCase() + weekdayMatch[1].slice(1).toLowerCase();
    errors.push({
      original: weekdayMatch[0],
      correction: `am ${day}`,
      category: 'rektion',
      explanation: `Falsche Präposition bei Wochentagen: Bei Tagen der Woche verwendet man „am“ (an + dem): „am ${day}“ (nicht „${weekdayMatch[0]}“).`
    });
  }

  // Preposition wegen with accusative article: "wegen die Überstunden" -> "wegen der Überstunden"
  const wegenMatch = text.match(/\bwegen\s+die\s+([A-ZÄÖÜa-zäöüß]+)\b/i);
  if (wegenMatch) {
    const noun = wegenMatch[1];
    errors.push({
      original: wegenMatch[0],
      correction: `wegen der ${noun}`,
      category: 'rektion',
      explanation: `Kasus nach der Präposition „wegen“: „wegen“ verlangt den Genitiv (oder Dativ): „wegen der ${noun}“ (nicht „${wegenMatch[0]}“).`
    });
  }

  // Dativ in closing formula: "Mit freundliche Grüßen" or "Mit freundlichen Gruß"
  const closingErrorMatch = text.match(/\bmit\s+(freundliche[nm]?)\s+(gr[uü]ß(?:en)?|gr[uü]ss(?:en)?)(?=[.!?,;\s\n]|$)/i);
  if (closingErrorMatch) {
    const full = closingErrorMatch[0].trim();
    if (/mit\s+freundliche\s+gr[uü]ßen/i.test(full)) {
      errors.push({
        original: full,
        correction: 'Mit freundlichen Grüßen',
        category: 'rektion',
        explanation: 'Dativ-Plural-Endung nach „mit“: Das Adjektiv benötigt die Endung „-en“: „Mit freundlichen Grüßen“ (nicht „Mit freundliche Grüßen“).'
      });
    } else if (/mit\s+freundlichen\s+gr[uü]ß(?=[.!?,;\s\n]|$)/i.test(full)) {
      errors.push({
        original: full,
        correction: 'Mit freundlichem Gruß / Mit freundlichen Grüßen',
        category: 'rektion',
        explanation: 'Dativ-Endung: „Mit freundlichem Gruß“ (Singular) oder „Mit freundlichen Grüßen“ (Plural).'
      });
    }
  }

  return errors;
}
