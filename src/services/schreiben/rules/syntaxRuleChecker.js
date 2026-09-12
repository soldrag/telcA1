/**
 * Syntax, Word Order and Sentence Bracket (Satzklammer) checker for German A1.
 */

export function checkSyntaxRules(text = '') {
  const errors = [];

  // Coordinating conjunctions 'und' / 'aber' followed by verb-final subordinate order:
  const undSubordinateMatch = text.match(/\b(und|aber|oder)\s+(ich|wir|er|sie)\s+([a-zäöüß\s]{3,25})\s+([a-zäöüß]{3,}e?n)\s+(m[öo]chte|will|kann|muss)\b/i);
  if (undSubordinateMatch) {
    const [full, conj, subj, middle, infinitive, modal] = undSubordinateMatch;
    errors.push({
      original: full,
      correction: `${conj} ${subj} ${modal} ${middle.trim()} ${infinitive}`,
      category: 'syntax',
      explanation: `Wortstellung nach „${conj}“: „${conj}“ verbindet Hauptsätze (Position 0). Das konjugierte Verb steht an Position 2: „${conj} ${subj} ${modal} ${middle.trim()} ${infinitive}“`
    });
  }

  // Subordinate conjunctions 'weil' / 'dass' / 'ob' with main clause word order: "weil ich kann nicht kommen"
  const weilWordOrderMatch = text.match(/\b(weil|dass|ob)\s+(ich|du|er|sie|es|wir|ihr)\s+(kann|können|kannst|könnt|muss|müssen|musst|müsst|will|wollen|m[öo]chte|m[öo]chten)\s+((?:nicht\s+)?[a-zäöüß]+)\b/i);
  if (weilWordOrderMatch) {
    const [full, conj, subj, modal, rest] = weilWordOrderMatch;
    const cleanRest = rest.trim();
    errors.push({
      original: full,
      correction: `${conj} ${subj} ${cleanRest} ${modal}`,
      category: 'syntax',
      explanation: `Wortstellung im Nebensatz mit „${conj}“: Das konjugierte Verb steht am Ende des Nebensatzes: „${conj} ${subj} ${cleanRest} ${modal}“ (nicht „${full}“).`
    });
  }

  // W-Frage with verb at end: "Wie viel der Kurs kostet?" / "Wie viel der Kurs kostet." -> "Wie viel kostet der Kurs?"
  const wFrageSubjectVerbMatch = text.match(/\b(wie\s+viel(?:e)?|was|wann|wo|wie|warum)\s+(der|die|das|dieser|diese|ein|eine|mein|meine|ihr|ihre)\s+([a-zäöüß]+)\s+([a-zäöüß]+)(?:\s*\?|\s*(?=[.!?,\n]|$))/i);
  if (wFrageSubjectVerbMatch) {
    const [full, wWord, art, noun, verb] = wFrageSubjectVerbMatch;
    errors.push({
      original: full.trim(),
      correction: `${wWord} ${verb} ${art} ${noun}?`,
      category: 'syntax',
      explanation: `Wortstellung in der W-Frage: Das Verb steht auf Position 2 direkt nach dem Fragewort: „${wWord} ${verb} ${art} ${noun}?“`
    });
  }

  // W-Frage with pronoun before verb: "(Und) wie ich kann mich anmelden?" -> "(Und) wie kann ich mich anmelden?"
  const wFragePronounVerbMatch = text.match(/\b(und\s+)?(wie\s+viel(?:e)?|wohin|woher|wie|wann|wo|warum|was)\s+(ich|du|er|sie|wir|ihr)\s+(kann|können|kannst|könnt|will|wollen|muss|müssen|m[öo]chte|m[öo]chten|[a-zäöüß]{3,}(?:e|t|en))\b/i);
  if (wFragePronounVerbMatch) {
    const [full, prefix = '', wWord, pronoun, verb] = wFragePronounVerbMatch;
    errors.push({
      original: full.trim(),
      correction: `${prefix}${wWord} ${verb} ${pronoun}`,
      category: 'syntax',
      explanation: `Wortstellung in der Frage: Das Verb steht auf Position 2 nach dem Fragewort: „${prefix}${wWord} ${verb} ${pronoun}“`
    });
  }

  // Verbzweitstellung with adverbial / time marker on Position 1: "Im August ich möchte" -> "Im August möchte ich"
  const adverbialMatch = text.match(/\b(nächsten\s+monat|nächste\s+woche|nächstes\s+jahr|letzten\s+monat|letzte\s+woche|jeden\s+tag|gestern|heute|morgen|jetzt|danach|zuerst|leider|am\s+wochenende|im\s+sommer|im\s+[a-zäöüß]+|am\s+[a-zäöüß]+)\s+(ich|wir|er|sie|du|ihr)\s+(kann|will|muss|m[öo]chte|m[öo]chten|bin|habe|hat|hatte|lerne|komme|gehe|fahre|mache)\b/i);
  if (adverbialMatch) {
    const [full, adv, subj, verb] = adverbialMatch;
    errors.push({
      original: full.trim(),
      correction: `${adv} ${verb} ${subj}`,
      category: 'syntax',
      explanation: `Verbzweitstellung im Hauptsatz: Nach einer Angabe an Position 1 („${adv}“) steht das konjugierte Verb an Position 2 vor dem Subjekt: „${adv} ${verb} ${subj}“`
    });
  }

  // Modal verb bracket (Satzklammer): "möchte lernen vormittags" -> "möchte vormittags lernen"
  const A1_INFINITIVES = 'lernen|machen|kommen|gehen|fahren|besuchen|arbeiten|schreiben|kaufen|bezahlen|bleiben|essen|trinken|treffen|sehen|sprechen|fragen|anmelden|buchen|übernachten';
  const modalBracketMatch = text.match(new RegExp(`\\b(will|wollen|wollt|kann|können|kannst|könnt|m[öo]chte|m[öo]chten|m[öo]chtest|m[öo]chtet|muss|müssen|musst|müsst|darf|dürfen|darfst|dürft|soll|sollen)\\s+(${A1_INFINITIVES})\\s+([a-zäöüß0-9\\s]{2,60})(?=[.!?,\n]|$)`, 'i'));
  if (modalBracketMatch) {
    const [full, modal, verb, rest] = modalBracketMatch;
    const restWords = rest.trim().split(/\s+/);
    const lastWord = restWords[restWords.length - 1].toLowerCase();
    const isLastWordInfinitive = new RegExp(`^(${A1_INFINITIVES})$`, 'i').test(lastWord);

    if (!isLastWordInfinitive) {
      errors.push({
        original: full.trim(),
        correction: `${modal} ${rest.trim()} ${verb}`,
        category: 'syntax',
        explanation: `Satzklammer bei Modalverben: Der Infinitiv gehört ans Satzende: „${modal} ${rest.trim()} ${verb}“`
      });
    }
  }

  // Quantity duration: "Zeit vier Wochen" -> "vier Wochen Zeit"
  const durationMatch = text.match(/\bzeit\s+(\d+|ein|eine|zwei|drei|vier|f[üu]nf)\s+(wochen?|tage?|monate?)\b/i);
  if (durationMatch) {
    const [full, num, unit] = durationMatch;
    errors.push({
      original: full,
      correction: `${num} ${unit} Zeit`,
      category: 'syntax',
      explanation: `Wortstellung: Die Mengenangabe steht vor dem Nomen: „${num} ${unit} Zeit“`
    });
  }

  return errors;
}
