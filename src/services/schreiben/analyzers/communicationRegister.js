/**
 * German A1 communication register analyzer for Salutations and Closings.
 * Maps student phrases into 3-tier telc points: 2 (full), 1 (partial/informal/hybrid), 0 (none).
 */

const FORMAL_SALUTATIONS = [
  /^sehr\s+geehrte\s+damen\s+und\s+herren[,\s!.]*$/i,
  /^sehr\s+geehrte\s+frau\s+[\p{L}.\s-]+[,\s!.]*$/iu,
  /^sehr\s+geehrter\s+herr\s+[\p{L}.\s-]+[,\s!.]*$/iu,
  /^sehr\s+geehrtes\s+(?:praxis-?team|team|ärzteteam)[,\s!.]*$/i,
  /^sehr\s+geehrte\s+kolleg(?:en|innen)[,\s!.]*$/i,
  /^guten\s+tag\s+(?:frau|herr|dr\.|praxis-?team|team)\s*[\p{L}.\s-]*[,\s!.]*$/iu,
  /^guten\s+tag[,\s!.]*$/i,
];

const MISSPELLED_FORMAL_SALUTATIONS = [
  { regex: /^sehr\s+geehrte\s+herr\s+[\p{L}.\s-]+[,\s!.]*$/iu, correction: 'Sehr geehrter Herr …' },
  { regex: /^sehr\s+geehrter\s+frau\s+[\p{L}.\s-]+[,\s!.]*$/iu, correction: 'Sehr geehrte Frau …' },
  { regex: /^sehr\s+geehrte\s+(?:praxis-?team|team|ärzteteam)[,\s!.]*$/i, correction: 'Sehr geehrtes Praxis-Team' }
];

const HYBRID_SALUTATIONS = [
  /^hallo\s+damen\s+und\s+herren[,\s!.]*$/i,
  /^hallo\s+(?:frau|herr|dr\.|praxis-?team|team)\s*[\p{L}.\s-]*[,\s!.]*$/iu,
  /^liebe\s+damen\s+und\s+herren[,\s!.]*$/i,
  /^liebes\s+(?:praxis-?team|team)[,\s!.]*$/i,
  /^liebe\s+(?:praxis-?team|team)[,\s!.]*$/i,
];

const INFORMAL_SALUTATIONS = [
  /^liebe\s+[a-zäöüß]+[,\s!.]*$/i,
  /^lieber\s+[a-zäöüß]+[,\s!.]*$/i,
  /^hallo\s+[a-zäöüß]+[,\s!.]*$/i,
  /^hallo[,\s!.]*$/i,
  /^hi\s+[a-zäöüß]+[,\s!.]*$/i,
];

const CLOSING_PATTERNS = [
  { regex: /mit\s+freundlich(?:en?|em?|er)?\s+gr[üu]?(?:ß|ss)(?:en?|e)?/i, formal: true },
  { regex: /freundliche\s+gr[üu]?(?:ß|ss)e?/i, formal: true },
  { regex: /schöne\s+gr[üu]?(?:ß|ss)e?/i, formal: false, semiFormal: true },
  { regex: /beste\s+gr[üu]?(?:ß|ss)e?/i, formal: false, semiFormal: true },
  { regex: /viele\s+gr[üu]?(?:ß|ss)e?/i, formal: false, semiFormal: true },
  { regex: /herzliche\s+gr[üu]?(?:ß|ss)e?/i, formal: false, semiFormal: true },
  { regex: /liebe\s+gr[üu]?(?:ß|ss)e?/i, formal: false, semiFormal: false },
  { regex: /bis\s+bald/i, formal: false, semiFormal: false },
];

export function evaluateSalutation(firstLine = '', { isFormalRequired = true } = {}) {
  if (!firstLine || !firstLine.trim()) {
    return { score: 0, maxScore: 2, recognized: false, text: '', feedback: 'Keine Anrede am Textanfang gefunden.' };
  }

  const line = firstLine.trim();
  if (FORMAL_SALUTATIONS.some(p => p.test(line))) {
    return { score: 2, maxScore: 2, recognized: true, text: line, feedback: 'Passende formelle Anrede.' };
  }

  const misspelled = MISSPELLED_FORMAL_SALUTATIONS.find(p => p.regex.test(line));
  if (misspelled) {
    return {
      score: 1,
      maxScore: 2,
      recognized: true,
      text: line,
      feedback: `Anrede erkannt, aber Deklinationsfehler: korrekt wäre „${misspelled.correction}“.`
    };
  }

  if (HYBRID_SALUTATIONS.some(p => p.test(line))) {
    return {
      score: 1,
      maxScore: 2,
      recognized: true,
      text: line,
      feedback: 'Verständliche Anrede, aber stilistischer Register-Mix. Für offizielle E-Mails: „Sehr geehrte Damen und Herren“.'
    };
  }

  if (INFORMAL_SALUTATIONS.some(p => p.test(line))) {
    return {
      score: isFormalRequired ? 1 : 2,
      maxScore: 2,
      recognized: true,
      text: line,
      feedback: isFormalRequired
        ? 'Informelle Anrede erkannt. Bei Institutionen wird „Sehr geehrte Damen und Herren“ erwartet.'
        : 'Passende informelle Anrede.'
    };
  }

  return { score: 0, maxScore: 2, recognized: false, text: '', feedback: 'Keine anerkannte Anredeformel gefunden.' };
}

export function evaluateClosing(text = '', { isFormalRequired = true } = {}) {
  const lower = text.toLowerCase();
  const matched = CLOSING_PATTERNS.find(p => p.regex.test(lower));

  if (!matched) {
    return { score: 0, maxScore: 2, recognized: false, text: '', senderName: '', hasName: false, feedback: 'Fehlende Grußformel am Ende des Schreibens.' };
  }

  const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const closingIdx = lines.findIndex(l => matched.regex.test(l));
  let closingLine = lines[closingIdx] || 'Mit freundlichen Grüßen';
  let senderName = '';

  if (closingIdx !== -1 && closingIdx < lines.length - 1) {
    senderName = lines.slice(closingIdx + 1).join(' ').trim();
  } else {
    // Closing and name might be inline e.g. "Mit freundlichen Grüßen, Anna"
    const inlineMatch = text.match(new RegExp(`${matched.regex.source}[,\\s]+([A-Za-zÄÖÜäöüß\\s]+)$`, 'i'));
    if (inlineMatch) {
      closingLine = text.slice(inlineMatch.index, inlineMatch.index + inlineMatch[0].length - inlineMatch[1].length).replace(/[,\s]+$/, '').trim();
      senderName = inlineMatch[1].trim();
    } else {
      senderName = closingLine.replace(matched.regex, '').replace(/^[,\s]+/, '').trim();
    }
  }

  const hasName = Boolean(senderName);
  let score = 2;
  if (!hasName) {
    score = 1;
  } else if (isFormalRequired && !matched.formal && !matched.semiFormal) {
    score = 1;
  } else if (isFormalRequired && matched.semiFormal) {
    score = senderName.includes(' ') ? 2 : 1;
  }

  return {
    score,
    maxScore: 2,
    recognized: true,
    text: closingLine,
    senderName,
    hasName,
    feedback: hasName ? 'Grußformel mit Absendernamen vorhanden.' : 'Grußformel vorhanden, aber Absendername fehlt.'
  };
}
